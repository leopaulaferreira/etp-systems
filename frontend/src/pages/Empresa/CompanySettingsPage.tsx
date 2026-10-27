import { Navigate, useParams } from 'react-router-dom'
import { Building2, ShieldCheck, UserRound } from 'lucide-react'
import PageHero from '../../components/ui/PageHero'
import { useAuth } from '../../auth/AuthContext'
import { useCompanySettings } from './companySettings'
import { useCompanyOverview } from './companyOverviewContext'
import CompanyLoadState from './CompanyLoadState'
import CompanySettingsForm from './CompanySettingsForm'
import CompanySecurity from './CompanySecurity'

const pages = {
  dados: { title: 'Dados da empresa', icon: Building2, description: 'A identidade da organização e os contatos que aproximam sua equipe.' },
  conta: { title: 'Minha conta', icon: UserRound, description: 'Seu perfil como responsável pelo desenvolvimento da equipe.' },
  seguranca: { title: 'Segurança', icon: ShieldCheck, description: 'Consulte suas informações de acesso e gerencie a sessão atual.' },
}

export default function CompanySettingsPage() {
  const { section } = useParams()
  const { companyId } = useAuth()
  const { data, loading } = useCompanyOverview()
  const { settings, save } = useCompanySettings(companyId, data?.companyName)
  if (section !== 'dados' && section !== 'conta' && section !== 'seguranca') return <Navigate to="/empresa/configuracoes/dados" replace />
  if (section === 'dados' && !data) return <CompanyLoadState />
  const page = pages[section]
  const departments = new Set((data?.employees ?? []).map(employee => employee.department?.trim()).filter(Boolean)).size
  return <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
    <PageHero eyebrow="Configurações" {...page} />
    {section === 'seguranca'
      ? <CompanySecurity email={settings.accountEmail} />
      : <CompanySettingsForm key={`${companyId}:${section}`} section={section} settings={settings} save={save} employees={data?.employees.length ?? 0} departments={departments} organization={data ? settings.name : loading ? 'Carregando organização…' : 'Organização indisponível'} />}
  </div>
}
