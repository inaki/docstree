// OAuth helpers using chrome.identity.launchWebAuthFlow (cross-browser friendly)
// NOTE: Use a Web Application OAuth client and set redirect URI to:
// https://<EXTENSION_ID>.chromiumapp.org/
// Update CLIENT_ID with your Web OAuth client ID via env:
// PLASMO_PUBLIC_GOOGLE_CLIENT_ID=... in .env.local
const CLIENT_ID =
  process.env.PLASMO_PUBLIC_GOOGLE_CLIENT_ID ||
  "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]

const buildAuthUrl = (redirectUri: string) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "token",
    redirect_uri: redirectUri,
    scope: SCOPES.join(" "),
    include_granted_scopes: "true",
    prompt: "consent"
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

const parseAccessToken = (url: string) => {
  const hash = new URL(url).hash.replace(/^#/, "")
  const params = new URLSearchParams(hash)
  return params.get("access_token")
}

export const getAuthToken = async (
  interactive = true
): Promise<string | null> => {
  // Try non-interactive token if allowed (Chrome caches tokens)
  if (!interactive) {
    return new Promise((resolve) => {
      chrome.identity.getAuthToken(
        { interactive: false, scopes: SCOPES },
        (token) => {
          if (chrome.runtime.lastError || !token) {
            return resolve(null)
          }
          resolve(token)
        }
      )
    })
  }

  const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`
  const url = buildAuthUrl(redirectUri)

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url, interactive: true },
      (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
          return reject(
            chrome.runtime.lastError || new Error("No redirect URL")
          )
        }
        const token = parseAccessToken(redirectUrl)
        if (!token) {
          return reject(new Error("No access_token in auth response"))
        }
        resolve(token)
      }
    )
  })
}

export const revokeAuthToken = async (token: string): Promise<void> => {
  try {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
  } catch {
    // ignore revoke errors
  }
}
