# Perfil

A identidade e os dados editáveis do colaborador vêm de `GET /api/colaborador/perfil`. As alterações de conta e notificações em Configurações usam `PUT /api/colaborador/perfil`; e-mail e empresa são definidos pela conta autenticada e não podem ser editados nessa tela. Cursos, avaliações e certificados consultam seus próprios endpoints.

Preferências de formato, lembretes e acessibilidade continuam ajustes locais do navegador. A plataforma ainda não envia e-mail ou push a partir desses controles.

Objetivo de aprendizagem e nível também vêm da API, inclusive em outro navegador. Valores antigos desses campos no armazenamento local são ignorados. Leituras, alterações e limpeza do perfil são executadas em ordem; cada gravação usa o último perfil confirmado. Uma falha permite nova tentativa e provoca uma releitura antes da próxima gravação.

A organização visual e os comportamentos das seis seções de Configurações estão descritos no [guia da página](../Configuracoes/README.md).

## Próximo passo

O sexto cartão do perfil utiliza os cursos e as avaliações já consultados pela página, sem novos endpoints. Primeiro procura um curso com 100% de progresso e avaliação disponível, sem aprovação e com tentativas restantes; autorizações extras do RH entram no limite recebido da API. O link abre a avaliação daquele curso sem iniciar ou enviar uma tentativa.

Se não houver uma avaliação elegível, destaca o curso não concluído com maior progresso e aulas disponíveis. Em caso de empate, preserva a ordem recebida. O acesso à página de estudo reutiliza a retomada da última aula. Cursos sem aulas não são sugeridos para estudo; quando não há ação elegível, o cartão oferece o catálogo.

Durante o carregamento, o cartão aguarda os dados. Uma falha exibe uma ação de atualização, sem interpretar indisponibilidade como ausência de cursos. O cartão compartilha as dimensões e os estilos das demais seções e ocupa a última posição da grade.

Validação: `tests/profile-next-step.test.mjs` cobre prioridades, tentativas extras, aprovação, limites e cursos sem aulas. `tests/browser/profile-next-step.spec.mjs` verifica os destinos, o estado de erro e a apresentação em cinco tamanhos de tela.
