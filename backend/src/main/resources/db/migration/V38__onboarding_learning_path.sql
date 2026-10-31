-- Reúne conteúdos existentes e completos, sem alterar inscrições ou progresso.
INSERT INTO trilhas_aprendizagem (nome, descricao, categoria, nivel, icone, destaque)
SELECT 'Integração ao Ambiente Corporativo',
       'Prepare-se para o dia a dia da empresa: proteja dados pessoais, comunique-se com clareza e organize suas prioridades. Três cursos com aulas, avaliações e certificados individuais.',
       'Negócios', 'Iniciante', 'users', TRUE
WHERE NOT EXISTS (SELECT 1 FROM trilhas_aprendizagem WHERE nome = 'Integração ao Ambiente Corporativo');

INSERT INTO trilhas_cursos (trilha_id, curso_id)
SELECT t.id, c.id
FROM trilhas_aprendizagem t
JOIN cursos c ON c.titulo IN ('LGPD na Prática', 'Comunicação Assertiva no Ambiente de Trabalho', 'Fundamentos da Gestão do Tempo')
WHERE t.nome = 'Integração ao Ambiente Corporativo'
  AND NOT EXISTS (SELECT 1 FROM trilhas_cursos tc WHERE tc.trilha_id = t.id AND tc.curso_id = c.id);
