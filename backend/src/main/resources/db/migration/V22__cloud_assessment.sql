-- Questões 1–6: Aula 1; 7–12: Aula 2; 13–18: Aula 3.
INSERT INTO avaliacoes (id, curso_id, titulo, nota_minima, limite_tentativas)
SELECT UUID(), c.id, 'Avaliação: Cloud Computing Essencial', 80, 2
FROM cursos c
WHERE c.titulo = 'Cloud Computing Essencial'
  AND NOT EXISTS (SELECT 1 FROM avaliacoes a WHERE a.curso_id = c.id);

INSERT INTO questoes (id, avaliacao_id, enunciado, explicacao, ordem)
SELECT UUID(), a.id, pergunta.enunciado, pergunta.explicacao, pergunta.ordem
FROM avaliacoes a
JOIN cursos c ON c.id = a.curso_id
JOIN (
    SELECT 1 AS ordem, 'O que é Cloud Computing?' AS enunciado, 'Cloud Computing permite utilizar recursos como servidores, armazenamento e bancos de dados pela internet.' AS explicacao
    UNION ALL SELECT 2, 'Qual alternativa representa um recurso que pode ser oferecido pela nuvem?', 'A nuvem pode disponibilizar diversos recursos computacionais, incluindo servidores, redes, armazenamento e bancos de dados.'
    UNION ALL SELECT 3, 'Qual é uma diferença básica entre infraestrutura local e nuvem?', 'Um dos principais diferenciais da nuvem é a possibilidade de aumentar ou reduzir recursos conforme a necessidade.'
    UNION ALL SELECT 4, 'O que significa escalabilidade em Cloud Computing?', 'Escalabilidade é a capacidade de adaptar os recursos computacionais ao volume de uso.'
    UNION ALL SELECT 5, 'Uma loja virtual recebe muito mais acessos durante uma promoção. Qual benefício da nuvem pode ajudar nesse cenário?', 'A escalabilidade permite aumentar recursos temporariamente para suportar picos de acesso.'
    UNION ALL SELECT 6, 'Estar na nuvem significa que um sistema terá alta disponibilidade automaticamente?', 'A nuvem oferece recursos para alta disponibilidade, mas eles precisam ser corretamente planejados e configurados.'
    UNION ALL SELECT 7, 'Qual modelo de serviço oferece infraestrutura como máquinas virtuais, redes e armazenamento?', 'IaaS fornece recursos de infraestrutura que podem ser configurados e administrados pelo cliente.'
    UNION ALL SELECT 8, 'Qual situação representa melhor o uso de PaaS?', 'PaaS permite que a equipe foque na aplicação enquanto o provedor administra grande parte da infraestrutura.'
    UNION ALL SELECT 9, 'Qual alternativa representa melhor SaaS?', 'SaaS disponibiliza aplicações prontas, normalmente acessadas pela internet.'
    UNION ALL SELECT 10, 'Em qual modelo o cliente geralmente possui maior controle sobre a infraestrutura?', 'No IaaS, o cliente possui mais controle sobre sistemas, máquinas virtuais e configurações do ambiente.'
    UNION ALL SELECT 11, 'O que caracteriza uma nuvem privada?', 'A nuvem privada é dedicada a uma única organização e pode atender necessidades específicas de controle e gestão.'
    UNION ALL SELECT 12, 'O que é uma nuvem híbrida?', 'A nuvem híbrida combina ambientes diferentes, permitindo que a organização escolha onde executar cada tipo de carga.'
    UNION ALL SELECT 13, 'Qual é um exemplo comum de uso de Cloud Computing?', 'Hospedagem de aplicações, armazenamento, bancos de dados e backups são usos comuns da nuvem.'
    UNION ALL SELECT 14, 'Qual é uma boa prática relacionada a backups em nuvem?', 'Um backup só é realmente útil se puder ser recuperado quando necessário.'
    UNION ALL SELECT 15, 'Qual situação pode gerar custos desnecessários em cloud?', 'Recursos ativos sem necessidade continuam consumindo capacidade e podem gerar cobrança.'
    UNION ALL SELECT 16, 'Por que o monitoramento é importante em ambientes de nuvem?', 'O monitoramento ajuda a acompanhar a saúde, desempenho e consumo dos recursos utilizados.'
    UNION ALL SELECT 17, 'Qual alternativa representa uma boa prática de segurança na nuvem?', 'Controle de acesso, autenticação, atualizações e monitoramento ajudam a proteger os recursos em cloud.'
    UNION ALL SELECT 18, 'Qual afirmação melhor resume o uso adequado da computação em nuvem?', 'Cloud oferece diversos benefícios, mas o uso eficiente depende de planejamento, segurança, monitoramento e controle de custos.'
) pergunta
WHERE c.titulo = 'Cloud Computing Essencial'
  AND NOT EXISTS (
      SELECT 1 FROM questoes q WHERE q.avaliacao_id = a.id AND q.ordem = pergunta.ordem
  );

INSERT INTO alternativas (id, questao_id, texto, correta, ordem)
SELECT UUID(), q.id, opcao.texto, opcao.correta, opcao.ordem
FROM questoes q
JOIN avaliacoes a ON a.id = q.avaliacao_id
JOIN cursos c ON c.id = a.curso_id
JOIN (
    SELECT 1 AS questao, 0 AS ordem, 'Um tipo de sistema operacional usado apenas em servidores.' AS texto, 0 AS correta
    UNION ALL SELECT 1, 1, 'O fornecimento de recursos de tecnologia pela internet.', 1
    UNION ALL SELECT 1, 2, 'Uma técnica para aumentar a velocidade de computadores pessoais.', 0
    UNION ALL SELECT 1, 3, 'Um método de programação para aplicações móveis.', 0
    UNION ALL SELECT 2, 0, 'Apenas impressoras físicas.', 0
    UNION ALL SELECT 2, 1, 'Somente cabos de rede.', 0
    UNION ALL SELECT 2, 2, 'Servidores, armazenamento e bancos de dados.', 1
    UNION ALL SELECT 2, 3, 'Apenas softwares instalados localmente.', 0
    UNION ALL SELECT 3, 0, 'Na nuvem não existem servidores físicos.', 0
    UNION ALL SELECT 3, 1, 'A infraestrutura local depende apenas de internet.', 0
    UNION ALL SELECT 3, 2, 'Na nuvem os recursos podem ser contratados e ajustados sob demanda.', 1
    UNION ALL SELECT 3, 3, 'A infraestrutura local sempre possui custo menor.', 0
    UNION ALL SELECT 4, 0, 'A capacidade de aumentar ou reduzir recursos conforme a demanda.', 1
    UNION ALL SELECT 4, 1, 'A substituição automática de todos os computadores da empresa.', 0
    UNION ALL SELECT 4, 2, 'A criação de senhas para usuários.', 0
    UNION ALL SELECT 4, 3, 'O bloqueio de acesso externo aos sistemas.', 0
    UNION ALL SELECT 5, 0, 'Escalabilidade.', 1
    UNION ALL SELECT 5, 1, 'Impressão remota.', 0
    UNION ALL SELECT 5, 2, 'Formatação de discos.', 0
    UNION ALL SELECT 5, 3, 'Compactação de arquivos.', 0
    UNION ALL SELECT 6, 0, 'Sim, qualquer sistema em nuvem nunca fica indisponível.', 0
    UNION ALL SELECT 6, 1, 'Sim, desde que tenha conexão com a internet.', 0
    UNION ALL SELECT 6, 2, 'Não, a disponibilidade também depende da arquitetura e da configuração utilizada.', 1
    UNION ALL SELECT 6, 3, 'Não, sistemas em nuvem não podem ter alta disponibilidade.', 0
    UNION ALL SELECT 7, 0, 'SaaS.', 0
    UNION ALL SELECT 7, 1, 'IaaS.', 1
    UNION ALL SELECT 7, 2, 'PaaS.', 0
    UNION ALL SELECT 7, 3, 'LAN.', 0
    UNION ALL SELECT 8, 0, 'Usar um e-mail online pronto.', 0
    UNION ALL SELECT 8, 1, 'Comprar um servidor físico.', 0
    UNION ALL SELECT 8, 2, 'Publicar uma aplicação sem administrar diretamente o servidor.', 1
    UNION ALL SELECT 8, 3, 'Instalar um sistema operacional em um computador pessoal.', 0
    UNION ALL SELECT 9, 0, 'Uma máquina virtual configurada pela empresa.', 0
    UNION ALL SELECT 9, 1, 'Um software pronto para uso acessado pela internet.', 1
    UNION ALL SELECT 9, 2, 'Um servidor comprado e instalado localmente.', 0
    UNION ALL SELECT 9, 3, 'Uma rede física dentro da empresa.', 0
    UNION ALL SELECT 10, 0, 'IaaS.', 1
    UNION ALL SELECT 10, 1, 'SaaS.', 0
    UNION ALL SELECT 10, 2, 'PaaS.', 0
    UNION ALL SELECT 10, 3, 'Todos possuem exatamente o mesmo nível de controle.', 0
    UNION ALL SELECT 11, 0, 'Recursos exclusivos de uma única organização.', 1
    UNION ALL SELECT 11, 1, 'Recursos disponíveis gratuitamente para qualquer pessoa.', 0
    UNION ALL SELECT 11, 2, 'Apenas serviços usados por usuários domésticos.', 0
    UNION ALL SELECT 11, 3, 'Uma nuvem sem nenhum tipo de segurança.', 0
    UNION ALL SELECT 12, 0, 'Uma nuvem que funciona apenas em dispositivos móveis.', 0
    UNION ALL SELECT 12, 1, 'Uma combinação de diferentes ambientes, como nuvem pública e infraestrutura privada ou local.', 1
    UNION ALL SELECT 12, 2, 'Uma rede que não possui servidores.', 0
    UNION ALL SELECT 12, 3, 'Um sistema utilizado exclusivamente para backups.', 0
    UNION ALL SELECT 13, 0, 'Hospedar aplicações e sistemas.', 1
    UNION ALL SELECT 13, 1, 'Substituir cabos de energia.', 0
    UNION ALL SELECT 13, 2, 'Aumentar fisicamente a memória de um computador.', 0
    UNION ALL SELECT 13, 3, 'Reparar equipamentos danificados.', 0
    UNION ALL SELECT 14, 0, 'Criar o backup e nunca verificar novamente.', 0
    UNION ALL SELECT 14, 1, 'Manter apenas uma única cópia sem planejamento.', 0
    UNION ALL SELECT 14, 2, 'Planejar e testar regularmente a recuperação dos dados.', 1
    UNION ALL SELECT 14, 3, 'Evitar backups quando os dados estão em cloud.', 0
    UNION ALL SELECT 15, 0, 'Monitorar o uso dos recursos.', 0
    UNION ALL SELECT 15, 1, 'Manter máquinas virtuais sem uso ligadas continuamente.', 1
    UNION ALL SELECT 15, 2, 'Ajustar recursos conforme a demanda.', 0
    UNION ALL SELECT 15, 3, 'Remover serviços que não são mais necessários.', 0
    UNION ALL SELECT 16, 0, 'Apenas para alterar a aparência das aplicações.', 0
    UNION ALL SELECT 16, 1, 'Para identificar falhas, consumo, indisponibilidade e problemas de desempenho.', 1
    UNION ALL SELECT 16, 2, 'Para impedir qualquer acesso dos usuários.', 0
    UNION ALL SELECT 16, 3, 'Apenas para aumentar a quantidade de servidores.', 0
    UNION ALL SELECT 17, 0, 'Compartilhar a mesma senha entre todos os usuários.', 0
    UNION ALL SELECT 17, 1, 'Deixar qualquer usuário acessar todos os recursos.', 0
    UNION ALL SELECT 17, 2, 'Utilizar controle de acesso, autenticação e monitoramento.', 1
    UNION ALL SELECT 17, 3, 'Desativar atualizações de segurança.', 0
    UNION ALL SELECT 18, 0, 'A nuvem elimina completamente a necessidade de planejamento.', 0
    UNION ALL SELECT 18, 1, 'A nuvem oferece flexibilidade e escalabilidade, mas exige cuidados com segurança, custos e arquitetura.', 1
    UNION ALL SELECT 18, 2, 'Todo sistema deve obrigatoriamente ser migrado para a nuvem.', 0
    UNION ALL SELECT 18, 3, 'Utilizar cloud significa não precisar mais monitorar sistemas.', 0
) opcao ON opcao.questao = q.ordem
WHERE c.titulo = 'Cloud Computing Essencial'
  AND NOT EXISTS (
      SELECT 1 FROM alternativas existente WHERE existente.questao_id = q.id AND existente.ordem = opcao.ordem
  );
