-- Aula 2: questões 7–12, preservando o curso e suas inscrições.
INSERT INTO aulas (id, curso_id, titulo, conteudo, video_url, ordem)
SELECT UUID(), c.id, 'Consultando Dados com SELECT', '', '/videos/sql-aula-2.mp4', 2
FROM cursos c
WHERE c.titulo = 'SQL para Iniciantes'
  AND NOT EXISTS (SELECT 1 FROM aulas a WHERE a.curso_id = c.id AND a.ordem = 2);

INSERT INTO questoes (id, avaliacao_id, enunciado, explicacao, ordem)
SELECT UUID(), a.id, pergunta.enunciado, pergunta.explicacao, pergunta.ordem
FROM avaliacoes a
JOIN cursos c ON c.id = a.curso_id
JOIN (
    SELECT 7 AS ordem, 'Qual comando SQL é utilizado para consultar informações?' AS enunciado, 'SELECT é o comando utilizado para consultar dados armazenados no banco.' AS explicacao
    UNION ALL SELECT 8, 'Qual é a função do comando FROM?', 'A cláusula FROM indica de qual tabela os dados da consulta serão obtidos.'
    UNION ALL SELECT 9, 'O que significa o asterisco em SELECT * FROM cursos?', 'O asterisco (*) seleciona todas as colunas da tabela indicada na consulta.'
    UNION ALL SELECT 10, 'Qual comando é utilizado para filtrar registros de acordo com uma condição?', 'A cláusula WHERE filtra os registros de acordo com a condição informada.'
    UNION ALL SELECT 11, 'O que esta consulta retorna?
SELECT *
FROM cursos
WHERE nivel = ''Iniciante'';', 'A condição WHERE nivel = ''Iniciante'' seleciona apenas os cursos cujo nível é Iniciante.'
    UNION ALL SELECT 12, 'Qual é a função do ORDER BY?', 'ORDER BY permite ordenar os resultados; ASC indica ordem crescente e DESC, decrescente.'
 ) pergunta
WHERE c.titulo = 'SQL para Iniciantes'
  AND NOT EXISTS (
      SELECT 1 FROM questoes q WHERE q.avaliacao_id = a.id AND q.ordem = pergunta.ordem
  );

INSERT INTO alternativas (id, questao_id, texto, correta, ordem)
SELECT UUID(), q.id, opcao.texto, opcao.correta, opcao.ordem
FROM questoes q
JOIN avaliacoes a ON a.id = q.avaliacao_id
JOIN cursos c ON c.id = a.curso_id
JOIN (
    SELECT 7 AS questao, 0 AS ordem, 'DELETE' AS texto, 0 AS correta
    UNION ALL SELECT 7, 1, 'UPDATE', 0
    UNION ALL SELECT 7, 2, 'SELECT', 1
    UNION ALL SELECT 7, 3, 'INSERT', 0
    UNION ALL SELECT 8, 0, 'Definir de qual tabela os dados serão obtidos', 1
    UNION ALL SELECT 8, 1, 'Excluir uma tabela', 0
    UNION ALL SELECT 8, 2, 'Ordenar os resultados', 0
    UNION ALL SELECT 8, 3, 'Alterar os dados', 0
    UNION ALL SELECT 9, 0, 'Consultar apenas a primeira coluna', 0
    UNION ALL SELECT 9, 1, 'Consultar todas as colunas', 1
    UNION ALL SELECT 9, 2, 'Excluir todas as colunas', 0
    UNION ALL SELECT 9, 3, 'Ordenar automaticamente os registros', 0
    UNION ALL SELECT 10, 0, 'FROM', 0
    UNION ALL SELECT 10, 1, 'ORDER BY', 0
    UNION ALL SELECT 10, 2, 'WHERE', 1
    UNION ALL SELECT 10, 3, 'INSERT', 0
    UNION ALL SELECT 11, 0, 'Todos os cursos, independentemente do nível', 0
    UNION ALL SELECT 11, 1, 'Apenas os cursos com nível Iniciante', 1
    UNION ALL SELECT 11, 2, 'Apenas o nome da tabela', 0
    UNION ALL SELECT 11, 3, 'Os cursos em ordem alfabética', 0
    UNION ALL SELECT 12, 0, 'Inserir novos dados', 0
    UNION ALL SELECT 12, 1, 'Organizar os resultados de uma consulta', 1
    UNION ALL SELECT 12, 2, 'Excluir registros', 0
    UNION ALL SELECT 12, 3, 'Criar relacionamentos', 0
 ) opcao ON opcao.questao = q.ordem
WHERE c.titulo = 'SQL para Iniciantes'
  AND NOT EXISTS (
      SELECT 1 FROM alternativas existente WHERE existente.questao_id = q.id AND existente.ordem = opcao.ordem
  );
