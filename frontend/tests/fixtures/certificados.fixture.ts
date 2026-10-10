import type { Certificate, CertificateDownload } from '../types/certificate'

/** Dados demonstrativos, sem emissão ou verificação por uma API. */
export const certificates: Certificate[] = [
  {
    id: 'lgpd',
    title: 'Fundamentos de LGPD',
    description:
      'Compreenda os princípios e práticas essenciais da Lei Geral de Proteção de Dados.',
    hours: 6,
    accent: 'blue',
    status: 'completed',
    progress: 100,
    issuedAt: '2024-05-12',
    code: 'ETP-LGPD-2024-0512',
  },
  {
    id: 'seguranca',
    title: 'Segurança da Informação',
    description: 'Conheça os pilares da segurança e aprenda a proteger informações no dia a dia.',
    hours: 8,
    accent: 'green',
    status: 'completed',
    progress: 100,
    issuedAt: '2024-04-28',
    code: 'ETP-SEG-2024-0428',
  },
  {
    id: 'criptografia',
    title: 'Introdução à Criptografia',
    description: 'Explore os fundamentos da criptografia e da comunicação segura.',
    hours: 10,
    accent: 'purple',
    status: 'completed',
    progress: 100,
    issuedAt: '2024-04-10',
    code: 'ETP-CRIP-2024-0410',
  },
  {
    id: 'nuvem',
    title: 'Computação em Nuvem: Conceitos e Aplicações',
    description:
      'Descubra os modelos de serviços e as principais aplicações da computação em nuvem.',
    hours: 4,
    accent: 'blue',
    status: 'completed',
    progress: 100,
    issuedAt: '2024-03-22',
    code: 'ETP-CLOUD-2024-0322',
  },
  {
    id: 'protecao',
    title: 'Boas Práticas em Proteção de Dados',
    description: 'Aplique boas práticas de privacidade e proteção de dados pessoais.',
    hours: 10,
    accent: 'orange',
    status: 'completed',
    progress: 100,
    issuedAt: '2024-02-15',
    code: 'ETP-DADOS-2024-0215',
  },
  {
    id: 'privacidade',
    title: 'Privacidade no Ambiente Digital',
    description: 'Aprenda a cuidar da sua identidade e dos seus dados no ambiente digital.',
    hours: 4,
    accent: 'cyan',
    status: 'completed',
    progress: 100,
    issuedAt: '2024-01-18',
    code: 'ETP-PRIV-2024-0118',
  },
  {
    id: 'etica',
    title: 'Ética e Cidadania Digital',
    description: 'Desenvolva uma atuação responsável, ética e consciente no mundo digital.',
    hours: 6,
    accent: 'purple',
    status: 'completed',
    progress: 100,
    issuedAt: '2023-12-08',
    code: 'ETP-ETICA-2023-1208',
  },
  {
    id: 'governanca',
    title: 'Governança de Dados',
    description: 'Organize processos e responsabilidades para uma gestão eficiente de dados.',
    hours: 6,
    accent: 'green',
    status: 'in_progress',
    progress: 65,
  },
  {
    id: 'riscos',
    title: 'Gestão de Riscos em Segurança da Informação',
    description: 'Identifique, avalie e acompanhe riscos de segurança da informação.',
    hours: 8,
    accent: 'cyan',
    status: 'in_progress',
    progress: 30,
  },
  {
    id: 'redes',
    title: 'Fundamentos de Segurança de Redes',
    description: 'Conheça as estratégias de proteção de redes e conexões.',
    hours: 6,
    accent: 'orange',
    status: 'in_progress',
    progress: 15,
  },
]

export const initialDownloads: CertificateDownload[] = certificates
  .filter((item) => item.status === 'completed')
  .flatMap((item) => [
    { certificateId: item.id, downloadedAt: `${item.issuedAt}T13:00:00Z` },
    { certificateId: item.id, downloadedAt: `${item.issuedAt}T14:30:00Z` },
  ])

export const certificateAchievements = [
  {
    title: 'Primeiro Certificado',
    description: 'Você conquistou seu primeiro certificado!',
    date: '2023-12-08',
    icon: 'trophy',
  },
  {
    title: 'Especialista em Privacidade',
    description: 'Concluiu 2 cursos sobre proteção de dados.',
    date: '2024-02-15',
    icon: 'shield',
  },
  {
    title: 'Comprometido com o Aprendizado',
    description: 'Concluiu 5 cursos na plataforma.',
    date: '2024-04-10',
    icon: 'graduation',
  },
] as const
