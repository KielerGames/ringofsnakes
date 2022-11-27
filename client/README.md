[![Web-Client CI](https://github.com/KielerGames/ringofsnakes/actions/workflows/client.yml/badge.svg)](https://github.com/KielerGames/ringofsnakes/actions/workflows/client.yml)

## Install dependencies

Requires node.js (tested with version 16, usually the latest LTS version should work).
Run `npm install` in this directory.

## Build

Run `npm run build`.
This should create 
 - `public/index.html` and
 - `public/main.bundle.js` and
 - `public/worker.bundle.js` and
 - `public/shaders.json`.

Open `public/index.html` in a web browser.

> **Note**:
> You can configure the server address the client will connect to by setting an environment variable `GAME_SERVER`. The default value is `ws://127.0.0.1:8080/game`.
