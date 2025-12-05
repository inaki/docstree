import { defineManifest } from "@plasmo/config"

const clientId =
  process.env.PLASMO_PUBLIC_GOOGLE_CLIENT_ID ||
  "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"

export default defineManifest(() => ({
  manifest_version: 3,
  name: "Docstree",
  version: "0.0.1",
  description: "Simple Google Drive file structure viewer",
  action: {
    default_popup: "popup.html"
  },
  permissions: ["identity", "storage"],
  host_permissions: ["https://*/*"],
  oauth2: {
    client_id: clientId,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"]
  },
  icons: {
    "16": "assets/icon.png",
    "32": "assets/icon.png",
    "48": "assets/icon.png",
    "128": "assets/icon.png"
  }
}))
