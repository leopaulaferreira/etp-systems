/** Dados do protótipo mantidos para Relatórios e para reconhecer valores antigos do perfil local. A identidade autenticada vem da API. */
export type CurrentUser = {
  name: string
  role: string
  notificationCount: number
  email: string
  location: string
  memberSince: string
  birthDate: string
  phone: string
  position: string
  company: string
  learningFocus: string
  experienceLevel: string
  notificationsEnabled: boolean
  language: string
}

export const currentUser: CurrentUser = {
  name: 'João Silva',
  role: 'Aprendiz',
  notificationCount: 3,
  email: 'joaosilva@email.com',
  location: 'São Paulo, Brasil',
  memberSince: '2024-02-12',
  birthDate: '1992-08-15',
  phone: '(11) 99999-9999',
  position: 'Analista de TI',
  company: 'ETP Systems',
  learningFocus: 'Segurança da Informação',
  experienceLevel: 'Intermediário',
  notificationsEnabled: true,
  language: 'Português (Brasil)',
}
