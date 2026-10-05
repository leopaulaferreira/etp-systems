# Painel da empresa

Rota `/empresa/dashboard`, acessível ao selecionar Empresa no login mock. Reutiliza
AppLayout, PageHero, IllustratedIcon, Avatar, Input, Button e CertificateDialog.
Não há backend nem alteração no schema do banco.

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

AuthContext guarda o perfil escolhido e o ID da empresa do mock. O perfil persiste
em sessionStorage; sessões anteriores sem perfil são tratadas como colaborador.
Logout remove sessão e perfil. RequireAuth redireciona acessos ao painel do outro
perfil; sidebar e topbar exibem a navegação e a identidade correspondentes.
Ajuda é compartilhada e seus links respeitam o perfil.

Essas regras servem para o fluxo do protótipo. Não representam autenticação ou
isolamento de dados seguros: na integração, a API deverá validar a identidade,
as permissões e o vínculo empresarial em todas as consultas.

## Validação

`npm run test:empresa` cobre indicadores, isolamento da seleção, ausência de notas,
zero real, filtros, ordenação, persistência e limpeza de sessão. As outras quatro
suítes do frontend, build e lint também foram executados.

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

Configurações persistem em localStorage com chave por empresa. O nome do responsável
atualiza a topbar e o nome da organização atualiza os cabeçalhos. Cancelar restaura
os valores salvos; falhas de armazenamento são informadas. Isso não altera credenciais:
a troca de senha depende da autenticação futura. Não se armazenam senhas aqui.
Não há emissão/download de certificados, tentativas ou gestão de colaboradores nestas áreas.
