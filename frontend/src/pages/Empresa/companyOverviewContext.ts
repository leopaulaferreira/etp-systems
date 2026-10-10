import { createContext, useContext } from 'react'
import type { CompanyOverview } from './companyApi'

export type CompanyOverviewContextValue = {
  data: CompanyOverview | null
  loading: boolean
  error: boolean
  retry: () => void
}

export const CompanyOverviewContext = createContext<CompanyOverviewContextValue | null>(null)

export function useCompanyOverview() {
  const context = useContext(CompanyOverviewContext)
  if (!context) throw new Error('useCompanyOverview requer CompanyOverviewProvider')
  return context
}
