# Perfil

A identidade e os dados editáveis do colaborador vêm de `GET /api/colaborador/perfil`. As alterações de conta e notificações em Configurações usam `PUT /api/colaborador/perfil`; e-mail e empresa são definidos pela conta autenticada e não podem ser editados nessa tela. Cursos, avaliações e certificados consultam seus próprios endpoints.

Preferências de formato, lembretes e acessibilidade continuam ajustes locais do navegador. A plataforma ainda não envia e-mail ou push a partir desses controles.

Objetivo de aprendizagem e nível também vêm da API, inclusive em outro navegador. Valores antigos desses campos no armazenamento local são ignorados. Leituras, alterações e limpeza do perfil são executadas em ordem; cada gravação usa o último perfil confirmado. Uma falha permite nova tentativa e provoca uma releitura antes da próxima gravação.

A organização visual e os comportamentos das seis seções de Configurações estão descritos no [guia da página](../Configuracoes/README.md).
