INSERT INTO questoes (id, avaliacao_id, enunciado, explicacao, ordem)
SELECT UUID(), a.id,
       'Um colaborador percebe que enviou por engano uma planilha com dados pessoais para um destinatário externo. Qual deve ser a atitude mais adequada?',
       'Em um possível incidente envolvendo dados pessoais, o colaborador deve agir rapidamente, evitar ocultar o ocorrido e seguir o procedimento interno da organização para que a situação seja tratada corretamente.',
       6
FROM avaliacoes a
JOIN cursos c ON c.id = a.curso_id
WHERE c.titulo = 'LGPD na Prática'
  AND NOT EXISTS (
      SELECT 1 FROM questoes q WHERE q.avaliacao_id = a.id AND q.ordem = 6
  );

INSERT INTO alternativas (id, questao_id, texto, correta, ordem)
SELECT UUID(), q.id, opcao.texto, opcao.correta, opcao.ordem
FROM questoes q
JOIN avaliacoes a ON a.id = q.avaliacao_id
JOIN cursos c ON c.id = a.curso_id
JOIN (
    SELECT 0 AS ordem, 'Apagar o e-mail enviado e não comunicar ninguém.' AS texto, 0 AS correta
    UNION ALL SELECT 1, 'Tentar resolver sozinho para evitar problemas.', 0
    UNION ALL SELECT 2, 'Interromper o compartilhamento, se possível, preservar as informações sobre o ocorrido e comunicar rapidamente a área responsável da empresa.', 1
    UNION ALL SELECT 3, 'Aguardar para ver se o destinatário utiliza os dados antes de tomar alguma providência.', 0
) opcao
WHERE c.titulo = 'LGPD na Prática'
  AND q.ordem = 6
  AND NOT EXISTS (
      SELECT 1 FROM alternativas existente WHERE existente.questao_id = q.id AND existente.ordem = opcao.ordem
  );
