-- Mantém a ordem correta de tentativas enviadas no mesmo segundo.
ALTER TABLE tentativas_avaliacao
    MODIFY COLUMN concluido_em TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);
