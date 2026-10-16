CREATE TABLE liberacoes_tentativas (
    id CHAR(36) PRIMARY KEY,
    usuario_id CHAR(36) NOT NULL,
    avaliacao_id CHAR(36) NOT NULL,
    autorizado_por CHAR(36) NULL,
    nome_responsavel VARCHAR(255) NOT NULL,
    motivo VARCHAR(500) NOT NULL,
    apos_tentativa INT NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_liberacao_tentativa UNIQUE (usuario_id, avaliacao_id, apos_tentativa),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE,
    FOREIGN KEY (autorizado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);
