ALTER TABLE cursos ADD COLUMN certificacao_habilitada BOOLEAN NOT NULL DEFAULT FALSE;

-- A LGPD será habilitada quando a terceira videoaula e as questões estiverem finalizadas.
UPDATE cursos SET certificacao_habilitada = TRUE
WHERE titulo IN ('Fundamentos de Segurança da Informação', 'Computação em Nuvem: Conceitos e Aplicações');

-- A V1 já criou certificados; a V11 preserva registros antigos e amplia suas regras.
ALTER TABLE certificados CHANGE COLUMN codigo_certificado codigo VARCHAR(100) NOT NULL;
ALTER TABLE certificados MODIFY COLUMN emitido_em TIMESTAMP(6) NOT NULL;
ALTER TABLE certificados ADD CONSTRAINT uk_certificados_usuario_curso UNIQUE (usuario_id, curso_id);

-- Preserva aprovações anteriores ainda sem certificado.
INSERT INTO certificados (id, usuario_id, curso_id, codigo, emitido_em)
SELECT UUID(), t.usuario_id, a.curso_id,
       CONCAT('ETP-', UPPER(REPLACE(UUID(), '-', ''))), MIN(t.concluido_em)
FROM tentativas_avaliacao t
JOIN avaliacoes a ON a.id = t.avaliacao_id
JOIN cursos c ON c.id = a.curso_id
LEFT JOIN certificados existing ON existing.usuario_id = t.usuario_id AND existing.curso_id = a.curso_id
WHERE t.aprovado = TRUE AND c.certificacao_habilitada = TRUE AND existing.id IS NULL
GROUP BY t.usuario_id, a.curso_id;
