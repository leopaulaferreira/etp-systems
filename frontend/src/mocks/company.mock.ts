import type { Employee, EmployeeCourse } from '../pages/Empresa/company'

export const company = { id: 'etp', name: 'ETP Systems', contactName: 'Mariana Costa', role: 'Empresa / RH' }

const security = { id: 'seguranca', title: 'Fundamentos de Cibersegurança', track: 'Segurança da Informação' }
const privacy = { id: 'lgpd', title: 'LGPD na Prática', track: 'Segurança da Informação' }
const data = { id: 'dados', title: 'Python para Análise de Dados', track: 'Dados e Tecnologia' }
const communication = { id: 'comunicacao', title: 'Comunicação Assertiva', track: 'Desenvolvimento Profissional' }

function course(base: typeof security, progress: number, score: number | null, date: string | null, code: string | null = null): EmployeeCourse {
  return { ...base, progress, score, updatedAt: date, completedAt: progress === 100 ? date : null, certificateCode: code }
}

export const employees: Employee[] = [
  { id: 'ana', companyId: company.id, name: 'Ana Souza', email: 'ana.souza@etp.example', department: 'Tecnologia', courses: [course(security, 100, 90, '2026-10-02', 'ETP-ANA-SEG'), course(privacy, 65, null, '2026-10-03'), course(data, 40, null, '2026-10-01')] },
  { id: 'bruno', companyId: company.id, name: 'Bruno Lima', email: 'bruno.lima@etp.example', department: 'Operações', courses: [course(security, 60, 60, '2026-10-01'), course(communication, 0, null, null)] },
  { id: 'carla', companyId: company.id, name: 'Carla Mendes', email: 'carla.mendes@etp.example', department: 'Recursos Humanos', courses: [course(privacy, 100, 100, '2026-10-03', 'ETP-CARLA-LGPD'), course(communication, 100, 90, '2026-09-28', 'ETP-CARLA-COM')] },
  { id: 'diego', companyId: company.id, name: 'Diego Alves', email: 'diego.alves@etp.example', department: 'Tecnologia', courses: [course(data, 0, null, null), course(security, 0, null, null)] },
  { id: 'fernanda', companyId: company.id, name: 'Fernanda Oliveira', email: 'fernanda.oliveira@etp.example', department: 'Financeiro', courses: [course(privacy, 100, 80, '2026-09-30', 'ETP-FER-LGPD'), course(communication, 35, null, '2026-10-02')] },
  { id: 'gabriel', companyId: company.id, name: 'Gabriel Santos', email: 'gabriel.santos@etp.example', department: 'Operações', courses: [course(security, 100, 85, '2026-10-01', 'ETP-GAB-SEG')] },
  { id: 'helena', companyId: company.id, name: 'Helena Ribeiro', email: 'helena.ribeiro@etp.example', department: 'Financeiro', courses: [course(data, 25, null, '2026-09-29'), course(privacy, 0, null, null)] },
  { id: 'joao', companyId: company.id, name: 'João Silva', email: 'joao.silva@etp.example', department: 'Tecnologia', courses: [course(security, 75, 70, '2026-10-03'), course(data, 15, null, '2026-10-02')] },
]
