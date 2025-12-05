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
  url: string
  children?: TreeNode[]
}

const Tree = ({
  nodes,
  depth = 0,
  isDark
}: {
  nodes: TreeNode[]
  depth?: number
  isDark: boolean
}) => (
  <ul
    className={`space-y-2 border-l border-border pl-3 ${depth === 0 ? "border-l-0 pl-0" : ""}`}>
    {nodes.map((node) => (
      <li key={node.id} className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-normal text-ink">
          <span className="text-ink-weak">
            {node.type === "folder" ? "📁" : "📄"}
          </span>
          <a
            className="truncate text-ink underline-offset-4 hover:underline"
            href={node.url}
            rel="noreferrer"
            target="_blank">
            {node.name}
          </a>
        </div>
        {node.children && node.children.length > 0 ? (
          <Tree nodes={node.children} depth={depth + 1} />
        ) : null}
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
  const [initializingAuth, setInitializingAuth] = useState(true)
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const isDark = theme === "dark"

  const tree = useMemo(() => {
    const rootId = selectedDriveId || "root"
    const nodes: Record<string, TreeNode> = {}
    const childrenMap: Record<string, TreeNode[]> = {}

    const getType = (mime?: string): "folder" | "file" =>
      mime === "application/vnd.google-apps.folder" ? "folder" : "file"

    const buildUrl = (id: string, type: "folder" | "file") =>
      type === "folder"
        ? `https://drive.google.com/drive/folders/${id}`
        : `https://drive.google.com/file/d/${id}/view`

    driveFiles.forEach((file) => {
      const nodeType = getType(file.mimeType)
      nodes[file.id] = {
        id: file.id,
        name: file.name,
        type: nodeType,
        url: buildUrl(file.id, nodeType),
        children: []
      }

      const parents =
        file.parents && file.parents.length > 0 ? file.parents : []
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
          if (nameMatch) return node
          const filteredChildren = node.children
            ? filterNodes(node.children)
            : []
          if (filteredChildren.length > 0)
            return { ...node, children: filteredChildren }
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
        const files = await listDriveFiles(
          authToken,
          selectedDriveId || undefined
        )
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

  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const token = await getAuthToken(false)
        setAuthToken(token)
        const storedDrive = localStorage.getItem("docstree:selectedDriveId")
        if (storedDrive) {
          setSelectedDriveId(storedDrive === "my-drive" ? null : storedDrive)
        }
        const storedTheme = localStorage.getItem("docstree:theme")
        if (storedTheme === "dark" || storedTheme === "light") {
          setTheme(storedTheme)
        }
      } catch (err) {
        // no cached token, ignore
      } finally {
        setInitializingAuth(false)
      }
    }
    checkExistingAuth()
  }, [])
  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [theme])

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
    <div className="min-w-[360px] max-w-sm space-y-4 rounded-2xl bg-surface p-5 text-ink shadow-pop ring-1 ring-border">
      <header className="space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-weak">
            Docstree
          </p>
          <button
            aria-label="Toggle theme"
            data-testid="theme-toggle"
            className="rounded-full border border-border bg-surface-weak px-3 py-1 text-xs font-semibold text-ink transition hover:border-ink-weak"
            onClick={() => {
              const next = isDark ? "light" : "dark"
              setTheme(next)
              localStorage.setItem("docstree:theme", next)
            }}>
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      <div className="flex items-center gap-3">
        {initializingAuth ? (
          <span className="text-sm text-ink-weak">Checking session...</span>
        ) : authToken ? (
          <>
            <span
              data-testid="status-connected"
              className="rounded-full border border-accent bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
              Connected
            </span>
            <button
              data-testid="sign-out-btn"
              className="ml-auto rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink transition hover:border-ink-weak"
              onClick={handleSignOut}>
              Sign out
            </button>
          </>
        ) : (
          <button
            data-testid="sign-in-btn"
            className="ml-auto rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-emerald-400"
            onClick={handleSignIn}>
            Sign in with Google
          </button>
        )}
      </div>

      {error ? (
        <p
          data-testid="error-banner"
          className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm font-medium text-ink-weak">Search</span>
        <input
          data-testid="search-input"
          className="w-full rounded-lg border border-border bg-surface-weak px-3 py-2 text-base text-ink outline-none ring-2 ring-transparent transition hover:border-ink-weak focus:border-ink-weak focus:ring-ink-weak"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name..."
          value={query}
        />
      </label>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.15em] text-ink-weak">
          <span>Root</span>
        </div>
        <select
          data-testid="root-select"
          className="w-full rounded-lg border border-border bg-surface-weak px-3 py-2 text-sm text-ink outline-none transition hover:border-ink-weak focus:border-ink-weak"
          disabled={!authToken}
          onChange={(e) => {
            const value = e.target.value || null
            setSelectedDriveId(value)
            localStorage.setItem(
              "docstree:selectedDriveId",
              value || "my-drive"
            )
          }}
          value={selectedDriveId || ""}>
          <option value="">My Drive</option>
          {drives.map((drive) => (
            <option key={drive.id} value={drive.id}>
              {drive.name}
            </option>
          ))}
        </select>
      </div>

      <section
        className="rounded-xl border border-border bg-surface-weak p-4 text-ink"
        data-testid="drive-tree">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.15em] text-ink-weak">
          <span>Drive files (live)</span>
          {loading ? (
            <span className="text-amber-200">Loading...</span>
          ) : (
            <span>{flattenFiltered.length} items</span>
          )}
        </div>
        <div className="mt-3 space-y-2">
          {!authToken && (
            <p className="text-sm text-ink-weak">
              Sign in to load your Drive files.
            </p>
          )}
          {authToken && !loading && driveFiles.length === 0 ? (
            <p className="text-sm text-ink-weak">No files returned yet.</p>
          ) : null}
          {filteredTree.length > 0 ? (
            <Tree isDark={isDark} nodes={filteredTree} />
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default IndexPopup
