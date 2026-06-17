# Foco

A native macOS menu-bar Pomodoro app — Tauri 2 (Rust) + Vue 3 + TypeScript.

Built as a learning / portfolio project, with the workflow polish of "Flow"
(menu-bar countdown, popover UI, statistics, streaks, notifications) and
without any Swift.

## Features

- **Menu-bar countdown** — live MM:SS in the macOS status bar, popover anchored under the icon.
- **Pomodoro state machine** — focus → short break → long break, cycle count configurable.
- **Persistent history** — every completed (or skipped) session is written to a local SQLite database.
- **Statistics view** — focus time for today / last 7 days / all time, 7-day bar chart, day-streak badge.
- **Settings** — durations, cycles, sound, notifications, launch-at-login.
- **End-of-session feedback** — Web Audio chime + native notification on natural completion.
- **Dark mode** — follows the system theme.

## Stack

| Layer        | Choice                                |
| ------------ | ------------------------------------- |
| Native shell | Tauri 2 (Rust)                        |
| UI           | Vue 3 + `<script setup>` + TypeScript |
| Bundler      | Vite                                  |
| State        | Pinia                                 |
| Persistence  | SQLite via sqlx                       |
| Charts       | Chart.js (vue-chartjs)                |

## Architecture

```
src/                          # Vue 3 frontend
├── components/               # dumb presentational components
├── views/                    # screens composed of components + stores
├── stores/                   # Pinia: timer, settings, stats
├── composables/              # cross-cutting effects (tray, recorder, notifier, autostart)
├── utils/                    # pure helpers (format, days, streak, sound)
└── types/

src-tauri/                    # Rust backend
└── src/
    ├── lib.rs                # plugin wiring, setup, activation policy
    ├── tray.rs               # menu-bar icon, menu, popover toggle
    ├── db.rs                 # SQLite pool + typed commands
    └── commands.rs           # set_tray_title
```

The frontend owns timer logic; Rust owns the OS surface (tray, DB, notifications)
and exposes a small typed command set. Cross-cutting effects (tray title sync,
session recording, notification, autostart) live in dedicated composables so
the stores stay free of transport concerns.

## Run

```bash
npm install
npm run tauri dev
```

## Build

```bash
npm run tauri build
```

Produces a `.app` and `.dmg` in `src-tauri/target/release/bundle/`.

## Plan

See [`plans/cadence-plan.md`](plans/cadence-plan.md) for the original phase-by-phase plan.
