-- Certificados preexistentes e aprovações recuperadas pela V11 também concluem o curso.
UPDATE progresso_cursos p
JOIN certificados c ON c.usuario_id = p.usuario_id AND c.curso_id = p.curso_id
SET p.percentual_progresso = 100, p.concluido = TRUE,
    p.concluido_em = COALESCE(p.concluido_em, c.emitido_em)
WHERE p.percentual_progresso < 100 OR p.concluido = FALSE OR p.concluido_em IS NULL;

INSERT INTO progresso_cursos (id, usuario_id, curso_id, percentual_progresso, concluido, atualizado_em, concluido_em)
SELECT UUID(), c.usuario_id, c.curso_id, 100, TRUE, c.emitido_em, c.emitido_em
FROM certificados c
LEFT JOIN progresso_cursos p ON p.usuario_id = c.usuario_id AND p.curso_id = c.curso_id
WHERE p.id IS NULL;
