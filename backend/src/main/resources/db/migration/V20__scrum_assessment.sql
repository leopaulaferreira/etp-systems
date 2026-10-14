-- Questões 1–6: Aula 1; 7–12: Aula 2; 13–18: Aula 3.
INSERT INTO avaliacoes (id, curso_id, titulo, nota_minima, limite_tentativas)
SELECT UUID(), c.id, 'Avaliação: Gestão de Projetos Ágeis com Scrum', 80, 2
FROM cursos c
WHERE c.titulo = 'Gestão de Projetos Ágeis com Scrum'
  AND NOT EXISTS (SELECT 1 FROM avaliacoes a WHERE a.curso_id = c.id);

INSERT INTO questoes (id, avaliacao_id, enunciado, explicacao, ordem)
SELECT UUID(), a.id, pergunta.enunciado, pergunta.explicacao, pergunta.ordem
FROM avaliacoes a
JOIN cursos c ON c.id = a.curso_id
JOIN (
    SELECT 1 AS ordem, 'Uma equipe entrega uma primeira versão de uma solução e recebe sugestões dos usuários. Qual atitude representa melhor uma abordagem ágil?' AS enunciado,
           'A abordagem ágil trabalha em ciclos menores, com colaboração e feedback frequente para adaptar as entregas às necessidades reais.' AS explicacao
    UNION ALL SELECT 2, 'Qual alternativa descreve melhor o Scrum?',
           'Scrum é um framework que ajuda o time a organizar o trabalho, inspecionar resultados e adaptar suas ações para gerar valor.'
    UNION ALL SELECT 3, 'Qual é a principal responsabilidade do Product Owner?',
           'O Product Owner conecta as necessidades dos usuários e do negócio às prioridades do produto, com foco em maximizar seu valor.'
    UNION ALL SELECT 4, 'Uma equipe não entende o propósito dos eventos do Scrum e enfrenta obstáculos recorrentes de colaboração. Como o Scrum Master deve contribuir?',
           'O Scrum Master ajuda a equipe a aplicar o Scrum, facilita a colaboração e atua para que os impedimentos sejam removidos.'
    UNION ALL SELECT 5, 'No Scrum, qual atividade está diretamente relacionada à responsabilidade dos Developers?',
           'Os Developers planejam e executam o trabalho de criação da entrega, colaborando entre si e mantendo o foco na qualidade.'
    UNION ALL SELECT 6, 'Qual situação demonstra uma colaboração adequada entre os papéis do Scrum Team?',
           'Os papéis têm responsabilidades diferentes e complementares. O Scrum Team colabora com autonomia e habilidades diversas para alcançar um objetivo comum.'
    UNION ALL SELECT 7, 'Qual alternativa relaciona corretamente uma Sprint ao Sprint Goal?',
           'A Sprint organiza o trabalho em um período definido. Seu objetivo dá foco ao time e explica o valor que se pretende alcançar nesse período.'
    UNION ALL SELECT 8, 'Qual deve ser o principal resultado da Sprint Planning?',
           'Na Sprint Planning, o Scrum Team colabora para definir por que a Sprint é importante, o que pode ser feito e como o trabalho será realizado.'
    UNION ALL SELECT 9, 'Durante a Daily Scrum, os Developers percebem que duas atividades dependem da mesma informação ainda indisponível. Qual é o uso mais adequado desse evento?',
           'A Daily Scrum permite aos Developers verificar o progresso, identificar obstáculos e adaptar o plano para avançar em direção ao objetivo da Sprint.'
    UNION ALL SELECT 10, 'Um acesso necessário para testar uma entrega foi bloqueado logo após a Daily Scrum. Qual é a atitude mais adequada?',
           'Impedimentos dificultam ou bloqueiam o avanço do trabalho. Eles devem ser tratados rapidamente, sem esperar um evento futuro para comunicar o problema.'
    UNION ALL SELECT 11, 'Na Sprint Review, usuários experimentam uma funcionalidade entregue e identificam uma necessidade que ainda não havia sido considerada. Qual é a melhor utilização desse feedback?',
           'A Sprint Review examina o resultado da Sprint com as partes interessadas. O feedback ajuda a adaptar o produto e orientar os próximos passos.'
    UNION ALL SELECT 12, 'A equipe entregou uma funcionalidade, mas percebeu que a falta de comunicação causou retrabalho. Qual deve ser o foco da Sprint Retrospective?',
           'A Retrospective busca melhorar a forma de trabalhar do time. A Review inspeciona o produto; a Retrospective identifica melhorias nas práticas e na colaboração.'
    UNION ALL SELECT 13, 'Qual é a diferença básica entre Product Backlog e Sprint Backlog?',
           'O Product Backlog é uma lista dinâmica do trabalho necessário para melhorar o produto. O Sprint Backlog organiza o objetivo e o trabalho escolhido para a Sprint atual.'
    UNION ALL SELECT 14, 'Há três demandas: uma mudança visual de baixo impacto, uma falha que impede clientes de concluir pedidos e uma melhoria interna sem urgência. Como o Product Owner deve orientar a priorização?',
           'O Product Owner é responsável pela ordenação do backlog. Priorizar exige considerar o impacto para os usuários e o negócio, além de urgência, riscos e outros fatores relevantes.'
    UNION ALL SELECT 15, 'Qual situação representa melhor um incremento do produto?',
           'Um incremento é uma evolução utilizável do produto. Iniciar atividades ou concluir etapas isoladas não equivale a ter uma entrega pronta e com qualidade.'
    UNION ALL SELECT 16, 'Qual alternativa relaciona corretamente Product Goal e Sprint Goal?',
           'O Product Goal orienta a evolução do produto. O Sprint Goal dá foco à Sprint atual, contribuindo para alcançar essa direção mais ampla.'
    UNION ALL SELECT 17, 'Uma demanda do Product Backlog está descrita apenas como “melhorar o atendimento”. O que o time deve fazer ao refiná-la?',
           'O refinamento torna os itens do backlog mais claros e preparados para o trabalho. Ele envolve revisar e detalhar demandas conforme o time aprende sobre as necessidades.'
    UNION ALL SELECT 18, 'Duas equipes concluíram a mesma quantidade de tarefas. Uma reduziu o tempo de atendimento dos clientes; a outra entregou funcionalidades que quase não são utilizadas. Qual indicador ajuda mais a compreender o valor entregue?',
           'Valor está relacionado ao benefício e ao impacto das entregas. Concluir muitas tarefas, por si só, não garante uma melhoria útil para os usuários ou para o negócio.'
) pergunta
WHERE c.titulo = 'Gestão de Projetos Ágeis com Scrum'
  AND NOT EXISTS (
      SELECT 1 FROM questoes q WHERE q.avaliacao_id = a.id AND q.ordem = pergunta.ordem
  );

INSERT INTO alternativas (id, questao_id, texto, correta, ordem)
SELECT UUID(), q.id, opcao.texto, opcao.correta, opcao.ordem
FROM questoes q
JOIN avaliacoes a ON a.id = q.avaliacao_id
JOIN cursos c ON c.id = a.curso_id
JOIN (
    SELECT 1 AS questao, 0 AS ordem, 'Concluir todo o plano inicial antes de reconsiderar as sugestões recebidas.' AS texto, 0 AS correta
    UNION ALL SELECT 1, 1, 'Usar o feedback para ajustar prioridades e orientar as próximas entregas.', 1
    UNION ALL SELECT 1, 2, 'Aumentar a velocidade de execução sem revisar as decisões do planejamento.', 0
    UNION ALL SELECT 1, 3, 'Concentrar a validação com os usuários na entrega final do projeto.', 0
    UNION ALL SELECT 2, 0, 'Uma ferramenta de software que controla automaticamente prazos e tarefas.', 0
    UNION ALL SELECT 2, 1, 'Um roteiro detalhado que define antecipadamente todas as etapas de um projeto.', 0
    UNION ALL SELECT 2, 2, 'Um modelo de relatório para comparar a produtividade individual dos colaboradores.', 0
    UNION ALL SELECT 2, 3, 'Um framework que organiza a colaboração em Sprints para enfrentar problemas e gerar valor.', 1
    UNION ALL SELECT 3, 0, 'Maximizar o valor do produto, considerando necessidades e orientando as prioridades.', 1
    UNION ALL SELECT 3, 1, 'Organizar os eventos do Scrum e apoiar a melhoria das práticas do time.', 0
    UNION ALL SELECT 3, 2, 'Definir sozinho como os Developers devem implementar cada solução.', 0
    UNION ALL SELECT 3, 3, 'Acompanhar a execução individual das tarefas e distribuir atividades diariamente.', 0
    UNION ALL SELECT 4, 0, 'Assumindo a escolha das funcionalidades para reduzir as discussões do time.', 0
    UNION ALL SELECT 4, 1, 'Distribuindo tarefas individuais e exigindo autorização para mudanças no trabalho.', 0
    UNION ALL SELECT 4, 2, 'Ajudando o time a compreender o Scrum, melhorar suas práticas e remover impedimentos.', 1
    UNION ALL SELECT 4, 3, 'Concentrando em si a aprovação dos resultados antes de ouvir o Product Owner.', 0
    UNION ALL SELECT 5, 0, 'Decidir sozinhos quais necessidades do negócio devem ter prioridade no produto.', 0
    UNION ALL SELECT 5, 1, 'Planejar e realizar o trabalho necessário para construir e testar uma entrega utilizável.', 1
    UNION ALL SELECT 5, 2, 'Autorizar a participação dos clientes nos eventos de revisão do produto.', 0
    UNION ALL SELECT 5, 3, 'Determinar os objetivos do produto sem colaboração com os demais papéis.', 0
    UNION ALL SELECT 6, 0, 'O Scrum Master aprova cada decisão técnica antes que os Developers possam trabalhar.', 0
    UNION ALL SELECT 6, 1, 'O Product Owner distribui tarefas detalhadas, e os Developers apenas seguem as instruções.', 0
    UNION ALL SELECT 6, 2, 'Cada papel conclui sua etapa antes que o próximo comece, evitando decisões conjuntas.', 0
    UNION ALL SELECT 6, 3, 'O Product Owner esclarece o valor esperado, os Developers planejam a solução e o Scrum Master apoia o trabalho do time.', 1
    UNION ALL SELECT 7, 0, 'A Sprint é um ciclo de duração fixa, e o Sprint Goal orienta o resultado que o time busca nesse ciclo.', 1
    UNION ALL SELECT 7, 1, 'A Sprint termina quando todo o Product Backlog é concluído, e o Sprint Goal define a duração total do projeto.', 0
    UNION ALL SELECT 7, 2, 'A Sprint reúne apenas as reuniões do time, e o Sprint Goal corresponde ao relatório dessas reuniões.', 0
    UNION ALL SELECT 7, 3, 'A Sprint é uma sequência de tarefas independentes, e o Sprint Goal mede o desempenho individual de cada pessoa.', 0
    UNION ALL SELECT 8, 0, 'Uma avaliação das dificuldades de colaboração encontradas na Sprint anterior.', 0
    UNION ALL SELECT 8, 1, 'Uma aprovação definitiva de todas as funcionalidades futuras do produto.', 0
    UNION ALL SELECT 8, 2, 'Um objetivo compartilhado para a Sprint, itens selecionados e um plano para realizar o trabalho.', 1
    UNION ALL SELECT 8, 3, 'Uma demonstração do produto concluído aos usuários e às partes interessadas.', 0
    UNION ALL SELECT 9, 0, 'Apresentar relatórios individuais para que o Scrum Master cobre as tarefas atrasadas.', 0
    UNION ALL SELECT 9, 1, 'Ordenar todas as demandas futuras do produto antes de continuar o trabalho.', 0
    UNION ALL SELECT 9, 2, 'Solicitar aos clientes a aprovação formal de cada tarefa realizada no dia anterior.', 0
    UNION ALL SELECT 9, 3, 'Inspecionar o avanço em direção ao Sprint Goal e ajustar o plano de trabalho diante da dependência.', 1
    UNION ALL SELECT 10, 0, 'Aguardar a Sprint Review para que o problema seja incluído na apresentação do produto.', 0
    UNION ALL SELECT 10, 1, 'Comunicar o impedimento prontamente e buscar sua resolução com o time e o apoio do Scrum Master.', 1
    UNION ALL SELECT 10, 2, 'Alterar o Sprint Goal individualmente para retirar a necessidade dos testes.', 0
    UNION ALL SELECT 10, 3, 'Trabalhar em outras tarefas e informar o bloqueio somente depois de resolvê-lo.', 0
    UNION ALL SELECT 11, 0, 'Avaliar exclusivamente a comunicação interna da equipe, sem discutir o produto.', 0
    UNION ALL SELECT 11, 1, 'Transformar a Review em uma distribuição de tarefas individuais para a próxima Sprint.', 0
    UNION ALL SELECT 11, 2, 'Inspecionar o resultado com as partes interessadas e considerar ajustes nas próximas decisões sobre o produto.', 1
    UNION ALL SELECT 11, 3, 'Registrar a sugestão, mantendo as prioridades futuras fixas até o término de todo o projeto.', 0
    UNION ALL SELECT 12, 0, 'Analisar como o time trabalhou e combinar ações para melhorar a colaboração nas próximas Sprints.', 1
    UNION ALL SELECT 12, 1, 'Apresentar a funcionalidade aos clientes para validar novas necessidades do produto.', 0
    UNION ALL SELECT 12, 2, 'Selecionar os itens do Product Backlog que serão realizados na próxima Sprint.', 0
    UNION ALL SELECT 12, 3, 'Verificar o andamento das tarefas de hoje e reorganizar somente o próximo dia de trabalho.', 0
    UNION ALL SELECT 13, 0, 'O Product Backlog contém somente o trabalho da Sprint atual; o Sprint Backlog reúne todas as necessidades futuras do produto.', 0
    UNION ALL SELECT 13, 1, 'O Product Backlog organiza as demandas do produto; o Sprint Backlog arquiva apenas as entregas concluídas nas Sprints anteriores.', 0
    UNION ALL SELECT 13, 2, 'O Product Backlog contém apenas atividades técnicas; o Sprint Backlog contém apenas solicitações de usuários e do negócio.', 0
    UNION ALL SELECT 13, 3, 'O Product Backlog reúne as necessidades ordenadas do produto; o Sprint Backlog contém o objetivo, os itens selecionados e o plano da Sprint.', 1
    UNION ALL SELECT 14, 0, 'Ordenar exclusivamente pela data de chegada, mantendo a solicitação mais antiga no topo.', 0
    UNION ALL SELECT 14, 1, 'Considerar valor, impacto, urgência e riscos, colocando a falha que bloqueia pedidos em destaque.', 1
    UNION ALL SELECT 14, 2, 'Escolher primeiro as tarefas mais rápidas para aumentar a quantidade de itens concluídos.', 0
    UNION ALL SELECT 14, 3, 'Atender primeiro a solicitação da pessoa de maior cargo, independentemente do efeito sobre os usuários.', 0
    UNION ALL SELECT 15, 0, 'Uma melhoria integrada ao produto, com qualidade verificada e pronta para ser utilizada.', 1
    UNION ALL SELECT 15, 1, 'Um conjunto de ideias selecionadas para desenvolvimento, ainda sem implementação.', 0
    UNION ALL SELECT 15, 2, 'Uma funcionalidade parcialmente construída que ainda depende de testes para funcionar.', 0
    UNION ALL SELECT 15, 3, 'Um relatório das horas trabalhadas e das tarefas iniciadas durante a Sprint.', 0
    UNION ALL SELECT 16, 0, 'O Product Goal orienta apenas o trabalho de hoje; o Sprint Goal define a visão de longo prazo de todo o produto.', 0
    UNION ALL SELECT 16, 1, 'O Product Goal é uma lista de tarefas técnicas; o Sprint Goal reúne todas as solicitações futuras dos clientes.', 0
    UNION ALL SELECT 16, 2, 'O Product Goal indica uma direção mais ampla para o produto; o Sprint Goal define um objetivo do ciclo atual alinhado a essa direção.', 1
    UNION ALL SELECT 16, 3, 'O Product Goal mede o desempenho do Product Owner; o Sprint Goal mede separadamente o desempenho de cada Developer.', 0
    UNION ALL SELECT 17, 0, 'Fixar antecipadamente a pessoa responsável e a data de todas as demandas futuras.', 0
    UNION ALL SELECT 17, 1, 'Transferir a descrição para o Sprint Backlog sem esclarecer a necessidade.', 0
    UNION ALL SELECT 17, 2, 'Usar a discussão para apresentar aos clientes somente as funcionalidades já concluídas.', 0
    UNION ALL SELECT 17, 3, 'Esclarecer o problema, detalhar o resultado esperado e atualizar as informações para preparar decisões futuras.', 1
    UNION ALL SELECT 18, 0, 'A quantidade de tarefas marcadas como concluídas por cada equipe.', 0
    UNION ALL SELECT 18, 1, 'A melhoria efetiva que as entregas produziram para os usuários e para o negócio.', 1
    UNION ALL SELECT 18, 2, 'O total de horas registradas pelos colaboradores durante a execução.', 0
    UNION ALL SELECT 18, 3, 'A quantidade de funcionalidades adicionadas, independentemente de sua utilização.', 0
) opcao ON opcao.questao = q.ordem
WHERE c.titulo = 'Gestão de Projetos Ágeis com Scrum'
  AND NOT EXISTS (
      SELECT 1 FROM alternativas existente WHERE existente.questao_id = q.id AND existente.ordem = opcao.ordem
  );
