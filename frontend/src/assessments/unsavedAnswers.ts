import type { Assessment } from '../types/assessment.ts'

export function hasUnsavedAnswers(items: Assessment[]): boolean {
  return items.some(item => item.status === 'in_progress' && Object.keys(item.answers).length > 0)
}
export const leaveAssessmentMessage = 'Há respostas da avaliação que ainda não foram enviadas. Deseja sair? Elas podem ser retomadas nesta sessão, mas serão perdidas ao recarregar a página ou sair da conta.'
