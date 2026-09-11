import { FolderArchive, ShieldAlert, Waypoints } from 'lucide-react'
import { project } from '../../data/project'

export function WorkspaceContextBar() {
  return (
    <aside className="workspace-context-bar" aria-label="Workspace context">
      <div className="workspace-context-primary">
        <Waypoints aria-hidden="true" size={18} />
        <strong>{project.name} workspace</strong>
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
