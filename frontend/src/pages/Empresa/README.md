# Painel da empresa

As rotas `/empresa/dashboard`, `/empresa/colaboradores`, `/empresa/avaliacoes` e `/empresa/certificados` usam `GET /api/empresa/painel`. O backend seleciona os colaboradores pela empresa da conta RH autenticada. O frontend valida o contrato e o UUID da empresa da sessão antes de exibir a resposta. Os dados são compartilhados entre as telas da empresa, atualizados quando a aba recebe foco e descartados quando a sessão muda. Falhas mostram uma mensagem com opção de tentar novamente; não são substituídas por números fictícios.

O painel calcula os indicadores a partir das inscrições retornadas: pessoas em aprendizagem, cursos com 100% de progresso, média da última nota por pessoa/curso, certificados emitidos e distribuição do progresso. Nota ausente aparece como “—” e não entra na média; nota zero entra. Conclusão de curso e emissão de certificado são eventos distintos. As conclusões recentes usam a data do progresso, enquanto o detalhe do certificado usa a data de emissão. O diálogo individual mostra a categoria do curso, sem inferir uma trilha não registrada.

Colaboradores permite buscar por nome/e-mail e filtrar por situação e área. Avaliações e Certificados permitem buscar e filtrar por curso. Colaboradores sem cursos, notas, certificados ou área são exibidos sem valores fictícios. Os indicadores da Visão geral representam a empresa inteira. Em Avaliações, a média e as contagens acompanham os filtros e consideram a última nota de cada par colaborador/curso; nota zero participa da média e a seleção vazia mostra “—”. Em Certificados, os totais do acervo representam a empresa inteira, e a contagem de registros indica os resultados filtrados.

O login, a sessão e as permissões continuam centralizados em AuthContext e RequireAuth. O token fica em sessionStorage e a recarga valida `/api/auth/me`. A API de RH aceita somente o perfil `EMPRESA`; um colaborador não acessa essas consultas.

As páginas `/empresa/configuracoes/dados`, `/empresa/configuracoes/conta` e `/empresa/configuracoes/seguranca` mantêm preferências locais em localStorage, isoladas por empresa e usuário. O nome inicial da organização vem da API; alterações de nome/contato ficam neste navegador e não alteram o cadastro do banco. O e-mail de acesso vem da sessão e é somente leitura. Segurança oferece logout; a alteração de senha aguarda um endpoint próprio.

Em desenvolvimento, `ETP_DEMO_ENABLED=true` e `ETP_DEMO_COMPANY_DATA_ENABLED=true` cadastram oito colaboradores ilustrativos no MySQL. Eles não podem fazer login. O arquivo `company.mock.ts` foi removido após a integração. A conta de colaborador usada para login também aparece para o RH quando pertence à mesma empresa. Alguns resultados que existiam no antigo mock não existem no banco, pois os respectivos cursos ainda não têm avaliação ou certificação habilitada.

Validação: `npm run test:empresa` cobre o contrato da API, indicadores, dados vazios, filtros e ordenação. `ETP_DB_TEST=true mvn -f backend/pom.xml verify` cobre permissões e isolamento entre empresas com MySQL. Build e lint do frontend devem passar antes de publicar.

## Tentativa extra autorizada pelo RH

Em **Avaliações**, abra o resultado de um colaborador para consultar as tentativas. Quando todas estiverem esgotadas e não houver aprovação, informe o motivo e use **Liberar uma tentativa extra**. O mesmo controle aparece nos detalhes de um colaborador, nos cursos com avaliação entregue.

A autorização vale apenas para aquele colaborador e curso. O servidor valida a empresa da conta RH, preserva todas as notas e registra responsável, motivo, data e a tentativa após a qual ocorreu a liberação. Uma autorização pendente não pode ser duplicada. O histórico aparece no próprio painel. O colaborador usa **Atualizar avaliações** para receber o novo limite.

## Visualização do certificado emitido

Os cartões de Certificados exibem a miniatura à direita do curso e do titular. **Ver certificado** abre o documento com ajuste à tela, ampliação de 100% a 200% e download em PDF. A área ampliada tem rolagem própria e pode ser percorrida pelo teclado.

O campo `certificate` de cada curso no painel traz a mesma resposta usada na consulta do colaborador: ID, titular, curso, descrição, carga horária, código e data. A prévia usa `CertificatePreview` e o PDF usa `downloadCertificate`, os mesmos componentes do fluxo após a avaliação. A leitura não emite outro certificado. O frontend valida a correspondência do curso, código e data; quando os dados completos não chegam, mantém os detalhes disponíveis sem inventar uma prévia.

A comparação entre o certificado do RH e o do colaborador é coberta nos testes de contrato, desenho e PDF. O teste de integração do painel verifica o documento após uma aprovação real, a preservação do registro e o isolamento entre empresas. Os testes de navegador cobrem miniatura, ampliação, PDF e foco em cinco tamanhos de tela.
