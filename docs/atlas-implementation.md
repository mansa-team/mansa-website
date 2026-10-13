# Mansa — implementação da direção Atlas da compreensão

Direção e plano UI/UX apresentados no chat e implementação autorizada em 13/10/2026.

## Objetivo e limites

Recriar a apresentação institucional preservando a proposta, os fatos, o logo, os nomes dos fundadores, o estágio em desenvolvimento e a conversa com investidores no projeto, parceiros e apoiadores. Sem dados financeiros inventados, produto comercial simulado ou mudança de hospedagem. O envio continua explicitamente pelo aplicativo de e-mail enquanto Formspree não estiver configurado.

## Decisões de execução

- Instrument Sans variável, licença OFL, hospedada localmente; a tipografia forma a abertura com superfície clara e composição ampla.
- Campo vetorial próprio de relações no hero, sem canvas, seguido por três diagramas conceituais semanticamente distintos.
- Proposta com artigos em HTML, índice de âncoras e figura persistente no desktop. Figuras individuais no celular. Texto sempre acessível sem JavaScript e sem movimento.
- Pesquisa com três frentes de trabalho e fontes documentais reais; sem transformar documentação em alegações de eficácia.
- Origem e fundadores como autoria; contato e rodapé com o mesmo sistema visual.
- Retirada da abertura bloqueadora de 1,5s e do marcador de sessão correspondente. Tema automático e manual preservados.
- Estudos internos anteriores preservados fora da indexação; não utilizados como entrada da experiência pública.

## Sequência de trabalho

1. Base tipográfica, cores semânticas, composição da home e arte vetorial de abertura.
2. Em paralelo, atlas dos princípios; cabeçalho, rodapé e contato; adaptação dos testes aos contratos aprovados.
3. Integração, revisão visual desktop/celular/claro/escuro e ajustes observados.
4. TypeScript, build de produção, testes de fluxo, acessibilidade e fallback. Evidência de limitações separada de resultados.

## Critérios

Conteúdo reconhecível e legível, nenhum bloqueio para leitura/contato, âncoras estáveis, movimento reduzido, navegação por teclado, ausência de overflow horizontal, estados honestos de formulário, metadados/noindex preservados. Verificação com pessoas e telefone físico não é substituída por testes automatizados.

## Resultado verificado em 13/10/2026

- TypeScript e build de produção aprovados; dez páginas estáticas geradas.
- 104 testes aprovados em Chromium e WebKit, incluindo contato, teclado, temas, fontes públicas, ausência de JavaScript, movimento reduzido, links diretos, ampliação de texto e larguras de 320 a 1920px.
- As verificações automatizadas de acessibilidade incluídas na suite passaram nos temas claro e escuro. Revisão independente identificou e levou à correção dos links em texto, contraste das bordas dos controles e alinhamento do contato em telas largas.
- Revisão visual de home e contato em 1440×1000 e 390×844, nos temas claro e escuro; sem erro JavaScript ou transbordamento nas capturas. Evidências locais em `work/qa/`.
- Medição pontual no build local, 390×844, latência de 150ms, download de 1,6Mbps e CPU limitada em 4×: LCP de 548ms, CLS de 0,00046, aproximadamente 190KB de JavaScript codificado. Com movimento reduzido, LCP de 544ms. São medições de laboratório local, não garantia de desempenho público nem dados de campo.
- A tentativa dos 52 testes Firefox falhou antes de abrir a aplicação: o navegador instalado neste Mac informa `Could not find profile folder`. Validação nesse motor permanece pendente; a configuração CI continua incluindo os três motores.
- Nenhuma publicação, configuração de domínio ou ativação de Formspree foi realizada. Prévia de desenvolvimento local na porta 3000.
- Avaliação com pessoas, leitor de tela e dispositivos físicos permanece necessária antes de afirmar validação integral de UX/acessibilidade.
