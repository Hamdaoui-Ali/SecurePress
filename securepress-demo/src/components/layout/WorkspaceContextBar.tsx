import { FolderArchive, ShieldAlert, Waypoints } from 'lucide-react'

export function WorkspaceContextBar() {
  return (
    <aside className="workspace-context-bar" aria-label="Workspace context">
      <div className="workspace-context-primary">
        <Waypoints aria-hidden="true" size={18} />
        <strong>TELCO workspace</strong>
      </div>
      <span>
        <FolderArchive aria-hidden="true" size={16} />
        Source package · indexed
      </span>
      <span>
        <ShieldAlert aria-hidden="true" size={16} />
        Target verification required
      </span>
    </aside>
  )
}
