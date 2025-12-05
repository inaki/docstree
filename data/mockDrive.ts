export type FileNode = {
  id: string
  name: string
  type: "folder" | "file"
  children?: FileNode[]
}

export const mockDrive: FileNode[] = [
  {
    id: "folder-docs",
    name: "Documents",
    type: "folder",
    children: [
      {
        id: "file-proposal",
        name: "Product-Proposal.docx",
        type: "file"
      },
      {
        id: "folder-specs",
        name: "Specs",
        type: "folder",
        children: [
          { id: "file-api", name: "API-v2.md", type: "file" },
          { id: "file-ux", name: "UX-Wireframes.pdf", type: "file" }
        ]
      }
    ]
  },
  {
    id: "folder-engineering",
    name: "Engineering",
    type: "folder",
    children: [
      {
        id: "folder-client",
        name: "client",
        type: "folder",
        children: [
          { id: "file-package", name: "package.json", type: "file" },
          { id: "file-index", name: "index.tsx", type: "file" }
        ]
      },
      {
        id: "folder-server",
        name: "server",
        type: "folder",
        children: [
          { id: "file-main", name: "main.go", type: "file" },
          { id: "file-docker", name: "Dockerfile", type: "file" }
        ]
      }
    ]
  },
  {
    id: "folder-research",
    name: "Research",
    type: "folder",
    children: [
      { id: "file-llm", name: "LLM-Notes.md", type: "file" },
      { id: "file-market", name: "Market-Sizing.xlsx", type: "file" }
    ]
  }
]
