package com.zeprus.pokemodgo;

import android.app.Notification;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.BitmapFactory;
import android.os.Build;

import androidx.core.app.NotificationManagerCompat;
import android.util.Log;
import android.view.Gravity;
import android.widget.Toast;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import eu.chainfire.libsuperuser.Shell;

public class Injector{
    private Context context;
    private Shell.Interactive shell;
    private List<Script> scriptList = new ArrayList<>();
    private SharedPreferences modulePrefs;

    Injector(Context context){
        this.context = context;
        try {
            this.shell = Shell.Pool.SU.get();
        } catch (Shell.ShellDiedException e) {
            e.printStackTrace();
        }

        SharedPreferences loadModulePrefs = context.getSharedPreferences("load_modules", Context.MODE_PRIVATE);
        modulePrefs = context.getSharedPreferences("module_prefs", Context.MODE_PRIVATE);

        for(Map.Entry<String, ?> entry : loadModulePrefs.getAll().entrySet()) {
            if(entry.getValue().toString().equals("true")) setup(entry.getKey());
        }
    }

    public void setup(String scriptName){
        this.scriptList.add(new Script(context, scriptName));
    }
    void inject() {
        StringBuilder sources = new StringBuilder();
        for(int i = 0; i < scriptList.size(); i++){
            sources.append(scriptList.get(i).getScriptPath())
                    .append(" ")
                    .append(scriptList.get(i).getRealSize())
                    .append(" ");
        }
        int SHELL_COMMAND_CODE = 0;
        shell.addCommand(new String[] {"/data/local/tmp/pokemod-injector com.nianticlabs.pokemongo " + sources}, SHELL_COMMAND_CODE,
                new Shell.OnCommandLineListener(){
            @Override
            public void onCommandResult(int commandCode, int exitCode) {
                handleCmdResult(commandCode, exitCode);
            }
            @Override
            public void onSTDOUT(String line) {
                Log.d("Injector", line);
                handleOut(line);
            }
            @Override
            public void onSTDERR(String line) {
                Log.e("Injector", line);
            }
        });
    }
    private void handleErr(String line){
        Toast.makeText(context, "Encountered an error. Please make a logcat.", Toast.LENGTH_SHORT).show();
    }

    private void handleOut(String line){
        if(!isJson(line)){
            Toast.makeText(context, line, Toast.LENGTH_SHORT).show();
            return;
        }
        JsonElement element = new JsonParser().parse(line);
        JsonObject root = element.getAsJsonObject();
        if(!root.has("payload")){
            Log.d("MESSAGE", "Everybody walk the dinosaur");
            return;
        }
        JsonObject payload = root.getAsJsonObject("payload");
        String script = payload.get("script").toString().replace("\"", "");
        JsonObject content = payload.getAsJsonObject("content");
        //switch over scripts with special formatting
        switch(script){
            case "get_encounter_stats":
                handleGetEncounterStats(content);
                break;
            case "get_inventory_stats":
                handleGetInventoryStats(content);
                break;
            case "quest_logger":
                logQuest(content);
                break;
//            case "auto_hatch_incubate":
//                handleSilentHatch(content);
//                break;
            case "silent_hatch":
                handleSilentHatch(content);
                break;
            default:
                makeGenericToast(content);
        }
    }

    private void handleSilentHatch(JsonObject content) {
        try {
            String info = "";
            if (content.get("SHINY").getAsBoolean()) {
                info += "✨✨✨ ";
            }
            info += "Hatched " + content.get("NAME") + " " +
                    "CP: " + content.get("CP") +
                    " ATK: " + content.get("ATK") +
                    " DEF: " + content.get("DEF") +
                    " HP: " + content.get("HP") +
                    " IV: " + content.get("IV");
            Toast toast = Toast.makeText(context, info, Toast.LENGTH_LONG);
            switch(modulePrefs.getString("toast_location", "bottom")){
                case "top": toast.setGravity(Gravity.TOP|Gravity.CENTER_HORIZONTAL, 0, 30);
                    break;
                case "center": toast.setGravity(Gravity.CENTER_VERTICAL|Gravity.CENTER_HORIZONTAL, 0, 0);
                    break;
                case "bottom": toast.setGravity(Gravity.BOTTOM|Gravity.CENTER_HORIZONTAL, 0, -30);
                    break;
            }
            toast.show();
        } catch (Error e){
            Toast toast = Toast.makeText(context, content.toString(), Toast.LENGTH_LONG);
            switch(modulePrefs.getString("toast_location", "bottom")){
                case "top": toast.setGravity(Gravity.TOP|Gravity.CENTER_HORIZONTAL, 0, 30);
                    break;
                case "center": toast.setGravity(Gravity.CENTER_VERTICAL|Gravity.CENTER_HORIZONTAL, 0, 0);
                    break;
                case "bottom": toast.setGravity(Gravity.BOTTOM|Gravity.CENTER_HORIZONTAL, 0, -30);
                    break;
            }
            toast.show();
        }
    }

    private void logQuest(JsonObject content) {

    }

    private void handleGetInventoryStats(JsonObject content){
        String info = "CP: " + content.get("CP") +
                " ATK: " + content.get("ATK") +
                " DEF: " + content.get("DEF") +
                " HP: " + content.get("HP") +
                " IV: " + content.get("IV");
        Toast toast = Toast.makeText(context, info, Toast.LENGTH_LONG);
        switch(modulePrefs.getString("toast_location", "bottom")){
            case "top": toast.setGravity(Gravity.TOP|Gravity.CENTER_HORIZONTAL, 0, 30);
                break;
            case "center": toast.setGravity(Gravity.CENTER_VERTICAL|Gravity.CENTER_HORIZONTAL, 0, 0);
                break;
            case "bottom": toast.setGravity(Gravity.BOTTOM|Gravity.CENTER_HORIZONTAL, 0, -30);
                break;
        }
        toast.show();
    }
    private void handleGetEncounterStats(JsonObject content) {
        if(content.has("NAME")) {
            switch (modulePrefs.getString("popup_type", "Toast")) {
                case "Notification":
                    buildNotificationFromEncounterStats(content);
                    break;
                case "Toast":
                    makeToastFromEncounterStats(content);
                    break;
            }
        }
    }
    private void makeGenericToast(JsonObject object){
        StringBuilder toastMessage = new StringBuilder();
        for (String key : object.keySet()) {
            toastMessage.append(key).append(": ").append(object.get(key)).append(" ");
        }
        Toast.makeText(context, toastMessage.toString(), Toast.LENGTH_LONG).show();
    }
    private void makeToastFromEncounterStats(JsonObject content) {
        String info = "";
        if(content.get("SHINY").getAsBoolean()){
            info += "✨✨✨ ";
        }
        info += "CP: " + content.get("CP") +
                " IV: " + content.get("IV") +
                " Lvl: " + content.get("LVL");
        if(modulePrefs.getString("info_type", "minimal").equals("verbose")){
            info += " ATK: " + content.get("ATK") +
                    " DEF: " + content.get("DEF") +
                    " HP: " + content.get("HP") +
                    " " + content.get("GENDER") +
                    " Weight: " + content.get("WEIGHT") +
                    " Height: " + content.get("HEIGHT");
        }
        if(content.has("PVP")){
            JsonObject great = content.getAsJsonObject("PVP").getAsJsonObject("GREAT");
            JsonObject ultra = content.getAsJsonObject("PVP").getAsJsonObject("ULTRA");
            if(Integer.parseInt(great.get("rank").toString()) <= 25) {
                info += "\n⚠️GREAT-LEAGUE ⚠️\nRANK: " + great.get("rank").toString() + " LVL: " + great.get("lvl") + " CP: " + great.get("cp").toString();
            }
            if(Integer.parseInt(ultra.get("rank").toString()) <= 25) {
                info += "\n⚠️ULTRA-LEAGUE ⚠️\nRANK: " + ultra.get("rank").toString() + " LVL: " + ultra.get("lvl") + " CP: " + ultra.get("cp").toString();
            }
        }
        Toast toast = Toast.makeText(context, info, Toast.LENGTH_LONG);
        switch(modulePrefs.getString("toast_location", "bottom")){
            case "top": toast.setGravity(Gravity.TOP|Gravity.CENTER_HORIZONTAL, 0, 30);
                break;
            case "center": toast.setGravity(Gravity.CENTER_VERTICAL|Gravity.CENTER_HORIZONTAL, 0, 0);
                break;
            case "bottom": toast.setGravity(Gravity.BOTTOM|Gravity.CENTER_HORIZONTAL, 0, -30);
                break;
        }
        toast.show();
    }

    private void buildNotificationFromEncounterStats(JsonObject content) {
        String info = "";
        if(content.get("SHINY").getAsBoolean()){
            info += "✨✨✨ ";
        }
        if(content.has("PVP")){
            JsonObject great = content.getAsJsonObject("PVP").getAsJsonObject("GREAT");
            JsonObject ultra = content.getAsJsonObject("PVP").getAsJsonObject("ULTRA");
            if(Integer.parseInt(great.get("rank").toString()) <= 25) {
                info += "GREAT-LEAGUE ";
            }
            if(Integer.parseInt(ultra.get("rank").toString()) <= 25) {
                info += "ULTRA-LEAGUE ";
            }
        }
        info += "CP: " + content.get("CP") +
                " IV: " + content.get("IV") +
                " Lvl: " + content.get("LVL");
        Notification.Builder builder = new Notification.Builder(context)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setLargeIcon(BitmapFactory.decodeResource(context.getResources(),
                        R.mipmap.ic_launcher))
                .setContentTitle("A wild " + content.get("NAME").toString().replace("\"", "") + " appears!")
                .setContentText(info)
                .setVibrate(new long[]{0L});
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder.setTimeoutAfter(3000)
                    .setChannelId("Popup");
        }
        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
        notificationManager.cancel(2);
        notificationManager.notify(2, builder.build());
    }

    private void handleCmdResult(int commandCode, int exitCode) {
        Toast.makeText(context, "CommandCode: " + commandCode + " ExitCode: " + exitCode, Toast.LENGTH_SHORT).show();
    }

    private static boolean isJson(String Json) {
        try {
            new JSONObject(Json);
        } catch (JSONException ex) {
            try {
                new JSONArray(Json);
            } catch (JSONException ex1) {
                return false;
            }
        }
        return true;
    }
}
