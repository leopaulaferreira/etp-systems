export type AssessmentStatus = 'pending' | 'in_progress' | 'completed' | 'scheduled'
export type QuestionKind = 'multiple_choice' | 'true_false'

export type AssessmentQuestion = {
  id: string
  kind: QuestionKind
  prompt: string
  options: string[]
  optionIds?: string[]
  correctOption?: number
  explanation?: string
}

export type AssessmentAttempt = {
  answers: Record<string, number>
  completedAt: string
  score?: number
  passed?: boolean
}

export type Assessment = {
  id: string
  courseId?: string
  title: string
  course: string
  courseType: 'Curso' | 'Trilha'
  type: 'Quiz' | 'Teste'
  topic: 'privacy' | 'security' | 'cloud' | 'access'
  status: AssessmentStatus
  estimatedMinutes: number
  minimumScore: number
  maxAttempts: number
  dueAt?: string
  availableAt?: string
  questions: AssessmentQuestion[]
  answers: Record<string, number>
  attempts: AssessmentAttempt[]
}
