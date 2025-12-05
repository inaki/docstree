import { useEffect, useMemo, useState } from "react"

import { listDriveFiles, type DriveFile } from "./lib/googleDrive"
import { getAuthToken, revokeAuthToken } from "./lib/googleAuth"
import { mockDrive, type FileNode } from "./data/mockDrive"
import "./style.css"

type TreeProps = {
  nodes: FileNode[]
  depth?: number
}

const Tree = ({ nodes, depth = 0 }: TreeProps) => (
  <ul className={`space-y-2 border-l border-slate-800 pl-3 ${depth === 0 ? "border-l-0 pl-0" : ""}`}>
    {nodes.map((node) => (
      <li key={node.id} className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
          <span className="text-slate-500">{node.type === "folder" ? "📁" : "📄"}</span>
          <span>{node.name}</span>
        </div>
        {node.children && node.children.length > 0 ? <Tree nodes={node.children} depth={depth + 1} /> : null}
      </li>
    ))}
  </ul>
)

const filterTree = (nodes: FileNode[], query: string): FileNode[] => {
  if (!query) return nodes
  const q = query.toLowerCase()
  return nodes
    .map((node) => {
      const nameMatch = node.name.toLowerCase().includes(q)
      const filteredChildren = node.children ? filterTree(node.children, query) : []
      const childMatch = filteredChildren.length > 0
      if (nameMatch || childMatch) {
        return { ...node, children: filteredChildren }
      }
      return null
    })
    .filter(Boolean) as FileNode[]
}

function IndexPopup() {
  const [query, setQuery] = useState("")
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => filterTree(mockDrive, query), [query])

  useEffect(() => {
    const fetchFiles = async () => {
      if (!authToken) {
        setDriveFiles([])
        return
      }
      setLoading(true)
      setError(null)
      try {
        const files = await listDriveFiles(authToken)
        setDriveFiles(files)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [authToken])

  const handleSignIn = async () => {
    setError(null)
    try {
      const token = await getAuthToken(true)
      setAuthToken(token)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleSignOut = async () => {
    if (!authToken) return
    try {
      await revokeAuthToken(authToken)
    } catch (err) {
      // ignore revoke errors
      console.warn(err)
    } finally {
      setAuthToken(null)
      setDriveFiles([])
    }
  }

  return (
    <div className="min-w-[360px] max-w-sm space-y-4 rounded-2xl bg-slate-900 p-5 text-slate-100 shadow-xl">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Docstree</p>
        <h1 className="text-2xl font-semibold">Drive structure viewer</h1>
        <p className="text-sm text-slate-400">
          Search to filter folders and files. Mock data lives in <code className="font-mono">/data/mockDrive.ts</code>. Sign in to pull your Drive files.
        </p>
      </header>

      <div className="flex items-center gap-3">
        {authToken ? (
          <>
            <span className="rounded-full bg-emerald-900/60 px-3 py-1 text-xs font-semibold text-emerald-200">
              Connected
            </span>
            <button
              className="ml-auto rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500"
              onClick={handleSignOut}>
              Sign out
            </button>
          </>
        ) : (
          <button
            className="ml-auto rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400"
            onClick={handleSignIn}>
            Sign in with Google
          </button>
        )}
      </div>

      {error ? <p className="rounded-lg border border-red-900 bg-red-950/40 p-2 text-sm text-red-200">{error}</p> : null}

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-200">Search</span>
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-base text-slate-100 outline-none ring-2 ring-transparent transition focus:border-slate-500 focus:ring-slate-500"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name..."
          value={query}
        />
      </label>

      <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.15em] text-slate-400">
          <span>Structure</span>
          <span>{filtered.length} top-level items</span>
        </div>
        <div className="mt-3">
          {filtered.length > 0 ? (
            <Tree nodes={filtered} />
          ) : (
            <p className="text-sm text-slate-500">No items match that search.</p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.15em] text-slate-400">
          <span>Drive files (live)</span>
          {loading ? <span className="text-amber-200">Loading...</span> : <span>{driveFiles.length} items</span>}
        </div>
        <div className="mt-3 space-y-2">
          {!authToken && <p className="text-sm text-slate-500">Sign in to load your Drive files.</p>}
          {authToken && !loading && driveFiles.length === 0 ? (
            <p className="text-sm text-slate-500">No files returned yet.</p>
          ) : null}
          {driveFiles.length > 0 ? (
            <ul className="space-y-1">
              {driveFiles.slice(0, 10).map((file) => (
                <li key={file.id} className="flex items-center gap-2 text-sm text-slate-200">
                  <span className="text-slate-500">📄</span>
                  <span className="truncate">{file.name}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default IndexPopup
