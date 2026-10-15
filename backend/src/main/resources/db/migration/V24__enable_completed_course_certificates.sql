-- Cursos com conteúdo e avaliações disponíveis passam a emitir certificados.
UPDATE cursos SET certificacao_habilitada = TRUE
WHERE titulo IN ('LGPD na Prática', 'Introdução à Inteligência Artificial',
                 'Gestão de Projetos Ágeis com Scrum', 'Cloud Computing Essencial');

-- Recupera aprovações anteriores, preservando a primeira data de aprovação.
-- Certificados já emitidos mantêm seu código e sua data.
INSERT INTO certificados (id, usuario_id, curso_id, codigo, emitido_em)
SELECT UUID(), t.usuario_id, a.curso_id,
       CONCAT('ETP-', UPPER(REPLACE(UUID(), '-', ''))), MIN(t.concluido_em)
FROM tentativas_avaliacao t
JOIN avaliacoes a ON a.id = t.avaliacao_id
JOIN cursos c ON c.id = a.curso_id
LEFT JOIN certificados existente ON existente.usuario_id = t.usuario_id AND existente.curso_id = a.curso_id
WHERE t.aprovado = TRUE AND c.certificacao_habilitada = TRUE AND existente.id IS NULL
GROUP BY t.usuario_id, a.curso_id;

-- A recuperação também conclui o progresso, como na emissão pela API.
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
