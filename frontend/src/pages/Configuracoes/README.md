# Configurações do colaborador

A página `/configuracoes` organiza seis seções, selecionadas pelo parâmetro `secao`: `estudo` (padrão), `conta`, `notificacoes`, `acessibilidade`, `seguranca` e `privacidade`. No desktop, o menu apresenta a identidade do colaborador e um link para o perfil; no celular, um seletor com rótulos preserva a largura do conteúdo.

- **Estudo:** objetivo e nível são salvos automaticamente na API do perfil. Os cartões de formatos registram preferências locais e não filtram o catálogo. Os lembretes são configurados em Notificações.
- **Conta:** nome, telefone, cargo e localização são editáveis; e-mail e empresa aparecem apenas para consulta. O formulário mantém alterações ao alternar seções, permite cancelar e salva somente os campos editados. Uma gravação não reaplica valores antigos de notificações ou aprendizagem.
- **Notificações:** a preferência de avisos do cabeçalho usa a API; o controle fica indisponível durante a gravação e volta ao valor confirmado em caso de falha. Os tipos de lembrete ficam no navegador e alimentam uma prévia ilustrativa. Não há envio de e-mail ou push.
- **Acessibilidade:** texto ampliado e redução de movimentos afetam imediatamente a interface. Esses ajustes são compartilhados no navegador, conforme o provedor de acessibilidade existente. A seção oferece uma amostra de leitura e instruções de teclado.
- **Segurança:** apresenta os dados da sessão e o logout. A alteração de senha continua indisponível. Sair exige confirmação quando há edição pendente da conta ou respostas de avaliações ainda não enviadas.
- **Privacidade:** exporta um JSON do perfil e das preferências; não exporta todo o histórico de aprendizagem. A limpeza exige confirmação, restaura os campos opcionais e as preferências, preservando identidade, conta, inscrições, avaliações e certificados.

O nome e os demais dados do perfil continuam usando `ProfileContext` e sua fila de gravações. Os formatos e lembretes usam a chave `etp-study-settings-v1:<usuarioId>`. Nenhum endpoint foi acrescentado para a reorganização visual.

Validação: `profile.spec.mjs` cobre persistência de objetivo/nível e recuperação de falhas. `collaborator-settings.spec.mjs` cobre navegação, edição pendente, notificações, preferências locais, teclado, texto ampliado, exportação, limpeza e confirmação de logout. Ambos executam em cinco tamanhos de tela com API simulada, sem alterar contas reais.
