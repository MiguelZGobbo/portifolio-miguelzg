import type { Localized } from '../lib/i18n';

export type ProjectHierarchy = 'H1' | 'H2' | 'H3';

export interface ProjectShowcaseContent {
  kind: Localized;
  summary: Localized;
  technologies: string[];
  aspects: Localized[];
}

export interface Project {
  slug: string;
  name: Localized;
  state: Localized;
  hierarchy: ProjectHierarchy;
  showcase: ProjectShowcaseContent;
  image?: {
    src: string;
    alt: Localized;
    caption?: Localized;
  };
  href: string;
  ariaLabel: Localized;
}

export const projects: Project[] = [
  {
    slug: 'purchase-orders-api',
    image: {
      src: 'purchase-orders-api.png',
      alt: { pt: 'Arquitetura da API: autenticação JWT, Flask, validação de pedidos e PostgreSQL.', en: 'API architecture: JWT authentication, Flask, order validation and PostgreSQL.' },
      caption: { pt: 'Arquitetura e regras de pedidos', en: 'Architecture and order rules' },
    },
    name: { pt: 'Purchase Orders API', en: 'Purchase Orders API' },
    state: { pt: 'concluído', en: 'completed' },
    hierarchy: 'H1',
    showcase: {
      kind: { pt: 'API REST · Backend', en: 'REST API · Backend' },
      summary: {
        pt: 'API REST para gerenciamento de pedidos de compra e seus itens, com autenticação JWT, persistência em PostgreSQL, execução com Docker e testes automatizados.',
        en: 'REST API for managing purchase orders and their items, with JWT authentication, PostgreSQL persistence, Docker-based execution, and automated tests.',
      },
      technologies: ['Python', 'Flask', 'PostgreSQL', 'Docker'],
      aspects: [
        { pt: 'Backend', en: 'Backend' },
        { pt: 'REST', en: 'REST' },
        { pt: 'Autenticação', en: 'Authentication' },
        { pt: 'Testes', en: 'Testing' },
      ],
    },
    href: 'https://github.com/MiguelZGobbo/purchase-orders-api',
    ariaLabel: {
      pt: 'Ver código do projeto Purchase Orders API no GitHub',
      en: 'View code for the Purchase Orders API project on GitHub',
    },
  },
  {
    slug: 'beadwise',
    image: {
      src: 'beadwise.png',
      alt: { pt: 'Fluxo conceitual do BeadWise: detectar, entender, recomendar, aplicar, medir e manter ou reverter.', en: 'BeadWise conceptual flow: detect, understand, recommend, apply, measure and keep or roll back.' },
      caption: { pt: 'Visão do produto · em desenvolvimento', en: 'Product vision · in development' },
    },
    name: { pt: 'BeadWise', en: 'BeadWise' },
    state: { pt: 'em desenvolvimento', en: 'in development' },
    hierarchy: 'H2',
    showcase: {
      kind: { pt: 'Aplicação Windows', en: 'Windows application' },
      summary: {
        pt: 'Projeto que organiza especificações, protótipos, código e testes para investigar mecanismos do Windows com critérios de prova, segurança e reversibilidade.',
        en: 'Project organizing specifications, prototypes, source code, and tests to investigate Windows mechanisms with proof, safety, and reversibility criteria.',
      },
      technologies: ['C#', '.NET', 'Windows APIs'],
      aspects: [
        { pt: 'Sistemas Windows', en: 'Windows systems' },
        { pt: 'Prototipagem', en: 'Prototyping' },
        { pt: 'Validação', en: 'Validation' },
        { pt: 'Segurança', en: 'Safety' },
      ],
    },
    href: 'https://github.com/MiguelZGobbo/beadwise',
    ariaLabel: {
      pt: 'Ver código do projeto BeadWise no GitHub',
      en: 'View code for the BeadWise project on GitHub',
    },
  },
  {
    slug: 'portfolio',
    image: {
      src: 'portfolio.png',
      alt: { pt: 'Captura da página inicial do portfólio, com apresentação profissional e foto de Miguel.', en: 'Screenshot of the portfolio homepage with Miguel’s professional introduction and photo.' },
      caption: { pt: 'Página inicial · captura real', en: 'Homepage · actual screenshot' },
    },
    name: { pt: 'Portfólio Miguel ZG', en: 'Miguel ZG Portfolio' },
    state: { pt: 'ativo / em evolução', en: 'active / evolving' },
    hierarchy: 'H3',
    showcase: {
      kind: { pt: 'Site pessoal', en: 'Personal website' },
      summary: {
        pt: 'Portfólio pessoal em Astro, CSS e JavaScript, com conteúdo em PT/EN, dark mode, responsividade, acessibilidade, SEO e deploy automatizado.',
        en: 'Personal portfolio built with Astro, CSS, and JavaScript, with PT/EN content, dark mode, responsive behavior, accessibility, SEO, and automated deployment.',
      },
      technologies: ['Astro', 'CSS', 'JavaScript', 'GitHub Actions'],
      aspects: [
        { pt: 'Componentização', en: 'Componentization' },
        { pt: 'Responsividade', en: 'Responsive design' },
        { pt: 'Acessibilidade', en: 'Accessibility' },
        { pt: 'SEO', en: 'SEO' },
      ],
    },
    href: 'https://github.com/MiguelZGobbo/portifolio-miguelzg',
    ariaLabel: {
      pt: 'Ver código do projeto Portfólio Miguel ZG no GitHub',
      en: 'View code for the Miguel ZG Portfolio project on GitHub',
    },
  },
  {
    slug: 'task-management-api',
    image: {
      src: 'task-management-api.svg',
      alt: { pt: 'Esquema dos cinco endpoints de tarefas, dos campos da entidade Tarefa e da persistência com JPA e MySQL.', en: 'Diagram of the five task endpoints, the Tarefa entity fields and persistence with JPA and MySQL.' },
      caption: { pt: 'Endpoints e modelo · esquema da implementação', en: 'Endpoints and model · implementation diagram' },
    },
    name: { pt: 'API de Gerenciamento de Tarefas', en: 'Task Management API' },
    state: { pt: 'concluído', en: 'completed' },
    hierarchy: 'H3',
    showcase: {
      kind: { pt: 'API REST · Backend', en: 'REST API · Backend' },
      summary: {
        pt: 'API REST acadêmica para gerenciamento de tarefas, desenvolvida com Java e Spring Boot, com operações de CRUD, persistência em MySQL e validação via Postman.',
        en: 'Academic REST API for task management built with Java and Spring Boot, with CRUD operations, MySQL persistence, and endpoint validation through Postman.',
      },
      technologies: ['Java', 'Spring Boot', 'MySQL', 'Postman'],
      aspects: [
        { pt: 'Backend', en: 'Backend' },
        { pt: 'REST', en: 'REST' },
        { pt: 'CRUD', en: 'CRUD' },
        { pt: 'Persistência relacional', en: 'Relational persistence' },
      ],
    },
    href: 'https://github.com/MiguelZGobbo/API-de-Gerenciamento-de-Tarefas',
    ariaLabel: {
      pt: 'Ver código do projeto API de Gerenciamento de Tarefas no GitHub',
      en: 'View code for the Task Management API project on GitHub',
    },
  },
];
