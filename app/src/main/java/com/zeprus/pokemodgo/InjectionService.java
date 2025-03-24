package com.zeprus.pokemodgo;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.BitmapFactory;
import android.graphics.PixelFormat;
import android.os.IBinder;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.LinearLayout;
import android.widget.PopupWindow;
import android.widget.Toast;

import java.io.File;
import java.util.Objects;

import eu.chainfire.libsuperuser.Shell;

public class InjectionService extends Service implements View.OnClickListener{
    private static final String STOP_SELF = "stop";
    protected File injectorFile;
    protected File serverFile;
    public static boolean running = false;
    protected Injector injector;
    protected Server server;

    private WindowManager windowManager;
    private View floatingWidget;

    public void onCreate(){
        super.onCreate();
        serverFile = new File(this.getFilesDir(), "pokemod-server");
        injectorFile = new File(this.getFilesDir(), "pokemod-injector");
        SharedPreferences prefs = this.getSharedPreferences("module_prefs", MODE_PRIVATE);

        if(prefs.getBoolean("manualInject", false)){
            setupWidget();
        }
    }

    private void setupWidget() {
        floatingWidget = LayoutInflater.from(this).inflate(R.layout.injection_widget, null);
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        final WindowManager.LayoutParams params;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            params = new WindowManager.LayoutParams(
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                    PixelFormat.TRANSLUCENT);
        } else {
            params = new WindowManager.LayoutParams(
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.TYPE_PHONE,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                    PixelFormat.TRANSLUCENT);
        }
        windowManager.addView(floatingWidget, params);
        floatingWidget.findViewById(R.id.widget_inject).setOnClickListener(this);
        floatingWidget.findViewById(R.id.widget_root).setOnTouchListener(new View.OnTouchListener() {
            private int initialX;
            private int initialY;
            private float initialTouchX;
            private float initialTouchY;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        initialX = params.x;
                        initialY = params.y;
                        initialTouchX = event.getRawX();
                        initialTouchY = event.getRawY();
                        return true;

                    case MotionEvent.ACTION_UP:
                        return true;

                    case MotionEvent.ACTION_MOVE:
                        params.x = initialX + (int) (event.getRawX() - initialTouchX);
                        params.y = initialY + (int) (event.getRawY() - initialTouchY);
                        windowManager.updateViewLayout(floatingWidget, params);
                        return true;
                }
                return false;
            }
        });
    }

    public int onStartCommand(Intent intent, int flags, int startId){
        if(intent.getBooleanExtra("startInjector", false)){
            startInjector();
            return START_NOT_STICKY;
        }
        if(Objects.equals(intent.getAction(), STOP_SELF)){
            stopSelf();
        }
        server = new Server();
        if(!server.running) startServer();
        createNotification();
        running = true;
        return START_NOT_STICKY;
    }
    private void startServer(){
        if(!server.run()){
            Log.e("InjectionService", "Error starting server.");
        }
    }
    public static void stopServer(){
        try {
            Shell.Pool.SU.run("killall -15 pokemod-server");
        } catch (Shell.ShellDiedException e) {
            e.printStackTrace();
        }
    }
    private void startInjector() {
        new Injector(getApplicationContext()).inject();
    }
    public static void stopInjector(){
        try {
            Shell.Pool.SU.run("killall -15 pokemod-injector");
        } catch (Shell.ShellDiedException e) {
            e.printStackTrace();
        }
    }
    private void createNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        Intent stopSelf = new Intent(this, InjectionService.class);
        stopSelf.setAction(STOP_SELF);
        PendingIntent pStopSelf = PendingIntent.getService(this, 0, stopSelf, 0);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent, 0);
            Notification notification = new Notification.Builder(this, "Service")
                    .setContentTitle("Pokémod GO")
                    .setContentText("Pokémod GO is running")
                    .setSmallIcon(R.mipmap.ic_launcher)
                    .setLargeIcon(BitmapFactory.decodeResource(this.getResources(),
                            R.mipmap.ic_launcher))
                    .setContentIntent(pendingIntent)
                    .addAction(R.drawable.ic_launcher_foreground, "Stop", pStopSelf)
                    .build();
            startForeground(1, notification);
        }
    }
    @Override
    public void onClick(View v) {
        Intent startInjectorIntent = new Intent(getApplicationContext(), InjectionService.class)
                .putExtra("startInjector", true);
        startService(startInjectorIntent);
        if (floatingWidget != null) windowManager.removeView(floatingWidget);
    }
    @Override
    public void onDestroy() {
        stopServer();
        stopInjector();
        cleanup();
        if (floatingWidget != null) windowManager.removeView(floatingWidget);
        super.onDestroy();
        running = false;
    }
    protected void cleanup(){
        try {
            Shell.Pool.SU.run("setenforce 1");
            Shell.Pool.SU.run("rm -rf /data/local/tmp/*frida*");
            Shell.Pool.SU.run("rm -rf /data/local/tmp/pokemod*");
        } catch (Shell.ShellDiedException e) {
            Log.e("InjectionService", "Cleanup error");
            e.printStackTrace();
        }
    }
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}