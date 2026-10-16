-- Mantém o mesmo curso e suas inscrições, usando o título completo.
UPDATE cursos SET titulo = 'Comunicação Assertiva no Ambiente de Trabalho', certificacao_habilitada = TRUE
WHERE titulo = 'Comunicação Assertiva';

INSERT INTO aulas (id, curso_id, titulo, conteudo, video_url, ordem)
SELECT UUID(), c.id, lesson.titulo, '', lesson.video_url, lesson.ordem
FROM cursos c
JOIN (
    SELECT 1 AS ordem, 'Fundamentos da Comunicação Assertiva' AS titulo, '/videos/comunicacao-aula-1.mp4' AS video_url
    UNION ALL SELECT 2, 'Feedback e Conversas Difíceis', '/videos/comunicacao-aula-2.mp4'
    UNION ALL SELECT 3, 'Comunicação no Trabalho em Equipe', '/videos/comunicacao-aula-3.mp4'
) lesson
WHERE c.titulo = 'Comunicação Assertiva no Ambiente de Trabalho'
  AND NOT EXISTS (
      SELECT 1 FROM aulas a WHERE a.curso_id = c.id AND a.ordem = lesson.ordem
  );
