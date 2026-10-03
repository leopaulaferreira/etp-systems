import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { initialAssessments } from '../mocks/avaliacoes.mock'
import type { Assessment } from '../types/assessment'

type AssessmentContextValue = {
  assessments: Assessment[]
  setAssessments: Dispatch<SetStateAction<Assessment[]>>
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null)

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [assessments, setAssessments] = useState(initialAssessments)
  return <AssessmentContext.Provider value={{ assessments, setAssessments }}>{children}</AssessmentContext.Provider>
}

export function useAssessments() {
  const context = useContext(AssessmentContext)
  if (!context) throw new Error('useAssessments deve ser usado dentro de AssessmentProvider')
  return context
}
