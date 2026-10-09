-- Registra quando o avanço de um curso chegou a 100%.
ALTER TABLE progresso_cursos ADD COLUMN concluido_em TIMESTAMP NULL;

-- Normaliza eventuais registros anteriores à introdução da data de conclusão.
UPDATE progresso_cursos SET percentual_progresso = 100 WHERE concluido = TRUE;
UPDATE progresso_cursos SET concluido = TRUE, concluido_em = atualizado_em
WHERE percentual_progresso = 100;
