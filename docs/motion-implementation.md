# Atlas motion — implementação

Plano apresentado no chat e autorizado pelo usuário em 13/10/2026. Execução na árvore atual para preservar a implementação ainda não versionada.

## Contrato aprovado

Abertura com assinatura vetorial (~800ms), lente responsiva apenas ao ponteiro fino, três coreografias explicativas, microinterações curtas e reversíveis. Scroll desktop suavizado apenas se preservar navegação/foco/histórico; touch, movimento reduzido e economia de dados usam comportamento nativo. Conteúdo sempre presente no HTML.

**Correção de escopo solicitada pelo usuário em 13/10:** a abertura deve incluir uma intro fullscreen com barra antes de revelar o site. A regra anterior de entrada imediata foi substituída por esse pedido explícito. O indicador contextual de navegação permanece separado.

## Intro de entrada

`EntryIntro` fornece HTML/CSS; `entry-script.ts` inicia no head antes da pintura, independentemente de React. Marca central sobre fundo verde, campo de linhas e barra na base. A barra acompanha três marcos de preparação (DOM, fonte e logo), sem alegar medir bytes da rede. A assinatura visual dura no mínimo 1,4s; a barra leva até 850ms para assentar, seguida por saída de 640ms. A coreografia do hero começa durante essa saída.

Abre na entrada/reload da home, sem armazenar um marcador de sessão. Rotas internas, âncoras diretas, restauração pelo histórico, movimento reduzido e saveData pulam a abertura. Pular, Tab, Escape, aba oculta ou mudança para preferência reduzida encerram imediatamente. Prazo máximo de 4,5s libera a leitura mesmo com recursos indisponíveis. Sem JavaScript, a intro permanece oculta pelo CSS. Não usa `app/loading.tsx`, preservando o conteúdo completo no HTML.

Capturas e gravação: `work/qa/entry-desktop.png`, `entry-mobile.png` e `mansa-entry-preview.webm`. A medição de desempenho e os 170 testes abaixo são a linha de base anterior à intro; a validação da intro é registrada separadamente após a execução.

Validação da intro: build e TypeScript aprovados; **24/24 testes de entrada em Chromium/WebKit passaram**. A suíte ampliada teve 171/178 aprovados na primeira execução; os casos restantes foram revalidados após aguardar o fim da intro nas pré-condições de menu/scroll e remover um clique de ensaio que o WebKit executava como navegação real sem JavaScript. Uma verificação de resize/teclado no Chromium apresentou falha intermitente e passou na execução isolada. Capturas desktop/celular sem overflow, erro de execução ou aviso de hidratação.

Medição com intro, nas mesmas condições móveis de laboratório: FCP 652ms, LCP 2356ms, CLS 0; movimento reduzido (sem intro): FCP/LCP 616ms, CLS 0,00046. JavaScript: 193.054 bytes. O LCP normal agora inclui o tempo de apresentação da abertura; não deve ser comparado à entrada imediata como se o fluxo fosse o mesmo.

## Trabalho

- [x] HeroMotion: linhas, lente, relações; interrupção por scroll/teclado; repouso sem RAF ocioso.
- [x] Atlas: perspectiva, constância, compreensão; desktop acompanha leitura, mobile entrada única.
- [x] Interface: pressão/hover/foco/menu; loading contextual para navegação pendente.
- [x] Scroll: Lenis desktop isolado, comparação e testes de fallback e histórico.
- [x] Editorial: hierarquia de entradas para títulos, pesquisa e desenhos.
- [x] Integração: TypeScript/build, testes Chromium/WebKit, screenshots, perfil de desempenho e revisão independente.

## Implementação

| Camada      | Comportamento                                                                                                                                                                | Limites                                                                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hero        | Linhas 560ms, lente 640ms com 120ms de atraso, relações 440ms e legendas 360ms; sequência termina em 760ms. Lente responde ao mouse em até ±10px horizontal / ±6px vertical. | Conteúdo sempre visível; entrada dispensada em âncora direta; scroll, teclado, saída da tela e aba oculta encerram efeitos. Sem loop em repouso. |
| Perspectiva | Empresa primeiro, depois relações e contexto.                                                                                                                                | Desktop segue a posição de leitura e pode reverter. Rótulos permanecem legíveis.                                                                 |
| Constância  | Contribuições entram em sequência sobre a linha de tempo.                                                                                                                    | Diagrama conceitual; sem simulação de retorno ou novos dados financeiros.                                                                        |
| Compreensão | Informação, conexões e explicação aparecem em ordem.                                                                                                                         | Mobile executa uma entrada finita de 560ms; cada artigo conserva seu próprio SVG.                                                                |
| Editorial   | Títulos 520ms/18px, documento 500ms/12px, pesquisa 420ms/8px; desenhos da pesquisa 600ms.                                                                                    | Uma vez por montagem; foco e entrada fora da tela encerram o efeito.                                                                             |
| Controles   | Pressão 140ms; menu abre 240ms e fecha 160ms, reversível.                                                                                                                    | Hitboxes estáveis; teclado/Escape imediatos; tema muda cores em conjunto para preservar contraste.                                               |
| Rolagem     | Lenis 1.3.26, `lerp: 0.22`, importação condicional; relógio acionado por wheel.                                                                                              | Desktop ≥1080px com hover/ponteiro fino. Touch/teclado/âncoras/histórico nativos. Desligado com movimento reduzido, saveData ou aba oculta.      |
| Loading     | `useLinkStatus` nos CTAs do cabeçalho; marca e três traços se alinham uma vez durante espera real.                                                                           | Sem porcentagem simulada, tempo mínimo ou overlay bloqueante. O painel some ao resolver a navegação.                                             |

HTML e SVG completos são o estado base. WAAPI, IntersectionObserver e Lenis só aprimoram a experiência. Os estudos Three.js históricos continuam nas rotas internas; nenhum novo WebGL foi adicionado à home.

O loading da raiz foi removido durante a validação: a boundary substituía a home por um fallback no HTML inicial. O indicador contextual preserva leitura e contato sem JavaScript, mesmo quando chunks não chegam.

## Evidências locais — 13/10/2026

- Build de produção, TypeScript, Prettier e `git diff --check` passaram. Rodada final: **170 testes Chromium/WebKit aprovados**, incluindo mudança da preferência de movimento durante abertura/fechamento do menu, saveData, ausência de JavaScript e chunks bloqueados.
- Capturas revisadas em desktop 1440px, celular 390px e tema escuro, sem overflow ou erros de execução. Suíte verifica também larguras de 320px a 1920px.
- Comparação de wheel de 640px: scroll nativo concentrou o deslocamento em um quadro; suavização distribuiu em passos máximos aproximados de 127–135px e assentou em cerca de 0,5s. Testes instrumentados registraram zero callbacks RAF em 500ms de repouso antes e depois de dois gestos.
- Medição local de produção: viewport 390×844, RTT 150ms, download 1,6Mbps e CPU 4× mais lenta. Normal: LCP/FCP 624ms, CLS 0; movimento reduzido: LCP/FCP 560ms, CLS 0,00046. JavaScript transferido: 192.960 bytes. São resultados de laboratório, sem equivalência a dados de campo.
- Revisão independente encontrou RAF ocioso na rolagem e animação editorial continuando fora da tela; ambos corrigidos e cobertos por regressões.
- Artefatos ignorados pelo Git: `work/qa/mansa-motion-preview.webm`, capturas `desktop-*`, `mobile-*`, `night-*` e `next-performance.json`.
- Firefox não foi validado neste Mac porque o navegador instalado falha antes de abrir a aplicação. Trackpad, dispositivos físicos e leitor de tela ainda exigem revisão humana. Nada foi publicado.

## Critérios de revisão

Mudança dinâmica da preferência; fontes/chunks lentos ou ausentes; ação durante animação; voltar/avançar/deep links; touch e teclado. Não competir pelo mesmo transform entre controladores. Não animar containers da página inteira. Não mudar fatos, promessas financeiras, formulário ou metadados. Nenhuma publicação nesta etapa.

## Verificação antes do PR — 13/10/2026

Nova execução integral no build final: **178/178 testes Chromium/WebKit aprovados**. Build, TypeScript, Prettier e verificação do diff passaram. Revisão estática independente não encontrou achados P1/P2. Firefox e validação em dispositivos físicos permanecem pendentes.
