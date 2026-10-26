-- Aula 1: questões 1, 2, 7–10; aula 2: 3, 4, 11–14; aula 3: 5, 6, 15–18.
-- As questões 1–6 e todo o histórico de tentativas permanecem intactos.
INSERT INTO questoes (id, avaliacao_id, enunciado, explicacao, ordem)
SELECT UUID(), a.id, pergunta.enunciado, pergunta.explicacao, pergunta.ordem
FROM avaliacoes a
JOIN cursos c ON c.id = a.curso_id
JOIN (
    SELECT 7 AS ordem, 'Qual é a importância dos dados para muitos sistemas de Inteligência Artificial?' AS enunciado,
           'Muitos modelos de IA aprendem padrões a partir de dados utilizados durante seu treinamento.' AS explicacao
    UNION ALL SELECT 8, 'O que significa dizer que um modelo de IA foi treinado?',
           'O treinamento permite que o modelo ajuste seu comportamento a partir de dados e exemplos para reconhecer padrões ou produzir resultados.'
    UNION ALL SELECT 9, 'Qual alternativa diferencia melhor uma automação tradicional de uma solução baseada em IA?',
           'Automações tradicionais podem seguir regras fixas, enquanto soluções de IA podem utilizar modelos capazes de identificar padrões e produzir previsões ou resultados.'
    UNION ALL SELECT 10, 'Qual das situações abaixo pode envolver Inteligência Artificial?',
           'Sistemas de recomendação são um exemplo comum de IA, pois podem analisar informações e padrões para sugerir conteúdos relevantes.'
    UNION ALL SELECT 11, 'Qual é um exemplo comum de Inteligência Artificial no cotidiano?',
           'Sistemas de recomendação utilizam informações e padrões de comportamento para sugerir conteúdos, produtos ou serviços.'
    UNION ALL SELECT 12, 'Como a IA pode auxiliar um profissional em suas atividades?',
           'A IA pode apoiar diversas atividades profissionais, mas continua sendo necessário revisar resultados e aplicar julgamento humano.'
    UNION ALL SELECT 13, 'Por que fornecer contexto em um prompt pode melhorar o resultado gerado pela IA?',
           'Informações sobre contexto, objetivo, público e formato esperado ajudam a orientar a geração de uma resposta mais adequada.'
    UNION ALL SELECT 14, 'Um colaborador precisa preparar um resumo para uma apresentação destinada a pessoas sem conhecimento técnico. Qual prompt é mais adequado?',
           'Um prompt claro informa a tarefa, o formato e o público esperado, melhorando a direção fornecida ao sistema.'
    UNION ALL SELECT 15, 'Por que uma resposta gerada por IA deve ser revisada antes de ser utilizada em uma atividade importante?',
           'A IA pode cometer erros ou produzir informações imprecisas, portanto conteúdos relevantes devem ser verificados antes do uso.'
    UNION ALL SELECT 16, 'Qual atitude representa um uso responsável de IA no ambiente profissional?',
           'A IA deve atuar como ferramenta de apoio. O profissional continua responsável por avaliar e validar o resultado utilizado.'
    UNION ALL SELECT 17, 'O que deve ser analisado antes de enviar informações para uma ferramenta de IA?',
           'Informações pessoais, confidenciais ou restritas devem ser protegidas conforme as políticas e regras aplicáveis.'
    UNION ALL SELECT 18, 'Qual prática é recomendada quando uma resposta de IA apresenta uma informação importante para uma decisão?',
           'Uma resposta convincente não garante que a informação esteja correta. Informações relevantes devem ser verificadas em fontes confiáveis.'
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
    SELECT 7 AS questao, 0 AS ordem, 'Eles podem ser utilizados para identificar padrões e treinar modelos.' AS texto, 1 AS correta
    UNION ALL SELECT 7, 1, 'Servem apenas para armazenar senhas.', 0
    UNION ALL SELECT 7, 2, 'São necessários somente quando a IA está sem internet.', 0
    UNION ALL SELECT 7, 3, 'Não possuem relação com o funcionamento de sistemas de IA.', 0
    UNION ALL SELECT 8, 0, 'Que ele foi instalado em um computador.', 0
    UNION ALL SELECT 8, 1, 'Que passou por um processo no qual dados ou exemplos foram utilizados para ajustar seu comportamento.', 1
    UNION ALL SELECT 8, 2, 'Que recebeu uma senha para acessar a internet.', 0
    UNION ALL SELECT 8, 3, 'Que todas as suas respostas foram escritas manualmente.', 0
    UNION ALL SELECT 9, 0, 'Toda automação utiliza Inteligência Artificial.', 0
    UNION ALL SELECT 9, 1, 'Uma automação pode executar regras predefinidas, enquanto sistemas de IA podem identificar padrões nos dados.', 1
    UNION ALL SELECT 9, 2, 'Sistemas de IA não podem automatizar tarefas.', 0
    UNION ALL SELECT 9, 3, 'Uma automação sempre aprende sozinha.', 0
    UNION ALL SELECT 10, 0, 'Um sistema que recomenda conteúdos de acordo com interesses do usuário.', 1
    UNION ALL SELECT 10, 1, 'Um interruptor comum acendendo uma lâmpada.', 0
    UNION ALL SELECT 10, 2, 'Um cronômetro contando exatamente 60 segundos.', 0
    UNION ALL SELECT 10, 3, 'Um arquivo sendo copiado manualmente para outra pasta.', 0
    UNION ALL SELECT 11, 0, 'Um sistema de recomendação de filmes ou produtos.', 1
    UNION ALL SELECT 11, 1, 'Uma calculadora realizando uma soma simples.', 0
    UNION ALL SELECT 11, 2, 'Um cabo conectando o computador ao monitor.', 0
    UNION ALL SELECT 11, 3, 'Um arquivo de texto vazio.', 0
    UNION ALL SELECT 12, 0, 'Garantindo que toda informação produzida esteja correta.', 0
    UNION ALL SELECT 12, 1, 'Auxiliando na organização, análise, resumo e criação de conteúdos.', 1
    UNION ALL SELECT 12, 2, 'Eliminando completamente a necessidade de decisões humanas.', 0
    UNION ALL SELECT 12, 3, 'Substituindo automaticamente todas as ferramentas utilizadas pela empresa.', 0
    UNION ALL SELECT 13, 0, 'Porque ajuda o sistema a compreender melhor o objetivo da solicitação.', 1
    UNION ALL SELECT 13, 1, 'Porque impede completamente qualquer erro.', 0
    UNION ALL SELECT 13, 2, 'Porque aumenta a velocidade da conexão com a internet.', 0
    UNION ALL SELECT 13, 3, 'Porque transforma automaticamente a resposta em uma fonte oficial.', 0
    UNION ALL SELECT 14, 0, '“Resuma.”', 0
    UNION ALL SELECT 14, 1, '“Faça alguma coisa com este texto.”', 0
    UNION ALL SELECT 14, 2, '“Resuma este conteúdo em cinco tópicos, usando linguagem simples para um público sem conhecimento técnico.”', 1
    UNION ALL SELECT 14, 3, '“Escreva o máximo possível.”', 0
    UNION ALL SELECT 15, 0, 'Porque sistemas de IA podem produzir informações incorretas ou imprecisas.', 1
    UNION ALL SELECT 15, 1, 'Porque toda resposta gerada por IA está necessariamente errada.', 0
    UNION ALL SELECT 15, 2, 'Porque IA só pode ser utilizada para entretenimento.', 0
    UNION ALL SELECT 15, 3, 'Porque sistemas de IA não conseguem produzir textos.', 0
    UNION ALL SELECT 16, 0, 'Copiar qualquer resposta sem conferir.', 0
    UNION ALL SELECT 16, 1, 'Revisar o conteúdo gerado e assumir responsabilidade pelo resultado utilizado.', 1
    UNION ALL SELECT 16, 2, 'Considerar todas as respostas da IA como fontes oficiais.', 0
    UNION ALL SELECT 16, 3, 'Compartilhar dados internos sempre que isso melhorar a resposta.', 0
    UNION ALL SELECT 17, 0, 'Se os dados são pessoais, confidenciais ou possuem alguma restrição de uso.', 1
    UNION ALL SELECT 17, 1, 'Apenas a quantidade de palavras do texto.', 0
    UNION ALL SELECT 17, 2, 'Apenas a velocidade da internet.', 0
    UNION ALL SELECT 17, 3, 'Se a ferramenta consegue gerar imagens.', 0
    UNION ALL SELECT 18, 0, 'Aceitar a informação automaticamente.', 0
    UNION ALL SELECT 18, 1, 'Verificar a informação utilizando fontes confiáveis antes de utilizá-la.', 1
    UNION ALL SELECT 18, 2, 'Compartilhar a resposta imediatamente.', 0
    UNION ALL SELECT 18, 3, 'Considerar a informação verdadeira se o texto estiver bem escrito.', 0
) opcao ON opcao.questao = q.ordem
WHERE c.titulo = 'Introdução à Inteligência Artificial'
  AND q.ordem BETWEEN 7 AND 18
  AND NOT EXISTS (
      SELECT 1 FROM alternativas existente WHERE existente.questao_id = q.id AND existente.ordem = opcao.ordem
  );
