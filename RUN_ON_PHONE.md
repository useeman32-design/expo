# How to run Albarka on your phone

The easiest way is **Expo Go** — no building, no Android Studio / Xcode. You scan a QR code and the app opens on your phone in seconds.

---

## 0. Get the code onto your computer
Download `albarka-source.zip` and **unzip** it into a folder, e.g. `albarka/`.

## 1. Install Node.js (only once)
Download the **LTS** version from <https://nodejs.org> and install it.
Check it works in a terminal:
```bash
node -v
npm -v
```

## 2. Install the app's dependencies
Open a terminal **inside the unzipped `albarka` folder** and run:
```bash
npm install
```

## 3. Install the "Expo Go" app on your phone
- **Android:** get it from the Play Store (free, works in Nigeria)
- **iPhone:** get it from the App Store

## 4. Start the app
In the same terminal, run:
```bash
npx expo start
```
A QR code appears in the terminal.

## 5. Scan the QR code
Make sure your **phone and computer are on the same network** (easiest: turn on your phone's hotspot and connect your laptop to it).
- **Android:** open Expo Go → tap **"Scan QR code"**
- **iPhone:** open the regular **Camera** app and point it at the QR

The app opens on your phone. 🎉 Edit the code on your computer and it **reloads automatically**.

---

## Troubleshooting (common in Nigeria)

**"Could not connect" / QR won't load**
Your network may be blocking local connections. Run with tunnel mode instead — it works over the internet, no shared WiFi needed:
```bash
npx expo start --tunnel
```
(First time it may ask to install `@expo/ngrok` — press `y`.)

**Slow first load** — that's normal. The first launch downloads the bundle; after that it's instant.

**Press `r` in the terminal** to force a reload, `j` to open in a web browser, `q` to quit.

---

## Later: a real installable app (.apk)
Expo Go is perfect for testing. When you want a standalone app you can share or put on the Play Store, build it with EAS:
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
EAS builds it in the cloud and gives you a downloadable `.apk`.
