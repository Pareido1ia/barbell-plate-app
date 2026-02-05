This is a [React Native](https://reactnative.dev) app.

# Run locally on Android emulator (Android Studio)

Prereqs: Node 20+, JDK 17, Android Studio with Android SDK + an AVD created. Ensure `JAVA_HOME` points to JDK 17 and Android SDK tools (`adb`, `emulator`) are on your PATH (Android Studio can add them).

1) Install deps (first time):  
   `npm install`
2) Start Metro (terminal 1):  
   `npm start`
3) Start an emulator from Android Studio (AVD Manager) or via CLI:  
   `emulator -avd <your_avd_name>`
4) With Metro running, install to the emulator (terminal 2):  
   `npm run android`

Shortcuts: `RR` in the emulator to reload; `Ctrl+M` (Win/Linux) or `Cmd+M` (macOS) for the dev menu.

# Build a release APK (sideload)

Prereqs: JDK 17 + Android SDK.

```sh
# optional: set JAVA_HOME if not already
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17"

npm install          # once
cd android
gradlew.bat assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

Sideload to a device (USB debugging on):

```sh
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

For a store-ready build, create your own keystore and point `signingConfigs.release` to it, then rerun `gradlew.bat assembleRelease` (APK) or `gradlew.bat bundleRelease` (AAB).
