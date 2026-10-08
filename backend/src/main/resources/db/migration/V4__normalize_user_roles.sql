-- Preserva os usuários antigos; somente perfis conhecidos são convertidos.
UPDATE usuarios SET perfil = 'COLABORADOR'
WHERE LOWER(TRIM(perfil)) IN ('aluno', 'aluno_1', 'colaborador');

UPDATE usuarios SET perfil = 'EMPRESA'
WHERE LOWER(TRIM(perfil)) = 'empresa';

ALTER TABLE usuarios
    MODIFY perfil VARCHAR(50) NOT NULL DEFAULT 'COLABORADOR',
    ADD CONSTRAINT chk_usuarios_perfil CHECK (perfil IN ('COLABORADOR', 'EMPRESA'));
