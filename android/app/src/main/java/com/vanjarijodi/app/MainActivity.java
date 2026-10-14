package com.vanjarijodi.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Screenshot restriction (FLAG_SECURE) disabled to allow testers to capture screenshots & screen recordings
    }
}
