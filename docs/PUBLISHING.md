# Publishing Docstree to Chrome Web Store

This guide walks you through publishing Docstree to the Chrome Web Store.

## Prerequisites

- Google account
- $5 USD for Chrome Web Store developer registration (one-time fee)
- The production build: `build/chrome-mv3-prod.zip`

---

## Step 1: Configure Google Cloud Console for Production

Your OAuth client needs to be configured for production use.

### 1.1 Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (the one with client ID `71158390476-hmjlu4vamjp30a4ldnr2pegmnahhh7fd`)

### 1.2 Configure OAuth Consent Screen

1. Navigate to **APIs & Services** > **OAuth consent screen**
2. Fill in required fields:
   - **App name**: Docstree - Google Drive Tree Viewer
   - **User support email**: Your email
   - **App logo**: Upload `assets/icon128.png`
   - **Application home page**: Your Chrome Web Store URL (add after publishing) or GitHub repo
   - **Application privacy policy link**: Your privacy policy URL (see Step 4)
   - **Developer contact email**: Your email

3. Under **Scopes**, ensure you have:
   - `https://www.googleapis.com/auth/drive.readonly`

4. Set publishing status:
   - For testing: Keep as "Testing" (limited to 100 test users)
   - For production: Click **PUBLISH APP** to move to "In Production"

   > **Note**: The `drive.readonly` scope requires Google verification. You may need to submit for verification which can take several weeks. Alternatively, you can publish with limited users first.

### 1.3 Verify OAuth Client Settings

1. Go to **APIs & Services** > **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Ensure these are set:
   - **Application type**: Chrome Extension
   - **Item ID**: Will be your Chrome Web Store extension ID (add after first upload)

---

## Step 2: Register as Chrome Web Store Developer

### 2.1 Pay Registration Fee

1. Go to [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the $5 USD one-time registration fee
4. Accept the developer agreement

---

## Step 3: Prepare Store Listing Assets

### 3.1 Required Assets

| Asset | Size | Notes |
|-------|------|-------|
| Extension icon | 128x128 | Already created: `assets/icon128.png` |
| Screenshot(s) | 1280x800 or 640x400 | At least 1 required, up to 5 |

### 3.2 Optional Assets

| Asset | Size | Notes |
|-------|------|-------|
| Small promo tile | 440x280 | Displayed in store listings |
| Large promo tile | 920x680 | For featured placements |
| Marquee promo tile | 1400x560 | For marquee features |

### 3.3 Creating Screenshots

1. Install the extension locally from `build/chrome-mv3-prod`
2. Open the extension popup
3. Take screenshots showing:
   - The sign-in state
   - File tree with folders expanded
   - Search functionality
   - Dark/light mode toggle
4. Resize to 1280x800 or 640x400

---

## Step 4: Create Privacy Policy

A privacy policy is **required** because Docstree accesses Google Drive data.

### 4.1 Privacy Policy Content

Your privacy policy should include:

```
Privacy Policy for Docstree

Last updated: [DATE]

## What data we access
Docstree accesses your Google Drive file and folder names, and their
hierarchical structure, using read-only permissions.

## How we use your data
- Display your Drive files in a tree structure within the extension
- Enable search and filtering of file names
- Store your favorites locally in your browser

## Data storage
- All data stays local on your device
- We do NOT send your data to any external servers
- Your OAuth token is stored locally in Chrome's secure storage

## Data sharing
We do NOT share, sell, or transfer your data to any third parties.

## How to revoke access
1. Go to https://myaccount.google.com/permissions
2. Find "Docstree" and click "Remove Access"
3. Alternatively, sign out from the extension menu

## Contact
[YOUR EMAIL]
```

### 4.2 Hosting Options

Host your privacy policy at one of:
- GitHub Pages (free): Create a `privacy.md` in your repo
- GitHub Gist (free): Create a public gist
- Your own website

---

## Step 5: Upload to Chrome Web Store

### 5.1 Create New Item

1. Go to [Developer Console](https://chrome.google.com/webstore/devconsole)
2. Click **New Item**
3. Upload `build/chrome-mv3-prod.zip`

### 5.2 Fill Store Listing

**Product Details:**
- **Language**: English (or your preferred language)
- **Extension name**: Docstree - Google Drive Tree Viewer
- **Summary** (132 chars max): View your Google Drive as a tree. Browse folders, search files, and save favorites.
- **Description**:

```
Docstree lets you browse your Google Drive files as a hierarchical tree structure,
making it easy to visualize and navigate your folder organization.

Features:
• Tree view of all your Google Drive files and folders
• Support for My Drive and Shared Drives
• Quick search to filter files by name
• Favorite files for quick access
• Dark and light mode themes
• Clean, minimal interface

Privacy-focused:
• Read-only access to your Drive
• All data stays on your device
• No external servers or tracking

Perfect for users who want a quick overview of their Drive structure without
opening Google Drive in a full browser tab.
```

- **Category**: Productivity
- **Language**: English

**Graphic Assets:**
- Upload your icon (128x128)
- Upload at least 1 screenshot

**Additional Fields:**
- **Official URL**: Your GitHub repo or website
- **Homepage URL**: Same as above

### 5.3 Fill Privacy Tab

- **Single purpose description**: Display Google Drive files in a tree structure for easy browsing and navigation
- **Permission justifications**:
  - `identity`: Required to authenticate with Google and access the user's Drive
  - `storage`: Required to persist user preferences and authentication token locally
  - `host_permissions (googleapis.com)`: Required to fetch file list from Google Drive API
- **Privacy policy URL**: Your hosted privacy policy URL
- **Data usage disclosures**: Check applicable boxes (likely "User's files" for Drive access)

### 5.4 Submit for Review

1. Review all sections for completeness
2. Click **Submit for Review**
3. Initial review typically takes 1-3 business days

---

## Step 6: Post-Publishing

### 6.1 Update OAuth Client

After your extension is published:

1. Copy your extension ID from the Chrome Web Store URL
2. Go to Google Cloud Console > Credentials
3. Update your OAuth client with the extension ID

### 6.2 Monitor Reviews

- Check the Developer Console for review status
- Respond to any reviewer feedback promptly
- Monitor user reviews and ratings

---

## Troubleshooting

### OAuth Issues

**"This app isn't verified"**
- Your OAuth consent screen is still in testing mode
- Submit for Google verification or add test users

**"Access blocked"**
- Check that your OAuth client ID matches the one in the extension
- Verify the extension ID is added to OAuth client settings

### Review Rejections

Common reasons:
- Missing or inadequate privacy policy
- Insufficient permission justifications
- Misleading description or screenshots

---

## Build Commands Reference

```bash
# Development build with hot reload
npm run dev

# Production build
npm run build

# Package for Chrome Web Store (creates .zip)
npm run package
```

Output files:
- `build/chrome-mv3-dev/` - Development build
- `build/chrome-mv3-prod/` - Production build
- `build/chrome-mv3-prod.zip` - Upload this to Chrome Web Store
