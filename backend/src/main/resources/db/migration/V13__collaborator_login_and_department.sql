-- Registros de colaboradores podem aparecer no painel de RH sem receber acesso ao sistema.
ALTER TABLE usuarios
    ADD COLUMN login_habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN departamento VARCHAR(100) NULL;
