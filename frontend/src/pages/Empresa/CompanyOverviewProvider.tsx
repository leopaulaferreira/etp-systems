import { useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { fetchCompanyOverview, type CompanyOverview } from './companyApi'
import { CompanyOverviewContext } from './companyOverviewContext'

type FetchState = { key: string; data: CompanyOverview | null; error: boolean }

export default function CompanyOverviewProvider({ children }: { children: ReactNode }) {
  const { role, companyId, user } = useAuth()
  const [state, setState] = useState<FetchState>({ key: '', data: null, error: false })
  const [attempt, setAttempt] = useState(0)
  const key = `${user?.id ?? ''}:${companyId ?? ''}:${attempt}`

  useEffect(() => {
    if (role !== 'empresa' || !companyId) return
    const refresh = () => {
      if (document.visibilityState === 'visible') setAttempt((value) => value + 1)
    }
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [role, companyId])

  useEffect(() => {
    if (role !== 'empresa' || !companyId) return
    const controller = new AbortController()
    fetchCompanyOverview(companyId, controller.signal).then((data) => {
      if (!controller.signal.aborted) setState({ key, data, error: false })
    }).catch(() => {
      if (!controller.signal.aborted) setState({ key, data: null, error: true })
    })
    return () => controller.abort()
  }, [role, companyId, key])

  const current = role === 'empresa' && state.key === key ? state : null
  return <CompanyOverviewContext.Provider value={{
    data: current?.data ?? null, loading: role === 'empresa' && !current,
    error: current?.error ?? false, retry: () => setAttempt((value) => value + 1),
  }}>{children}</CompanyOverviewContext.Provider>
}
