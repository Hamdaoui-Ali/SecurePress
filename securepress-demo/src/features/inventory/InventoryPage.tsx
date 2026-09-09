import { Database, Play, RefreshCcw } from 'lucide-react'
import { useAssessment } from '../../app/AssessmentProvider'
import { telcoScenario } from '../../data/scenario'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ComponentTable } from './ComponentTable'
import { InventoryProgress } from './InventoryProgress'

export function InventoryPage() {
  const { state, busy, progress, runInventory } = useAssessment()
  const completed = state.inventoryCompleted

  return (
    <div className="page-stack">
      <div className="page-heading page-heading-with-action">
        <div>
          <p className="eyebrow">ÉTAPE 2 · INVENTAIRE</p>
          <h2>Ce qui est présent dans la copie</h2>
          <p>
            L’inventaire confirme les fichiers disponibles sans déduire leur
            activation ni leur exploitabilité.
          </p>
        </div>
        <Button
          busy={busy}
          onClick={() => void runInventory()}
          data-guide-id="run-inventory"
        >
          {completed ? (
            <RefreshCcw aria-hidden="true" size={17} />
          ) : (
            <Play aria-hidden="true" size={17} />
          )}
          {completed ? 'Relancer la simulation' : 'Lancer l’inventaire simulé'}
        </Button>
      </div>

      <div className="inventory-summary">
        <div className="inventory-summary-icon" aria-hidden="true">
          <Database size={22} />
        </div>
        <div>
          <strong>
            {telcoScenario.inventory.pluginCount} extensions identifiées
          </strong>
          <span>
            {telcoScenario.inventory.themeCount} thèmes · WordPress{' '}
            {telcoScenario.project.wordpressVersion}
          </span>
        </div>
      </div>

      <Card title="Progression de l’inventaire" eyebrow="LECTURE LOCALE">
        <InventoryProgress
          completed={completed}
          busy={busy}
          progress={progress}
        />
      </Card>

      {completed ? (
        <Card title="Composants inventoriés" eyebrow="PRÉSENCE DANS LES FICHIERS">
          <p className="inventory-truth">
            Présent dans les fichiers ne signifie pas actif ou exploitable.
          </p>
          <ComponentTable components={telcoScenario.inventory.components} />
        </Card>
      ) : (
        <Card title="Tableau en attente" eyebrow="PROCHAINE PREUVE">
          <p className="muted-copy">
            Lancez la simulation pour remplir le tableau des composants et
            distinguer présence, activation et dépendance à la base WordPress.
          </p>
        </Card>
      )}
    </div>
  )
}
