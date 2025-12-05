import { useEffect, useMemo, useState } from "react"

import { getAuthToken, revokeAuthToken } from "./lib/googleAuth"
import {
  listDriveFiles,
  listSharedDrives,
  type DriveFile,
  type SharedDrive
} from "./lib/googleDrive"

import "./style.css"

type TreeNode = {
  id: string
  name: string
  type: "folder" | "file"
  children?: TreeNode[]
}

const Tree = ({ nodes, depth = 0 }: { nodes: TreeNode[]; depth?: number }) => (
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

function IndexPopup() {
  const [query, setQuery] = useState("")
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([])
  const [drives, setDrives] = useState<SharedDrive[]>([])
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(null) // null = My Drive
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tree = useMemo(() => {
    const rootId = selectedDriveId || "root"
    const nodes: Record<string, TreeNode> = {}
    const childrenMap: Record<string, TreeNode[]> = {}

    const getType = (mime?: string): "folder" | "file" =>
      mime === "application/vnd.google-apps.folder" ? "folder" : "file"

    driveFiles.forEach((file) => {
      nodes[file.id] = {
        id: file.id,
        name: file.name,
        type: getType(file.mimeType),
        children: []
      }

      const parents = file.parents && file.parents.length > 0 ? file.parents : []
      const effectiveParents = parents.length > 0 ? parents : [rootId]
      effectiveParents.forEach((parentId) => {
        if (!childrenMap[parentId]) childrenMap[parentId] = []
        childrenMap[parentId].push(nodes[file.id])
      })
    })

    const attachChildren = (node: TreeNode) => {
      if (childrenMap[node.id]) {
        node.children = childrenMap[node.id]
        node.children.forEach(attachChildren)
      }
    }

    const roots = childrenMap[rootId] || []
    roots.forEach(attachChildren)
    return roots
  }, [driveFiles, selectedDriveId])

  const filteredTree = useMemo(() => {
    if (!query) return tree
    const q = query.toLowerCase()
    const filterNodes = (nodes: TreeNode[]): TreeNode[] =>
      nodes
        .map((node) => {
          const nameMatch = node.name.toLowerCase().includes(q)
          const filteredChildren = node.children ? filterNodes(node.children) : []
          if (nameMatch || filteredChildren.length > 0) {
            return { ...node, children: filteredChildren }
          }
          return null
        })
        .filter(Boolean) as TreeNode[]
    return filterNodes(tree)
  }, [query, tree])

  const flattenFiltered = useMemo(() => {
    const out: TreeNode[] = []
    const walk = (nodes: TreeNode[]) => {
      nodes.forEach((n) => {
        out.push(n)
        if (n.children) walk(n.children)
      })
    }
    walk(filteredTree)
    return out
  }, [filteredTree])

  useEffect(() => {
    const fetchFiles = async () => {
      if (!authToken) {
        setDriveFiles([])
        return
      }
      setLoading(true)
      setError(null)
      try {
        const files = await listDriveFiles(authToken, selectedDriveId || undefined)
        setDriveFiles(files)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [authToken, selectedDriveId])

  useEffect(() => {
    const fetchDrives = async () => {
      if (!authToken) {
        setDrives([])
        return
      }
      try {
        const data = await listSharedDrives(authToken)
        setDrives(data)
      } catch (err) {
        console.warn("Failed to load shared drives", err)
      }
    }

    fetchDrives()
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
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Docstree
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

      {error ? (
        <p className="rounded-lg border border-red-900 bg-red-950/40 p-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-200">Search</span>
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-base text-slate-100 outline-none ring-2 ring-transparent transition focus:border-slate-500 focus:ring-slate-500"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name..."
          value={query}
        />
      </label>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.15em] text-slate-400">
          <span>Root</span>
          <span className="text-slate-500">
            Choose My Drive or a shared drive
          </span>
        </div>
        <select
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-slate-500"
          disabled={!authToken}
          onChange={(e) => setSelectedDriveId(e.target.value || null)}
          value={selectedDriveId || ""}>
          <option value="">My Drive</option>
          {drives.map((drive) => (
            <option key={drive.id} value={drive.id}>
              {drive.name}
            </option>
          ))}
        </select>
      </div>

      <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.15em] text-slate-400">
          <span>Drive files (live)</span>
          {loading ? (
            <span className="text-amber-200">Loading...</span>
          ) : (
            <span>{flattenFiltered.length} items</span>
          )}
        </div>
        <div className="mt-3 space-y-2">
          {!authToken && (
            <p className="text-sm text-slate-500">
              Sign in to load your Drive files.
            </p>
          )}
          {authToken && !loading && driveFiles.length === 0 ? (
            <p className="text-sm text-slate-500">No files returned yet.</p>
          ) : null}
          {filteredTree.length > 0 ? <Tree nodes={filteredTree} /> : null}
        </div>
      </section>
    </div>
  )
}

export default IndexPopup
