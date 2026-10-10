import Button from '../../components/ui/Button'
import { useCompanyOverview } from './companyOverviewContext'

export default function CompanyLoadState() {
  const { error, retry } = useCompanyOverview()
  return <div className="rounded-[22px] border border-ink-200/70 bg-panel p-6 text-sm text-ink-700 shadow-card"
    role={error ? 'alert' : 'status'}>
    <p>{error ? 'Não foi possível carregar os dados da empresa.' : 'Carregando dados da empresa...'}</p>
    {error && <Button type="button" className="mt-3" onClick={retry}>Tentar novamente</Button>}
  </div>
}
