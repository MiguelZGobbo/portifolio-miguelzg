# 👨‍💻 Portfólio Miguel Zager Gobbo

Site pessoal desenvolvido com **Astro**, **CSS** e **JavaScript**. Apresenta minhas habilidades, projetos e formas de contato, com design responsivo, navegação por seções, animações de reveal, **dark mode**, **i18n PT/EN**, **PWA** e **SEO**.

![Astro](https://img.shields.io/badge/Astro-FF5D01?logo=astro&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-3-1572B6?logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript)

---

## ✨ Seções do Site

| Seção | Descrição |
|-------|-----------|
| **Início** | Apresentação com foto e destaque para backend e sistemas |
| **Sobre** | Formação, foco e status profissional |
| **Habilidades** | Linguagens, backend, banco de dados, ferramentas e soft skills |
| **Projetos** | Cards com links para os repositórios no GitHub |
| **Currículo** | Visualização e download do currículo em PDF |
| **Contato** | Formulário de mensagem e links para LinkedIn, GitHub e e-mail |

---

## ✨ Funcionalidades

- **Dark mode** — automático (`prefers-color-scheme`) com toggle manual persistido
- **i18n PT/EN** — toggle na página, com detecção do idioma do navegador
- **Efeitos** — partículas em canvas, parallax no hero e tilt 3D nos cards
- **Acessibilidade** — skip-link e foco visível
- **PWA** — manifest e ícones de aplicativo
- **SEO** — sitemap, robots, canonical, Open Graph e JSON-LD

---

## 🛠️ Tecnologias

- **Astro** — Framework estático com componentes e otimização automática de imagens (WebP)
- **CSS3** — Estilização, layout responsivo e ondas decorativas em SVG
- **JavaScript** — Navegação por seções, animações de reveal e interações
- **EmailJS** — Envio de mensagens pelo formulário de contato (carregado sob demanda)
- **@fontsource-variable** — Fontes variáveis auto-hospedadas (Playfair Display e DM Sans)
- **@astrojs/sitemap** — Geração automática do sitemap
- **GitHub Actions** — Build e deploy automático no GitHub Pages

---

## 🚀 Como Executar

### Pré-requisitos

- Node.js 22.12+

### Passos

1. **Clone o repositório**
   ```bash
   git clone https://github.com/MiguelZGobbo/portifolio-miguelzg.git
   cd portifolio-miguelzg
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Rode em modo desenvolvimento**
   ```bash
   npm run dev
   ```
   Acesse **http://localhost:4321/portifolio-miguelzg/**.

4. **Verifique tipos e erros**
   ```bash
   npm run check
   ```

5. **Build de produção**
   ```bash
   npm run build
   npm run preview
   ```

---

## 📁 Estrutura do Projeto

```
portifolio-miguelzg/
├── public/                   # Recursos estáticos
│   ├── files/
│   │   ├── MiguelZagerGobbo-CV.pdf
│   │   └── MiguelZagerGobbo-CV-EN.pdf
│   ├── img/
│   │   ├── favicon.svg
│   │   └── foto-perfil.jpeg  # Imagem para compartilhamento (OG)
│   ├── robots.txt
│   ├── site.webmanifest
│   ├── icon-192.png / icon-512.png / icon-maskable-512.png
│   └── apple-touch-icon.png
└── src/
    ├── assets/
    │   └── foto-perfil.jpeg  # Foto otimizada pelo Astro
    ├── components/
    │   ├── ContactForm.astro
    │   ├── CopyButton.astro
    │   ├── Icon.astro        # Ícones SVG centralizados
    │   ├── LangToggle.astro  # Alternância PT/EN
    │   ├── Nav.astro
    │   ├── Particles.astro   # Partículas em canvas
    │   ├── ProjectCard.astro
    │   ├── SectionTitle.astro
    │   ├── SkillCard.astro
    │   ├── ThemeToggle.astro # Alternância de tema
    │   └── Waves.astro       # Ondas de fundo animadas
    ├── data/
    │   ├── projects.ts       # Projetos (conteúdo bilingue pt/en)
    │   └── skills.ts
    ├── layouts/
    │   └── BaseLayout.astro  # Head, SEO, preload de fontes e init de tema/idioma
    ├── lib/
    │   └── i18n.ts           # Dicionários PT/EN
    ├── pages/
    │   └── index.astro
    ├── scripts/
    │   └── main.js           # Interações, animações e i18n
    └── styles/
        └── global.css        # Estilos globais
```

---

## 🚢 Deploy

O deploy é automático via **GitHub Actions** (`.github/workflows/deploy.yml`): a cada push na branch `main`, o site é construído e publicado no GitHub Pages em `https://miguelzgobbo.github.io/portifolio-miguelzg/`.

---

## 👤 Autor

**Miguel Zago Gobbo**

[![GitHub](https://img.shields.io/badge/GitHub-MiguelZGobbo-181717?logo=github)](https://github.com/MiguelZGobbo)
