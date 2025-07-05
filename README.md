# SnapQL <!-- omit in toc -->

cursor for data ⚡️ - explore your postgresql db in seconds

https://github.com/user-attachments/assets/15da0076-7bc4-4a20-a65b-103838ce3bc5

- generate schema-aware queries in seconds with AI
- supports any PostgreSQL database
- local desktop app - your database credentials don't leave your computer
- use your own OpenAI key

💬 [Join the Telegram group to chat with the devs + share feedback!](https://t.me/+QJu4_a2yImo3OTY0)

- [Build SnapQL locally](#build-snapql-locally)
  - [Quick Start (using Makefile)](#quick-start-using-makefile)
  - [Manual Build Steps](#manual-build-steps)
  - [Makefile Commands](#makefile-commands)

## Build SnapQL locally

I will eventually ship some precompiled binaries, but that takes some setup. In the meantime, follow these steps to build a local copy:

### Quick Start (using Makefile)

```bash
git clone <repo-url>
cd snap-ql
make install-global  # Installs deps, builds for your platform, and adds to PATH
```

Now you can run `snap-ql` from anywhere in your terminal!

### Manual Build Steps

- clone the repo
- run `npm install` (or `make install`)
- if you're on MacOS, you will need to have XCode installed
- run `npm run build:mac` or `npm run build:win` depending on your platform (or `make dist-mac`/`make dist-win`)
- install the binary located in `./dist`

### Makefile Commands

- `make help` - Show all available commands
- `make dev` - Start development server with hot reload
- `make install-global` - Build and install to PATH in one step
- `make link` / `make unlink` - Add/remove from PATH (after building)
- `make clean` - Clean build artifacts

<a href="https://news.ycombinator.com/item?id=44326620">
  <img
    alt="Featured on Hacker News"
    src="https://hackerbadge.now.sh/api?id=44326620"
  />
</a>

[![Tip in Crypto](https://tip.md/badge.svg)](https://tip.md/NickTikhonov)
