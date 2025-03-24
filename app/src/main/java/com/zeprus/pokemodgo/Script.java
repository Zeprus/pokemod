package com.zeprus.pokemodgo;

import android.content.Context;
import android.util.Log;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public class Script {
    private int realSize;
    private Context context;
    private String scriptName;
    private File scriptFile;

    public Script(Context context, String scriptName){
        this.context = context;
        this.scriptName = scriptName;
        realSize = context.getResources().getInteger(getIntIdentifier(context, scriptName));
        createScriptFile();
    }
    private static int getIntIdentifier(Context context, String name) {
        return context.getResources().getIdentifier(name, "integer", context.getPackageName());
    }
    private void createScriptFile(){
        scriptFile = new File(context.getFilesDir() + "/scripts/", scriptName);
        if(!scriptFile.isFile()){
            try {
                if(scriptFile.getParentFile().mkdirs()){
                    Log.d("Script", "Directory created.");
                }
                if(scriptFile.createNewFile()){
                    Log.d("Script", "Script created " + scriptFile.getAbsoluteFile());
                } else {
                 Log.e("Script", "Error creating file.");
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        int read;
        try {
            InputStream scriptStream = context.getAssets().open("scripts/" + scriptName);
            byte[] buffer = new byte[scriptStream.available()];
            OutputStream outputStream = new FileOutputStream(scriptFile);
            try {
                while ((read = scriptStream.read(buffer)) > 0) {
                    outputStream.write(buffer, 0, read);
                }
            } finally {
                outputStream.close();
                scriptStream.close();
            }
        } catch (Exception e) {
            Log.e("InjectionService", "Error reading script.");
            e.printStackTrace();
        }
    }
    String getScriptPath(){
        return scriptFile.getAbsolutePath();
    }
    int getRealSize(){
        return realSize;
    }
}
