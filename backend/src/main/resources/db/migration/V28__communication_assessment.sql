-- Questões 1–6: Aula 1; 7–12: Aula 2; 13–18: Aula 3.
INSERT INTO avaliacoes (id, curso_id, titulo, nota_minima, limite_tentativas)
SELECT UUID(), c.id, 'Avaliação: Comunicação Assertiva no Ambiente de Trabalho', 80, 2
FROM cursos c
WHERE c.titulo = 'Comunicação Assertiva no Ambiente de Trabalho'
  AND NOT EXISTS (SELECT 1 FROM avaliacoes a WHERE a.curso_id = c.id);

INSERT INTO questoes (id, avaliacao_id, enunciado, explicacao, ordem)
SELECT UUID(), a.id, pergunta.enunciado, pergunta.explicacao, pergunta.ordem
FROM avaliacoes a
JOIN cursos c ON c.id = a.curso_id
JOIN (
    SELECT 1 AS ordem, 'O que caracteriza uma comunicação assertiva?' AS enunciado, 'A comunicação assertiva busca equilíbrio entre clareza, respeito e capacidade de se posicionar.' AS explicacao
    UNION ALL SELECT 2, 'Qual situação representa comunicação passiva?', 'A comunicação passiva ocorre quando a pessoa evita se posicionar, mesmo quando deveria expressar uma necessidade ou limite.'
    UNION ALL SELECT 3, 'Qual comportamento está mais associado à comunicação agressiva?', 'A comunicação agressiva tende a impor opiniões e pode gerar conflitos.'
    UNION ALL SELECT 4, 'Um colaborador está sobrecarregado e recebe uma nova tarefa. Qual resposta é mais assertiva?', 'A resposta comunica o limite de forma clara e busca uma solução conjunta.'
    UNION ALL SELECT 5, 'O que significa praticar escuta ativa?', 'A escuta ativa ajuda a compreender corretamente a mensagem e reduzir ruídos.'
    UNION ALL SELECT 6, 'Qual frase é mais clara e objetiva?', 'A mensagem apresenta claramente o que é necessário, o prazo e o contexto.'
    UNION ALL SELECT 7, 'Qual é o principal objetivo de um feedback eficaz?', 'Feedback deve apoiar desenvolvimento e melhoria, não servir como ataque pessoal.'
    UNION ALL SELECT 8, 'Qual exemplo apresenta um feedback mais adequado?', 'O exemplo foca em fatos e comportamentos específicos, sem atacar a pessoa.'
    UNION ALL SELECT 9, 'Qual sequência representa uma estrutura simples para dar feedback?', 'Essa estrutura ajuda a tornar o feedback mais objetivo e orientado para solução.'
    UNION ALL SELECT 10, 'Ao receber um feedback, qual atitude é mais adequada?', 'Receber feedback de forma construtiva envolve escutar, compreender e avaliar possíveis melhorias.'
    UNION ALL SELECT 11, 'Antes de uma conversa difícil, qual atitude pode ajudar?', 'Preparação ajuda a manter a conversa objetiva e focada em solução.'
    UNION ALL SELECT 12, 'Qual resposta é mais assertiva diante de um problema recorrente de informações incompletas?', 'A frase descreve o problema, mostra o impacto e propõe uma solução conjunta.'
    UNION ALL SELECT 13, 'Qual prática ajuda a evitar falhas no alinhamento de tarefas?', 'Clareza sobre responsabilidade, prazo e resultado reduz mal-entendidos e retrabalho.'
    UNION ALL SELECT 14, 'O que caracteriza uma reunião produtiva?', 'Uma reunião produtiva gera entendimento, decisões e encaminhamentos claros.'
    UNION ALL SELECT 15, 'Para um assunto sensível e complexo, qual canal tende a ser mais adequado?', 'Assuntos sensíveis costumam exigir um canal que permita diálogo e esclarecimento.'
    UNION ALL SELECT 16, 'Qual frase demonstra uma discordância assertiva?', 'A frase reconhece o outro ponto de vista e apresenta a discordância com respeito.'
    UNION ALL SELECT 17, 'Quando ocorre um ruído de comunicação dentro da equipe, qual atitude é mais adequada?', 'Tratar o problema rapidamente e com foco nos fatos ajuda a evitar que pequenos ruídos se transformem em conflitos maiores.'
    UNION ALL SELECT 18, 'Qual afirmação melhor resume uma boa comunicação no trabalho em equipe?', 'Comunicação em equipe depende de troca clara de informações, escuta, alinhamento e respeito entre os participantes.'
) pergunta
WHERE c.titulo = 'Comunicação Assertiva no Ambiente de Trabalho'
  AND NOT EXISTS (
      SELECT 1 FROM questoes q WHERE q.avaliacao_id = a.id AND q.ordem = pergunta.ordem
  );

INSERT INTO alternativas (id, questao_id, texto, correta, ordem)
SELECT UUID(), q.id, opcao.texto, opcao.correta, opcao.ordem
FROM questoes q
JOIN avaliacoes a ON a.id = q.avaliacao_id
JOIN cursos c ON c.id = a.curso_id
JOIN (
    SELECT 1 AS questao, 0 AS ordem, 'Evitar qualquer discordância.' AS texto, 0 AS correta
    UNION ALL SELECT 1, 1, 'Expressar ideias e necessidades com clareza e respeito.', 1
    UNION ALL SELECT 1, 2, 'Impor a própria opinião.', 0
    UNION ALL SELECT 1, 3, 'Falar o mínimo possível.', 0
    UNION ALL SELECT 2, 0, 'Explicar um limite de forma clara.', 0
    UNION ALL SELECT 2, 1, 'Discordar com respeito.', 0
    UNION ALL SELECT 2, 2, 'Aceitar uma tarefa mesmo sabendo que não conseguirá cumprir.', 1
    UNION ALL SELECT 2, 3, 'Pedir esclarecimentos antes de responder.', 0
    UNION ALL SELECT 3, 0, 'Ouvir antes de responder.', 0
    UNION ALL SELECT 3, 1, 'Interromper e desvalorizar a opinião do outro.', 1
    UNION ALL SELECT 3, 2, 'Confirmar se entendeu corretamente.', 0
    UNION ALL SELECT 3, 3, 'Explicar seu ponto de vista com respeito.', 0
    UNION ALL SELECT 4, 0, '“Tá bom, eu faço.”', 0
    UNION ALL SELECT 4, 1, '“Não vou fazer isso de jeito nenhum.”', 0
    UNION ALL SELECT 4, 2, '“Posso ajudar, mas minha carga está completa. Podemos revisar as prioridades ou o prazo?”', 1
    UNION ALL SELECT 4, 3, 'Ignorar a solicitação.', 0
    UNION ALL SELECT 5, 0, 'Esperar apenas a própria vez de falar.', 0
    UNION ALL SELECT 5, 1, 'Prestar atenção, fazer perguntas e confirmar o entendimento.', 1
    UNION ALL SELECT 5, 2, 'Concordar com tudo.', 0
    UNION ALL SELECT 5, 3, 'Evitar fazer perguntas.', 0
    UNION ALL SELECT 6, 0, '“Preciso disso logo.”', 0
    UNION ALL SELECT 6, 1, '“Veja isso quando puder.”', 0
    UNION ALL SELECT 6, 2, '“Preciso do relatório até amanhã às 15h para a reunião.”', 1
    UNION ALL SELECT 6, 3, '“Tente não demorar.”', 0
    UNION ALL SELECT 7, 0, 'Criticar a personalidade da pessoa.', 0
    UNION ALL SELECT 7, 1, 'Ajudar na melhoria ou reforçar boas práticas.', 1
    UNION ALL SELECT 7, 2, 'Mostrar autoridade.', 0
    UNION ALL SELECT 7, 3, 'Evitar qualquer discussão futura.', 0
    UNION ALL SELECT 8, 0, '“Você é muito desorganizado.”', 0
    UNION ALL SELECT 8, 1, '“Você nunca faz nada direito.”', 0
    UNION ALL SELECT 8, 2, '“Percebi que os últimos relatórios foram entregues após o prazo. Podemos entender o que está dificultando a entrega?”', 1
    UNION ALL SELECT 8, 3, '“Todo mundo reclama do seu trabalho.”', 0
    UNION ALL SELECT 9, 0, 'Opinião → crítica → cobrança → punição.', 0
    UNION ALL SELECT 9, 1, 'Situação → comportamento → impacto → próximo passo.', 1
    UNION ALL SELECT 9, 2, 'Problema → culpa → justificativa → decisão.', 0
    UNION ALL SELECT 9, 3, 'Elogio → silêncio → crítica → encerramento.', 0
    UNION ALL SELECT 10, 0, 'Interromper imediatamente para se defender.', 0
    UNION ALL SELECT 10, 1, 'Ignorar o comentário.', 0
    UNION ALL SELECT 10, 2, 'Ouvir, pedir exemplos e refletir sobre o conteúdo.', 1
    UNION ALL SELECT 10, 3, 'Concordar automaticamente com tudo.', 0
    UNION ALL SELECT 11, 0, 'Começar a conversa no momento de maior irritação.', 0
    UNION ALL SELECT 11, 1, 'Definir o objetivo e separar fatos de opiniões.', 1
    UNION ALL SELECT 11, 2, 'Evitar pensar sobre o assunto.', 0
    UNION ALL SELECT 11, 3, 'Enviar uma acusação por mensagem.', 0
    UNION ALL SELECT 12, 0, '“Você sempre manda tudo errado.”', 0
    UNION ALL SELECT 12, 1, 'Não dizer nada e corrigir sozinho.', 0
    UNION ALL SELECT 12, 2, '“Percebi que algumas informações estão chegando incompletas e isso está gerando retrabalho. Podemos revisar juntos o que precisa ser enviado?”', 1
    UNION ALL SELECT 12, 3, 'Reclamar com outros colegas.', 0
    UNION ALL SELECT 13, 0, 'Deixar responsabilidades implícitas.', 0
    UNION ALL SELECT 13, 1, 'Definir claramente responsável, prazo e resultado esperado.', 1
    UNION ALL SELECT 13, 2, 'Evitar registrar decisões.', 0
    UNION ALL SELECT 13, 3, 'Utilizar mensagens vagas.', 0
    UNION ALL SELECT 14, 0, 'Muitas pessoas falando ao mesmo tempo.', 0
    UNION ALL SELECT 14, 1, 'Reunião longa, independentemente do resultado.', 0
    UNION ALL SELECT 14, 2, 'Objetivo claro, decisões registradas e próximos passos definidos.', 1
    UNION ALL SELECT 14, 3, 'Ausência de opiniões diferentes.', 0
    UNION ALL SELECT 15, 0, 'Uma mensagem curta e sem contexto.', 0
    UNION ALL SELECT 15, 1, 'Apenas um emoji.', 0
    UNION ALL SELECT 15, 2, 'Uma conversa ou reunião apropriada ao tema.', 1
    UNION ALL SELECT 15, 3, 'Uma mensagem enviada para todo o grupo.', 0
    UNION ALL SELECT 16, 0, '“Isso está completamente errado.”', 0
    UNION ALL SELECT 16, 1, '“Sua ideia não faz sentido.”', 0
    UNION ALL SELECT 16, 2, '“Entendo sua proposta, mas vejo um risco nesse ponto. Podemos analisar outra alternativa?”', 1
    UNION ALL SELECT 16, 3, '“Faça como eu estou dizendo.”', 0
    UNION ALL SELECT 17, 0, 'Esperar que se resolva sozinho.', 0
    UNION ALL SELECT 17, 1, 'Conversar cedo, focar no problema e buscar uma solução.', 1
    UNION ALL SELECT 17, 2, 'Evitar a pessoa envolvida.', 0
    UNION ALL SELECT 17, 3, 'Procurar culpados antes de entender o ocorrido.', 0
    UNION ALL SELECT 18, 0, 'Todos precisam concordar o tempo inteiro.', 0
    UNION ALL SELECT 18, 1, 'Apenas gestores precisam se comunicar claramente.', 0
    UNION ALL SELECT 18, 2, 'Clareza, escuta, alinhamento e respeito ajudam a equipe a colaborar melhor.', 1
    UNION ALL SELECT 18, 3, 'Registrar decisões torna a comunicação desnecessária.', 0
) opcao ON opcao.questao = q.ordem
WHERE c.titulo = 'Comunicação Assertiva no Ambiente de Trabalho'
  AND NOT EXISTS (
      SELECT 1 FROM alternativas existente WHERE existente.questao_id = q.id AND existente.ordem = opcao.ordem
  );
