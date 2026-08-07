export interface Localized {
  pt: string;
  en: string;
}

export interface Project {
  id: string;
  name: Localized;
  desc: Localized;
  stack: string[];
  href: string;
  ariaLabel: Localized;
}

export const projects: Project[] = [
  {
    id: 'purchase-orders-api',
    name: { pt: 'Purchase Orders API', en: 'Purchase Orders API' },
    desc: {
      pt: 'API REST para gerenciamento de pedidos de compra, com autenticação JWT, containerização via Docker e documentação interativa via Swagger.',
      en: 'REST API for purchase order management, with JWT authentication, Docker containerization and interactive Swagger documentation.',
    },
    stack: ['Python', 'Flask', 'PostgreSQL', 'Docker', 'JWT'],
    href: 'https://github.com/MiguelZGobbo/purchase-orders-api',
    ariaLabel: {
      pt: 'Ver o projeto Purchase Orders API no GitHub',
      en: 'View the Purchase Orders API project on GitHub',
    },
  },
  {
    id: 'task-management-api',
    name: { pt: 'API de Gerenciamento de Tarefas', en: 'Task Management API' },
    desc: {
      pt: 'API REST para gerenciamento de tarefas utilizando Java e Spring Boot, com persistência de dados implementada via Spring Data JPA e MySQL, e gerenciamento de dependências e build com Maven.',
      en: 'REST API for task management built with Java and Spring Boot, with data persistence via Spring Data JPA and MySQL, and Maven for dependency and build management.',
    },
    stack: ['Java', 'Spring Boot', 'MySQL', 'Maven'],
    href: 'https://github.com/MiguelZGobbo/API-de-Gerenciamento-de-Tarefas',
    ariaLabel: {
      pt: 'Ver o projeto API de Gerenciamento de Tarefas no GitHub',
      en: 'View the Task Management API project on GitHub',
    },
  },
  {
    id: 'retro-car-horizon',
    name: { pt: 'Retro Car Horizon', en: 'Retro Car Horizon' },
    desc: {
      pt: 'Jogo arcade 2D desenvolvido em Pygame, com três níveis de dificuldade e arquitetura baseada em Factory e Mediator para gerenciar entidades e colisões.',
      en: '2D arcade game built with Pygame, featuring three difficulty levels and an architecture based on Factory and Mediator patterns to manage entities and collisions.',
    },
    stack: ['Python', 'Pygame'],
    href: 'https://github.com/MiguelZGobbo/game_project',
    ariaLabel: {
      pt: 'Ver o projeto Retro Car Horizon no GitHub',
      en: 'View the Retro Car Horizon project on GitHub',
    },
  },
  {
    id: 'portfolio-miguel-zg',
    name: { pt: 'Portfólio Miguel ZG', en: 'Miguel ZG Portfolio' },
    desc: {
      pt: 'Site pessoal desenvolvido com Astro, apresentando projetos, habilidades e contato, com design responsivo, dark mode, i18n e navegação fluida.',
      en: 'Personal website built with Astro, showcasing projects, skills and contact, with responsive design, dark mode, i18n and smooth navigation.',
    },
    stack: ['Astro', 'HTML', 'CSS', 'JavaScript'],
    href: 'https://github.com/MiguelZGobbo/portifolio-miguelzg',
    ariaLabel: {
      pt: 'Ver o projeto Portfólio Miguel ZG no GitHub',
      en: 'View the Miguel ZG Portfolio project on GitHub',
    },
  },
];
