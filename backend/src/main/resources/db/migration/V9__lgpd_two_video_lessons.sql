UPDATE aulas a
JOIN cursos c ON c.id = a.curso_id
SET a.titulo = 'Introdução à LGPD e Proteção de Dados',
    a.conteudo = '',
    a.video_url = '/videos/lgpd-aula-1.mp4'
WHERE c.titulo = 'LGPD na Prática' AND a.ordem = 1;

INSERT INTO aulas (id, curso_id, titulo, conteudo, video_url, ordem)
SELECT UUID(), c.id, 'Boas práticas no ambiente corporativo', '', '/videos/lgpd-aula-2.mp4', 2
FROM cursos c
WHERE c.titulo = 'LGPD na Prática'
  AND NOT EXISTS (SELECT 1 FROM aulas a WHERE a.curso_id = c.id AND a.ordem = 2);
