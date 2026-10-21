-- Questões 1–6: Aula 1; 7–12: Aula 2; 13–18: Aula 3.
UPDATE cursos SET certificacao_habilitada = TRUE WHERE titulo = 'Introdução à Criptografia';

INSERT INTO avaliacoes (id, curso_id, titulo, nota_minima, limite_tentativas)
SELECT UUID(), c.id, 'Avaliação: Introdução à Criptografia', 80, 2
FROM cursos c
WHERE c.titulo = 'Introdução à Criptografia'
  AND NOT EXISTS (SELECT 1 FROM avaliacoes a WHERE a.curso_id = c.id);

INSERT INTO questoes (id, avaliacao_id, enunciado, explicacao, ordem)
SELECT UUID(), a.id, pergunta.enunciado, pergunta.explicacao, pergunta.ordem
FROM avaliacoes a
JOIN cursos c ON c.id = a.curso_id
JOIN (
    SELECT 1 AS ordem, 'Qual é uma das principais finalidades da criptografia?' AS enunciado, 'A criptografia utiliza técnicas para proteger informações e dificultar o acesso por pessoas ou sistemas não autorizados.' AS explicacao
    UNION ALL SELECT 2, 'O que é chamado de texto cifrado?', 'O texto cifrado é o resultado da transformação de uma informação legível por um mecanismo criptográfico.'
    UNION ALL SELECT 3, 'O que representa a confidencialidade na segurança da informação?', 'A confidencialidade busca restringir o acesso às informações às pessoas e aos sistemas autorizados.'
    UNION ALL SELECT 4, 'O que está relacionado à integridade de uma informação?', 'A integridade está relacionada à preservação da informação contra alterações indevidas.'
    UNION ALL SELECT 5, 'Qual é a função básica de uma chave criptográfica?', 'A chave é um parâmetro utilizado pelos mecanismos criptográficos para proteger ou recuperar informações, conforme o algoritmo empregado.'
    UNION ALL SELECT 6, 'Qual afirmação sobre criptografia está correta?', 'A criptografia deve ser combinada com autenticação, controles de acesso, backups e outras práticas de segurança.'
    UNION ALL SELECT 7, 'Na criptografia simétrica, como as chaves são utilizadas?', 'Na criptografia simétrica, a mesma chave secreta é utilizada para cifrar e decifrar a informação.'
    UNION ALL SELECT 8, 'Qual é um dos principais desafios da criptografia simétrica?', 'As partes precisam compartilhar a chave secreta de forma segura e protegê-la contra acesso não autorizado.'
    UNION ALL SELECT 9, 'A criptografia assimétrica utiliza:', 'A criptografia assimétrica utiliza duas chaves relacionadas: uma pública e uma privada.'
    UNION ALL SELECT 10, 'Qual chave da criptografia assimétrica deve permanecer protegida?', 'A chave privada deve permanecer secreta e protegida; a chave pública pode ser compartilhada.'
    UNION ALL SELECT 11, 'O que melhor define uma função hash?', 'Uma função hash gera um resumo digital dos dados de entrada, útil em mecanismos de verificação de integridade.'
    UNION ALL SELECT 12, 'Por que é incorreto dizer que uma senha armazenada com hash está simplesmente “criptografada”?', 'Diferentemente da cifragem reversível com uma chave, o hash é concebido para ser unidirecional e não para recuperar a senha original.'
    UNION ALL SELECT 13, 'Qual é a principal função do HTTPS apresentada na aula?', 'O HTTPS utiliza TLS para proteger a comunicação entre navegador e servidor; ele não elimina todos os riscos da aplicação.'
    UNION ALL SELECT 14, 'Em uma conexão HTTPS moderna, criptografia simétrica e assimétrica podem ser utilizadas em conjunto porque:', 'Mecanismos de chave pública participam da autenticação e do estabelecimento seguro da sessão; a criptografia simétrica protege os dados transmitidos.'
    UNION ALL SELECT 15, 'Qual é a função básica de um certificado digital apresentada na aula?', 'Um certificado digital associa uma identidade a uma chave pública, permitindo verificar essa associação conforme a cadeia de confiança.'
    UNION ALL SELECT 16, 'Como as senhas devem ser armazenadas de acordo com a aula?', 'Senhas devem usar algoritmos próprios para armazenamento de senhas, com salt e custo adequado, como o BCrypt, em vez de texto simples.'
    UNION ALL SELECT 17, 'Uma assinatura digital pode ajudar principalmente a verificar:', 'A verificação de uma assinatura digital com a chave pública correspondente ajuda a verificar a autenticidade e detectar alterações na informação.'
    UNION ALL SELECT 18, 'Como uma função hash pode ajudar a verificar a integridade de um arquivo?', 'Compara-se o hash calculado do arquivo recebido com um hash de referência obtido de fonte confiável; diferenças indicam alteração no conteúdo.'
 ) pergunta
WHERE c.titulo = 'Introdução à Criptografia'
  AND NOT EXISTS (
      SELECT 1 FROM questoes q WHERE q.avaliacao_id = a.id AND q.ordem = pergunta.ordem
  );

INSERT INTO alternativas (id, questao_id, texto, correta, ordem)
SELECT UUID(), q.id, opcao.texto, opcao.correta, opcao.ordem
FROM questoes q
JOIN avaliacoes a ON a.id = q.avaliacao_id
JOIN cursos c ON c.id = a.curso_id
JOIN (
    SELECT 1 AS questao, 0 AS ordem, 'Aumentar a velocidade da internet' AS texto, 0 AS correta
    UNION ALL SELECT 1, 1, 'Proteger informações contra acesso não autorizado', 1
    UNION ALL SELECT 1, 2, 'Eliminar a necessidade de autenticação', 0
    UNION ALL SELECT 1, 3, 'Substituir sistemas de backup', 0
    UNION ALL SELECT 2, 0, 'Uma informação transformada para dificultar sua leitura por pessoas não autorizadas', 1
    UNION ALL SELECT 2, 1, 'Uma informação armazenada apenas em servidores', 0
    UNION ALL SELECT 2, 2, 'Um arquivo que foi apagado permanentemente', 0
    UNION ALL SELECT 2, 3, 'Uma mensagem sem qualquer proteção', 0
    UNION ALL SELECT 3, 0, 'Garantir que todos possam acessar os dados', 0
    UNION ALL SELECT 3, 1, 'Impedir que pessoas não autorizadas tenham acesso às informações', 1
    UNION ALL SELECT 3, 2, 'Aumentar o tamanho dos arquivos', 0
    UNION ALL SELECT 3, 3, 'Manter os sistemas sempre conectados à internet', 0
    UNION ALL SELECT 4, 0, 'Garantir que ela permaneça disponível para qualquer pessoa', 0
    UNION ALL SELECT 4, 1, 'Verificar se ela não foi alterada indevidamente', 1
    UNION ALL SELECT 4, 2, 'Tornar seu conteúdo público', 0
    UNION ALL SELECT 4, 3, 'Fazer cópias automáticas do arquivo', 0
    UNION ALL SELECT 5, 0, 'Controlar mecanismos utilizados para proteger ou recuperar informações', 1
    UNION ALL SELECT 5, 1, 'Aumentar a velocidade de processamento do computador', 0
    UNION ALL SELECT 5, 2, 'Substituir a senha de todos os usuários', 0
    UNION ALL SELECT 5, 3, 'Detectar automaticamente qualquer ataque', 0
    UNION ALL SELECT 6, 0, 'Elimina todos os riscos de segurança', 0
    UNION ALL SELECT 6, 1, 'Substitui senhas e controles de acesso', 0
    UNION ALL SELECT 6, 2, 'É uma camada de proteção que deve ser combinada com outras práticas de segurança', 1
    UNION ALL SELECT 6, 3, 'É utilizada somente por especialistas em segurança', 0
    UNION ALL SELECT 7, 0, 'Uma mesma chave é utilizada para proteger e recuperar a informação', 1
    UNION ALL SELECT 7, 1, 'Nenhuma chave é necessária', 0
    UNION ALL SELECT 7, 2, 'Sempre são utilizadas três chaves', 0
    UNION ALL SELECT 7, 3, 'Uma chave é utilizada apenas para gerar hashes', 0
    UNION ALL SELECT 8, 0, 'Ela não consegue proteger grandes volumes de dados', 0
    UNION ALL SELECT 8, 1, 'A necessidade de compartilhar e proteger a chave secreta', 1
    UNION ALL SELECT 8, 2, 'Ela não utiliza nenhuma chave', 0
    UNION ALL SELECT 8, 3, 'Ela funciona apenas em aplicativos bancários', 0
    UNION ALL SELECT 9, 0, 'Apenas uma senha', 0
    UNION ALL SELECT 9, 1, 'Uma chave temporária sem proteção', 0
    UNION ALL SELECT 9, 2, 'Um par formado por chave pública e chave privada', 1
    UNION ALL SELECT 9, 3, 'Apenas funções hash', 0
    UNION ALL SELECT 10, 0, 'Chave pública', 0
    UNION ALL SELECT 10, 1, 'Chave privada', 1
    UNION ALL SELECT 10, 2, 'Chave de sessão pública', 0
    UNION ALL SELECT 10, 3, 'Chave do navegador', 0
    UNION ALL SELECT 11, 0, 'Um mecanismo reversível utilizado para recuperar o texto original', 0
    UNION ALL SELECT 11, 1, 'Um processo que gera um resumo digital da informação', 1
    UNION ALL SELECT 11, 2, 'Uma segunda forma de criptografia simétrica', 0
    UNION ALL SELECT 11, 3, 'Um método utilizado apenas para transmitir arquivos', 0
    UNION ALL SELECT 12, 0, 'Porque hash é um processo concebido para ser unidirecional, e não para recuperar a informação original', 1
    UNION ALL SELECT 12, 1, 'Porque o hash utiliza sempre uma chave pública', 0
    UNION ALL SELECT 12, 2, 'Porque hashes funcionam apenas em documentos', 0
    UNION ALL SELECT 12, 3, 'Porque senhas não podem utilizar mecanismos de segurança', 0
    UNION ALL SELECT 13, 0, 'Proteger a comunicação entre navegador e servidor', 1
    UNION ALL SELECT 13, 1, 'Aumentar o espaço disponível no servidor', 0
    UNION ALL SELECT 13, 2, 'Substituir o login dos usuários', 0
    UNION ALL SELECT 13, 3, 'Impedir qualquer tipo de ataque ao sistema', 0
    UNION ALL SELECT 14, 0, 'As duas realizam exatamente a mesma função', 0
    UNION ALL SELECT 14, 1, 'Mecanismos de chave pública ajudam no estabelecimento da comunicação, enquanto a criptografia simétrica protege os dados da sessão', 1
    UNION ALL SELECT 14, 2, 'A criptografia simétrica serve apenas para gerar certificados', 0
    UNION ALL SELECT 14, 3, 'A criptografia assimétrica substitui completamente a simétrica', 0
    UNION ALL SELECT 15, 0, 'Aumentar a velocidade de um site', 0
    UNION ALL SELECT 15, 1, 'Associar uma identidade, como um domínio, a uma chave pública', 1
    UNION ALL SELECT 15, 2, 'Armazenar a senha do usuário', 0
    UNION ALL SELECT 15, 3, 'Substituir o servidor da aplicação', 0
    UNION ALL SELECT 16, 0, 'Em texto simples', 0
    UNION ALL SELECT 16, 1, 'Em documentos compartilhados', 0
    UNION ALL SELECT 16, 2, 'Utilizando técnicas apropriadas de hash para armazenamento de senhas', 1
    UNION ALL SELECT 16, 3, 'Utilizando apenas a chave pública do servidor', 0
    UNION ALL SELECT 17, 0, 'A velocidade e o tamanho de um arquivo', 0
    UNION ALL SELECT 17, 1, 'A autenticidade e a integridade de uma informação', 1
    UNION ALL SELECT 17, 2, 'A quantidade de usuários de um sistema', 0
    UNION ALL SELECT 17, 3, 'O espaço disponível no banco de dados', 0
    UNION ALL SELECT 18, 0, 'Comparando o hash do arquivo original com o hash do arquivo recebido', 1
    UNION ALL SELECT 18, 1, 'Criptografando o arquivo com duas senhas diferentes', 0
    UNION ALL SELECT 18, 2, 'Enviando o arquivo novamente ao servidor', 0
    UNION ALL SELECT 18, 3, 'Transformando o arquivo em uma chave privada', 0
 ) opcao ON opcao.questao = q.ordem
WHERE c.titulo = 'Introdução à Criptografia'
  AND NOT EXISTS (
      SELECT 1 FROM alternativas existente WHERE existente.questao_id = q.id AND existente.ordem = opcao.ordem
  );
