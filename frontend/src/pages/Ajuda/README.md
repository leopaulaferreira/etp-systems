# Central de Ajuda

Página `/ajuda`, protegida pela sessão mock e acessível pelo card de suporte da
sidebar. Reutiliza AppLayout, PageHero, Input e Button, com os tokens e classes
das páginas internas. O código da página é carregado sob demanda.

- `help.ts`: quatro categorias, dez respostas e filtro local por pergunta/resposta.
  Busca ignora acentos e caixa e se combina com a categoria selecionada.
- `AjudaPage.tsx`: categorias, busca, estado vazio, accordion com animação reduzida
  conforme a preferência do usuário e card de suporte.
- `SupportDialog.tsx`: modal nativo com assunto, categoria e descrição obrigatórios.
  Impede submissões compostas só por espaços, mantém o foco no modal, fecha com
  Escape/Cancelar e restaura o foco ao botão de origem.

O envio é simulado imediatamente e confirmado na página. Nenhuma solicitação é
armazenada, transmitida ou acompanhada. Cancelar descarta o formulário. A categoria
ativa no FAQ é usada como valor inicial do formulário.

Termos de Uso exibe uma indicação de indisponibilidade; Política de Privacidade
leva à seção existente em Configurações. Não há novas páginas jurídicas.

Validação: `npm run test:ajuda`, `npm run build` e `npm run lint`. As demais suítes
(`test:avaliacoes`, `test:cursos`, `test:certificados`) também foram executadas.
No navegador, foram conferidos filtros combinados, estado vazio, accordion por
teclado, campos obrigatórios, envio simulado, cancelamento por Escape, foco do
modal, link de privacidade e drawer mobile em 320, 390 e 1440 px.
