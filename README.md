# Portfólio Miguel Zager Gobbo

Site pessoal estático em Astro, TypeScript, CSS e JavaScript, com apresentação profissional, projetos, competências, formação, currículos e contato em português e inglês.

## Executar

Requer Node.js 22.12 ou superior.

~~~sh
npm ci
npm run dev
~~~

Abra [localhost:4321/portifolio-miguelzg/](http://localhost:4321/portifolio-miguelzg/). Para conferir a saída de produção, execute `npm run build` e `npm run preview`.

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Desenvolvimento local com Astro. |
| `npm run check` | Verificação de tipos e componentes Astro. |
| `npm test` | Build seguido dos testes de conteúdo, comportamento, acessibilidade, SEO e arquitetura. |
| `npm run build` | Geração de páginas, sitemap e assets em dist/. |
| `npm run preview` | Prévia local do build. |

O GitHub Actions executa `npm run check` e `npm test` antes de publicar a branch main no GitHub Pages.

## Conteúdo e comportamento

- Rotas canônicas: /portifolio-miguelzg/ (PT) e /portifolio-miguelzg/en/ (EN).
- Ordem das seções: Início, Projetos, Competências, Sobre e Contato.
- Idioma definido pela URL, com troca de página que preserva a seção equivalente.
- Tema claro/escuro persistido no navegador, navegação por âncoras e layout fluido.
- Quatro projetos em lista contínua, com links para repositórios e miniaturas que abrem um diálogo acessível.
- Currículos em PT/EN com visualização e download.
- Formulário com validação acessível, honeypot e EmailJS sob demanda. O envio permanece desativado em localhost e endereços de loopback.
- Conteúdo e links disponíveis sem JavaScript; animações respeitam a preferência por movimento reduzido.
- Metadados, canonical, hreflang, Open Graph, Twitter, JSON-LD e sitemap gerados no build.

## Organização

~~~text
src/
  assets/             Imagens processadas pelo Astro
  components/         Apresentação, mídia e diálogo
    home/             Seções da homepage
    pages/            Composição compartilhada PT/EN
  data/               Projetos, competências e campos de contato
  layouts/            Documento HTML e metadados
  lib/                Traduções, rotas e geração de SEO
  pages/              Entradas estáticas PT/EN
  scripts/            Comportamentos do navegador
  styles/             CSS importado em ordem por global.css
public/               Currículos, foto social, manifesto e ícones públicos
scripts/              Geração dos ícones de instalação
tests/                Testes de comportamento, modelo, build e estilos
docs/                 Arquitetura, decisões e desempenho
~~~

Consulte [a arquitetura e o contrato visual](docs/architecture.md), [as decisões arquiteturais](docs/adr/README.md) e [o registro de desempenho](docs/performance.md).

## Manutenção de imagens e estilos

Edite projetos em `src/data/projects.ts`, competências em `src/data/skills.ts` e textos em `src/lib/i18n.ts`.

As imagens ficam em `src/assets/projects/`; a [documentação dos assets](src/assets/projects/README.md) registra sua origem. O campo opcional `image` informa o arquivo, alt text e legenda em PT/EN. Bitmaps recebem miniaturas responsivas e ampliação WebP com qualidade 90; o SVG usa o mesmo arquivo nas duas visualizações. Sem JavaScript, o link abre a imagem em outra aba.

A foto em `src/assets/` alimenta as variantes otimizadas; a cópia em `public/img/` mantém uma URL estável para compartilhamento. Os dois usos são intencionais. Currículos, imagens e ícones em `public/` fazem parte da publicação e devem continuar versionados.

`src/styles/global.css` define a ordem da cascata. As cores e escalas fluidas ficam em `foundation.css`, com tokens escuros em `theme.css`. A IBM Plex Sans Variable usa o subconjunto latino local de `fonts.css`; revise sua cobertura ao adicionar idiomas. Regenere os PNGs de instalação com `node scripts/generate-icons.mjs`.

## Git e arquivos locais

Versione código, testes, configurações compartilhadas, workflow, `package-lock.json`, documentação de manutenção e assets publicados. `dist/` é gerado pelo CI e enviado como artefato de deploy, sem ser commitado.

O `.gitignore` mantém dependências, caches, ambientes `.env*`, logs, cobertura, capturas de testes, planos de agentes e anotações em `.local/` ou `.clean/` apenas no computador. Modelos `.env.example` podem ser versionados com valores fictícios. A configuração de extensões do VS Code pode ser compartilhada; as demais preferências do editor ficam locais.

O formulário utiliza identificadores públicos do EmailJS no navegador. Não coloque credenciais privadas no frontend ou nos modelos de ambiente.

## Autor

[Miguel Zager Gobbo](https://github.com/MiguelZGobbo)
