// Helpers for Chrome extension OAuth via chrome.identity
// Note: Requires manifest.permissions ["identity"] and oauth2 config in package.json/manifest.

const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]

export const getAuthToken = async (interactive = true): Promise<string> => {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive, scopes: SCOPES }, (token) => {
      if (chrome.runtime.lastError || !token) {
        return reject(chrome.runtime.lastError || new Error("No token returned"))
      }
      resolve(token)
    })
  })
}

export const revokeAuthToken = async (token: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.identity.removeCachedAuthToken({ token }, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError)
      }
      resolve()
    })
  })
}
