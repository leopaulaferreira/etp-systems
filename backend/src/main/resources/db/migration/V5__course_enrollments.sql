-- Preserva inscrições existentes em trilhas e permite cursos individuais.
ALTER TABLE inscricoes
    MODIFY COLUMN trilha_id CHAR(36) NULL,
    ADD COLUMN curso_id CHAR(36) NULL,
    ADD CONSTRAINT fk_inscricoes_curso FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
    ADD CONSTRAINT uk_inscricoes_usuario_curso UNIQUE (usuario_id, curso_id),
    ADD CONSTRAINT ck_inscricoes_destino CHECK (
        (trilha_id IS NOT NULL AND curso_id IS NULL)
        OR (trilha_id IS NULL AND curso_id IS NOT NULL)
    );
