-- Mantém a primeira inscrição caso requisições antigas tenham criado duplicatas.
-- Em datas iguais, o ID define qual registro é preservado. Datas desconhecidas ficam por último.
DELETE duplicada FROM inscricoes duplicada
JOIN inscricoes anterior
  ON anterior.usuario_id = duplicada.usuario_id
 AND anterior.trilha_id = duplicada.trilha_id
 AND (
     anterior.inscrito_em < duplicada.inscrito_em
     OR (anterior.inscrito_em IS NOT NULL AND duplicada.inscrito_em IS NULL)
     OR (anterior.inscrito_em <=> duplicada.inscrito_em AND anterior.id < duplicada.id)
 );

ALTER TABLE inscricoes
    ADD CONSTRAINT uk_inscricoes_usuario_trilha UNIQUE (usuario_id, trilha_id);
