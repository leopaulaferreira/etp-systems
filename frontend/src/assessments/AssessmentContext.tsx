import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { useAuth } from '../auth/AuthContext'
import { fetchAssessments } from '../pages/Avaliacoes/assessmentApi'
import type { Assessment } from '../types/assessment'

type AssessmentContextValue = {
  assessments: Assessment[]
  setAssessments: Dispatch<SetStateAction<Assessment[]>>
  status: 'loading' | 'ready' | 'error'
  reload: () => void
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null)

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const { user, role } = useAuth()
  const userId = user?.id
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    if (!userId || role !== 'colaborador') return
    const controller = new AbortController()
    fetchAssessments(controller.signal).then((items) => {
      setAssessments(items)
      setStatus('ready')
    }).catch(() => {
      if (!controller.signal.aborted) setStatus('error')
    })
    return () => controller.abort()
  }, [userId, role, revision])
  return <AssessmentContext.Provider value={{ assessments, setAssessments, status,
    reload: () => { setStatus('loading'); setRevision((current) => current + 1) } }}>{children}</AssessmentContext.Provider>
}

export function useAssessments() {
  const context = useContext(AssessmentContext)
  if (!context) throw new Error('useAssessments deve ser usado dentro de AssessmentProvider')
  return context
}
