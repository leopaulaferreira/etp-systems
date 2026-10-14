INSERT INTO aulas (id, curso_id, titulo, conteudo, video_url, ordem)
SELECT UUID(), c.id, lesson.titulo, '', lesson.video_url, lesson.ordem
FROM cursos c
JOIN (
    SELECT 1 AS ordem, 'Fundamentos de Cloud Computing' AS titulo, '/videos/cloud-aula-1.mp4' AS video_url
    UNION ALL SELECT 2, 'Serviços e Modelos de Nuvem', '/videos/cloud-aula-2.mp4'
    UNION ALL SELECT 3, 'Cloud na Prática: Benefícios, Cuidados e Casos de Uso', '/videos/cloud-aula-3.mp4'
) lesson
WHERE c.titulo = 'Cloud Computing Essencial'
  AND NOT EXISTS (
      SELECT 1 FROM aulas a WHERE a.curso_id = c.id AND a.ordem = lesson.ordem
  );
