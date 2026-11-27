package com.vanjarijodi.app;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Fix Android 15/16 (API 35/36) edge-to-edge overlap so the status/network bar
        // and display cutout NEVER cover the top helpline strip or app header.
        Window window = getWindow();
        if (window != null) {
            final int headerMaroon = Color.parseColor("#5E0715");

            // Keep content cleanly inset below status bar & above navigation bar / IME
            WindowCompat.setDecorFitsSystemWindows(window, false);

            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.VANILLA_ICE_CREAM) {
                window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
                window.setStatusBarColor(headerMaroon);
            }

            View decorView = window.getDecorView();
            decorView.setBackgroundColor(headerMaroon);

            // Light (white) status bar icons (clock, WiFi, 4G/5G network, battery) on maroon bar
            WindowInsetsControllerCompat insetsController =
                WindowCompat.getInsetsController(window, decorView);
            if (insetsController != null) {
                insetsController.setAppearanceLightStatusBars(false);
            }

            View contentView = findViewById(android.R.id.content);
            if (contentView != null) {
                contentView.setBackgroundColor(headerMaroon);
                ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, windowInsets) -> {
                    Insets systemBars = windowInsets.getInsets(
                        WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
                    );
                    Insets ime = windowInsets.getInsets(WindowInsetsCompat.Type.ime());
                    int bottomInset = Math.max(systemBars.bottom, ime.bottom);
                    v.setPadding(systemBars.left, systemBars.top, systemBars.right, bottomInset);
                    return WindowInsetsCompat.CONSUMED;
                });
                ViewCompat.requestApplyInsets(contentView);
            }
        }
    }
}
