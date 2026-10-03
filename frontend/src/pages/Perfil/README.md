# Perfil

A rota `/perfil` reúne dados demonstrativos já usados nas outras páginas:

- Indicadores de trilhas e horas do Dashboard; certificados da página Certificados; avaliações concluídas da página Avaliações.
- Objetivos dos cursos em andamento em Meus Cursos, conquistas do Dashboard e atividade das avaliações.
- Os links levam às respectivas páginas e os downloads usam o gerador de PDF dos certificados.

Os dados pessoais partem de `mocks/user.mock.ts`. O formulário salva as alterações em `localStorage` e atualiza o nome no cabeçalho, na saudação do Dashboard e nos certificados demonstrativos. O estado das avaliações é compartilhado entre as páginas durante a sessão. A integração com o backend ainda não existe.
