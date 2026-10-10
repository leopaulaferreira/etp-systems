# Painel da empresa

As rotas `/empresa/dashboard`, `/empresa/colaboradores`, `/empresa/avaliacoes` e `/empresa/certificados` usam `GET /api/empresa/painel`. O backend seleciona os colaboradores pela empresa da conta RH autenticada. O frontend valida o contrato e o UUID da empresa da sessão antes de exibir a resposta. Os dados são buscados uma vez no layout, compartilhados entre as telas da empresa e descartados quando a sessão muda. Falhas mostram uma mensagem com opção de tentar novamente; não são substituídas por números fictícios.

O painel calcula os indicadores a partir das inscrições retornadas: pessoas em aprendizagem, cursos com 100% de progresso, média da última nota por pessoa/curso, certificados emitidos e distribuição do progresso. Nota ausente aparece como “—” e não entra na média; nota zero entra. Conclusão de curso e emissão de certificado são eventos distintos. As conclusões recentes usam a data do progresso, enquanto o detalhe do certificado usa a data de emissão. O diálogo individual mostra a categoria do curso, sem inferir uma trilha não registrada.

Colaboradores permite buscar por nome/e-mail e filtrar por situação e área. Avaliações e Certificados permitem buscar e filtrar por curso. Colaboradores sem cursos, notas, certificados ou área são exibidos sem valores fictícios. Os filtros atuam sobre a lista; os indicadores representam a empresa inteira.

O login, a sessão e as permissões continuam centralizados em AuthContext e RequireAuth. O token fica em sessionStorage e a recarga valida `/api/auth/me`. A API de RH aceita somente o perfil `EMPRESA`; um colaborador não acessa essas consultas.

As páginas `/empresa/configuracoes/dados`, `/empresa/configuracoes/conta` e `/empresa/configuracoes/seguranca` mantêm preferências locais em localStorage, isoladas por empresa e usuário. O nome inicial da organização vem da API; alterações de nome/contato ficam neste navegador e não alteram o cadastro do banco. O e-mail de acesso vem da sessão e é somente leitura. Segurança oferece logout; a alteração de senha aguarda um endpoint próprio.

Em desenvolvimento, `ETP_DEMO_ENABLED=true` e `ETP_DEMO_COMPANY_DATA_ENABLED=true` cadastram oito colaboradores ilustrativos no MySQL. Eles não podem fazer login. O arquivo `company.mock.ts` foi removido após a integração. A conta de colaborador usada para login também aparece para o RH quando pertence à mesma empresa. Alguns resultados que existiam no antigo mock não existem no banco, pois os respectivos cursos ainda não têm avaliação ou certificação habilitada.

Validação: `npm run test:empresa` cobre o contrato da API, indicadores, dados vazios, filtros e ordenação. `ETP_DB_TEST=true mvn -f backend/pom.xml verify` cobre permissões e isolamento entre empresas com MySQL. Build e lint do frontend devem passar antes de publicar.
