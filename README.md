# 👨‍💻 Portfólio Miguel Zager Gobbo

Site pessoal desenvolvido com **Astro**, **CSS** e **JavaScript**. Apresenta minhas habilidades, projetos e formas de contato, com design responsivo, scroll-snap e animações de reveal.

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

## 🛠️ Tecnologias

- **Astro** — Framework estático com componentes e otimização automática de imagens (WebP)
- **CSS3** — Estilização, layout responsivo e ondas decorativas em SVG
- **JavaScript** — Navegação com scroll-snap, animações de reveal e interações
- **EmailJS** — Envio de mensagens pelo formulário de contato
- **Google Fonts** — Tipografia (Playfair Display e DM Sans)
- **GitHub Actions** — Build e deploy automático no GitHub Pages

---

## 🚀 Como Executar

### Pré-requisitos

- Node.js 22+

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
   Acesse **http://localhost:4321**.

4. **Build de produção**
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
│   │   └── MiguelZagerGobbo-CV.pdf
│   └── img/
│       ├── favicon.svg
│       └── foto-perfil.jpeg  # Imagem para compartilhamento (OG)
└── src/
    ├── assets/
    │   └── foto-perfil.jpeg  # Foto otimizada pelo Astro
    ├── components/
    │   ├── ContactForm.astro
    │   ├── CopyButton.astro
    │   ├── Icon.astro        # Ícones SVG centralizados
    │   ├── Nav.astro
    │   ├── ProjectCard.astro
    │   ├── SectionTitle.astro
    │   ├── SkillCard.astro
    │   └── Waves.astro       # Ondas de fundo animadas
    ├── data/
    │   ├── projects.ts       # Projetos (adicionar = 3 linhas)
    │   └── skills.ts
    ├── layouts/
    │   └── BaseLayout.astro  # Head, SEO, fontes e scripts
    ├── pages/
    │   └── index.astro
    ├── scripts/
    │   └── main.js           # Interações e animações
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
