package com.zeprus.pokemodgo;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.Preference;
import android.preference.PreferenceFragment;
import android.preference.PreferenceManager;
import android.preference.SwitchPreference;
import android.widget.Switch;

public class LoadModulePrefFragment extends PreferenceFragment{

    @Override
    public void onCreate(final Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        getPreferenceManager().setSharedPreferencesName("load_modules");
        addPreferencesFromResource(R.xml.load_modules_screen);
    }
}
