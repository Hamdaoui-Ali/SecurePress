import { ShieldCheck } from 'lucide-react'

export function DemoBanner() {
  return (
    <aside className="demo-banner" role="status">
      <ShieldCheck aria-hidden="true" size={20} />
      <div>
        <strong>Simulation locale</strong>
        <span>Aucun système réel n’est connecté à cette application.</span>
      </div>
    </aside>
  )
}
