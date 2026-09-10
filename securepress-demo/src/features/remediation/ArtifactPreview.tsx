import { StatusBadge } from '../../components/ui/StatusBadge'

const snippets: Record<string, string> = {
  'R-004': "define('DISALLOW_FILE_EDIT', true);",
  'R-005': "define('FORCE_SSL_ADMIN', true);",
  'R-006': 'wp plugin update --all --dry-run',
}

export function ArtifactPreview({ remediationId }: { remediationId: string }) {
  const snippet = snippets[remediationId]
  if (!snippet) return null

  return (
    <div className="artifact-preview">
      <div className="artifact-preview-header">
        <span>Generated workspace artifact</span>
        <StatusBadge
          label="Generated workspace artifact · proposed change set"
          tone="prepared"
        />
      </div>
      <pre>
        <code>{snippet}</code>
      </pre>
    </div>
  )
}
