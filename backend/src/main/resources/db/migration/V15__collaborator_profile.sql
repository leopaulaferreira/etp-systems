ALTER TABLE usuarios
    ADD COLUMN telefone VARCHAR(40),
    ADD COLUMN localizacao VARCHAR(120),
    ADD COLUMN cargo VARCHAR(120),
    ADD COLUMN foco_aprendizagem VARCHAR(120),
    ADD COLUMN nivel_experiencia VARCHAR(30),
    ADD COLUMN notificacoes_ativas BOOLEAN NOT NULL DEFAULT TRUE;
