CREATE TABLE aulas (
    id CHAR(36) PRIMARY KEY,
    curso_id CHAR(36) NOT NULL,
    titulo VARCHAR(160) NOT NULL,
    conteudo TEXT NOT NULL,
    video_url VARCHAR(500) NULL,
    ordem INT NOT NULL,
    CONSTRAINT fk_aulas_curso FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
    CONSTRAINT uk_aulas_curso_ordem UNIQUE (curso_id, ordem)
);

CREATE TABLE avaliacoes (
    id CHAR(36) PRIMARY KEY,
    curso_id CHAR(36) NOT NULL,
    titulo VARCHAR(160) NOT NULL,
    nota_minima INT NOT NULL DEFAULT 80,
    limite_tentativas INT NOT NULL DEFAULT 2,
    CONSTRAINT fk_avaliacoes_curso FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
    CONSTRAINT uk_avaliacoes_curso UNIQUE (curso_id),
    CONSTRAINT ck_avaliacoes_nota CHECK (nota_minima BETWEEN 0 AND 100),
    CONSTRAINT ck_avaliacoes_tentativas CHECK (limite_tentativas > 0)
);

CREATE TABLE questoes (
    id CHAR(36) PRIMARY KEY,
    avaliacao_id CHAR(36) NOT NULL,
    enunciado TEXT NOT NULL,
    explicacao TEXT NOT NULL,
    ordem INT NOT NULL,
    CONSTRAINT fk_questoes_avaliacao FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE,
    CONSTRAINT uk_questoes_avaliacao_ordem UNIQUE (avaliacao_id, ordem)
);

CREATE TABLE alternativas (
    id CHAR(36) PRIMARY KEY,
    questao_id CHAR(36) NOT NULL,
    texto VARCHAR(500) NOT NULL,
    correta BOOLEAN NOT NULL,
    ordem INT NOT NULL,
    CONSTRAINT fk_alternativas_questao FOREIGN KEY (questao_id) REFERENCES questoes(id) ON DELETE CASCADE,
    CONSTRAINT uk_alternativas_questao_ordem UNIQUE (questao_id, ordem)
);

CREATE TABLE tentativas_avaliacao (
    id CHAR(36) PRIMARY KEY,
    avaliacao_id CHAR(36) NOT NULL,
    usuario_id CHAR(36) NOT NULL,
    nota INT NOT NULL,
    aprovado BOOLEAN NOT NULL,
    concluido_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tentativas_avaliacao FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE,
    CONSTRAINT fk_tentativas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT ck_tentativas_nota CHECK (nota BETWEEN 0 AND 100)
);
CREATE INDEX idx_tentativas_usuario_avaliacao ON tentativas_avaliacao(usuario_id, avaliacao_id);

CREATE TABLE respostas_avaliacao (
    id CHAR(36) PRIMARY KEY,
    tentativa_id CHAR(36) NOT NULL,
    questao_id CHAR(36) NOT NULL,
    alternativa_id CHAR(36) NOT NULL,
    CONSTRAINT fk_respostas_tentativa FOREIGN KEY (tentativa_id) REFERENCES tentativas_avaliacao(id) ON DELETE CASCADE,
    CONSTRAINT fk_respostas_questao FOREIGN KEY (questao_id) REFERENCES questoes(id) ON DELETE CASCADE,
    CONSTRAINT fk_respostas_alternativa FOREIGN KEY (alternativa_id) REFERENCES alternativas(id) ON DELETE CASCADE,
    CONSTRAINT uk_respostas_tentativa_questao UNIQUE (tentativa_id, questao_id)
);

INSERT INTO aulas (id, curso_id, titulo, conteudo, ordem)
SELECT UUID(), id, 'Proteção de dados no dia a dia',
       'A LGPD orienta como dados pessoais devem ser usados. Um nome ligado ao e-mail, por exemplo, identifica uma pessoa. Antes de coletar informações, defina uma finalidade clara e use apenas o que for necessário.\n\nCompartilhe dados somente com pessoas autorizadas e por canais da empresa. Evite enviar planilhas com informações de clientes por aplicativos pessoais. Ao se afastar do computador, bloqueie a tela.\n\nSe perceber uma exposição indevida, siga o procedimento interno da organização. Na avaliação, você aplicará essas práticas em situações simples.', 1
FROM cursos WHERE titulo = 'LGPD na Prática';
INSERT INTO aulas (id, curso_id, titulo, conteudo, ordem)
SELECT UUID(), id, 'Hábitos essenciais de segurança',
       'Segurança da informação começa com hábitos simples. Use senhas individuais e difíceis de adivinhar; não as compartilhe. Quando disponível, a autenticação em duas etapas acrescenta uma barreira.\n\nDesconfie de mensagens urgentes que pedem links ou dados. Verifique o remetente e o endereço antes de abrir. Atualizações corrigem falhas conhecidas; cópias de segurança ajudam a recuperar dados após incidentes.\n\nEm equipamentos compartilhados, encerre a sessão ao terminar. A avaliação reúne exemplos práticos desses cuidados.', 1
FROM cursos WHERE titulo = 'Fundamentos de Segurança da Informação';
INSERT INTO aulas (id, curso_id, titulo, conteudo, ordem)
SELECT UUID(), id, 'Primeiros passos na nuvem',
       'Computação em nuvem oferece recursos como armazenamento, processamento e aplicações acessados pela rede. Em vez de manter tudo no próprio computador, a organização utiliza serviços de um provedor.\n\nUma vantagem é a elasticidade: aumentar ou reduzir recursos conforme a demanda. No modelo SaaS, você usa uma aplicação gerenciada pelo provedor, como um editor de documentos no navegador.\n\nO provedor cuida de parte da infraestrutura, mas a organização ainda precisa controlar quem acessa seus dados e serviços. Revise esses conceitos antes da avaliação.', 1
FROM cursos WHERE titulo = 'Computação em Nuvem: Conceitos e Aplicações';

INSERT INTO avaliacoes (id, curso_id, titulo, nota_minima, limite_tentativas)
SELECT UUID(), id, CONCAT('Avaliação: ', titulo), 80, 2 FROM cursos
WHERE titulo IN ('LGPD na Prática', 'Fundamentos de Segurança da Informação', 'Computação em Nuvem: Conceitos e Aplicações');

INSERT INTO questoes (id, avaliacao_id, enunciado, explicacao, ordem)
SELECT UUID(), a.id, q.enunciado, q.explicacao, q.ordem FROM avaliacoes a
JOIN cursos c ON c.id = a.curso_id
JOIN (
 SELECT 'LGPD na Prática' curso, 1 ordem, 'Qual destes exemplos identifica uma pessoa?' enunciado, 'Nome e e-mail associados permitem identificar alguém.' explicacao
 UNION ALL SELECT 'LGPD na Prática', 2, 'Qual é uma boa prática ao coletar dados?', 'Use apenas os dados necessários para a finalidade definida.'
 UNION ALL SELECT 'LGPD na Prática', 3, 'Onde informações de clientes devem ser compartilhadas?', 'Use canais autorizados e pessoas que precisam dos dados.'
 UNION ALL SELECT 'LGPD na Prática', 4, 'O que fazer ao se afastar do computador?', 'Bloquear a tela reduz o risco de acesso indevido.'
 UNION ALL SELECT 'LGPD na Prática', 5, 'O que fazer ao notar exposição indevida de dados?', 'Siga o procedimento interno para que o incidente seja tratado.'
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 1, 'Qual prática fortalece uma conta?', 'A autenticação em duas etapas adiciona uma verificação.'
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 2, 'Como agir diante de uma mensagem urgente com link?', 'Verifique o remetente e o endereço antes de abrir.'
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 3, 'Para que serve um backup?', 'Cópias permitem recuperar informações após perdas.'
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 4, 'Por que atualizar os sistemas?', 'Atualizações podem corrigir falhas conhecidas.'
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 5, 'O que fazer ao terminar em um equipamento compartilhado?', 'Encerrar a sessão protege sua conta.'
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 1, 'O que caracteriza um serviço de nuvem?', 'Recursos de nuvem são acessados pela rede.'
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 2, 'O que significa elasticidade na nuvem?', 'É possível ajustar recursos conforme a demanda.'
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 3, 'Qual é um exemplo de SaaS?', 'No SaaS, a aplicação é acessada e gerenciada pelo provedor.'
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 4, 'Quem deve controlar o acesso aos dados na nuvem?', 'A organização continua responsável por controlar acessos.'
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 5, 'Qual vantagem a nuvem pode oferecer?', 'Recursos podem ser usados sem manter toda a infraestrutura local.'
) q ON q.curso = c.titulo;

INSERT INTO alternativas (id, questao_id, texto, correta, ordem)
SELECT UUID(), q.id, o.texto, o.correta, o.ordem FROM questoes q
JOIN avaliacoes a ON a.id = q.avaliacao_id JOIN cursos c ON c.id = a.curso_id
JOIN (
 SELECT 'LGPD na Prática' curso, 1 questao, 0 ordem, 'Nome associado ao e-mail' texto, 1 correta
 UNION ALL SELECT 'LGPD na Prática', 1, 1, 'Uma cor sem contexto', 0
 UNION ALL SELECT 'LGPD na Prática', 1, 2, 'Uma previsão genérica do tempo', 0
 UNION ALL SELECT 'LGPD na Prática', 2, 0, 'Coletar tudo que estiver disponível', 0
 UNION ALL SELECT 'LGPD na Prática', 2, 1, 'Usar apenas os dados necessários', 1
 UNION ALL SELECT 'LGPD na Prática', 2, 2, 'Publicar a planilha inteira', 0
 UNION ALL SELECT 'LGPD na Prática', 3, 0, 'Em grupos pessoais', 0
 UNION ALL SELECT 'LGPD na Prática', 3, 1, 'Em redes sociais abertas', 0
 UNION ALL SELECT 'LGPD na Prática', 3, 2, 'Por canais autorizados', 1
 UNION ALL SELECT 'LGPD na Prática', 4, 0, 'Bloquear a tela', 1
 UNION ALL SELECT 'LGPD na Prática', 4, 1, 'Deixar a conta aberta', 0
 UNION ALL SELECT 'LGPD na Prática', 4, 2, 'Anotar a senha no monitor', 0
 UNION ALL SELECT 'LGPD na Prática', 5, 0, 'Ignorar o ocorrido', 0
 UNION ALL SELECT 'LGPD na Prática', 5, 1, 'Seguir o procedimento interno', 1
 UNION ALL SELECT 'LGPD na Prática', 5, 2, 'Publicar os dados novamente', 0
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 1, 0, 'Compartilhar a senha', 0
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 1, 1, 'Usar autenticação em duas etapas', 1
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 1, 2, 'Reutilizar a senha', 0
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 2, 0, 'Clicar imediatamente', 0
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 2, 1, 'Encaminhar sem ler', 0
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 2, 2, 'Verificar remetente e endereço', 1
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 3, 0, 'Recuperar dados após perdas', 1
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 3, 1, 'Substituir atualizações', 0
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 3, 2, 'Divulgar senhas', 0
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 4, 0, 'Para mudar a cor da tela', 0
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 4, 1, 'Para corrigir falhas conhecidas', 1
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 4, 2, 'Para eliminar backups', 0
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 5, 0, 'Manter a sessão aberta', 0
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 5, 1, 'Compartilhar sua conta', 0
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 5, 2, 'Encerrar a sessão', 1
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 1, 0, 'Recursos acessados pela rede', 1
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 1, 1, 'Somente arquivos em papel', 0
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 1, 2, 'Um computador sem conexão', 0
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 2, 0, 'Manter sempre a mesma capacidade', 0
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 2, 1, 'Ajustar recursos à demanda', 1
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 2, 2, 'Desligar todas as aplicações', 0
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 3, 0, 'Um cabo de rede', 0
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 3, 1, 'Uma memória RAM', 0
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 3, 2, 'Editor de documentos no navegador', 1
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 4, 0, 'Ninguém, porque o provedor faz tudo', 0
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 4, 1, 'A organização', 1
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 4, 2, 'Qualquer pessoa na internet', 0
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 5, 0, 'Dispensar controles de acesso', 0
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 5, 1, 'Eliminar toda responsabilidade sobre dados', 0
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 5, 2, 'Usar recursos sem manter toda infraestrutura local', 1
) o ON o.curso = c.titulo AND o.questao = q.ordem;
