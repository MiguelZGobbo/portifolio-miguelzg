# 👨‍💻 Portfólio Miguel Zager Gobbo

Site pessoal estático desenvolvido com **Astro**, **CSS** e **JavaScript**. A página inicial reúne apresentação, projetos, competências, formação, currículo e contato em uma leitura contínua.

![Astro](https://img.shields.io/badge/Astro-FF5D01?logo=astro&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-3-1572B6?logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript)

## Estrutura pública

A homepage mantém esta ordem de conteúdo:

1. **Início** — apresentação profissional e foto.
2. **Projetos** — Purchase Orders API, BeadWise, Portfólio Miguel ZG e API de Gerenciamento de Tarefas, com níveis de evidência diferentes.
3. **Competências** — linguagens, backend, bancos de dados, ferramentas e soft skills.
4. **Sobre mim** — perfil, formação e acesso ao currículo em português ou inglês.
5. **Contato** — formulário, e-mail, LinkedIn e GitHub.

O conteúdo público está disponível em duas rotas canônicas:

- /portifolio-miguelzg/
- /portifolio-miguelzg/en/
Português permanece na rota principal e inglês usa o prefixo `/en/`. A troca de idioma é uma navegação nativa entre páginas estáticas equivalentes e preserva a seção atual quando disponível. As seções usam âncoras e rolagem nativas; os links dos projetos abrem seus repositórios no GitHub em uma nova aba.

## Funcionalidades atuais

- Tema claro/escuro com preferência persistida no navegador.
- Rotas estáticas independentes em PT/EN, com idioma definido pela URL, histórico e links profundos copiáveis.
- Navegação responsiva por Início, Projetos, Competências, Sobre e Contato.
- Escala fluida compartilhada por textos, imagens, controles e espaçamentos, calculada pela largura e altura útil da tela. As colunas se reorganizam pelo espaço disponível; a navegação informa sua altura real para manter as âncoras visíveis.
- Manchas desfocadas que acompanham as seções e animações de reveal, respeitando `prefers-reduced-motion`.
- Skip link, foco visível, rótulos acessíveis e HTML estático disponível antes das melhorias de JavaScript.
- Módulos de navegador separados para tema, navegação observada, reveals, clipboard e formulário de contato.
- Títulos, descrições, canonical, hreflang, Open Graph, Twitter e JSON-LD localizados e renderizados no build, com sitemap de duas URLs.

O escopo desta versão não inclui partículas, parallax, tilt 3D ou um contêiner de rolagem interno.

## Paleta

A identidade combina superfícies claras e textos de [Radix Colors — Slate](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette) com azuis acinzentados personalizados no tema claro. O tema escuro usa o fundo azul acinzentado da opção C e elementos em prata neutro da opção 1. Os dois blurs usam Radix Blue. Os valores ficam centralizados em `src/styles/global.css`, sem dependência de biblioteca; os números abaixo identificam os passos das escalas [clara](https://github.com/radix-ui/colors/blob/main/src/light.ts) e [escura](https://github.com/radix-ui/colors/blob/main/src/dark.ts).

| Papel | Claro | Escuro |
| --- | --- | --- |
| Fundo / campos / superfície de apoio | Slate 2 / 1 / 3 | `#253640` / `#2B3D48` / `#30434E` |
| Texto principal / secundário | Slate 12 / 11 | Slate 12 / 11 |
| Ícones / links e foco | `#647D8A` / `#405A67` | `#A8ADB2` / `#C4C8CC` |
| Ação preenchida / hover | `#405A67` / Slate 12 | `#C4C8CC` / `#E8ECEC` |
| Texto sobre ação | Branco | `#202629` |
| Separadores / erros | Slate 6 / Red 12 | `#3B4F5B` / Red 11 |
| Blur | Blue 7 | Blue 9 |

As três manchas usam opacidades de 22%, 16% e 9% no claro e 10%, 7% e 4% no escuro, em desktop e mobile. Os tokens `--action-background`, `--action-hover` e `--on-action` separam os botões dos links e indicadores funcionais; os aliases anteriores permanecem disponíveis. O favicon usa Blue 11 com símbolo branco, e os ícones de instalação usam Slate 2 com desenho Blue 11. Para regenerar os PNGs sem alterar sua geometria: `node scripts/generate-icons.mjs`.

No tema claro, o núcleo do blur mantém 90% da cor em 24% do raio e 60% em 45%, tornando sua presença mais perceptível perto dos cantos. A cor, a opacidade máxima das camadas, os halos, as bordas transparentes e o movimento permanecem iguais; o tema escuro mantém sua distribuição anterior.

## Miniaturas dos projetos

As imagens são opcionais: sem `image`, o projeto ocupa toda a largura. Para adicionar uma, salve o arquivo em `src/assets/projects/` e preencha `image: { src: 'arquivo.png', alt: { pt: 'Descrição da imagem', en: 'Image description' } }` em `src/data/projects.ts`. O componente importa os assets locais com `import.meta.glob`; o Astro gera versões otimizadas dos bitmaps. As miniaturas mantêm a proporção natural e usam carregamento tardio. As URLs ampliadas são geradas por `getImage()`, respeitando o caminho-base do site.

As ampliações dos bitmaps usam WebP com qualidade 90. O esquema SVG usa o mesmo arquivo vetorial na miniatura e no visualizador, sem variantes de resolução. A foto inicial mantém variantes de 120 a 480 px e um fallback de 480 px; o JPEG em `public/img/` permanece reservado às prévias de compartilhamento.

Com JavaScript, a miniatura abre um único visualizador `<dialog>` transparente sobre fundo escurecido e desfocado, com título, legenda e controle de fechar em PT/EN. A imagem se ajusta ao espaço disponível, sem cortes nem controles de zoom. A abertura e o fechamento usam fades de 180 ms. O fechar, Esc e clique externo aguardam a saída antes de restaurar foco e rolagem; há um limite de segurança de 250 ms caso o evento da animação não chegue. Com movimento reduzido, a abertura e o fechamento são imediatos.

A imagem ampliada é carregada somente ao abrir, com espaço reservado pela proporção conhecida e fade quando estiver pronta. Resultados de carregamentos antigos são descartados após fechar ou reabrir. Sem JavaScript, o link abre normalmente a imagem em uma nova aba. O comportamento fica em `src/scripts/project-viewer.js`, inicializado pelo ponto de entrada compartilhado.

Um único link envolve imagem e legenda, com ícone de expansão de 16 px sempre visível ao lado da legenda. Apenas a imagem da miniatura recebe borda de 1 px e sombra curta, ajustadas por tema e levemente intensificadas no hover e no foco. Essas transições duram 180 ms e são desativadas com movimento reduzido. A janela ampliada permanece sem borda ou sombra decorativa.

A seleção atual reúne o diagrama de arquitetura do repositório Purchase Orders API, o infográfico conceitual do repositório BeadWise, uma captura real da página inicial deste portfólio e um esquema vetorial dos endpoints e da entidade da API de tarefas. As legendas distinguem capturas, esquemas e visão de produto em desenvolvimento. A origem de cada arquivo está em `src/assets/projects/README.md`.

## Tecnologias

O dimensionamento usa os tokens `--fluid-type`, `--fluid-gap`, `--fluid-space` e `--page-gutter` em `src/styles/global.css`, com a mesma lógica de largura/altura do Conscientiza Queimadas. Limites em `rem` preservam a ampliação de texto. Sem JavaScript, o cabeçalho permanece no fluxo da página para não cobrir conteúdo. `ResizeObserver` complementa o deslocamento das âncoras na navegação fixa e reserva a altura real do título e da legenda no visualizador de imagens. O redimensionamento da janela também atualiza essas medidas quando o observador não está disponível.

- **Astro** — componentes e geração das páginas estáticas em PT/EN.
- **TypeScript** — modelo tipado dos projetos e conteúdo bilíngue.
- **CSS** — identidade visual, layout responsivo e ondas decorativas.
- **JavaScript ES modules** — pequenas melhorias de comportamento no HTML gerado.
- **EmailJS** — carregado sob demanda pelo formulário de contato.
- **@fontsource-variable** — IBM Plex Sans auto-hospedada.
- **@astrojs/sitemap** — geração do sitemap durante o build.

O CSS é extraído automaticamente pelo Astro e compartilhado pelas duas páginas. `src/styles/fonts.css` declara somente o WOFF2 latino da IBM Plex Sans variável, com pesos de 100 a 700 e `font-display: swap`. Esse subconjunto cobre os acentos e a pontuação do conteúdo atual em PT/EN; ao incluir outros idiomas ou caracteres, revise essa cobertura. O relatório de otimização fica em [docs/phases/asset-optimization.md](docs/phases/asset-optimization.md).

## Como executar

### Pré-requisitos

- Node.js 22.12 ou superior.

### Instalação e desenvolvimento

    git clone https://github.com/MiguelZGobbo/portifolio-miguelzg.git
    cd portifolio-miguelzg
    npm install
    npm run dev

Com a configuração atual, a aplicação fica disponível em:

    http://localhost:4321/portifolio-miguelzg/

Para testar a saída estática localmente:

    npm run build
    npm run preview

## Scripts

| Script | Uso |
| --- | --- |
| npm test | Gera as duas páginas estáticas e executa os testes de modelo, páginas construídas, navegação, SEO e arquitetura. |
| npm run check | Executa as verificações e diagnósticos do Astro. |
| npm run build | Gera as duas páginas estáticas, o sitemap e os assets em dist/. |
| npm run dev | Inicia o servidor de desenvolvimento do Astro. |
| npm run preview | Serve localmente o build produzido. |
| npm run astro | Expõe a CLI do Astro para comandos adicionais. |

## Estrutura do projeto

    portifolio-miguelzg/
    ├── public/
    │   ├── files/                  # Currículos em português e inglês
    │   ├── img/                   # Favicon, foto e imagens públicas
    │   ├── site.webmanifest
    │   └── ícones de instalação
    ├── src/
    │   ├── assets/                # Assets processados pelo Astro
    │   ├── components/
    │   │   ├── home/              # Seções da homepage
    │   │   ├── ProjectList.astro
    │   │   ├── Nav.astro
    │   │   ├── ThemeToggle.astro
    │   │   └── demais componentes reutilizáveis
    │   ├── data/
    │   │   ├── projects.ts        # Hierarquia e apresentação dos projetos
    │   │   └── skills.ts
    │   ├── layouts/
    │   │   └── BaseLayout.astro   # Head, metadados e inicialização
    │   ├── lib/
    │   │   └── i18n.ts            # Dicionários PT/EN
    │   ├── pages/
    │   │   ├── index.astro        # Homepage em português
    │   │   └── en/index.astro     # Homepage em inglês
    │   ├── scripts/               # Módulos de comportamento do navegador
    │   └── styles/
    │       └── global.css
    ├── tests/                     # Testes de modelo, build, arquitetura e navegação
    ├── docs/adr/                  # Decisões arquiteturais aceitas
    ├── docs/phases/               # Consolidações das fases concluídas
    └── docs/superpowers/plans/    # Planos de implementação por fase

## Estado de escopo

O build atual publica duas páginas estáticas com metadados próprios. [ADR-0003](docs/adr/ADR-0003-editorial-homepages-without-case-studies.md) registra a remoção das rotas de estudo de caso e substitui as partes correspondentes das decisões anteriores.

## Autor

**Miguel Zager Gobbo**

[![GitHub](https://img.shields.io/badge/GitHub-MiguelZGobbo-181717?logo=github)](https://github.com/MiguelZGobbo)
