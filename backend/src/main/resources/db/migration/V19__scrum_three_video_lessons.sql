INSERT INTO aulas (id, curso_id, titulo, conteudo, video_url, ordem)
SELECT UUID(), c.id, lesson.titulo, '', lesson.video_url, lesson.ordem
FROM cursos c
JOIN (
    SELECT 1 AS ordem, 'Fundamentos do Scrum e Papéis do Time' AS titulo, '/videos/scrum-aula-1.mp4' AS video_url
    UNION ALL SELECT 2, 'Eventos do Scrum: da Sprint ao Daily', '/videos/scrum-aula-2.mp4'
    UNION ALL SELECT 3, 'Backlog, Priorização e Entrega de Valor', '/videos/scrum-aula-3.mp4'
) lesson
WHERE c.titulo = 'Gestão de Projetos Ágeis com Scrum'
  AND NOT EXISTS (
      SELECT 1 FROM aulas a WHERE a.curso_id = c.id AND a.ordem = lesson.ordem
  );
