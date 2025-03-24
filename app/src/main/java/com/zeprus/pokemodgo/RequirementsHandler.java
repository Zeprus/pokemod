package com.zeprus.pokemodgo;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import eu.chainfire.libsuperuser.Shell;

public class RequirementsHandler extends Activity {
    protected File serverFile;
    protected File injectorFile;
    protected File errorFile;
    protected void onCreate(Bundle savedInstanceState){
        serverFile = new File(this.getFilesDir(), "pokemod-server");
        injectorFile = new File(this.getFilesDir(), "pokemod-injector");
        errorFile = new File(this.getFilesDir(), "errorlog.txt");
        super.onCreate(savedInstanceState);
    }
    protected void onStart(){
        super.onStart();
        if(!setupFiles()) { respondError(); return;}
        respondSuccess();
    }
    protected void onStop(){
        super.onStop();
        respondStopped();
    }

    private boolean setupFiles() {
        if (!errorSetup(errorFile)) {
            Toast.makeText(this, "Setup failed, aborting.", Toast.LENGTH_SHORT).show();
            return false;
        }
            if (!serverSetup(serverFile)) {
                Toast.makeText(this, "Setup failed, aborting.", Toast.LENGTH_SHORT).show();
                return false;
            }
            if (!injectorSetup(injectorFile)) {
                Toast.makeText(this, "Setup failed, aborting.", Toast.LENGTH_SHORT).show();
                return false;
            }
        return true;
    }
    protected boolean errorSetup(File errorFile) {
        if(!errorFile.isFile()){
            try {
                if(!errorFile.createNewFile()){
                    return false;
                }
            } catch (IOException e) {
                e.printStackTrace();
                return false;
            }
        }
    return true;
    }
    protected boolean serverSetup(File serverFile){
        try {
            int read;
            InputStream serverInput = getAssets().open("core/pokemod-server");
            byte[] buffer = new byte[serverInput.available()];
            OutputStream outputStream = new FileOutputStream(serverFile);
            try{
                while((read = serverInput.read(buffer)) > 0) {
                    outputStream.write(buffer, 0, read);
                }
            } finally {
                outputStream.close();
                serverInput.close();
            }
            if(!serverFile.setExecutable(true)){
                Log.e("RequirementsHandler", "Error setting file executable.");
                return false;
            }
            Shell.Pool.SU.run("chmod 755 " + serverFile.getAbsolutePath());
            Shell.Pool.SU.run("cp " + serverFile.getAbsolutePath() + " /data/local/tmp/pokemod-server");
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        } catch (Shell.ShellDiedException e) {
            e.printStackTrace();
            return false;
        }
    }

    protected boolean injectorSetup(File injectorFile){
        try {
            int read;
            InputStream injectorInput = getAssets().open("core/pokemod-injector");
            byte[] buffer = new byte[injectorInput.available()];
            OutputStream outputStream = new FileOutputStream(injectorFile);
            try{
                while((read = injectorInput.read(buffer)) > 0) {
                    outputStream.write(buffer, 0, read);
                }
            } finally {
                outputStream.close();
                injectorInput.close();
            }
            if(!injectorFile.setExecutable(true)){
                Log.e("RequirementsHandler", "Error setting file executable.");
                return false;
            }
            Shell.Pool.SU.run("chmod 755 " + injectorFile.getAbsolutePath());
            Shell.Pool.SU.run("cp " + injectorFile.getAbsolutePath() + " /data/local/tmp/pokemod-injector");
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        } catch (Shell.ShellDiedException e) {
            e.printStackTrace();
            return false;
        }
    }
    private void respondError(){
        Intent returnIntent = new Intent();
        setResult(0, returnIntent);
        finish();
    }

    private void respondSuccess(){
        Intent returnIntent = new Intent();
        setResult(1, returnIntent);
        finish();
    }

    private void respondStopped() {
        Intent returnIntent = new Intent();
        setResult(2, returnIntent);
        finish();
    }
}