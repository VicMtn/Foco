# Foco

A native macOS menu-bar Pomodoro app

## Features

- **Menu-bar countdown** — live MM:SS in the macOS status bar, popover anchored under the icon.
- **Pomodoro state machine** — focus → short break → long break, cycle count configurable.
- **Auto-start sessions** — optionally chain focus and break sessions without manual input.
- **20-20-20 eye care** — floating widget every 20 min of focus reminding you to look 20 ft away for 20 s.
- **Persistent history** — every completed or skipped session is written to a local SQLite database.
- **Statistics view** — focus time for today / last 7 days / all time, 7 day bar chart, day streak badge.
- **Settings** — durations, cycles, automation, sound, notifications, launch-at-login.
- **End-of-session** — Web Audio note + native notification on natural completion.
- **Theme mode** — follows the system.

## Stack

| Layer        | Choice                |
| ------------ | --------------------- |
| Native shell | Tauri 2 (Rust)        |
| UI           | Vue 3 with TypeScript |
| Bundler      | Vite                  |
| State        | Pinia                 |
| Persistence  | SQLite via sqlx       |
| Charts       | Chart.js              |
| Icons        | lucide-vue-next       |

## Architecture

```
src/
├── components/               # presentational components
├── views/                    # screens composed of components + stores
├── stores/                   # Pinia: timer, settings, stats
├── composables/              # Stateful fonctions (tray, recorder, notifier, autostart, eye-care)
├── utils/                    # pure helpers (format, days, streak, sound)
├── EyeRestApp.vue            # standalone app mounted in the eye-rest popup window
└── types/

src-tauri/
└── src/
    ├── lib.rs                # plugin , setup, activation policy
    ├── tray.rs               # menu-bar icon, menu, popover toggle
    ├── db.rs                 # SQLite + typed commands
    └── commands.rs           # set_tray_title
```

## Run

```bash
npm install
npm start
```

## Build

```bash
npm run tauri build
```

Produces a `.app` and `.dmg` in `src-tauri/target/release/bundle/`.
