INSERT INTO avaliacoes (id, curso_id, titulo, nota_minima, limite_tentativas)
SELECT UUID(), c.id, 'Avaliação: Introdução à Inteligência Artificial', 80, 2
FROM cursos c
WHERE c.titulo = 'Introdução à Inteligência Artificial'
  AND NOT EXISTS (SELECT 1 FROM avaliacoes a WHERE a.curso_id = c.id);

INSERT INTO questoes (id, avaliacao_id, enunciado, explicacao, ordem)
SELECT UUID(), a.id, pergunta.enunciado, pergunta.explicacao, pergunta.ordem
FROM avaliacoes a
JOIN cursos c ON c.id = a.curso_id
JOIN (
    SELECT 1 AS ordem, 'Qual alternativa melhor define Inteligência Artificial?' AS enunciado,
           'A IA busca executar tarefas como reconhecer padrões, responder perguntas, recomendar conteúdos e analisar informações, sem possuir consciência humana.' AS explicacao
    UNION ALL SELECT 2, 'Qual exemplo representa melhor o uso de Machine Learning?',
           'Machine Learning utiliza dados e exemplos para identificar padrões e melhorar previsões ou classificações.'
    UNION ALL SELECT 3, 'Qual das opções representa um uso adequado de IA no ambiente de trabalho?',
           'A IA pode aumentar a produtividade, mas os resultados devem ser revisados e validados antes do uso.'
    UNION ALL SELECT 4, 'Qual prompt tende a produzir um resultado melhor?',
           'Um bom prompt fornece contexto, tarefa, objetivo e formato esperado, permitindo que a IA produza uma resposta mais adequada.'
    UNION ALL SELECT 5, 'O que significa dizer que uma IA pode apresentar uma “alucinação”?',
           'Sistemas de IA podem produzir respostas plausíveis, mas incorretas, por isso informações importantes devem ser verificadas.'
    UNION ALL SELECT 6, 'Um colaborador precisa resumir um documento interno que contém dados pessoais e informações confidenciais. Qual é a conduta mais adequada?',
           'Informações confidenciais e dados pessoais devem ser protegidos. O uso de IA deve seguir as políticas e ferramentas autorizadas pela organização.'
) pergunta
WHERE c.titulo = 'Introdução à Inteligência Artificial'
  AND NOT EXISTS (
      SELECT 1 FROM questoes q WHERE q.avaliacao_id = a.id AND q.ordem = pergunta.ordem
  );

INSERT INTO alternativas (id, questao_id, texto, correta, ordem)
SELECT UUID(), q.id, opcao.texto, opcao.correta, opcao.ordem
FROM questoes q
JOIN avaliacoes a ON a.id = q.avaliacao_id
JOIN cursos c ON c.id = a.curso_id
JOIN (
    SELECT 1 AS questao, 0 AS ordem, 'Um sistema que pensa exatamente como um ser humano.' AS texto, 0 AS correta
    UNION ALL SELECT 1, 1, 'Uma área da computação que cria sistemas capazes de realizar tarefas que normalmente exigem algum tipo de inteligência humana.', 1
    UNION ALL SELECT 1, 2, 'Um software utilizado apenas para criar imagens.', 0
    UNION ALL SELECT 1, 3, 'Um tipo de banco de dados automatizado.', 0

    UNION ALL SELECT 2, 0, 'Um sistema que segue apenas regras fixas escritas manualmente.', 0
    UNION ALL SELECT 2, 1, 'Um programa que aprende padrões a partir de exemplos para identificar mensagens de spam.', 1
    UNION ALL SELECT 2, 2, 'Um documento salvo automaticamente no computador.', 0
    UNION ALL SELECT 2, 3, 'Uma calculadora realizando operações matemáticas simples.', 0

    UNION ALL SELECT 3, 0, 'Enviar automaticamente qualquer resposta gerada pela IA sem revisar.', 0
    UNION ALL SELECT 3, 1, 'Utilizar IA para resumir um relatório e depois conferir as informações antes de utilizá-las.', 1
    UNION ALL SELECT 3, 2, 'Inserir senhas e dados confidenciais para obter respostas mais detalhadas.', 0
    UNION ALL SELECT 3, 3, 'Deixar a IA tomar decisões importantes sem participação humana.', 0

    UNION ALL SELECT 4, 0, 'Faça um texto.', 0
    UNION ALL SELECT 4, 1, 'Escreva qualquer coisa sobre atendimento.', 0
    UNION ALL SELECT 4, 2, 'Escreva um e-mail profissional, curto e cordial, informando ao cliente que o prazo de entrega foi alterado de sexta para segunda-feira.', 1
    UNION ALL SELECT 4, 3, 'Me ajude.', 0

    UNION ALL SELECT 5, 0, 'Que o sistema fica temporariamente sem acesso à internet.', 0
    UNION ALL SELECT 5, 1, 'Que a IA passa a ter consciência própria.', 0
    UNION ALL SELECT 5, 2, 'Que a IA pode gerar uma informação incorreta ou inventada, mesmo que a resposta pareça convincente.', 1
    UNION ALL SELECT 5, 3, 'Que o computador apresenta um defeito físico.', 0

    UNION ALL SELECT 6, 0, 'Copiar todo o documento para qualquer ferramenta pública de IA.', 0
    UNION ALL SELECT 6, 1, 'Compartilhar apenas os dados mais sensíveis para melhorar a resposta.', 0
    UNION ALL SELECT 6, 2, 'Verificar as políticas da empresa e evitar inserir informações confidenciais em ferramentas não autorizadas.', 1
    UNION ALL SELECT 6, 3, 'Utilizar a IA e apagar a conversa depois, pois isso elimina qualquer risco.', 0
) opcao ON opcao.questao = q.ordem
WHERE c.titulo = 'Introdução à Inteligência Artificial'
  AND NOT EXISTS (
      SELECT 1 FROM alternativas existente WHERE existente.questao_id = q.id AND existente.ordem = opcao.ordem
  );
