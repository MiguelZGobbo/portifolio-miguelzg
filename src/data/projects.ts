export interface Project {
  name: string;
  desc: string;
  stack: string[];
  href: string;
  ariaLabel: string;
}

export const projects: Project[] = [
  {
    name: 'Purchase Orders API',
    desc: 'API REST para gerenciamento de pedidos de compra, com autenticação JWT, containerização via Docker e documentação interativa via Swagger.',
    stack: ['Python', 'Flask', 'PostgreSQL', 'Docker', 'JWT'],
    href: 'https://github.com/MiguelZGobbo/purchase-orders-api',
    ariaLabel: 'Ver o projeto Purchase Orders API no GitHub',
  },
  {
    name: 'API de Gerenciamento de Tarefas',
    desc: 'API REST para gerenciamento de tarefas utilizando Java e Spring Boot, com persistência de dados implementada via Spring Data JPA e MySQL, e gerenciamento de dependências e build com Maven.',
    stack: ['Java', 'Spring Boot', 'MySQL', 'Maven'],
    href: 'https://github.com/MiguelZGobbo/API-de-Gerenciamento-de-Tarefas',
    ariaLabel: 'Ver o projeto API de Gerenciamento de Tarefas no GitHub',
  },
  {
    name: 'Retro Car Horizon',
    desc: 'Jogo arcade 2D desenvolvido em Pygame, com três níveis de dificuldade e arquitetura baseada em Factory e Mediator para gerenciar entidades e colisões.',
    stack: ['Python', 'Pygame'],
    href: 'https://github.com/MiguelZGobbo/game_project',
    ariaLabel: 'Ver o projeto Retro Car Horizon no GitHub',
  },
  {
    name: 'Portfólio Miguel ZG',
    desc: 'Site pessoal desenvolvido com HTML, CSS e JavaScript, apresentando projetos, habilidades e contato com design responsivo e navegação fluida.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    href: 'https://github.com/MiguelZGobbo/portifolio-miguelzg',
    ariaLabel: 'Ver o projeto Portfólio Miguel ZG no GitHub',
  },
];
