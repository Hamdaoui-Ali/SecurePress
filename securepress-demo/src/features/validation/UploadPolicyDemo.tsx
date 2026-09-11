import { FileCheck2, FileWarning } from 'lucide-react'
import { StatusBadge } from '../../components/ui/StatusBadge'

const uploadExamples = [
  { filename: 'shell.php', allowed: false, reason: 'Executable extension blocked' },
  { filename: 'document.pdf', allowed: true, reason: 'Document type allowed' },
  { filename: 'photo.jpg', allowed: true, reason: 'Image type allowed' },
]

export function UploadPolicyDemo() {
  return (
    <section className="validation-demo-card" aria-labelledby="upload-demo-title">
      <div className="validation-demo-header">
        <div>
          <p className="card-eyebrow">LOCAL POLICY CONTROL</p>
          <h3 id="upload-demo-title">Upload policy</h3>
        </div>
        <FileCheck2 aria-hidden="true" size={20} />
      </div>
      <p>
        Examples are evaluated by a static rule without upload or file writes.
      </p>
      <div className="upload-policy-list">
        {uploadExamples.map((example) => (
          <div className="upload-policy-row" key={example.filename}>
            <div className="upload-policy-file">
              {example.allowed ? (
                <FileCheck2 aria-hidden="true" size={17} />
              ) : (
                <FileWarning aria-hidden="true" size={17} />
              )}
              <strong>{example.filename}</strong>
              <span>{example.reason}</span>
            </div>
            <StatusBadge
              label={example.allowed ? 'ALLOWED' : 'BLOCKED'}
              tone={example.allowed ? 'success' : 'critical'}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
