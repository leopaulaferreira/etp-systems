# Perfil

A rota `/perfil` reúne dados demonstrativos já usados nas outras páginas:

- Indicadores de trilhas e horas do Dashboard; certificados da página Certificados; avaliações concluídas da página Avaliações.
- Objetivos dos cursos em andamento em Meus Cursos, conquistas do Dashboard e atividade das avaliações.
- Os links levam às respectivas páginas e os downloads usam o gerador de PDF dos certificados.

Nome e e-mail iniciais vêm da autenticação real. Os demais campos ainda partem de `mocks/user.mock.ts`. A edição em `/configuracoes` salva personalizações em `localStorage` por usuário e atualiza o nome exibido; o e-mail de acesso é somente leitura. As avaliações são compartilhadas entre páginas durante a sessão e reiniciadas quando a conta muda. A API de edição de perfil ainda não existe.
