import { FolderArchive, ShieldAlert, Waypoints } from 'lucide-react'
import { project } from '../../data/project'
import { useAssessment } from '../../app/AssessmentProvider'

function shortenPath(pathLabel: string): string {
  if (pathLabel.length <= 48) return pathLabel
  return `…${pathLabel.slice(-45)}`
}

export function WorkspaceContextBar() {
  const { source } = useAssessment()

  return (
    <aside className="workspace-context-bar" aria-label="Workspace context">
      <div className="workspace-context-primary">
        <Waypoints aria-hidden="true" size={18} />
        <strong>{project.name} workspace</strong>
      </div>
      <span>
        <FolderArchive aria-hidden="true" size={16} />
        {source.displayName || 'No source registered'}
      </span>
      {source.pathLabel ? <span title={source.pathLabel}>{shortenPath(source.pathLabel)}</span> : null}
      {source.wordpressVersion ? <span>WordPress {source.wordpressVersion}</span> : null}
      <span>
        <ShieldAlert aria-hidden="true" size={16} />
        Target verification required
      </span>
    </aside>
  )
}
