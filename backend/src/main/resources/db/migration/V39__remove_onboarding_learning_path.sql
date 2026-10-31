-- Desfaz a trilha adicionada na V38, preservando os cursos, inscrições
-- individuais, progresso, avaliações e certificados dos colaboradores.
-- Os vínculos e inscrições da trilha são removidos pelas FKs com cascade.
DELETE FROM trilhas_aprendizagem
WHERE nome = 'Integração ao Ambiente Corporativo'
  AND empresa_id IS NULL;
