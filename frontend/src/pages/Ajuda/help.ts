export const helpCategories = [
  { id: 'conta', label: 'Conta e acesso' },
  { id: 'cursos', label: 'Cursos e trilhas' },
  { id: 'avaliacoes', label: 'Avaliações' },
  { id: 'certificados', label: 'Certificados' },
] as const

export type HelpCategory = (typeof helpCategories)[number]['id']
export type HelpQuestion = {
  id: string
  category: HelpCategory
  question: string
  answer: string
}

export const helpQuestions: HelpQuestion[] = [
  { id: 'senha', category: 'conta', question: 'Como redefinir minha senha?', answer: 'A recuperação e a alteração de senha ainda não estão integradas neste protótipo. A opção Alterar senha, em Configurações > Segurança, informa essa disponibilidade.' },
  { id: 'acesso', category: 'conta', question: 'O que fazer se não conseguir entrar na minha conta?', answer: 'Na demonstração, use um e-mail com formato válido e uma senha de pelo menos 6 caracteres. Não use sua senha pessoal: o acesso é simulado e não valida uma conta real.' },
  { id: 'meus-cursos', category: 'cursos', question: 'Como acessar meus cursos?', answer: 'Abra Meus Cursos no menu lateral. As abas Em andamento, Concluídos e Salvos organizam seus conteúdos. Selecione um curso para consultar os detalhes.' },
  { id: 'progresso', category: 'cursos', question: 'Onde acompanho meu progresso?', answer: 'Consulte Meus Cursos para ver o progresso por curso e o Dashboard ou Relatórios para uma visão geral. Os dados de aprendizagem são ilustrativos nesta versão.' },
  { id: 'trilhas', category: 'cursos', question: 'Como funcionam as trilhas de aprendizagem?', answer: 'As trilhas reúnem cursos sobre um tema em uma sequência de aprendizagem. Em Trilhas, consulte os temas, o nível e a carga horária para escolher por onde começar.' },
  { id: 'avaliacoes', category: 'avaliacoes', question: 'Como funcionam as avaliações?', answer: 'Em Avaliações, abra uma atividade disponível, leia as instruções e responda todas as questões antes de entregar. O resultado mostra sua nota e a revisão das respostas.' },
  { id: 'notas', category: 'avaliacoes', question: 'Onde vejo minhas notas?', answer: 'Na página Avaliações, filtre por Concluídas e abra o resultado da atividade. Os indicadores da página também apresentam um resumo do seu desempenho.' },
  { id: 'tentativas', category: 'avaliacoes', question: 'Posso refazer uma avaliação?', answer: 'Se não atingir a nota mínima, você pode tentar novamente enquanto houver tentativas disponíveis. O protótipo permite até duas entregas por avaliação; atividades aprovadas ficam disponíveis para revisão.' },
  { id: 'certificados', category: 'certificados', question: 'Onde encontro meus certificados?', answer: 'Abra Certificados no menu lateral. Você pode pesquisar, visualizar e baixar os certificados disponíveis em PDF. Os documentos desta versão são demonstrativos.' },
  { id: 'emissao', category: 'certificados', question: 'Quando um certificado fica disponível?', answer: 'Nesta versão, cursos marcados como concluídos na página Certificados possuem um certificado demonstrativo. Cursos em andamento não permitem download. A emissão automática após concluir um curso ainda não está integrada.' },
]

export function filterHelpQuestions(query: string, category: HelpCategory | null) {
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim()
  const search = normalize(query)
  return helpQuestions.filter((item) =>
    (!category || item.category === category) && normalize(`${item.question} ${item.answer}`).includes(search),
  )
}
