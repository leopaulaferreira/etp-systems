CREATE TABLE aulas_concluidas (
    usuario_id CHAR(36) NOT NULL,
    aula_id CHAR(36) NOT NULL,
    concluido_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, aula_id),
    CONSTRAINT fk_aula_concluida_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_aula_concluida_aula FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE
);
