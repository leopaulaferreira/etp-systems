import WelcomeSection from './components/WelcomeSection'
import StatsGrid from './components/StatsGrid'
import ContinueLearningCard from './components/ContinueLearningCard'
import RecommendationsCard from './components/RecommendationsCard'
import RecentAssessmentsCard from './components/RecentAssessmentsCard'
import RecentCertificatesCard from './components/RecentCertificatesCard'
import ProgressOverviewCard from './components/ProgressOverviewCard'
import { fetchDashboard, type DashboardData } from './dashboardApi'

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetchDashboard(controller.signal).then((result) => {
      if (!controller.signal.aborted) setData(result)
    }).catch(() => {
      if (!controller.signal.aborted) setError(true)
    })
    return () => controller.abort()
  }, [retry])

  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <WelcomeSection />
      {!data && (error ? (
        <div role="alert" className="rounded-[22px] border border-ink-200/70 bg-panel p-6 text-ink-700 shadow-card">
          <p>Não foi possível carregar seu painel.</p>
          <button type="button" onClick={() => { setError(false); setRetry((value) => value + 1) }} className="mt-3 rounded-xl bg-brand-blue-700 px-4 py-2 font-bold text-white transition-colors hover:bg-brand-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500">Tentar novamente</button>
        </div>
      ) : <div role="status" className="rounded-[22px] border border-ink-200/70 bg-panel p-6 text-ink-500 shadow-card">Carregando seu painel...</div>)}
      {data && <>
      <StatsGrid data={data} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(360px,2fr)]">
        <ContinueLearningCard course={data.continueCourse} />
        <RecommendationsCard items={data.recommendations} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <RecentAssessmentsCard items={data.recentAssessments} />
        <RecentCertificatesCard items={data.recentCertificates} />
        <ProgressOverviewCard data={data} />
      </div>
      </>}
    </div>
  )
}
import { useEffect, useState } from 'react'
