# Getting Started

Follow these steps to run the extension locally and load it in your browser during development.

## 1) Install dependencies

- Install Node.js 18+ and a package manager (pnpm recommended).
- From the project root, install packages:

```bash
pnpm install
# or
npm install
# or
yarn install
```

## 2) Start the development build

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

This watches the source files and outputs a dev build in `build/<browser>-mv3-dev`.

## 3) Load the extension in your browser (Chrome/Edge)

1. Open `chrome://extensions` (or `edge://extensions`).
2. Toggle on **Developer mode**.
3. Click **Load unpacked** and select `build/chrome-mv3-dev`.
4. Keep the dev server running; click **Reload** on the extension after code changes.

## 4) Load the extension in Firefox (optional)

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on**.
3. Select `build/firefox-mv3-dev/manifest.json`.
4. Reload the temporary add-on after changes while `pnpm dev` continues to run.
