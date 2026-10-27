# Revisão de telas pequenas

Execute em `frontend/`:

```sh
npm ci
npx playwright install chromium
npm run test:mobile
```

A suíte inicia o Vite em `127.0.0.1:5178` e o encerra ao terminar. A porta deve estar livre. Não inicia o backend nem modifica o banco. Para usar um Chromium já instalado, defina `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` com o caminho do executável.

São 75 cenários: quinze fluxos em cinco tamanhos de viewport — 320×568, 390×844, 844×390 (horizontal), 768×1024 e 1440×900 (controle desktop).

- Menu lateral: abertura, fechamento, Escape, retorno do foco, rolagem até a ajuda e navegação.
- Menu da conta e controles principais: áreas de toque de pelo menos 44 pixels.
- Aula: reprodução do MP4 real de Cloud, navegação entre aulas, erro ao salvar, nova tentativa e estado preservado após recarregar.
- Avaliação: respostas, reprovação, tentativa restante, aprovação, erro na consulta de certificado e recuperação, além do esgotamento de tentativas.
- Certificado: visualização dentro do resultado e na página de certificados, download do PDF, fechamento do diálogo e busca sem resultados.
- Retomada da última aula, prioridade de links explícitos e proteção de respostas ao fechar, navegar, voltar, recarregar e sair da conta.
- RH: motivo obrigatório, liberação individual, histórico persistido na API simulada e bloqueio de autorização duplicada.
- Certificados do RH: miniatura à direita, documento com titular/código originais, ampliação com rolagem interna e teclado, PDF e retorno do foco ao fechar.
- Certificados do RH sem dados completos: mantém os detalhes e não inventa prévia nem download.
- Configurações do RH: edição, cancelamento, persistência local entre páginas, e-mail de acesso somente para consulta, falha de armazenamento com nova tentativa e logout. A indisponibilidade do painel não impede editar o responsável nem sobrescreve o nome da organização.
- Perfil: valores da API prevalecem sobre preferências locais antigas; alterações rápidas preservam ambos os campos; falha de gravação permite tentar novamente.
- Configurações do colaborador: edição de conta preservada entre seções, falha de notificações com nova tentativa, preferências locais, acessibilidade por teclado, exportação JSON, limpeza com confirmação e proteção de respostas ao sair.
- Verificação de largura: página, área principal, menu e diálogos sem rolagem horizontal.

As respostas da API e a sessão são simuladas em `mobile.fixture.mjs`, com nomes e títulos longos. Isso permite reproduzir erros de conexão e resultados sem consumir tentativas de contas reais. O vídeo e o gerador de PDF são os do projeto. Estes testes de interface complementam os testes de integração do backend.

Capturas de menu, aula, resultado e certificado ficam em `test-results/`. Falhas também geram captura e trace; esses arquivos não entram no Git.

A revisão foi feita em Chromium com emulação de viewport e toque, incluindo inspeção das capturas. O comportamento específico de Safari/iOS, teclado virtual, recortes físicos da tela e o destino do PDF no aparelho ainda exige conferência em dispositivo real.
