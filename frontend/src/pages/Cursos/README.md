# Cursos

A página `/cursos` consulta `GET /api/cursos` e `GET /api/cursos/{id}`. Busca, filtros por categoria e nível, ordenação e paginação de oito cards são locais. O destaque vem do campo `featured` da API. Em falha de rede, a tela mostra erro e permite tentar novamente; não há catálogo fictício de reserva.

O diálogo permite inscrição real em cursos pelo colaborador. A página `/cursos/:id/estudar` mostra uma aula por vez, com navegação pela lista lateral, “Aula anterior” e “Próxima aula”. LGPD na Prática tem duas videoaulas; outros conteúdos aparecem conforme cadastrados no backend. O catálogo não mostra contagens de alunos porque a API ainda não fornece esse dado.

Para associar um novo MP4 a uma aula, coloque-o em `frontend/public/videos/` e atualize a URL da aula em uma migração. O frontend também aceita embeds de `www.youtube-nocookie.com` no formato `/embed/ID`.

Validação: `npm run build`, `npm run lint` e `npm run test:cursos` em `frontend/`.
