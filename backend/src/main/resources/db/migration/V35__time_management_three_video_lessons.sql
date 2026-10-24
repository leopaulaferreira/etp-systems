-- Reutiliza o cadastro existente, preservando inscrições e progresso.
UPDATE cursos SET titulo = 'Fundamentos da Gestão do Tempo'
WHERE titulo = 'Gestão do Tempo e Prioridades';

INSERT INTO aulas (id, curso_id, titulo, conteudo, video_url, ordem)
SELECT UUID(), c.id, lesson.titulo, '', lesson.video_url, lesson.ordem
FROM cursos c
JOIN (
    SELECT 1 AS ordem, 'Fundamentos da Gestão do Tempo' AS titulo, '/videos/gestao-tempo-aula-1.mp4' AS video_url
    UNION ALL SELECT 2, 'Como Definir Prioridades', '/videos/gestao-tempo-aula-2.mp4'
    UNION ALL SELECT 3, 'Produtividade e Organização no Dia a Dia', '/videos/gestao-tempo-aula-3.mp4'
) lesson
WHERE c.titulo = 'Fundamentos da Gestão do Tempo'
  AND NOT EXISTS (
      SELECT 1 FROM aulas a WHERE a.curso_id = c.id AND a.ordem = lesson.ordem
  );
