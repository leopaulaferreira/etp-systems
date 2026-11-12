import ListLoadState from '../../components/ui/ListLoadState'
import { useCompanyOverview } from './companyOverviewContext'

export default function CompanyLoadState() {
  const { error, retry } = useCompanyOverview()
  return <ListLoadState loading="Carregando dados da empresa..." error={error ? 'Não foi possível carregar os dados da empresa.' : undefined} onRetry={retry} />
}
