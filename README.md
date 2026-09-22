# 👨‍💻 Portfólio Miguel Zager Gobbo

Site pessoal estático desenvolvido com **Astro**, **CSS** e **JavaScript**. A página inicial reúne apresentação, evidências de projetos, competências, formação, currículo e contato. Os projetos com profundidade suficiente também possuem estudos de caso em rotas próprias.

![Astro](https://img.shields.io/badge/Astro-FF5D01?logo=astro&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-3-1572B6?logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript)

## Estrutura pública

A homepage mantém esta ordem de conteúdo:

1. **Início** — apresentação profissional, foto e chamadas para projetos, currículo e contato.
2. **Projetos** — Purchase Orders API, BeadWise, Portfólio Miguel ZG e API de Gerenciamento de Tarefas, com níveis de evidência diferentes.
3. **Competências** — linguagens, backend, bancos de dados, ferramentas e soft skills.
4. **Sobre mim** — perfil e formação.
5. **Currículo** — visualização e download dos PDFs em português ou inglês.
6. **Contato** — formulário, e-mail, LinkedIn e GitHub.

O conteúdo público está disponível em seis rotas canônicas:

- /portifolio-miguelzg/
- /portifolio-miguelzg/en/
- /portifolio-miguelzg/projetos/purchase-orders-api/
- /portifolio-miguelzg/projetos/beadwise/
- /portifolio-miguelzg/en/projects/purchase-orders-api/
- /portifolio-miguelzg/en/projects/beadwise/

Português permanece nas rotas públicas originais e inglês usa o prefixo `/en/`. A troca de idioma é uma navegação nativa entre páginas estáticas equivalentes e preserva, quando disponível, a seção da homepage ou o estudo de caso atual. Os links entre a homepage e suas seções usam âncoras e rolagem nativas do documento. Os links de repositório abrem o GitHub em uma nova aba; as páginas de estudo de caso têm navegação própria de retorno à homepage.

## Funcionalidades atuais

- Tema claro/escuro com preferência persistida no navegador.
- Rotas estáticas independentes em PT/EN, com idioma definido pela URL, histórico e links profundos copiáveis.
- Layout responsivo para desktop e telas pequenas.
- Animações de reveal progressivo, respeitando prefers-reduced-motion.
- Skip link, foco visível, rótulos acessíveis e HTML estático disponível antes das melhorias de JavaScript.
- Módulos de navegador separados para tema, navegação observada, reveals, clipboard e formulário de contato.
- Títulos, descrições, canonical, hreflang, Open Graph, Twitter e JSON-LD localizados e renderizados no build, com sitemap de seis URLs.

O escopo desta versão não inclui partículas, parallax, tilt 3D ou um contêiner de rolagem interno.

## Tecnologias

- **Astro** — componentes, geração estática e rotas de estudo de caso.
- **TypeScript** — modelo tipado dos projetos e conteúdo bilíngue.
- **CSS** — identidade visual, layout responsivo e ondas decorativas.
- **JavaScript ES modules** — pequenas melhorias de comportamento no HTML gerado.
- **EmailJS** — carregado sob demanda pelo formulário de contato.
- **@fontsource-variable** — fontes Playfair Display e DM Sans auto-hospedadas.
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
| npm test | Gera as seis páginas estáticas e executa 89 testes de modelo, páginas construídas, navegação, SEO e arquitetura. |
| npm run check | Executa as verificações e diagnósticos do Astro. |
| npm run build | Gera as seis páginas estáticas, o sitemap e os assets em dist/. |
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
    │   │   ├── ProjectCard.astro
    │   │   ├── ProjectCaseStudy.astro
    │   │   ├── Nav.astro
    │   │   ├── ThemeToggle.astro
    │   │   └── demais componentes reutilizáveis
    │   ├── data/
    │   │   ├── projects.ts        # Hierarquia, evidências e estudos de caso
    │   │   └── skills.ts
    │   ├── layouts/
    │   │   └── BaseLayout.astro   # Head, metadados e inicialização
    │   ├── lib/
    │   │   └── i18n.ts            # Dicionários PT/EN
    │   ├── pages/
    │   │   ├── index.astro        # Homepage em português
    │   │   ├── projetos/[slug].astro
    │   │   └── en/                # Homepage e estudos de caso em inglês
    │   ├── scripts/               # Módulos de comportamento do navegador
    │   └── styles/
    │       └── global.css
    ├── tests/                     # Testes de modelo, build, arquitetura e navegação
    ├── docs/adr/                  # Decisões arquiteturais aceitas
    ├── docs/phases/               # Consolidações das fases concluídas
    └── docs/superpowers/plans/    # Planos de implementação por fase

## Estado de escopo

A Fase 8 de polimento visual está consolidada em [docs/phases/phase-8-consolidation.md](docs/phases/phase-8-consolidation.md). O build atual publica seis páginas estáticas com identidade de idioma e metadados próprios, e a regressão final reúne 94 testes além da auditoria funcional e visual em navegador. A próxima etapa é a Fase 9 — auditoria final independente — conforme [docs/phases/phase-9-handoff.md](docs/phases/phase-9-handoff.md).

## Autor

**Miguel Zager Gobbo**

[![GitHub](https://img.shields.io/badge/GitHub-MiguelZGobbo-181717?logo=github)](https://github.com/MiguelZGobbo)
