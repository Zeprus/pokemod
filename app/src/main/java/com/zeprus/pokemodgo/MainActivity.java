package com.zeprus.pokemodgo;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.preference.PreferenceManager;
import android.provider.Settings;
import androidx.annotation.Nullable;
import com.google.android.material.navigation.NavigationView;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.appcompat.app.ActionBarDrawerToggle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import java.io.File;

import eu.chainfire.libsuperuser.Shell;

public class MainActivity extends AppCompatActivity implements NavigationView.OnNavigationItemSelectedListener{
    protected File serverFile;
    protected File injectorFile;
    private Switch switchService;
    private Context context;
    private SharedPreferences modulePrefs;
    private static final int REQUIREMENTS_REQUEST_CODE = 1;
    private Button attachButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        File scriptDir = new File(getFilesDir(), "armeabi-v7a/core/scripts");
        if(!scriptDir.exists()) scriptDir.mkdir();
        super.onCreate(savedInstanceState);
        context = this;
        if(!checkSU()){
            setContentView(R.layout.root_missing);
            return;
        }
        loadDefaultPrefs();
        loadUi();
        checkAndDisplayPogoVersion();
        askPermission();
        switchService = findViewById(R.id.switchService);
        setSwitchState();
        serverFile = new File(this.getFilesDir(), "pokemod-server");
        injectorFile = new File(this.getFilesDir(), "pokemod-injector");
        createNotificationChannels();
    }

    private void loadDefaultPrefs() {
        PreferenceManager.setDefaultValues(this, "load_modules",MODE_PRIVATE, R.xml.load_modules_screen, true);
        PreferenceManager.setDefaultValues(this, "module_prefs", MODE_PRIVATE, R.xml.module_pref_screen, true);
        modulePrefs = context.getSharedPreferences("module_prefs", MODE_PRIVATE);
    }

    private void checkAndDisplayPogoVersion(){
        try {
            PackageInfo info = getPackageManager().getPackageInfo("com.nianticlabs.pokemongo", 0);
            String versionName = info.versionName;
            TextView textView = findViewById(R.id.version_display);
            if(versionName.equals(getString(R.string.supported_version))){
                textView.setText(getString(R.string.pokemon_version_display, versionName));
            } else {
                textView.setText(getString(R.string.unsupported_version, versionName, getString(R.string.supported_version)));
                attachButton.setEnabled(false);
            }
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
    }
    private void loadUi() {
        setContentView(R.layout.activity_main);
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        DrawerLayout drawer = findViewById(R.id.drawer_layout);
        NavigationView navigationView = findViewById(R.id.nav_view);
        attachButton = findViewById(R.id.buttonAttach);
        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(
                this, drawer, toolbar, R.string.navigation_drawer_open, R.string.navigation_drawer_close);
        drawer.addDrawerListener(toggle);
        toggle.syncState();
        navigationView.setNavigationItemSelectedListener(this);
    }
    private void askPermission() {
        Intent intent;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + getPackageName()));
            startActivityForResult(intent, 2084);
        }
        // TODO: add a `adb shell dumpsys deviceidle whitelist +com.zeprus.pokemodgo` check in here
    }
    private void startService() {
        Intent startInjectionService = new Intent(this, InjectionService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            this.startForegroundService(startInjectionService);
        } else {
            this.startService(startInjectionService);
        }
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            NotificationChannel serviceChannel = new NotificationChannel("Service", "Service", NotificationManager.IMPORTANCE_LOW);
            serviceChannel.setDescription("Displays if the service is running.");
            notificationManager.createNotificationChannel(serviceChannel);
            NotificationChannel popupChannel = new NotificationChannel("Popup", "Popup", NotificationManager.IMPORTANCE_HIGH);
            popupChannel.setDescription("Shows notification popups for e.g. IV");
            notificationManager.createNotificationChannel(popupChannel);
        }
    }
    protected void checkRequirements(){
        Intent startRequirementsHandler = new Intent(this, RequirementsHandler.class);
        this.startActivityForResult(startRequirementsHandler, REQUIREMENTS_REQUEST_CODE);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        switch (requestCode){
            case REQUIREMENTS_REQUEST_CODE: requirementsResult(resultCode);
        }
    }

    protected void requirementsResult(int resultCode){
        switch (resultCode){
            case 0:
                switchService.setChecked(false);
                return;
            case 1:
                startService();
                break;
            case 2:
                Toast.makeText(context, "Successfully stopped.", Toast.LENGTH_SHORT).show();
        }
    }

    private void setSwitchState(){
         final CompoundButton.OnCheckedChangeListener checkedListener = new CompoundButton.OnCheckedChangeListener() {
             @Override
             public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                 if(isChecked){
                     checkRequirements();
                 } else {
                     stopAndCleanup();
                 }
             }
         };
        switchService.setOnCheckedChangeListener(checkedListener);
        switchService.setChecked(InjectionService.running);
    }
    public void attach(View view){
        if(!InjectionService.running){
            Toast.makeText(context, "Please start the service first.", Toast.LENGTH_SHORT).show();
            return;
        }
        PackageManager packageManager = context.getPackageManager();
        try {
            Intent pogoLaunchIntent = packageManager.getLaunchIntentForPackage("com.nianticlabs.pokemongo");
            if (pogoLaunchIntent != null) {
                pogoLaunchIntent.addCategory(Intent.CATEGORY_LAUNCHER);
                context.startActivity(pogoLaunchIntent);
            }
        } catch (
                ActivityNotFoundException e) {
            e.printStackTrace();
            Toast.makeText(context, "Pokemon GO not found.", Toast.LENGTH_SHORT).show();
            return;
        }
        if(!modulePrefs.getBoolean("manualInject", false)) {
            Handler handler = new Handler();
            handler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    Intent startInjectorIntent = new Intent(context, InjectionService.class)
                            .putExtra("startInjector", true);
                    startService(startInjectorIntent);
                }
            }, 800);
        } else {
            Toast.makeText(context, "Manual injection is enabled, please use the widget.", Toast.LENGTH_SHORT).show();
        }
    }
    private boolean openSettings() {
        Intent launchSettingsIntent = new Intent(this, ModuleToggleSettingsActivity.class);
        this.startActivity(launchSettingsIntent);
        return true;
    }
    private boolean openAdvancedSettings() {
        Intent launchSettingsIntent = new Intent(this, ModuleSettingsActivity.class);
        this.startActivity(launchSettingsIntent);
        return true;
    }
    private void stopInjectionService() {
        stopService(new Intent(this, InjectionService.class));
    }

    protected void cleanup(){
        try {
            Shell.Pool.SU.run("setenforce 1");
            Shell.Pool.SU.run("rm -rf /data/local/tmp/*frida*");
            Shell.Pool.SU.run("rm -rf /data/local/tmp/pokemod*");
        } catch (Shell.ShellDiedException e) {
            Log.e("Mainactivity", "Cleanup error");
            e.printStackTrace();
        }
    }
    private void stopAndCleanup(){
        if(InjectionService.running) {
            stopInjectionService();
        }
        cleanup();
        Toast.makeText(context, "Cleanup performed.", Toast.LENGTH_SHORT).show();
    }
    public void performCleanup(View v){
            stopAndCleanup();
    }
    private boolean checkSU() {
        return Shell.SU.available();
    }
    @Override
    public void onBackPressed() {
        DrawerLayout drawer = findViewById(R.id.drawer_layout);
        if (drawer.isDrawerOpen(GravityCompat.START)) {
            drawer.closeDrawer(GravityCompat.START);
        } else {
            super.onBackPressed();
        }
    }


    @SuppressWarnings("StatementWithEmptyBody")
    @Override
    public boolean onNavigationItemSelected(MenuItem item) {
        // Handle navigation view item clicks here.
        int id = item.getItemId();

        if (id == R.id.nav_settings) {
            return openSettings();
        }

        if(id==R.id.nav_advanced){
            return openAdvancedSettings();
        }

        DrawerLayout drawer = findViewById(R.id.drawer_layout);
        drawer.closeDrawer(GravityCompat.START);
        return true;
    }
}
