ALTER TABLE trilhas_aprendizagem
    ADD COLUMN categoria VARCHAR(50) NOT NULL DEFAULT 'Geral',
    ADD COLUMN nivel VARCHAR(30) NOT NULL DEFAULT 'Iniciante',
    ADD COLUMN icone VARCHAR(30) NOT NULL DEFAULT 'shield',
    ADD COLUMN destaque BOOLEAN NOT NULL DEFAULT FALSE;

INSERT INTO trilhas_aprendizagem (nome, descricao, categoria, nivel, icone, destaque)
VALUES
('Segurança e Privacidade', 'Proteja informações pessoais e reconheça riscos no ambiente corporativo.', 'Segurança', 'Iniciante', 'shield', TRUE),
('Análise de Dados', 'Organize dados e transforme informações em decisões.', 'Dados', 'Iniciante', 'data', FALSE),
('Liderança e Colaboração', 'Desenvolva comunicação, liderança e gestão de equipes.', 'Negócios', 'Iniciante', 'users', FALSE),
('Computação em Nuvem', 'Conheça os fundamentos e a arquitetura de soluções em nuvem.', 'Tecnologia', 'Iniciante', 'cloud', FALSE);

INSERT INTO trilhas_cursos (trilha_id, curso_id)
SELECT t.id, c.id FROM trilhas_aprendizagem t JOIN cursos c
ON (t.nome = 'Segurança e Privacidade' AND c.titulo IN ('LGPD na Prática', 'Fundamentos de Cibersegurança', 'Fundamentos de Segurança da Informação', 'Segurança da Informação na Prática'))
OR (t.nome = 'Análise de Dados' AND c.titulo IN ('SQL para Iniciantes', 'Python para Análise de Dados', 'Power BI Essencial', 'Análise de Dados com Excel e Power BI'))
OR (t.nome = 'Liderança e Colaboração' AND c.titulo IN ('Comunicação Assertiva', 'Liderança Colaborativa', 'Gestão de Projetos Ágeis com Scrum'))
OR (t.nome = 'Computação em Nuvem' AND c.titulo IN ('Cloud Computing Essencial', 'Computação em Nuvem: Conceitos e Aplicações', 'Arquitetura de Soluções em Nuvem'));
