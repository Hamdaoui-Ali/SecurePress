import { FileCheck2, FileWarning } from 'lucide-react'
import { StatusBadge } from '../../components/ui/StatusBadge'

const uploadExamples = [
  { filename: 'shell.php', allowed: false, reason: 'Extension exécutable refusée' },
  { filename: 'document.pdf', allowed: true, reason: 'Type documentaire autorisé' },
  { filename: 'photo.jpg', allowed: true, reason: 'Type image autorisé' },
]

export function UploadPolicyDemo() {
  return (
    <section className="validation-demo-card" aria-labelledby="upload-demo-title">
      <div className="validation-demo-header">
        <div>
          <p className="card-eyebrow">LOCAL POLICY CONTROL</p>
          <h3 id="upload-demo-title">Politique de téléversement</h3>
        </div>
        <FileCheck2 aria-hidden="true" size={20} />
      </div>
      <p>
        Les exemples sont évalués par une règle statique, sans dépôt ni écriture
        de fichier.
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
              label={example.allowed ? 'AUTORISÉ' : 'BLOQUÉ'}
              tone={example.allowed ? 'success' : 'critical'}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
