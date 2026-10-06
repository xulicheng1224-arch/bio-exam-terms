package com.xulicheng.bioexamterms;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Hosts the terminology trainer in a WebView so it can be launched from the
 * home screen.
 *
 * Deliberately not a Trusted Web Activity: a TWA requires Google Chrome to be
 * installed, and the target phones use their vendor browser instead. A WebView
 * runs on the system WebView component, which every Android device has.
 */
public class MainActivity extends Activity {

    private static final String START_URL =
        "https://xulicheng1224-arch.github.io/bio-exam-terms/";

    private static final int BACKGROUND_COLOR = 0xFF0F1115;

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        // localStorage is where the study progress lives.
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(false);

        webView.setWebViewClient(new WebViewClient());
        webView.setBackgroundColor(BACKGROUND_COLOR);
        webView.loadUrl(START_URL);

        setContentView(webView);
    }

    /** Keeps in-app navigation inside the app instead of leaving it. */
    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }
        super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
