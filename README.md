# quip_translator

A tiny always-on-top translator widget for the desktop, styled like a terminal
(TUI) with the [Gruvbox](https://github.com/morhetz/gruvbox) dark-hard palette.
Built with Electron.

Press **⌘⇧T** (Ctrl+Shift+T on Windows/Linux) anywhere to pop it open, type,
get the translation, hit **Esc** to hide it again.

## Features

- Global shortcut toggle — works even when the app is in the background
- Frameless, always-on-top widget; hides on Esc or when it loses focus
- Floats above everything on macOS, including other apps' fullscreen spaces
- Auto language detection, 20+ target languages, one-key swap (`<->`)
- Translates as you type (Google Translate free endpoint, no API key)
- Remembers your language pair between sessions
- No Dock icon — it stays out of the way; quit with `[x]`

## Run

```sh
npm install
npm start
```

Then press ⌘⇧T to show or hide the widget.

## Start at login (macOS)

```sh
npm run autostart          # install LaunchAgent + start now
npm run autostart:remove   # undo
```

This writes `~/Library/LaunchAgents/com.quipo.translator.plist`, so the widget
launches in the background at every login and ⌘⇧T is always available.

## Keys

| Key   | Action              |
|-------|---------------------|
| ⌘⇧T   | Toggle the widget   |
| Esc   | Hide                |
| `<->` | Swap languages      |
| `[x]` | Quit the app        |

## Project layout

- `main.js` — Electron main process: window, global shortcut, translation IPC
- `preload.js` — context-isolated bridge between renderer and main
- `index.html` — the entire UI (markup, gruvbox styling, renderer logic)
