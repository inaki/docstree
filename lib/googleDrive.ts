export type DriveFile = {
  id: string
  name: string
  mimeType?: string
  parents?: string[]
}

export const listDriveFiles = async (token: string): Promise<DriveFile[]> => {
  const res = await fetch("https://www.googleapis.com/drive/v3/files?pageSize=50&fields=files(id,name,mimeType,parents)", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Drive API error (${res.status}): ${text}`)
  }

  const data = (await res.json()) as { files?: DriveFile[] }
  return data.files || []
}
