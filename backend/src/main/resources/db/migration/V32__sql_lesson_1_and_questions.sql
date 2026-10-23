-- Aula 1: questões 1–6, preservando o curso e suas inscrições.
INSERT INTO aulas (id, curso_id, titulo, conteudo, video_url, ordem)
SELECT UUID(), c.id, 'Introdução a Bancos de Dados e SQL', '', '/videos/sql-aula-1.mp4', 1
FROM cursos c
WHERE c.titulo = 'SQL para Iniciantes'
  AND NOT EXISTS (SELECT 1 FROM aulas a WHERE a.curso_id = c.id AND a.ordem = 1);

INSERT INTO avaliacoes (id, curso_id, titulo, nota_minima, limite_tentativas)
SELECT UUID(), c.id, 'Avaliação: SQL para Iniciantes', 80, 2
FROM cursos c
WHERE c.titulo = 'SQL para Iniciantes'
  AND NOT EXISTS (SELECT 1 FROM avaliacoes a WHERE a.curso_id = c.id);

INSERT INTO questoes (id, avaliacao_id, enunciado, explicacao, ordem)
SELECT UUID(), a.id, pergunta.enunciado, pergunta.explicacao, pergunta.ordem
FROM avaliacoes a
JOIN cursos c ON c.id = a.curso_id
JOIN (
    SELECT 1 AS ordem, 'Qual é a principal finalidade de um banco de dados?' AS enunciado, 'Um banco de dados permite armazenar informações de forma organizada para que possam ser consultadas, atualizadas e utilizadas por sistemas.' AS explicacao
    UNION ALL SELECT 2, 'Em uma tabela de banco de dados, o que representa uma linha?', 'Cada linha normalmente representa um registro, como um cliente, curso ou funcionário.'
    UNION ALL SELECT 3, 'O que uma coluna representa em uma tabela?', 'As colunas representam características dos registros, como nome, e-mail ou carga horária.'
    UNION ALL SELECT 4, 'Qual é a função de uma chave primária?', 'A chave primária identifica cada registro de forma única e não permite valores duplicados ou nulos.'
    UNION ALL SELECT 5, 'Para que serve a linguagem SQL?', 'SQL permite consultar e manipular dados, além de definir estruturas em bancos de dados relacionais.'
    UNION ALL SELECT 6, 'O que faz o comando abaixo?
SELECT * FROM clientes;', 'SELECT consulta dados, FROM informa a tabela e * representa todas as colunas.'
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
    SELECT 1 AS questao, 0 AS ordem, 'Criar apresentações digitais' AS texto, 0 AS correta
    UNION ALL SELECT 1, 1, 'Organizar e armazenar informações para consulta e utilização', 1
    UNION ALL SELECT 1, 2, 'Substituir o sistema operacional', 0
    UNION ALL SELECT 1, 3, 'Aumentar a velocidade da internet', 0
    UNION ALL SELECT 2, 0, 'Um registro individual', 1
    UNION ALL SELECT 2, 1, 'O nome do banco de dados', 0
    UNION ALL SELECT 2, 2, 'Uma linguagem de programação', 0
    UNION ALL SELECT 2, 3, 'Uma chave de segurança', 0
    UNION ALL SELECT 3, 0, 'Um sistema completo', 0
    UNION ALL SELECT 3, 1, 'Uma característica ou atributo dos registros', 1
    UNION ALL SELECT 3, 2, 'Uma cópia do banco', 0
    UNION ALL SELECT 3, 3, 'Uma conexão com a internet', 0
    UNION ALL SELECT 4, 0, 'Identificar cada registro de forma única', 1
    UNION ALL SELECT 4, 1, 'Excluir automaticamente registros repetidos', 0
    UNION ALL SELECT 4, 2, 'Criar senhas para os usuários', 0
    UNION ALL SELECT 4, 3, 'Organizar os registros em ordem alfabética', 0
    UNION ALL SELECT 5, 0, 'Apenas para criar interfaces gráficas', 0
    UNION ALL SELECT 5, 1, 'Para trabalhar com informações armazenadas em bancos de dados relacionais', 1
    UNION ALL SELECT 5, 2, 'Apenas para proteger arquivos', 0
    UNION ALL SELECT 5, 3, 'Para substituir bancos de dados', 0
    UNION ALL SELECT 6, 0, 'Exclui todos os clientes', 0
    UNION ALL SELECT 6, 1, 'Atualiza os clientes', 0
    UNION ALL SELECT 6, 2, 'Consulta todas as colunas da tabela clientes', 1
    UNION ALL SELECT 6, 3, 'Cria uma nova tabela', 0
 ) opcao ON opcao.questao = q.ordem
WHERE c.titulo = 'SQL para Iniciantes'
  AND NOT EXISTS (
      SELECT 1 FROM alternativas existente WHERE existente.questao_id = q.id AND existente.ordem = opcao.ordem
  );
