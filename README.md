# SnapQL

cursor for data ⚡️ - explore your postgresql db in seconds

[https://github.com/user-attachments/assets/15da0076-7bc4-4a20-a65b-103838ce3bc5](https://github.com/user-attachments/assets/15da0076-7bc4-4a20-a65b-103838ce3bc5)

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

## 📜 macOS Signing & Notarization — Environment Variables

When signing and notarizing the app, you’ll need to provide these environment variables for `electron-builder`. Here’s what they mean and where to find them:

| Variable            | Description                                                                                               | Where to Find It                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `APPLE_ID`          | Your Apple ID (the one you use for your Apple Developer account).                                         | [https://developer.apple.com/account](https://developer.apple.com/account)                                            |
| `APPLE_ID_PASSWORD` | An **App-specific password** generated under your Apple account security.                                 | Go to [https://appleid.apple.com/account/manage](https://appleid.apple.com/account/manage) → “App-Specific Passwords” |
| `ASC_PROVIDER`      | Your **Team ID** (a 10-character alphanumeric string).                                                    | [https://developer.apple.com/account](https://developer.apple.com/account) → “Membership” → “Team ID”                 |
| `CSC_NAME`          | The **exact name of your Developer ID Application certificate** installed in Keychain Access on your Mac. | Open **Keychain Access** → “My Certificates” → Copy the full name, e.g. `Developer ID Application: John Doe (TEAMID)` |

---

> 💡 **Reference:**
> See the official `electron-builder` docs for more details:
> 🔗 [Electron Builder — Apple Notarization](https://www.electron.build/code-signing#apple-notarization)

---

With these environment variables set up, `electron-builder` will automatically handle signing and notarization when you run:

```bash
npm run dist:mac
```

---

Happy hacking! 🎉
