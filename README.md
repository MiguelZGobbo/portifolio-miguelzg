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

Purchase Orders API e BeadWise possuem estudos de caso completos:

- /portifolio-miguelzg/projetos/purchase-orders-api/
- /portifolio-miguelzg/projetos/beadwise/

Os links entre a homepage e suas seções usam âncoras e rolagem nativas do documento. Os links de repositório abrem o GitHub em uma nova aba; as páginas de estudo de caso têm navegação própria de retorno à homepage.

## Funcionalidades atuais

- Tema claro/escuro com preferência persistida no navegador.
- Alternância PT/EN como aprimoramento na própria página, com conteúdo semântico renderizado estaticamente e links de currículo ajustados para o idioma.
- Layout responsivo para desktop e telas pequenas.
- Animações de reveal progressivo, respeitando prefers-reduced-motion.
- Skip link, foco visível, rótulos acessíveis e HTML estático disponível antes das melhorias de JavaScript.
- Módulos de navegador separados para tema, idioma, navegação observada, reveals, clipboard e formulário de contato.
- Metadados básicos da página, sitemap e manifest estático mantidos no build atual.

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
| npm test | Gera a saída estática e executa os testes de modelo, páginas construídas, navegação e arquitetura. |
| npm run check | Executa as verificações e diagnósticos do Astro. |
| npm run build | Gera as três páginas estáticas e os assets em dist/. |
| npm run dev | Inicia o servidor de desenvolvimento do Astro. |
| npm run preview | Serve localmente o build produzido. |
| npm run astro | Expõe a CLI do Astro para comandos adicionais. |

## Estrutura do projeto

    portifolio-miguelzg/
    ├── public/
    │   ├── files/                  # Currículos em português e inglês
    │   ├── img/                   # Favicon, foto e imagens públicas
    │   ├── robots.txt
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
    │   │   ├── index.astro        # Homepage
    │   │   └── projetos/[slug].astro
    │   ├── scripts/               # Módulos de comportamento do navegador
    │   └── styles/
    │       └── global.css
    ├── tests/                     # Testes de modelo, build, arquitetura e navegação
    ├── docs/adr/                  # Decisões arquiteturais aceitas
    └── docs/superpowers/plans/    # Plano de implementação da Fase 5

## Estado de escopo

Esta consolidação documenta a Fase 5 estrutural. A auditoria completa de acessibilidade, a localização por rota e a conclusão de SEO por página pertencem à Fase 6–7. O polimento visual e as decisões finais de motion pertencem à Fase 8.

## Autor

**Miguel Zager Gobbo**

[![GitHub](https://img.shields.io/badge/GitHub-MiguelZGobbo-181717?logo=github)](https://github.com/MiguelZGobbo)
