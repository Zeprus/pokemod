#include "./include/frida-core.h"
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>

static void on_message (FridaScript *script, const gchar *message, GBytes *data, gpointer user_data);
static void on_signal (int signo);
static gboolean stop (gpointer user_data);

static GMainLoop *loop = NULL;

guint target_pid;
FridaDeviceManager *manager;
GError *error = NULL;
FridaDeviceList *devices;
gint num_devices, i;
FridaDevice *local_device;
FridaSession *session;
FridaScript *script;
FridaScript *scriptArr[50];
int argcGlobal;

static void end(){
    if(scriptArr[1] != 0x0) {
        for (uint i = 1; i < argcGlobal / 2; i++) {
            FridaScript *scriptPtr = scriptArr[i];
            frida_script_unload_sync(scriptPtr, NULL, NULL);
            frida_unref(scriptPtr);
        }
    }

    frida_session_detach_sync(session, NULL, &error);
    frida_unref(session);

    frida_unref(local_device);

    frida_device_manager_close_sync(manager, NULL, &error);
    frida_unref(manager);

    g_main_loop_unref (loop);
}
static void on_signal (int signo) {
    if (signo == SIGTERM) {
        end();
    }
    if (signo == SIGINT) {
        g_idle_add(stop, NULL);
    }
}

static gboolean stop (gpointer user_data)
{
    g_main_loop_quit (loop);

    return FALSE;
}

static void on_message (FridaScript *script, const gchar *message, GBytes *data, gpointer user_data) {
    JsonParser * parser;
    JsonObject * root;
    const gchar * type;

    parser = json_parser_new ();
    json_parser_load_from_data (parser, message, -1, NULL);
    root = json_node_get_object (json_parser_get_root (parser));

    type = json_object_get_string_member (root, "type");
    if (strcmp (type, "log") == 0)
    {
        const gchar * log_message;

        log_message = json_object_get_string_member (root, "payload");
        g_print ("%s\n", log_message);
    }
    else
    {
        g_print ("%s\n", message);
    }

    g_object_unref (parser);
}
static void decrypt(char *key, char *data, int dataLength){
    int i;
    int keyLength = strlen(key);
    for( i = 0 ; i < dataLength ; i++ )
    {
        data[i]=data[i]^key[i%keyLength];
    }
    data[dataLength + 1] = (char) "\0";
}

int main (int argc, char *argv[]){
//argv[1] = process, argv[2]... < argc = source1, size1, source2, size2
    argcGlobal = argc;

    //setup Frida
    frida_init ();

    loop = g_main_loop_new (NULL, TRUE);

    signal (SIGINT, on_signal);
    signal (SIGTERM, on_signal);

    manager = frida_device_manager_new ();

    devices = frida_device_manager_enumerate_devices_sync (manager, NULL, &error);
    g_assert (error == NULL);

    local_device = NULL;
    num_devices = frida_device_list_size (devices);

    for (i = 0; i != num_devices; i++)
    {
        FridaDevice * device = frida_device_list_get (devices, i);

        if (frida_device_get_dtype (device) == FRIDA_DEVICE_TYPE_LOCAL)
            local_device = g_object_ref (device);

        g_object_unref (device);
    }
    g_assert (local_device != NULL);

    frida_unref (devices);
    devices = NULL;

    guint found = 0;
    FridaProcessList* processes = frida_device_enumerate_processes_sync(local_device, NULL, &error);
    for(uint i = 0; i < frida_process_list_size(processes); i++){
        if(strcmp(frida_process_get_name(frida_process_list_get(processes, i)), argv[1]) == 0){
            target_pid = frida_process_get_pid(frida_process_list_get(processes, i));
            found = 1;
            break;
        }
    }
    if(found == 0) {
        g_printerr("Pokemon GO isn't running.");
        return 0;
    }
    session = frida_device_attach_sync (local_device, target_pid, NULL, &error);
    if (error == NULL)
    {

        FridaScriptOptions * options;
        for(uint i = 2; i < argc; i+=2) {
            //g_print("Handling argument %i", i);
            FILE *fileptr;
            char *buffer;
            long filelen;

            fileptr = fopen(argv[i], "rb");  // Open the file in binary mode
            fseek(fileptr, 0, SEEK_END);          // Jump to the end of the file
            filelen = ftell(fileptr);             // Get the current byte offset in the file
            rewind(fileptr);                      // Jump back to the beginning of the file

            buffer = (char *)malloc((filelen+1)*sizeof(char)); // Enough memory for file + \0
            fread(buffer, filelen, 1, fileptr); // Read in the entire file
            fclose(fileptr); // Close the file



            //remove(argv[i]);
            int size = atoi(argv[i+1]);
            decrypt("xOyPhFtbAvAvPbxlmQ0lJzN029Qd3xS7", buffer, size);
            options = frida_script_options_new ();
            frida_script_options_set_name (options, argv[i]);
            frida_script_options_set_runtime (options, FRIDA_SCRIPT_RUNTIME_V8);

            script = frida_session_create_script_sync (session, buffer, options, NULL, &error);
            if(error != NULL){
                g_printerr("%s\n%s\n", buffer, error->message);
            }
            g_assert (error == NULL);

            g_clear_object (&options);

            g_signal_connect (script, "message", G_CALLBACK (on_message), NULL);

            frida_script_load_sync (script, NULL, &error);
            g_assert (error == NULL);
            scriptArr[i/2] = script;
        }


        if (g_main_loop_is_running (loop))
            g_main_loop_run (loop);
    } else {
        g_printerr ("Failed to attach: %s\n", error->message);
        g_error_free (error);
    }
    return 0;
}