/** Dados locais preservados como alternativa quando a API não estiver disponível. */
export const courseCategories = [
  'Tecnologia',
  'Dados',
  'Negócios',
  'Segurança',
  'Produtividade',
] as const
export const courseLevels = ['Iniciante', 'Intermediário', 'Avançado'] as const
export type CourseCategory = (typeof courseCategories)[number]
export type CourseLevel = (typeof courseLevels)[number]
export type CourseIcon =
  | 'cloud'
  | 'python'
  | 'communication'
  | 'ai'
  | 'security'
  | 'governance'
  | 'workspace'
  | 'analytics'
  | 'code'
  | 'leadership'
  | 'projects'

export type CatalogCourse = {
  id: string
  title: string
  description: string
  category: string
  level: CourseLevel
  durationHours: number
  students?: number
  icon: CourseIcon
  featured?: boolean
}

export const featuredCourse: CatalogCourse = {
  id: 'fundamentos-ciberseguranca',
  title: 'Fundamentos de Cibersegurança',
  description:
    'Aprenda os princípios essenciais para proteger sistemas, redes e dados contra as principais ameaças digitais.',
  category: 'Segurança',
  level: 'Intermediário',
  durationHours: 6,
  students: 12500,
  icon: 'security',
}

/** A ordem do mock define a relevância inicial do catálogo. O destaque também faz parte dos 24 cursos. */
export const catalogCourses: CatalogCourse[] = [
  {
    id: 'cloud-essencial',
    title: 'Cloud Computing Essencial',
    description: 'Entenda os conceitos de cloud, serviços e modelos de implantação.',
    category: 'Tecnologia',
    level: 'Iniciante',
    durationHours: 5,
    students: 8400,
    icon: 'cloud',
  },
  {
    id: 'python-analise-dados',
    title: 'Python para Análise de Dados',
    description: 'Aprenda Python na prática para coletar, tratar e analisar dados com eficiência.',
    category: 'Dados',
    level: 'Intermediário',
    durationHours: 8,
    students: 11200,
    icon: 'python',
  },
  {
    id: 'comunicacao-assertiva',
    title: 'Comunicação Assertiva',
    description:
      'Desenvolva habilidades de comunicação para melhorar relacionamentos e resultados.',
    category: 'Negócios',
    level: 'Iniciante',
    durationHours: 4,
    students: 6900,
    icon: 'communication',
  },
  {
    id: 'inteligencia-artificial',
    title: 'Introdução à Inteligência Artificial',
    description:
      'Explore os conceitos básicos da inteligência artificial e suas aplicações no dia a dia.',
    category: 'Tecnologia',
    level: 'Iniciante',
    durationHours: 5,
    students: 10300,
    icon: 'ai',
  },
  {
    id: 'lgpd-pratica',
    title: 'LGPD na Prática',
    description:
      'Entenda a Lei Geral de Proteção de Dados e aplique boas práticas na sua organização.',
    category: 'Segurança',
    level: 'Intermediário',
    durationHours: 3,
    students: 7600,
    icon: 'security',
  },
  {
    id: 'governanca-ti',
    title: 'Governança de TI',
    description: 'Aprenda a alinhar TI aos objetivos do negócio com frameworks e boas práticas.',
    category: 'Negócios',
    level: 'Intermediário',
    durationHours: 7,
    students: 4200,
    icon: 'governance',
  },
  {
    id: 'google-workspace',
    title: 'Google Workspace',
    description: 'Domine as principais ferramentas do Google para aumentar sua produtividade.',
    category: 'Produtividade',
    level: 'Iniciante',
    durationHours: 3,
    students: 9100,
    icon: 'workspace',
  },
  {
    id: 'power-bi-essencial',
    title: 'Power BI Essencial',
    description: 'Crie dashboards e relatórios interativos para transformar dados em decisões.',
    category: 'Dados',
    level: 'Intermediário',
    durationHours: 6,
    students: 9800,
    icon: 'analytics',
  },
  featuredCourse,
  {
    id: 'fundamentos-seguranca',
    title: 'Fundamentos de Segurança da Informação',
    description: 'Conheça as práticas e tecnologias para proteger informações e sistemas.',
    category: 'Segurança',
    level: 'Iniciante',
    durationHours: 6.5,
    students: 8700,
    icon: 'security',
  },
  {
    id: 'computacao-nuvem',
    title: 'Computação em Nuvem: Conceitos e Aplicações',
    description: 'Compare modelos de serviço e descubra como usar recursos de nuvem no trabalho.',
    category: 'Tecnologia',
    level: 'Iniciante',
    durationHours: 4,
    students: 7200,
    icon: 'cloud',
  },
  {
    id: 'gestao-projetos',
    title: 'Gestão de Projetos Ágeis com Scrum',
    description: 'Organize entregas, priorize atividades e colabore com times ágeis.',
    category: 'Negócios',
    level: 'Intermediário',
    durationHours: 6,
    students: 6300,
    icon: 'projects',
  },
  {
    id: 'excel-avancado',
    title: 'Excel Avançado para Negócios',
    description: 'Automatize análises com fórmulas, tabelas dinâmicas e modelos de dados.',
    category: 'Dados',
    level: 'Avançado',
    durationHours: 10,
    students: 8100,
    icon: 'analytics',
  },
  {
    id: 'lideranca-colaborativa',
    title: 'Liderança Colaborativa',
    description: 'Fortaleça a autonomia, a confiança e a colaboração da sua equipe.',
    category: 'Negócios',
    level: 'Intermediário',
    durationHours: 5,
    students: 5700,
    icon: 'leadership',
  },
  {
    id: 'gestao-tempo',
    title: 'Gestão do Tempo e Prioridades',
    description: 'Planeje sua rotina e concentre seus esforços no que gera mais resultado.',
    category: 'Produtividade',
    level: 'Iniciante',
    durationHours: 2,
    students: 10800,
    icon: 'workspace',
  },
  {
    id: 'sql-iniciantes',
    title: 'SQL para Iniciantes',
    description: 'Consulte e organize informações em bancos de dados relacionais.',
    category: 'Dados',
    level: 'Iniciante',
    durationHours: 6,
    students: 6800,
    icon: 'code',
  },
  {
    id: 'seguranca-informacao',
    title: 'Segurança da Informação na Prática',
    description: 'Aplique políticas de segurança e reconheça riscos no ambiente de trabalho.',
    category: 'Segurança',
    level: 'Intermediário',
    durationHours: 5,
    students: 4900,
    icon: 'security',
  },
  {
    id: 'automacao-python',
    title: 'Automação com Python',
    description: 'Crie scripts para simplificar tarefas repetitivas e ganhar produtividade.',
    category: 'Tecnologia',
    level: 'Avançado',
    durationHours: 10,
    students: 5100,
    icon: 'python',
  },
  {
    id: 'analise-dados',
    title: 'Análise de Dados com Excel e Power BI',
    description: 'Combine planilhas e visualizações para responder perguntas do negócio.',
    category: 'Dados',
    level: 'Intermediário',
    durationHours: 8,
    students: 9200,
    icon: 'analytics',
  },
  {
    id: 'atendimento-cliente',
    title: 'Excelência no Atendimento',
    description: 'Pratique a escuta ativa e construa experiências melhores para os clientes.',
    category: 'Negócios',
    level: 'Iniciante',
    durationHours: 3,
    students: 7400,
    icon: 'communication',
  },
  {
    id: 'arquitetura-cloud',
    title: 'Arquitetura de Soluções em Nuvem',
    description: 'Projete soluções escaláveis com foco em disponibilidade e eficiência.',
    category: 'Tecnologia',
    level: 'Avançado',
    durationHours: 12,
    students: 3600,
    icon: 'cloud',
  },
  {
    id: 'introducao-criptografia',
    title: 'Introdução à Criptografia',
    description: 'Entenda como cifras, chaves e assinaturas digitais protegem a comunicação.',
    category: 'Segurança',
    level: 'Iniciante',
    durationHours: 4,
    students: 4300,
    icon: 'security',
  },
  {
    id: 'apresentacoes-impacto',
    title: 'Apresentações de Impacto',
    description: 'Estruture suas ideias e comunique informações com clareza e confiança.',
    category: 'Produtividade',
    level: 'Iniciante',
    durationHours: 3,
    students: 6200,
    icon: 'communication',
  },
  {
    id: 'ia-negocios',
    title: 'Inteligência Artificial nos Negócios',
    description: 'Avalie oportunidades e limites da IA para melhorar processos e decisões.',
    category: 'Tecnologia',
    level: 'Avançado',
    durationHours: 8,
    students: 5900,
    icon: 'ai',
  },
]
