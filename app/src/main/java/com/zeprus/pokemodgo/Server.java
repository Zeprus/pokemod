package com.zeprus.pokemodgo;

import android.util.Log;

import eu.chainfire.libsuperuser.Shell;

public class Server {
    public boolean running;
    private Shell.Interactive shell;

    {
        try {
            shell = Shell.Pool.SU.get();
        } catch (Shell.ShellDiedException e) {
            e.printStackTrace();
        }
    }

    public boolean run(){
        try {
            shell.run("setenforce 0");
            shell.addCommand("/data/local/tmp/pokemod-server", 0, new Shell.OnCommandLineListener(){

                @Override
                public void onCommandResult(int commandCode, int exitCode) {

                }

                @Override
                public void onSTDOUT(String line) {
                    Log.d("Server", "Server response: " + line);
                }

                @Override
                public void onSTDERR(String line) {
                    Log.e("Server", "Server response: " + line);
                }
            });
        } catch (Shell.ShellDiedException e) {
            e.printStackTrace();
            return false;
        }
        return true;
    }
}
