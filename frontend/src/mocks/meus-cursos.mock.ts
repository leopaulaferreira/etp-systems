/**
 * Dados de exemplo da página Meus Cursos.
 *
 * Os dados ainda são estáticos e devem ser substituídos pelos contratos da API
 * quando a integração com o backend estiver disponível.
 */

export type CourseThumbnailKey =
  'security' | 'cloud' | 'data' | 'cybersecurity' | 'ai' | 'lgpd' | 'projects'

export type CourseItem = {
  id: string
  title: string
  description?: string
  type: 'CURSO' | 'TRILHA'
  thumbnail: CourseThumbnailKey
  progress?: number
  lastLesson?: string
  duration?: string
  completedAt?: string
  updatedAt?: string
}

export const continueCourse: CourseItem = {
  id: 'fundamentos-seguranca',
  title: 'Fundamentos de Segurança da Informação',
  description:
    'Aprenda os principais conceitos, práticas e tecnologias para proteger informações e sistemas contra ameaças digitais.',
  type: 'CURSO',
  thumbnail: 'security',
  progress: 65,
  lastLesson: 'Tipos de Ameaças e Vulnerabilidades',
  duration: '6h 30m',
}

export const ongoingCourses: CourseItem[] = [
  continueCourse,
  {
    id: 'computacao-nuvem',
    title: 'Computação em Nuvem: Conceitos e Aplicações',
    type: 'CURSO',
    thumbnail: 'cloud',
    progress: 40,
    lastLesson: 'Modelos de Serviço em Nuvem (IaaS, PaaS, SaaS)',
    duration: '4h',
  },
  {
    id: 'seguranca-informacao',
    title: 'Segurança da Informação na Prática',
    type: 'CURSO',
    thumbnail: 'lgpd',
    progress: 25,
    lastLesson: 'Políticas de Segurança da Informação',
    duration: '5h',
  },
  {
    id: 'trilha-ciberseguranca',
    title: 'Trilha de Cibersegurança',
    type: 'TRILHA',
    thumbnail: 'cybersecurity',
    progress: 10,
    lastLesson: 'Panorama da Cibersegurança',
    duration: '12 cursos',
  },
]

export const completedCourses: CourseItem[] = [
  {
    id: 'fundamentos-lgpd',
    title: 'Fundamentos de LGPD',
    type: 'CURSO',
    thumbnail: 'lgpd',
    progress: 100,
    duration: '3h 20m',
    completedAt: '12/05/2024',
  },
  {
    id: 'introducao-criptografia',
    title: 'Introdução à Criptografia',
    type: 'CURSO',
    thumbnail: 'security',
    progress: 100,
    duration: '4h',
    completedAt: '10/04/2024',
  },
]

export const savedCourses: CourseItem[] = [
  ongoingCourses[1],
  {
    id: 'inteligencia-artificial',
    title: 'Introdução à Inteligência Artificial',
    type: 'CURSO',
    thumbnail: 'ai',
    duration: '5h',
  },
  {
    id: 'lgpd-pratica',
    title: 'LGPD na Prática',
    type: 'CURSO',
    thumbnail: 'lgpd',
    duration: '3h',
  },
]

export const exploreCourses: CourseItem[] = [
  {
    id: 'trilha-dados',
    title: 'Trilha de Dados',
    type: 'TRILHA',
    thumbnail: 'data',
    duration: '12 cursos',
  },
  {
    id: 'analise-dados',
    title: 'Análise de Dados com Excel e Power BI',
    type: 'CURSO',
    thumbnail: 'data',
    duration: '8h',
  },
  {
    id: 'gestao-projetos',
    title: 'Gestão de Projetos Ágeis com Scrum',
    type: 'CURSO',
    thumbnail: 'projects',
    duration: '6h',
  },
]
