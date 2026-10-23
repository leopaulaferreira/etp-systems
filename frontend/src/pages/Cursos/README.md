# Cursos

A página `/cursos` consulta `GET /api/cursos` e `GET /api/cursos/{id}`. Busca, filtros por categoria e nível, ordenação e paginação de oito cards são locais. O destaque vem do campo `featured` da API. Em falha de rede, a tela mostra erro e permite tentar novamente; não há catálogo fictício de reserva.

O diálogo permite inscrição real em cursos pelo colaborador. A página `/cursos/:id/estudar` mostra uma aula por vez, com navegação pela lista lateral, “Aula anterior” e “Próxima aula”. LGPD na Prática tem duas videoaulas; Introdução à Inteligência Artificial e Gestão de Projetos Ágeis com Scrum têm três cada. Outros conteúdos aparecem conforme cadastrados no backend. O catálogo não mostra contagens de alunos porque a API ainda não fornece esse dado.

Para associar um novo MP4 a uma aula, coloque-o em `frontend/public/videos/` e atualize a URL da aula em uma migração. O frontend também aceita embeds de `www.youtube-nocookie.com` no formato `/embed/ID`.

Validação: `npm run build`, `npm run lint` e `npm run test:cursos` em `frontend/`.

A ordenação padrão **Com aulas primeiro** usa `lessonCount`, calculado no backend a partir das aulas cadastradas (em vídeo ou texto). A prioridade é aplicada antes da paginação e preserva a ordem dentro de cada grupo. Busca e filtros mantêm essa prioridade; ordens explícitas por nome, duração ou popularidade continuam disponíveis. Os cards informam a quantidade de aulas ou que o conteúdo está em preparação. O destaque só aparece para cursos com aulas.
