export const id = (n) => `11111111-1111-4111-8111-${String(n).padStart(12, '0')}`
export const courseId = id(1)
const title = 'Cloud Computing Essencial: Fundamentos, Serviços e Modelos de Nuvem'

export async function mockLearningApi(page) {
  const state = { completed: [], attempts: [], certificateError: false, saveError: false }
  const user = { id: id(2), nome: 'Rafael Martins de Albuquerque', email: 'mobile@example.test', perfil: 'COLABORADOR', empresaId: null }
  const course = { id: courseId, title, description: 'Fundamentos e aplicações da computação em nuvem.', category: 'Tecnologia', level: 'Iniciante', durationHours: 3, featured: false, icon: 'cloud' }
  const lessons = ['Fundamentos de Cloud Computing', 'Serviços e Modelos de Nuvem', 'Cloud na Prática: Benefícios, Cuidados e Casos de Uso'].map((title, i) => ({ id: id(10 + i), title, content: 'Conheça os recursos de computação em nuvem.\n\nRevise os conceitos antes de concluir a aula.', order: i + 1, videoUrl: i === 0 ? '/videos/cloud-aula-1.mp4' : null }))
  const questions = [0, 1, 2].map((i) => ({ id: id(20 + i), prompt: `Questão ${i + 1}: qual alternativa descreve o uso adequado dos recursos de computação em nuvem?`, options: ['Utilizar recursos pela internet conforme a necessidade.', 'Compartilhar a mesma senha entre todos os usuários.', 'Dispensar planejamento e monitoramento.', 'Ignorar os custos dos recursos utilizados.'], optionIds: [0, 1, 2, 3].map((j) => id(30 + i * 4 + j)), correctOption: null, explanation: null }))
  const assessment = () => ({ id: id(3), courseId, title: `Avaliação: ${title}`, course: title, status: state.attempts.length ? 'completed' : 'pending', minimumScore: 80, maxAttempts: 2, estimatedMinutes: 8, topic: 'cloud', questions: questions.map(q => ({ ...q, correctOption: state.attempts.some(a => a.passed) || state.attempts.length === 2 ? 0 : null, explanation: 'A nuvem permite ajustar recursos conforme a demanda.' })), attempts: state.attempts })
  const progress = () => ({ completedLessonIds: state.completed, totalLessons: 3, progress: Math.floor(state.completed.length * 10000 / 3) / 100 })
  await page.addInitScript(() => sessionStorage.setItem('etp-auth-session-v1', JSON.stringify({ accessToken: 'browser-test-only', expiresAt: Date.now() + 3600000 })))
  await page.route(url => url.pathname.startsWith('/api/'), async (route) => {
    const path = new URL(route.request().url()).pathname
    let data
    if (path === '/api/auth/me') data = user
    else if (path === '/api/colaborador/perfil') data = { name: user.nome, email: user.email, phone: '', location: '', position: 'Analista', company: 'ETP', learningFocus: '', experienceLevel: 'Iniciante', notificationsEnabled: true, memberSince: '2026-01-01' }
    else if (path === '/api/cursos') data = [course]
    else if (path === `/api/cursos/${courseId}`) data = course
    else if (path === `/api/colaborador/cursos/${courseId}/aulas`) data = lessons
    else if (path.endsWith('/aulas/progresso')) data = progress()
    else if (path.endsWith('/conclusao')) {
      if (state.saveError) return route.fulfill({ status: 503, json: {} })
      const lessonId = path.split('/').at(-2)
      if (!state.completed.includes(lessonId)) state.completed.push(lessonId)
      data = progress()
    } else if (path === '/api/colaborador/avaliacoes') data = [assessment()]
    else if (path.endsWith('/tentativas')) {
      const respostas = route.request().postDataJSON().respostas
      const answers = Object.fromEntries(respostas.map(r => [r.questaoId, questions.find(q => q.id === r.questaoId).optionIds.indexOf(r.alternativaId)]))
      const score = Math.round(Object.values(answers).filter(a => a === 0).length * 100 / 3)
      state.attempts.push({ answers, score, passed: score >= 80, completedAt: `2026-10-15T12:0${state.attempts.length}:00Z` })
      data = assessment()
    } else if (path === '/api/colaborador/meus-cursos') data = [{ ...course, enrolledAt: '2026-10-01T12:00:00Z', progress: progress().progress, updatedAt: null, completedAt: null }]
    else if (path === '/api/colaborador/certificados') {
      if (state.certificateError) return route.fulfill({ status: 503, json: {} })
      data = state.attempts.some(a => a.passed) ? [{ id: id(4), courseId, holderName: user.nome, title, description: course.description, durationHours: 3, code: `ETP-${'A'.repeat(32)}`, issuedAt: '2026-10-15T12:00:00Z' }] : []
    } else throw new Error(`API inesperada no teste: ${path}`)
    await route.fulfill({ json: data })
  })
  return state
}
