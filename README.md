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
- Manchas desfocadas que acompanham as seções e animações de reveal, respeitando `prefers-reduced-motion`.
- Skip link, foco visível, rótulos acessíveis e HTML estático disponível antes das melhorias de JavaScript.
- Módulos de navegador separados para tema, navegação observada, reveals, clipboard e formulário de contato.
- Títulos, descrições, canonical, hreflang, Open Graph, Twitter e JSON-LD localizados e renderizados no build, com sitemap de duas URLs.

O escopo desta versão não inclui partículas, parallax, tilt 3D ou um contêiner de rolagem interno.

## Tecnologias

- **Astro** — componentes e geração das páginas estáticas em PT/EN.
- **TypeScript** — modelo tipado dos projetos e conteúdo bilíngue.
- **CSS** — identidade visual, layout responsivo e ondas decorativas.
- **JavaScript ES modules** — pequenas melhorias de comportamento no HTML gerado.
- **EmailJS** — carregado sob demanda pelo formulário de contato.
- **@fontsource-variable** — IBM Plex Sans auto-hospedada.
- **@astrojs/sitemap** — geração do sitemap durante o build.

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
