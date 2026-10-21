-- Preserva o curso existente, suas inscrições e seu progresso.
INSERT INTO aulas (id, curso_id, titulo, conteudo, video_url, ordem)
SELECT UUID(), c.id, lesson.titulo, '', lesson.video_url, lesson.ordem
FROM cursos c
JOIN (
    SELECT 1 AS ordem, 'Fundamentos da Criptografia' AS titulo, '/videos/criptografia-aula-1.mp4' AS video_url
    UNION ALL SELECT 2, 'Criptografia Simétrica, Assimétrica e Hash', '/videos/criptografia-aula-2.mp4'
    UNION ALL SELECT 3, 'HTTPS, Senhas e Assinaturas Digitais', '/videos/criptografia-aula-3.mp4'
) lesson
WHERE c.titulo = 'Introdução à Criptografia'
  AND NOT EXISTS (
      SELECT 1 FROM aulas a WHERE a.curso_id = c.id AND a.ordem = lesson.ordem
  );
