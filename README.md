# SnapQL
cursor for data ⚡️ - explore your postgresql db in seconds

https://github.com/user-attachments/assets/15da0076-7bc4-4a20-a65b-103838ce3bc5

* generate schema-aware queries in seconds with AI
* supports any PostgreSQL database
* local desktop app - your database credentials don't leave your computer
* use your own OpenAI key

💬 [Join the Telegram group to chat with the devs + share feedback!](https://t.me/+QJu4_a2yImo3OTY0)

---

### 🧑‍💻 Build SnapQL locally

I will eventually ship some precompiled binaries, but that takes some setup. In the meantime, follow these steps to build a local copy:

* Clone the repo
* Run `npm install`
* If you're on MacOS, you will need to have XCode installed
* Run one of the following:
  * `npm run build:mac` — for a plain build
  * `npm run build:win` — for Windows
  * `npm run dist:mac` — for a **signed and notarized macOS build** (see setup below)
* Install the binary located in `./dist`

---

### 🧑‍💻 MacOS Signing & Notarization

If you want to build a signed & notarized macOS app (`npm run dist:mac`), you need to:

1. Have an **Apple Developer account**.
2. Create an **App-specific password** for notarization.
3. Set the following environment variables before running the build:
   ```bash
   export APPLE_ID="your-apple-id@example.com"
   export APPLE_ID_PASSWORD="your-app-specific-password"
   export ASC_PROVIDER="your-apple-team-id"
   export CSC_NAME="Developer ID Application: Your Name (TeamID)"

4. Run:
   ```bash
   npm run dist:mac
