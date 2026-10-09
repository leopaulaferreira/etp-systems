INSERT INTO alternativas (id, questao_id, texto, correta, ordem)
SELECT UUID(), q.id, nova.texto, 0, 3
FROM questoes q
JOIN avaliacoes a ON a.id = q.avaliacao_id
JOIN cursos c ON c.id = a.curso_id
JOIN (
 SELECT 'LGPD na Prática' curso, 1 ordem, 'Código de um produto sem relação com uma pessoa' texto
 UNION ALL SELECT 'LGPD na Prática', 2, 'Guardar uma cópia local depois de concluir a tarefa'
 UNION ALL SELECT 'LGPD na Prática', 3, 'Em uma conta de e-mail pessoal para agilizar o envio'
 UNION ALL SELECT 'LGPD na Prática', 4, 'Apenas minimizar a janela do sistema'
 UNION ALL SELECT 'LGPD na Prática', 5, 'Apagar o e-mail enviado sem comunicar ninguém'
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 1, 'Usar uma senha longa e compartilhá-la com a equipe'
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 2, 'Conferir apenas o nome exibido do remetente'
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 3, 'Impedir automaticamente qualquer acesso indevido'
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 4, 'Permitir o uso da mesma senha em todos os serviços'
 UNION ALL SELECT 'Fundamentos de Segurança da Informação', 5, 'Apenas fechar a janela do navegador'
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 1, 'Recursos disponíveis apenas no servidor local'
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 2, 'Aumentar a capacidade sem poder reduzi-la depois'
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 3, 'Servidor virtual configurado e mantido pela empresa'
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 4, 'Cada colaborador individualmente, sem regras da organização'
 UNION ALL SELECT 'Computação em Nuvem: Conceitos e Aplicações', 5, 'Transferir todas as decisões sobre dados ao provedor'
) nova ON nova.curso = c.titulo AND nova.ordem = q.ordem
WHERE NOT EXISTS (
    SELECT 1 FROM alternativas existente WHERE existente.questao_id = q.id AND existente.ordem = 3
);
