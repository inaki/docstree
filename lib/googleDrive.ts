export type DriveFile = {
  id: string
  name: string
  mimeType?: string
  parents?: string[]
  driveId?: string
}

export type SharedDrive = {
  id: string
  name: string
}

export const listSharedDrives = async (token: string): Promise<SharedDrive[]> => {
  const res = await fetch("https://www.googleapis.com/drive/v3/drives?pageSize=50&fields=drives(id,name)", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Drive API (drives) error (${res.status}): ${text}`)
  }

  const data = (await res.json()) as { drives?: SharedDrive[] }
  return data.drives || []
}

export const listDriveFiles = async (token: string, driveId?: string): Promise<DriveFile[]> => {
  const params = new URLSearchParams({
    pageSize: "200",
    fields: "files(id,name,mimeType,parents,driveId),nextPageToken",
    includeItemsFromAllDrives: "true",
    supportsAllDrives: "true",
    orderBy: "folder,name_natural"
  })

  if (driveId) {
    params.set("driveId", driveId)
    params.set("corpora", "drive")
  } else {
    params.set("corpora", "user")
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Drive API (files) error (${res.status}): ${text}`)
  }

  const data = (await res.json()) as { files?: DriveFile[] }
  return data.files || []
}
