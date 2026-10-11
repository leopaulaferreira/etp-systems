INSERT INTO aulas (id, curso_id, titulo, conteudo, video_url, ordem)
SELECT UUID(), c.id, lesson.titulo, '', lesson.video_url, lesson.ordem
FROM cursos c
JOIN (
    SELECT 1 AS ordem, 'Introdução à Inteligência Artificial' AS titulo, '/videos/ia-aula-1.mp4' AS video_url
    UNION ALL SELECT 2, 'Introdução à IA: Aula 2', '/videos/ia-aula-2.mp4'
    UNION ALL SELECT 3, 'Uso Responsável da Inteligência Artificial', '/videos/ia-aula-3.mp4'
) lesson
WHERE c.titulo = 'Introdução à Inteligência Artificial'
  AND NOT EXISTS (
      SELECT 1 FROM aulas a WHERE a.curso_id = c.id AND a.ordem = lesson.ordem
  );
