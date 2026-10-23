-- Aula 3: questões 13–18, preservando o curso e suas inscrições.
INSERT INTO aulas (id, curso_id, titulo, conteudo, video_url, ordem)
SELECT UUID(), c.id, 'Manipulando Dados e Trabalhando com Relacionamentos', '', '/videos/sql-aula-3.mp4', 3
FROM cursos c
WHERE c.titulo = 'SQL para Iniciantes'
  AND NOT EXISTS (SELECT 1 FROM aulas a WHERE a.curso_id = c.id AND a.ordem = 3);

INSERT INTO questoes (id, avaliacao_id, enunciado, explicacao, ordem)
SELECT UUID(), a.id, pergunta.enunciado, pergunta.explicacao, pergunta.ordem
FROM avaliacoes a
JOIN cursos c ON c.id = a.curso_id
JOIN (
    SELECT 13 AS ordem, 'Qual comando SQL é utilizado para adicionar um novo registro?' AS enunciado, 'INSERT adiciona novos registros a uma tabela.' AS explicacao
    UNION ALL SELECT 14, 'Qual comando é utilizado para alterar informações já existentes em uma tabela?', 'UPDATE altera os valores de registros existentes em uma tabela.'
    UNION ALL SELECT 15, 'Por que o uso do WHERE é especialmente importante em comandos UPDATE e DELETE?', 'Sem uma condição adequada, uma alteração ou exclusão pode atingir vários registros indevidamente.'
    UNION ALL SELECT 16, 'Qual comando é utilizado para remover registros de uma tabela?', 'DELETE remove registros de uma tabela; WHERE permite limitar quais registros serão removidos.'
    UNION ALL SELECT 17, 'O que é uma chave estrangeira?', 'A chave estrangeira permite estabelecer relacionamentos entre registros de tabelas diferentes.'
    UNION ALL SELECT 18, 'Para que serve o JOIN em SQL?', 'JOIN combina informações de tabelas de acordo com uma condição de relacionamento.'
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
    SELECT 13 AS questao, 0 AS ordem, 'SELECT' AS texto, 0 AS correta
    UNION ALL SELECT 13, 1, 'INSERT', 1
    UNION ALL SELECT 13, 2, 'DELETE', 0
    UNION ALL SELECT 13, 3, 'ORDER BY', 0
    UNION ALL SELECT 14, 0, 'UPDATE', 1
    UNION ALL SELECT 14, 1, 'INSERT', 0
    UNION ALL SELECT 14, 2, 'SELECT', 0
    UNION ALL SELECT 14, 3, 'FROM', 0
    UNION ALL SELECT 15, 0, 'Porque define quais registros serão afetados', 1
    UNION ALL SELECT 15, 1, 'Porque cria automaticamente uma cópia do banco', 0
    UNION ALL SELECT 15, 2, 'Porque transforma a tabela em somente leitura', 0
    UNION ALL SELECT 15, 3, 'Porque ordena os registros', 0
    UNION ALL SELECT 16, 0, 'INSERT', 0
    UNION ALL SELECT 16, 1, 'SELECT', 0
    UNION ALL SELECT 16, 2, 'DELETE', 1
    UNION ALL SELECT 16, 3, 'JOIN', 0
    UNION ALL SELECT 17, 0, 'Uma senha utilizada para acessar o banco', 0
    UNION ALL SELECT 17, 1, 'Um campo que referencia um registro de outra tabela', 1
    UNION ALL SELECT 17, 2, 'Um comando utilizado para apagar uma tabela', 0
    UNION ALL SELECT 17, 3, 'Um tipo especial de SELECT', 0
    UNION ALL SELECT 18, 0, 'Para combinar informações relacionadas de tabelas diferentes', 1
    UNION ALL SELECT 18, 1, 'Para excluir bancos de dados', 0
    UNION ALL SELECT 18, 2, 'Para criar senhas', 0
    UNION ALL SELECT 18, 3, 'Para substituir a chave primária', 0
 ) opcao ON opcao.questao = q.ordem
WHERE c.titulo = 'SQL para Iniciantes'
  AND NOT EXISTS (
      SELECT 1 FROM alternativas existente WHERE existente.questao_id = q.id AND existente.ordem = opcao.ordem
  );

UPDATE cursos SET certificacao_habilitada = TRUE WHERE titulo = 'SQL para Iniciantes';
