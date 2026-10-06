#!/usr/bin/env bash
#
# Builds the Android APK using the SDK command-line tools directly.
#
# Gradle and the Android Gradle Plugin are deliberately avoided: this project is
# one Activity plus a handful of resources, and the plugin brings a large
# dependency tree and its own failure modes. aapt2 + javac + d8 + apksigner is
# the same work with far less to go wrong.
#
# Usage: bash tools/build_apk.sh
set -euo pipefail

BUILD_ROOT="${ANDROID_BUILD_ROOT:-/d/Users/ROG/Downloads/android-build}"
SDK_ROOT="$BUILD_ROOT/android-sdk"
JDK_ROOT="$BUILD_ROOT/jdk17"
BUILD_TOOLS_VERSION="34.0.0"
PLATFORM_VERSION="android-34"
MIN_SDK="21"
TARGET_SDK="34"

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/android"
OUT_DIR="$ANDROID_DIR/build"
KEYSTORE_DIR="$ANDROID_DIR/keystore"
KEYSTORE="$KEYSTORE_DIR/release.keystore"
KEY_ALIAS="bioexamterms"
PASSWORD_FILE="$KEYSTORE_DIR/password.txt"

BUILD_TOOLS="$SDK_ROOT/build-tools/$BUILD_TOOLS_VERSION"
ANDROID_JAR="$SDK_ROOT/platforms/$PLATFORM_VERSION/android.jar"

require_file() {
  if [ ! -e "$1" ]; then
    echo "ERROR: $2 not found at $1" >&2
    exit 1
  fi
}

require_file "$JDK_ROOT/bin/javac.exe" "JDK 17"
require_file "$ANDROID_JAR" "Android platform $PLATFORM_VERSION"
require_file "$BUILD_TOOLS/aapt2.exe" "build-tools $BUILD_TOOLS_VERSION"

export JAVA_HOME="$JDK_ROOT"
export PATH="$JDK_ROOT/bin:$PATH"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/compiled" "$OUT_DIR/classes" "$OUT_DIR/dex" "$OUT_DIR/gen"

# --- signing key ------------------------------------------------------------

mkdir -p "$KEYSTORE_DIR"
if [ ! -f "$KEYSTORE" ]; then
  if [ ! -f "$PASSWORD_FILE" ]; then
    echo "bioexamterms-$(date +%Y)" > "$PASSWORD_FILE"
  fi
  STORE_PASSWORD="$(cat "$PASSWORD_FILE")"
  echo "creating signing key at $KEYSTORE"
  "$JDK_ROOT/bin/keytool.exe" -genkeypair -v \
    -keystore "$KEYSTORE" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass "$STORE_PASSWORD" -keypass "$STORE_PASSWORD" \
    -dname "CN=Bio Exam Terms, OU=Study, O=Personal, L=Wuhan, ST=Hubei, C=CN"
else
  STORE_PASSWORD="$(cat "$PASSWORD_FILE")"
fi

# --- resources --------------------------------------------------------------

echo "compiling resources"
"$BUILD_TOOLS/aapt2.exe" compile --dir "$ANDROID_DIR/res" -o "$OUT_DIR/compiled/res.zip"

echo "linking manifest and resources"
"$BUILD_TOOLS/aapt2.exe" link \
  -o "$OUT_DIR/base.apk" \
  -I "$ANDROID_JAR" \
  --manifest "$ANDROID_DIR/AndroidManifest.xml" \
  --java "$OUT_DIR/gen" \
  --min-sdk-version "$MIN_SDK" \
  --target-sdk-version "$TARGET_SDK" \
  --version-code 1 \
  --version-name "1.0.0" \
  "$OUT_DIR/compiled/res.zip"

# --- java -------------------------------------------------------------------

echo "compiling java"
SOURCES="$(find "$ANDROID_DIR/src" "$OUT_DIR/gen" -name '*.java')"
# shellcheck disable=SC2086
"$JDK_ROOT/bin/javac.exe" \
  --release 11 \
  -classpath "$ANDROID_JAR" \
  -encoding UTF-8 \
  -d "$OUT_DIR/classes" \
  $SOURCES

# --- dex --------------------------------------------------------------------

echo "dexing"
CLASSES="$(find "$OUT_DIR/classes" -name '*.class')"
# shellcheck disable=SC2086
"$BUILD_TOOLS/d8.bat" \
  --min-api "$MIN_SDK" \
  --lib "$ANDROID_JAR" \
  --output "$OUT_DIR/dex" \
  $CLASSES

python "$PROJECT_ROOT/tools/apk_add_dex.py" "$OUT_DIR/base.apk" "$OUT_DIR/dex/classes.dex"

# --- align and sign ---------------------------------------------------------

echo "aligning"
"$BUILD_TOOLS/zipalign.exe" -f -p 4 "$OUT_DIR/base.apk" "$OUT_DIR/aligned.apk"

echo "signing"
FINAL_APK="$ANDROID_DIR/bio-exam-terms.apk"
"$BUILD_TOOLS/apksigner.bat" sign \
  --ks "$KEYSTORE" \
  --ks-key-alias "$KEY_ALIAS" \
  --ks-pass "pass:$STORE_PASSWORD" \
  --key-pass "pass:$STORE_PASSWORD" \
  --v1-signing-enabled true \
  --v2-signing-enabled true \
  --out "$FINAL_APK" \
  "$OUT_DIR/aligned.apk"

"$BUILD_TOOLS/apksigner.bat" verify --print-certs "$FINAL_APK" | head -4

echo
echo "APK: $FINAL_APK  ($(du -h "$FINAL_APK" | cut -f1))"
