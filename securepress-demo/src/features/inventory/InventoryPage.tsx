import { Database, LoaderCircle, Play, RefreshCcw } from 'lucide-react'
import { Link } from 'react-router'
import { useAssessment } from '../../app/AssessmentProvider'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { telcoScenario } from '../../data/scenario'
import { selectVisibleComponents } from '../../domain/operation-view'
import { ComponentTable } from './ComponentTable'
import { InventoryProgress } from './InventoryProgress'

export function InventoryPage() {
  const { state, busy, progress, activeOperation, runInventory } = useAssessment()
  const completed = state.inventoryCompleted
  const isDiscovering = busy && activeOperation?.kind === 'discovery'
  const componentCount = telcoScenario.inventory.components.length
  const visibleComponents = selectVisibleComponents(
    telcoScenario.inventory.components,
    activeOperation,
    progress,
    completed,
  )

  return (
    <div className="page-stack">
      <div className="page-heading page-heading-with-action">
        <div>
          <p className="eyebrow">DISCOVERY</p>
          <h2>Index the source package</h2>
          <p>
            Discovery records components present in the indexed package without
            inferring activation or target exposure.
          </p>
        </div>
        <Button
          busy={false}
          disabled={busy}
          aria-busy={isDiscovering || undefined}
          onClick={() => void runInventory()}
          data-guide-id="run-inventory"
        >
          {isDiscovering ? (
            <LoaderCircle aria-hidden="true" size={17} />
          ) : completed ? (
            <RefreshCcw aria-hidden="true" size={17} />
          ) : (
            <Play aria-hidden="true" size={17} />
          )}
          {isDiscovering
            ? 'Discovery in progress'
            : completed
              ? 'Run discovery again'
              : 'Run discovery'}
        </Button>
      </div>

      <div className="inventory-summary">
        <div className="inventory-summary-icon" aria-hidden="true">
          <Database size={22} />
        </div>
        <div>
          <strong>{componentCount} components indexed</strong>
          <span>
            {telcoScenario.project.name} source package · WordPress {telcoScenario.project.wordpressVersion}
          </span>
        </div>
      </div>

      <Card title="Discovery progress" eyebrow="PACKAGE INDEXING">
        <InventoryProgress
          completed={completed}
          running={isDiscovering}
          progress={progress}
        />
      </Card>

      {completed || isDiscovering ? (
        <Card title="Indexed components" eyebrow="SOURCE PACKAGE">
          <p className="inventory-truth">
            {isDiscovering
              ? `Indexing ${visibleComponents.length} of ${componentCount} components from the local source.`
              : 'Presence in the package does not establish activation or exposure.'}
          </p>
          {visibleComponents.length > 0 ? (
            <ComponentTable components={visibleComponents} />
          ) : (
            <p className="empty-state">Preparing the component index…</p>
          )}
        </Card>
      ) : (
        <Card title="Component index pending" eyebrow="NEXT ACTION">
          <p className="muted-copy">
            Run discovery to index components and retain the distinction between
            package presence, activation, and database-dependent evidence.
          </p>
        </Card>
      )}

      {completed && !busy ? (
        <div className="workflow-continue">
          <div>
            <p className="eyebrow">NEXT OPERATION</p>
            <strong>Discovery is complete</strong>
            <span>Review the indexed package to continue to finding analysis.</span>
          </div>
          <Link className="button button-primary" to="/audit">
            Continue to finding analysis
          </Link>
        </div>
      ) : null}
    </div>
  )
}
