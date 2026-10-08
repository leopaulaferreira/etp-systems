-- Esquema inicial proveniente de database/schema.sql.
-- ============================================================
-- EMPRESAS
-- ============================================================

CREATE TABLE empresas (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- USUÁRIOS
-- ============================================================

CREATE TABLE usuarios (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    perfil VARCHAR(50) DEFAULT 'aluno',
    empresa_id CHAR(36),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_usuarios_empresa
        FOREIGN KEY (empresa_id)
        REFERENCES empresas(id)
);


-- ============================================================
-- CATEGORIAS
-- ============================================================

CREATE TABLE categorias (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TRILHAS DE APRENDIZAGEM
-- ============================================================

CREATE TABLE trilhas_aprendizagem (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    empresa_id CHAR(36),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_trilhas_empresa
        FOREIGN KEY (empresa_id)
        REFERENCES empresas(id)
);


-- ============================================================
-- CURSOS
-- ============================================================

CREATE TABLE cursos (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    categoria_id CHAR(36),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cursos_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias(id)
);


-- ============================================================
-- RELAÇÃO TRILHAS × CURSOS
-- ============================================================

CREATE TABLE trilhas_cursos (
    trilha_id CHAR(36) NOT NULL,
    curso_id CHAR(36) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (trilha_id, curso_id),

    CONSTRAINT fk_trilhas_cursos_trilha
        FOREIGN KEY (trilha_id)
        REFERENCES trilhas_aprendizagem(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_trilhas_cursos_curso
        FOREIGN KEY (curso_id)
        REFERENCES cursos(id)
        ON DELETE CASCADE
);


-- ============================================================
-- INSCRIÇÕES
-- ============================================================

CREATE TABLE inscricoes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    usuario_id CHAR(36) NOT NULL,
    trilha_id CHAR(36) NOT NULL,
    status VARCHAR(30) DEFAULT 'ativa',
    inscrito_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inscricoes_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_inscricoes_trilha
        FOREIGN KEY (trilha_id)
        REFERENCES trilhas_aprendizagem(id)
        ON DELETE CASCADE
);


-- ============================================================
-- PROGRESSO DOS CURSOS
-- ============================================================

CREATE TABLE progresso_cursos (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    usuario_id CHAR(36) NOT NULL,
    curso_id CHAR(36) NOT NULL,
    percentual_progresso DECIMAL(5,2) DEFAULT 0,
    concluido BOOLEAN DEFAULT FALSE,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_progresso_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_progresso_curso
        FOREIGN KEY (curso_id)
        REFERENCES cursos(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_progresso_usuario_curso
        UNIQUE (usuario_id, curso_id)
);


-- ============================================================
-- CERTIFICADOS
-- ============================================================

CREATE TABLE certificados (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    usuario_id CHAR(36) NOT NULL,
    curso_id CHAR(36) NOT NULL,
    emitido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    codigo_certificado VARCHAR(100) UNIQUE NOT NULL,

    CONSTRAINT fk_certificados_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_certificados_curso
        FOREIGN KEY (curso_id)
        REFERENCES cursos(id)
        ON DELETE CASCADE
);


-- ============================================================
-- CONQUISTAS
-- ============================================================

CREATE TABLE conquistas (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- RELAÇÃO USUÁRIOS × CONQUISTAS
-- ============================================================

CREATE TABLE usuarios_conquistas (
    usuario_id CHAR(36) NOT NULL,
    conquista_id CHAR(36) NOT NULL,
    desbloqueado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (usuario_id, conquista_id),

    CONSTRAINT fk_usuarios_conquistas_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_usuarios_conquistas_conquista
        FOREIGN KEY (conquista_id)
        REFERENCES conquistas(id)
        ON DELETE CASCADE
);


-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_usuarios_empresa_id
    ON usuarios(empresa_id);

CREATE INDEX idx_trilhas_aprendizagem_empresa_id
    ON trilhas_aprendizagem(empresa_id);

CREATE INDEX idx_cursos_categoria_id
    ON cursos(categoria_id);

CREATE INDEX idx_inscricoes_usuario_id
    ON inscricoes(usuario_id);

CREATE INDEX idx_progresso_cursos_usuario_id
    ON progresso_cursos(usuario_id);

CREATE INDEX idx_certificados_usuario_id
    ON certificados(usuario_id);
