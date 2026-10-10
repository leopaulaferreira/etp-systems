# Perfil

A identidade e os dados editáveis do colaborador vêm de `GET /api/colaborador/perfil`. As alterações de conta e notificações em Configurações usam `PUT /api/colaborador/perfil`; e-mail e empresa são definidos pela conta autenticada e não podem ser editados nessa tela. Cursos, avaliações e certificados consultam seus próprios endpoints.

Preferências de formato, lembretes e acessibilidade continuam ajustes locais do navegador. A plataforma ainda não envia e-mail ou push a partir desses controles.
