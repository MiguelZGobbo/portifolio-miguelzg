export interface Localized {
  pt: string;
  en: string;
}

export type ProjectHierarchy = 'H1' | 'H2' | 'H3';
export type ProjectStateKey = 'completed' | 'in-development' | 'active';
export type ProjectDecision = 'INCLUDE';

export interface ProjectShowcaseContent {
  summary: Localized;
  technologies: string[];
  aspects: Localized[];
}

export interface Project {
  slug: string;
  name: Localized;
  summary: Localized;
  origin?: Localized;
  contribution?: Localized;
  state: Localized;
  stateKey: ProjectStateKey;
  hierarchy: ProjectHierarchy;
  decision: ProjectDecision;
  compact: boolean;
  evidence: Localized[];
  stack: string[];
  showcase: ProjectShowcaseContent;
  href: string;
  ariaLabel: Localized;
}

const purchaseOrdersSummary: Localized = {
  pt: 'Projeto individual desenvolvido durante um curso para construir uma API REST de gerenciamento de pedidos de compra e seus itens. Implementa autenticação de usuários via JWT, persistência em PostgreSQL com SQLAlchemy, migrações de banco, documentação com Swagger, execução com Docker e uma rotina de qualidade com testes automatizados, lint e pre-commit.',
  en: 'Individual project developed as part of a course to build a REST API for managing purchase orders and their items. It includes JWT-based user authentication, PostgreSQL persistence with SQLAlchemy, database migrations, Swagger documentation, Docker-based execution, and an automated quality workflow with testing, linting, and pre-commit checks.',
};

const purchaseOrdersEvidence: Localized[] = [
  { pt: 'Backend', en: 'Backend' },
  { pt: 'REST', en: 'REST' },
  { pt: 'autenticação', en: 'authentication' },
  { pt: 'persistência/ORM', en: 'persistence/ORM' },
  { pt: 'migrações', en: 'migrations' },
  { pt: 'documentação de API', en: 'API documentation' },
  { pt: 'Docker', en: 'Docker' },
  { pt: 'testes automatizados', en: 'automated testing' },
  { pt: 'qualidade de código', en: 'code quality' },
];

const beadWiseSummary: Localized = {
  pt: 'Projeto em desenvolvimento que organiza discovery, especificações, protótipos, código e testes para investigar mecanismos de sistema Windows com critérios explícitos de prova, segurança e reversibilidade.',
  en: 'Project in development that organizes discovery, specifications, prototypes, source code, and tests to investigate Windows system mechanisms with explicit proof, safety, and reversibility criteria.',
};

const beadWiseEvidence: Localized[] = [
  { pt: 'C#/.NET e organização de solution', en: 'C#/.NET and solution organization' },
  { pt: 'testes estruturais/harnesses', en: 'structural tests/harnesses' },
  { pt: 'investigação de APIs Windows', en: 'Windows API investigation' },
  { pt: 'prototipagem técnica', en: 'technical prototyping' },
  { pt: 'validação por evidência', en: 'evidence-based validation' },
  { pt: 'mecanismos reversíveis/seguros', en: 'reversible/safe mechanisms' },
];

const taskApiSummary: Localized = {
  pt: 'Projeto acadêmico individual de uma API REST para gerenciamento de tarefas, desenvolvido com Java e Spring Boot. Implementa operações de CRUD e persistência em MySQL por meio do Spring Data JPA, com coleção Postman para validação dos endpoints.',
  en: 'Individual academic project for a task management REST API built with Java and Spring Boot. It implements CRUD operations and MySQL persistence through Spring Data JPA, with a Postman collection used to validate the endpoints.',
};

const portfolioSummary: Localized = {
  pt: 'Portfólio pessoal desenvolvido com Astro, CSS e JavaScript para reunir apresentação profissional, projetos, currículo e formas de contato. A implementação utiliza componentes reutilizáveis e inclui PT/EN, dark mode, responsividade, recursos de acessibilidade e SEO, além de build e deploy automatizados com GitHub Actions.',
  en: 'Personal portfolio built with Astro, CSS, and JavaScript to bring together my professional profile, projects, resume, and contact options. The implementation uses reusable components and includes PT/EN support, dark mode, responsive behavior, accessibility and SEO features, as well as automated build and deployment with GitHub Actions.',
};

const taskApiEvidence: Localized[] = [
  { pt: 'Java', en: 'Java' },
  { pt: 'Spring Boot', en: 'Spring Boot' },
  { pt: 'REST', en: 'REST' },
  { pt: 'CRUD', en: 'CRUD' },
  { pt: 'persistência relacional', en: 'relational persistence' },
  { pt: 'Spring Data JPA', en: 'Spring Data JPA' },
  { pt: 'MySQL', en: 'MySQL' },
  { pt: 'ecossistema Maven/Postman', en: 'Maven/Postman ecosystem' },
];

const portfolioEvidence: Localized[] = [
  { pt: 'JavaScript', en: 'JavaScript' },
  { pt: 'Astro', en: 'Astro' },
  { pt: 'HTML/CSS', en: 'HTML/CSS' },
  { pt: 'componentização', en: 'componentization' },
  { pt: 'responsividade', en: 'responsive behavior' },
  { pt: 'acessibilidade', en: 'accessibility' },
  { pt: 'internacionalização', en: 'internationalization' },
  { pt: 'SEO', en: 'SEO' },
  { pt: 'CI/CD / GitHub Actions', en: 'CI/CD / GitHub Actions' },
];

export const projects: Project[] = [
  {
    slug: 'purchase-orders-api',
    name: { pt: 'Purchase Orders API', en: 'Purchase Orders API' },
    summary: purchaseOrdersSummary,
    origin: { pt: 'Projeto individual desenvolvido durante um curso', en: 'Individual project developed as part of a course' },
    contribution: { pt: 'individual', en: 'individual' },
    state: { pt: 'concluído', en: 'completed' },
    stateKey: 'completed',
    hierarchy: 'H1',
    decision: 'INCLUDE',
    compact: false,
    evidence: purchaseOrdersEvidence,
    stack: ['Python', 'Flask', 'PostgreSQL', 'SQLAlchemy', 'JWT', 'Docker', 'Pytest'],
    showcase: {
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
      pt: 'Ver o projeto Purchase Orders API no GitHub',
      en: 'View the Purchase Orders API project on GitHub',
    },
  },
  {
    slug: 'beadwise',
    name: { pt: 'BeadWise', en: 'BeadWise' },
    summary: beadWiseSummary,
    state: { pt: 'em desenvolvimento', en: 'in development' },
    stateKey: 'in-development',
    hierarchy: 'H2',
    decision: 'INCLUDE',
    compact: false,
    evidence: beadWiseEvidence,
    stack: ['C#', '.NET', 'Windows APIs'],
    showcase: {
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
      pt: 'Ver o projeto BeadWise no GitHub',
      en: 'View the BeadWise project on GitHub',
    },
  },
  {
    slug: 'portfolio',
    name: { pt: 'Portfólio Miguel ZG', en: 'Miguel ZG Portfolio' },
    summary: portfolioSummary,
    origin: { pt: 'pessoal', en: 'personal' },
    contribution: { pt: 'individual', en: 'individual' },
    state: { pt: 'ativo / em evolução', en: 'active / evolving' },
    stateKey: 'active',
    hierarchy: 'H3',
    decision: 'INCLUDE',
    compact: true,
    evidence: portfolioEvidence,
    stack: ['Astro', 'HTML', 'CSS', 'JavaScript'],
    showcase: {
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
      pt: 'Ver o projeto Portfólio Miguel ZG no GitHub',
      en: 'View the Miguel ZG Portfolio project on GitHub',
    },
  },
  {
    slug: 'task-management-api',
    name: { pt: 'API de Gerenciamento de Tarefas', en: 'Task Management API' },
    summary: taskApiSummary,
    origin: { pt: 'acadêmico', en: 'academic' },
    contribution: { pt: 'individual', en: 'individual' },
    state: { pt: 'concluído', en: 'completed' },
    stateKey: 'completed',
    hierarchy: 'H3',
    decision: 'INCLUDE',
    compact: true,
    evidence: taskApiEvidence,
    stack: ['Java', 'Spring Boot', 'Spring Data JPA', 'MySQL', 'Maven', 'Postman'],
    showcase: {
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
      pt: 'Ver o projeto API de Gerenciamento de Tarefas no GitHub',
      en: 'View the Task Management API project on GitHub',
    },
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
