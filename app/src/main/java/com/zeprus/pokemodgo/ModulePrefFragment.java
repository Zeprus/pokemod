package com.zeprus.pokemodgo;

import android.os.Bundle;
import android.preference.PreferenceFragment;

public class ModulePrefFragment extends PreferenceFragment{
    @Override
    public void onCreate(final Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        getPreferenceManager().setSharedPreferencesName("module_prefs");
        addPreferencesFromResource(R.xml.module_pref_screen);
    }
}
