# Certificados

A página `/certificados` usa a sessão JWT e consulta `GET /api/colaborador/certificados`. A API retorna certificados emitidos para o usuário autenticado, com nome do titular, curso, código único e data de emissão. A página também combina inscrições e avaliações disponíveis para mostrar cursos que ainda aguardam certificação. Esses cursos não permitem download.

A aprovação em uma avaliação emite um certificado quando o curso está habilitado para certificação. O progresso informado manualmente não autoriza a emissão. Nesta fase, Segurança da Informação e Computação em Nuvem estão habilitados; LGPD na Prática aguarda a terceira videoaula e a revisão das questões.

A busca, os filtros e a ordenação atuam sobre os dados recebidos da API. O PDF é gerado localmente com o nome do titular e o código fornecidos pelo backend. Os downloads são contabilizados apenas durante a visita atual; não existe histórico persistente de downloads ou verificação pública do código. Em caso de falha na API, a página mostra uma opção para tentar novamente.

Validação em `frontend/`: `npm run test:certificados`, `npm run build` e `npm run lint`. O arquivo `tests/fixtures/certificados.fixture.ts` permanece como fixture dos testes de filtros e PDF; a página não o utiliza.
