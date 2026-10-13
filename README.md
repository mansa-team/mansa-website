# Mansa

Site institucional em Next.js App Router + React + TypeScript. A direção “Atlas da compreensão” usa tipografia ampla, desenhos vetoriais próprios e uma narrativa documental para apresentar a proposta de investimento de longo prazo, mantendo explícito que o projeto está em desenvolvimento.

## Executar

Requer Node.js 22 ou superior.

```sh
npm ci
npm run dev
```

Abra http://localhost:3000. Para revisar a versão de produção:

```sh
npm run build
npm run start
```

## Verificar

```sh
npm run check
npm run test:local
npm run test:performance
```

`test:local` verifica Chromium e WebKit. `npm test` inclui Firefox; neste Mac o Firefox instalado falha ao criar o perfil antes de abrir a aplicação. O job de CI instala os três navegadores em Linux. As verificações automatizadas não substituem testes em dispositivos físicos ou com leitor de tela.

## Experiência e arquitetura

- HTML institucional e metadados pré-renderizados; Instrument Sans variável hospedada localmente sob licença OFL.
- Intro em tela cheia na abertura/reload da home: marca, barra de preparação e saída de 640ms que revela o site. Pular, Tab e Escape liberam a leitura imediatamente. Âncoras, páginas internas, retorno pelo histórico, movimento reduzido e economia de dados dispensam a intro. HTML completo preservado sem JavaScript.
- Depois da intro, assinatura vetorial de 760ms, interrompível por scroll e teclado. A lente acompanha discretamente o mouse. Sem canvas na home.
- Três princípios com diagramas conceituais distintos: perspectiva, constância e compreensão. Textos sempre no documento; figura e índice acompanham a leitura no desktop. No celular e sem JavaScript, cada artigo tem seu próprio diagrama.
- Diagramas com construção progressiva e reversível durante a leitura no desktop; no celular, entrada única de 560ms. Movimento reduzido, economia de dados e ausência de JavaScript preservam as figuras completas.
- Lenis suaviza apenas a roda do mouse em desktop com ponteiro fino (a partir de 1080px). Touch, teclado, âncoras e histórico mantêm comportamento nativo. O controlador não agenda quadros em repouso.
- Navegação móvel com `details` e animação reversível de 240ms para abrir / 160ms para fechar; Escape devolve foco ao controle. Indicador de loading contextual aparece somente durante navegação realmente pendente, sem bloquear leitura.
- Entradas editoriais com ritmos próprios para títulos, pesquisa e documento; executadas uma vez e interrompidas por foco, âncoras, saída da tela e preferência de movimento reduzido. Tokens em `src/styles/motion.css`.
- Pesquisa apresentada com seu estágio real e links para as fontes públicas. Origem, fundadores e interesses de contato preservados.
- Tema automático entre 18h e 6h, com opção manual persistente. Contraste, foco e bordas de controles tratados nos dois temas.
- Estudos 3D históricos mantidos nas rotas internas. React Three Fiber e Three.js carregam apenas nesses estudos; a experiência pública não depende de WebGL.

Rotas: `/`, `/contato/`, `/privacidade/`, `/estudo/`, `/estudo/clareza/` e `/estudo/camadas/`. Os estudos são internos e sempre ficam fora da indexação. URLs desconhecidas retornam HTTP 404.

## Configuração posterior

Copie `.env.example` para `.env.local` somente quando houver dados definidos:

- `SITE_URL`: domínio oficial completo. Sem ele, metadados e robots mantêm o site fora da indexação; sitemap vazio. Previews Vercel também ficam fora da indexação.
- `NEXT_PUBLIC_FORMSPREE_ID`: ID do formulário verificado, adiado pelo usuário. Sem ele, a página explica o envio pelo aplicativo de e-mail antes dos campos, oferece copiar a mensagem e apresenta texto selecionável se a área de transferência não estiver disponível. Preparar ou copiar não envia a mensagem e preserva os campos.
- `NEXT_PUBLIC_CONTACT_EMAIL`: contato público, atualmente `mansafin.team@gmail.com`.

O usuário adiou domínio e Formspree. A implementação não foi publicada. Alterações de variáveis públicas e metadados exigem novo build. A Vercel deve usar o preset Next.js; não existe dependência ou configuração de Astro.

## Arte e evidências

`node scripts/inspect.mjs` registra desktop, celular, tema escuro e contato em `work/qa/`, com o servidor local em 3000. `npm run test:performance` mede a home no build de produção em condições móveis simuladas. Os arquivos de QA são locais e ignorados pelo Git.

Direção atual: [docs/atlas-implementation.md](docs/atlas-implementation.md). Coreografia, comportamento e validação: [docs/motion-implementation.md](docs/motion-implementation.md). As direções e revisões anteriores em `docs/` são documentação histórica.

Os scripts `render-poster.mjs` e `render-sculpture-forms.mjs` permanecem disponíveis para os estudos 3D históricos; não definem a arte da nova home.
