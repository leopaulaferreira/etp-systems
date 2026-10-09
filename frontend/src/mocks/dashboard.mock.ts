/**
 * Dados de exemplo da página Dashboard.
 *
 * O front-end ainda não está integrado a uma API real: todo o conteúdo abaixo
 * é estático/fictício e serve apenas para viabilizar a construção da tela.
 * Ao integrar com o backend, os tipos aqui definidos devem orientar o
 * contrato dos endpoints correspondentes.
 */

export type MetricAccent = 'blue' | 'green' | 'purple' | 'orange'

export type MetricCardData = {
  id: string
  label: string
  value: string
  ctaLabel: string
  accent: MetricAccent
  icon: 'trilhas' | 'cursos' | 'certificados' | 'horas'
}

export const metricCards: MetricCardData[] = [
  { id: 'trilhas-andamento', label: 'Trilhas em andamento', value: '3', ctaLabel: 'Ver todas', accent: 'blue', icon: 'trilhas' },
  { id: 'cursos-concluidos', label: 'Cursos concluídos', value: '12', ctaLabel: 'Ver todos', accent: 'green', icon: 'cursos' },
  { id: 'certificados', label: 'Certificados', value: '7', ctaLabel: 'Ver todos', accent: 'purple', icon: 'certificados' },
  { id: 'horas-estudadas', label: 'Horas estudadas', value: '48h', ctaLabel: 'Ver detalhes', accent: 'orange', icon: 'horas' },
]

export type ContinueLearning = {
  badge: string
  title: string
  description: string
  progressPercent: number
  modulesCompleted: number
  modulesTotal: number
  lastActivity: string
  ctaLabel: string
}

export const continueLearning: ContinueLearning = {
  badge: 'TRILHA',
  title: 'Trilha de Cibersegurança',
  description: 'Continue de onde parou e avance na proteção de sistemas e dados.',
  progressPercent: 65,
  modulesCompleted: 8,
  modulesTotal: 12,
  lastActivity: 'Retomar: Introdução à Criptografia',
  ctaLabel: 'Ver meus cursos',
}

export type RecommendationLevel = 'Iniciante' | 'Intermediário' | 'Avançado'
export type RecommendationType = 'CURSO' | 'TRILHA'

export type Recommendation = {
  id: string
  title: string
  type: RecommendationType
  level: RecommendationLevel
  durationHours: number
  thumbnail: 'seguranca' | 'nuvem' | 'dados'
}

export const recommendations: Recommendation[] = [
  {
    id: 'fundamentos-seguranca',
    title: 'Fundamentos de Segurança da Informação',
    type: 'CURSO',
    level: 'Intermediário',
    durationHours: 6,
    thumbnail: 'seguranca',
  },
  {
    id: 'computacao-nuvem',
    title: 'Computação em Nuvem: Conceitos e Aplicações',
    type: 'CURSO',
    level: 'Iniciante',
    durationHours: 4,
    thumbnail: 'nuvem',
  },
  {
    id: 'protecao-dados',
    title: 'Boas Práticas em Proteção de Dados',
    type: 'TRILHA',
    level: 'Intermediário',
    durationHours: 10,
    thumbnail: 'dados',
  },
]

export type Achievement = {
  id: string
  title: string
  description: string
  status: string
  badge: 'defensor' | 'sequencia' | 'explorador'
}

export const achievements: Achievement[] = [
  {
    id: 'defensor-dados',
    title: 'Defensor de Dados',
    description: 'Concluiu o módulo sobre LGPD',
    status: 'Hoje',
    badge: 'defensor',
  },
  {
    id: 'sequencia-estudos',
    title: 'Sequência de Estudos',
    description: '7 dias consecutivos estudando',
    status: 'Ontem',
    badge: 'sequencia',
  },
  {
    id: 'explorador',
    title: 'Explorador',
    description: 'Iniciou 3 novas trilhas',
    status: '2 dias atrás',
    badge: 'explorador',
  },
]

export type CertificateSummary = {
  id: string
  title: string
  completedAt: string
}

export const recentCertificates: CertificateSummary[] = [
  { id: 'lgpd', title: 'Fundamentos de LGPD', completedAt: '12/05/2024' },
  { id: 'seguranca-informacao', title: 'Segurança da Informação', completedAt: '28/04/2024' },
  { id: 'criptografia', title: 'Introdução à Criptografia', completedAt: '10/04/2024' },
]

export type ProgressItem = {
  id: string
  label: string
  current: number
  total: number
  displayValue: string
  icon: 'trilhas' | 'cursos' | 'horas' | 'certificados'
}

export const progressOverview: ProgressItem[] = [
  { id: 'trilhas', label: 'Trilhas em andamento', current: 3, total: 5, displayValue: '3 de 5', icon: 'trilhas' },
  { id: 'cursos', label: 'Cursos concluídos', current: 12, total: 20, displayValue: '12 de 20', icon: 'cursos' },
  { id: 'horas', label: 'Horas estudadas', current: 48, total: 100, displayValue: '48h de 100h', icon: 'horas' },
  { id: 'certificados', label: 'Certificados conquistados', current: 7, total: 15, displayValue: '7 de 15', icon: 'certificados' },
]
