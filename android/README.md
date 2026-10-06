# Android wrapper

Packages the web app into an APK that can be installed from the phone's file
manager, for phones whose built-in browser cannot install a PWA.

## Why a WebView and not a Trusted Web Activity

A TWA is the usual way to ship a PWA as an APK, but it **requires Google Chrome
to be installed** — the TWA launches Chrome to render the page. The phones this
targets use their vendor browser and may not have Chrome at all, in which case a
TWA installs and then shows nothing useful.

A WebView runs on the system WebView component, which every Android device has.
It also avoids needing a hosted `/.well-known/assetlinks.json`.

The trade-off: rendering comes from the system WebView rather than Chrome, so
it can differ slightly across devices. `speechSynthesis` (the 发音 button) is
the most likely casualty on older WebView builds.

The app loads the deployed URL, so **updating the glossary never requires
reinstalling the APK** — just push to the site.

## Building

Requires JDK 17 and Android SDK build-tools 34.0.0 plus platform android-34.
The script expects them under `ANDROID_BUILD_ROOT` (default
`D:/Users/ROG/Downloads/android-build`):

```
android-build/
  jdk17/
  android-sdk/
    build-tools/34.0.0/
    platforms/android-34/
```

Then, from the repository root:

```bash
bash tools/build_apk.sh
```

Output: `android/bio-exam-terms.apk`.

Gradle is deliberately not used. This is one Activity and a handful of
resources; `aapt2 + javac + d8 + zipalign + apksigner` does the same job with
far less to download and far fewer ways to fail.

## The signing key

`android/keystore/` holds `release.keystore` and `password.txt`. Both are
gitignored and **must be backed up somewhere safe**. Android identifies an app
by its signing key: lose it and you cannot ship an update that installs over an
existing install — you would have to uninstall first.

## Changing the app

- Name shown under the icon: `res/values/strings.xml`
- Icon: regenerate with `node tools/make_icons.mjs`
- Starting URL, back-button behaviour, WebView settings: `src/com/xulicheng/bioexamterms/MainActivity.java`
- Permissions, orientation, app id: `AndroidManifest.xml`
