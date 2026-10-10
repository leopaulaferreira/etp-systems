# Painel da empresa

Rota `/empresa/dashboard`, acessível com uma conta de perfil `EMPRESA`. Reutiliza
AppLayout, PageHero, IllustratedIcon, Avatar, Input, Button e CertificateDialog.
O acesso já usa autenticação real; os indicadores e colaboradores ainda são ilustrativos.

## Dados e regras

`../../mocks/company.mock.ts` reúne a identidade de RH e oito colaboradores com
suas inscrições, progresso, última nota e certificado. `company.ts` filtra os
registros pelo ID da empresa da sessão antes de montar qualquer lista ou indicador.

- Colaboradores: quantidade de pessoas vinculadas à empresa.
- Em aprendizagem: pessoas que iniciaram pelo menos um curso e ainda não
  concluíram todos os cursos atribuídos.
- Cursos concluídos: inscrições com 100% de progresso, contando cada pessoa/curso.
- Média nas avaliações: média das últimas notas disponíveis de cada pessoa/curso.
  Ausência de nota aparece como “—” e não entra na média; nota zero entra.
- Distribuição: inscrições concluídas, em andamento e não iniciadas.
- Conclusões recentes: três inscrições concluídas mais recentemente.

Busca por nome/e-mail ignora acentos e combina situação e área. Os filtros afetam
somente a lista; os indicadores continuam representando a empresa inteira.
Os resumos individuais mostram os cursos, respectivas trilhas, progresso,
notas e códigos dos certificados. A associação à trilha é um rótulo do mock,
sem gestão ou matrícula em trilhas nesta página.

## Sessão e navegação

AuthContext recebe perfil, identidade e UUID real da empresa pela API de autenticação.
O token persiste em sessionStorage e a recarga valida a sessão por `/api/auth/me`.
Logout remove o token; flags de sessões mock antigas são ignoradas. RequireAuth
redireciona acessos ao painel do outro perfil; sidebar e topbar exibem a navegação
e a identidade correspondentes.
Ajuda é compartilhada e seus links respeitam o perfil.

A autenticação já é real, mas indicadores, colaboradores e resultados continuam
usando exclusivamente o conjunto sintético do mock, separado do UUID da sessão.
A futura API de Empresa/RH deverá filtrar os registros pelo vínculo do usuário
autenticado e validar as permissões em todas as consultas.

## Preparação para dados reais

As páginas existentes podem receber respostas de consultas somente leitura do backend. O filtro da empresa deve usar o vínculo do usuário autenticado, nunca o identificador fixo `etp` deste mock. Colaboradores sem cursos, notas ou certificados precisam aparecer com valores vazios coerentes. A área/departamento já é opcional no banco (migração V13). Os nomes de trilhas presentes em `company.mock.ts` são apenas rótulos ilustrativos.

O ambiente de desenvolvimento pode cadastrar os oito colaboradores do mock no MySQL com `ETP_DEMO_COMPANY_DATA_ENABLED=true` (e `ETP_DEMO_ENABLED=true`), sem permitir login para essas contas. A página ainda lê exclusivamente o mock. Para validar a futura API, também será necessária outra empresa para testar isolamento. Progresso de 100% informado manualmente, aprovação na avaliação e emissão do certificado são eventos distintos. Algumas notas e certificados do mock não existem no backend porque os respectivos cursos não têm avaliação ou certificação habilitada. A integração deve mostrar cada medida com seu nome correto e preservar a interface atual sem exibir números fictícios quando a API falhar.

## Validação

`npm run test:empresa` cobre indicadores, isolamento da seleção, ausência de notas,
zero real, filtros e ordenação. `npm run test:auth` cobre a sessão e suas falhas.
As demais suítes do frontend, build e lint também foram executados.

No navegador: login dos dois perfis, refresh, redirecionamentos, filtros combinados,
lista vazia, modal por teclado, Tab/Escape/retorno de foco, ajuda, logout e drawer.
Layout conferido em 320, 390, 768, 1024, 1280 e 1440 px.

## Áreas da empresa

A sidebar organiza links diretos em Painel da empresa e Configurações:

- `/empresa/dashboard`: visão geral, indicadores, progresso e conclusões recentes.
- `/empresa/colaboradores`: lista completa, filtros e resumo individual.
- `/empresa/avaliacoes`: últimas notas por colaborador/curso, busca e filtro por curso.
- `/empresa/certificados`: consulta por pessoa, curso ou código e detalhes da conquista.
- `/empresa/configuracoes/dados`: nome da organização e e-mail de contato.
- `/empresa/configuracoes/conta`: nome do responsável e e-mail da conta.
- `/empresa/configuracoes/seguranca`: informação de acesso e logout.

Configurações persistem em localStorage com chave por empresa e usuário. O nome do responsável
atualiza a topbar e o nome da organização atualiza os cabeçalhos. Cancelar restaura
os valores salvos; falhas de armazenamento são informadas. Isso não altera credenciais:
o e-mail de acesso vem da API e é somente leitura; a troca de senha aguarda um endpoint próprio. Não se armazenam senhas aqui.
Não há emissão/download de certificados, tentativas ou gestão de colaboradores nestas áreas.
