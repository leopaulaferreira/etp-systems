INSERT INTO aulas (id, curso_id, titulo, conteudo, video_url, ordem)
SELECT UUID(), c.id, 'LGPD na Prática: Prevenção e Resposta a Incidentes', '', '/videos/lgpd-aula-3.mp4', 3
FROM cursos c
WHERE c.titulo = 'LGPD na Prática'
  AND NOT EXISTS (SELECT 1 FROM aulas a WHERE a.curso_id = c.id AND a.ordem = 3);
