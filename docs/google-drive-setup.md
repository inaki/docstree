# Connect Docstree to Google Drive

Step-by-step to enable Google Sign-In and Drive API for this extension.

## 1) Create a Google Cloud project

- Go to <https://console.cloud.google.com/> and create/select a project.
- Set a recognizable name (e.g., “Docstree Extension”).

## 2) Enable the Drive API

- In the project, open **APIs & Services → Library**.
- Search for **Google Drive API** and click **Enable**.

## 3) Configure OAuth consent

- Go to **APIs & Services → OAuth consent screen**.
- Choose **External** (recommended) unless you manage all users in one workspace.
- Fill app name, user support email, and developer contact.
- Add scopes: include `https://www.googleapis.com/auth/drive.readonly` so the token can read file metadata. Keep the scope minimal; add broader scopes (e.g., `drive.file` or `drive`) only if you later need write access or full-drive access.
- Add test users (your Google accounts) while in “Testing” mode.
- Save and **Publish** if you want broader access later.

## 4) Create OAuth client for the Chrome extension

- Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
- Choose **Application type: Chrome app** (or “Desktop” if Chrome app is not shown; you can switch to extension later).
- For **Application ID**, use your extension ID. During development, grab it from `chrome://extensions` after loading the unpacked build.
- The redirect URL must be `https://<EXTENSION_ID>.chromiumapp.org/` (Chrome/Edge). Add this under **Authorized redirect URIs**.
- Download or copy the **Client ID** (`...apps.googleusercontent.com`).

## 5) Wire the client ID and scopes into the manifest

- In `package.json`, set `manifest.oauth2.client_id` to your client ID.
- Ensure scopes include Drive read access:

```json
"oauth2": {
  "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "scopes": ["https://www.googleapis.com/auth/drive.readonly"]
}
```

- Keep `permissions: ["identity"]` in the manifest. Host permissions already allow Google APIs.

## 6) Load the extension for development

```bash
yarn install
yarn dev
```

- In Chrome/Edge, open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select `build/chrome-mv3-dev`.
- Copy the extension ID from that page and, if needed, update the OAuth client’s Application ID and redirect URI to match.
- After editing the manifest client ID, rerun `yarn dev` and reload the unpacked extension.

## 7) Test sign-in and Drive fetch

- Click **Sign in with Google** in the popup. A Google consent window should appear.
- On success, the popup lists Drive files using the token via the Drive API (`lib/googleDrive.ts`).
- Use the search box to filter the mock tree; the live Drive list appears separately.

## 8) Common troubleshooting

- **redirect_uri_mismatch**: Ensure the redirect matches `https://<EXTENSION_ID>.chromiumapp.org/` exactly and that the Application ID matches your extension ID.
- **invalid_client**: Use a Chrome/Edge OAuth client type; check for typos in the client ID.
- **user_not_whitelisted**: Add your account as a test user in the OAuth consent screen (while in Testing mode).
- **No consent screen popup**: Make sure `permissions: ["identity"]` exists and the OAuth block is present in the manifest.

## 9) Next steps

- Map Drive file parents to build a real tree instead of the mock (`data/mockDrive.ts`).
- Add pagination or query parameters to `listDriveFiles`.
- Handle sign-out/revoke flows more visibly (e.g., toast).
- Add `drive.file` scope for write access if you need uploads/changes. Update the consent screen and manifest scopes accordingly.
