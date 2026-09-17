export interface Localized {
  pt: string;
  en: string;
}

export type ProjectHierarchy = 'H1' | 'H2' | 'H3';
export type ProjectStateKey = 'completed' | 'in-development' | 'active';
export type ProjectDecision = 'INCLUDE';

export interface CaseStudyContent {
  overview: Localized;
  context: Localized;
  built: Localized;
  decisions: Localized[];
  implementation: Localized;
  validation: Localized;
  result: Localized;
  limitations: Localized;
  evidence: Localized[];
}

export interface Project {
  slug: string;
  name: Localized;
  summary: Localized;
  /** Kept as a compatibility alias for existing card consumers. */
  desc: Localized;
  origin?: Localized;
  contribution?: Localized;
  state: Localized;
  stateKey: ProjectStateKey;
  hierarchy: ProjectHierarchy;
  decision: ProjectDecision;
  compact: boolean;
  evidence: Localized[];
  stack: string[];
  href: string;
  ariaLabel: Localized;
  caseStudy?: CaseStudyContent;
}

export type CaseStudyProject = Project & { caseStudy: CaseStudyContent };

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

const purchaseOrdersCaseStudy: CaseStudyContent = {
  overview: {
    pt: 'API REST concluída para gerenciamento de pedidos de compra e seus itens, com autenticação, persistência relacional, migrações, documentação, execução reproduzível e validação automatizada.',
    en: 'Completed REST API for managing purchase orders and their items, with authentication, relational persistence, migrations, documentation, reproducible execution, and automated validation.',
  },
  context: {
    pt: 'Projeto individual desenvolvido durante um curso para praticar a construção de uma API de backend com escopo observável e execução reproduzível.',
    en: 'Individual project developed as part of a course to practice building a backend API with an observable scope and reproducible execution.',
  },
  built: {
    pt: purchaseOrdersSummary.pt,
    en: purchaseOrdersSummary.en,
  },
  decisions: [
    {
      pt: 'Usar JWT para autenticação de usuários da API.',
      en: 'Use JWT for API user authentication.',
    },
    {
      pt: 'Usar PostgreSQL com SQLAlchemy e migrações para organizar a persistência e a evolução do banco.',
      en: 'Use PostgreSQL with SQLAlchemy and migrations to organize persistence and database evolution.',
    },
    {
      pt: 'Manter documentação Swagger, execução com Docker e uma rotina de qualidade verificável.',
      en: 'Keep Swagger documentation, Docker-based execution, and a verifiable quality workflow.',
    },
  ],
  implementation: {
    pt: 'A implementação pública demonstra uma API REST com Flask, autenticação JWT, PostgreSQL com SQLAlchemy, migrações com Flask-Migrate/Alembic, Swagger/Flasgger, Docker/Docker Compose e organização modular.',
    en: 'The public implementation demonstrates a Flask REST API, JWT authentication, PostgreSQL with SQLAlchemy, Flask-Migrate/Alembic migrations, Swagger/Flasgger, Docker/Docker Compose, and a modular organization.',
  },
  validation: {
    pt: 'A validação inclui suíte de testes executável com Pytest, Ruff, pre-commit, Makefile, documentação e exemplos de execução e endpoints.',
    en: 'Validation includes an executable Pytest suite, Ruff, pre-commit, Makefile, documentation, and execution and endpoint examples.',
  },
  result: {
    pt: 'O projeto é tratado como concluído e reúne implementação observável, testes, autenticação, persistência, migrações, Docker e documentação em uma evidência principal de backend.',
    en: 'The project is treated as completed and brings together observable implementation, testing, authentication, persistence, migrations, Docker, and documentation as a primary backend evidence.',
  },
  limitations: {
    pt: 'O material de referência não apresenta métricas de produção; a avaliação deve se basear na implementação, na execução reproduzível, nos testes, na qualidade e na documentação observáveis.',
    en: 'The reference material does not present production metrics; evaluation should be based on the observable implementation, reproducible execution, tests, quality checks, and documentation.',
  },
  evidence: [
    {
      pt: 'Repositório público com código, testes, documentação e exemplos de execução.',
      en: 'Public repository with source code, tests, documentation, and execution examples.',
    },
  ],
};

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

const beadWiseCaseStudy: CaseStudyContent = {
  overview: {
    pt: 'Projeto em desenvolvimento com evidência de engenharia real. O estado atual separa o que foi especificado, prototipado e comprovado do que ainda não é produto final.',
    en: 'Project in development with real engineering evidence. The current state separates what has been specified, prototyped, and proven from what is not yet a final product.',
  },
  context: {
    pt: 'O repositório organiza discovery, feature specs, prototypes, src e tests para investigar um problema complexo de software Windows antes de promover hipóteses a implementação final.',
    en: 'The repository organizes discovery, feature specs, prototypes, src, and tests to investigate a complex Windows software problem before promoting hypotheses to final implementation.',
  },
  built: {
    pt: 'A solução pública contém BeadWise.App, BeadWise.Application, BeadWise.Core, BeadWise.Windows e projetos de teste, além de uma matriz de provas e uma fixture de processo controlado.',
    en: 'The public solution contains BeadWise.App, BeadWise.Application, BeadWise.Core, BeadWise.Windows, and test projects, along with a proof matrix and a controlled-process fixture.',
  },
  decisions: [
    {
      pt: 'Separar discovery, especificações, protótipos, código e testes para manter o estado de cada hipótese explícito.',
      en: 'Separate discovery, specifications, prototypes, source code, and tests so the state of each hypothesis stays explicit.',
    },
    {
      pt: 'Usar critérios de prova e harnesses para validar mecanismos técnicos em ambiente controlado.',
      en: 'Use proof criteria and harnesses to validate technical mechanisms in a controlled environment.',
    },
    {
      pt: 'Priorizar mecanismos seguros e reversíveis antes de qualquer promoção para contratos e componentes finais.',
      en: 'Prioritize safe and reversible mechanisms before any promotion to final contracts and components.',
    },
  ],
  implementation: {
    pt: 'A organização observada inclui uma solution C#/.NET com camadas de App, Application, Core e Windows, projetos de teste e uma fixture de processo controlado. Nenhum prototype é promovido automaticamente para backend final, UI, DI, IPC ou contratos finais.',
    en: 'The observed organization includes a C#/.NET solution with App, Application, Core, and Windows layers, test projects, and a controlled-process fixture. No prototype is automatically promoted to final backend, UI, DI, IPC, or contracts.',
  },
  validation: {
    pt: 'A Fase 2 técnica registrou 234 Feature Specs, 90 em SPECIFIED e 40/40 harnesses executados na verificação central, com provas envolvendo Win32/PInvoke, Registry com snapshot/rollback, Performance Counters, AMD ADL, UAC/admin e restart controlado de processo.',
    en: 'The technical Phase 2 recorded 234 Feature Specs, 90 in SPECIFIED, and 40/40 harnesses executed in the central verification, with proofs involving Win32/PInvoke, Registry snapshot/rollback, Performance Counters, AMD ADL, UAC/admin, and controlled process restart.',
  },
  result: {
    pt: 'O resultado comprovado é evidência de processo de engenharia, investigação e validação técnica. A documentação registra PROVEN = 0 e APPROVED = 0; o projeto permanece em desenvolvimento.',
    en: 'The proven result is evidence of an engineering process, investigation, and technical validation. The documentation records PROVEN = 0 and APPROVED = 0; the project remains in development.',
  },
  limitations: {
    pt: 'BeadWise não deve ser apresentado como produto final nem como 234 funcionalidades implementadas. Há capabilities em RESEARCH, BLOCKED ou DEFERRED, e prototypes ainda não equivalem a backend final, UI, DI, IPC ou contratos finais.',
    en: 'BeadWise must not be presented as a final product or as 234 implemented features. Some capabilities remain in RESEARCH, BLOCKED, or DEFERRED, and prototypes are not equivalent to final backend, UI, DI, IPC, or contracts.',
  },
  evidence: [
    {
      pt: 'Repositório público com discovery, especificações, protótipos, solution, testes, matriz de provas e fixture de processo controlado.',
      en: 'Public repository with discovery, specifications, prototypes, solution, tests, proof matrix, and controlled-process fixture.',
    },
  ],
};

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
    desc: purchaseOrdersSummary,
    origin: { pt: 'Projeto individual desenvolvido durante um curso', en: 'Individual project developed as part of a course' },
    contribution: { pt: 'individual', en: 'individual' },
    state: { pt: 'concluído', en: 'completed' },
    stateKey: 'completed',
    hierarchy: 'H1',
    decision: 'INCLUDE',
    compact: false,
    evidence: purchaseOrdersEvidence,
    stack: ['Python', 'Flask', 'PostgreSQL', 'SQLAlchemy', 'JWT', 'Docker', 'Pytest'],
    href: 'https://github.com/MiguelZGobbo/purchase-orders-api',
    ariaLabel: {
      pt: 'Ver o projeto Purchase Orders API no GitHub',
      en: 'View the Purchase Orders API project on GitHub',
    },
    caseStudy: purchaseOrdersCaseStudy,
  },
  {
    slug: 'beadwise',
    name: { pt: 'BeadWise', en: 'BeadWise' },
    summary: beadWiseSummary,
    desc: beadWiseSummary,
    state: { pt: 'em desenvolvimento', en: 'in development' },
    stateKey: 'in-development',
    hierarchy: 'H2',
    decision: 'INCLUDE',
    compact: false,
    evidence: beadWiseEvidence,
    stack: ['C#', '.NET', 'Windows APIs'],
    href: 'https://github.com/MiguelZGobbo/beadwise',
    ariaLabel: {
      pt: 'Ver o projeto BeadWise no GitHub',
      en: 'View the BeadWise project on GitHub',
    },
    caseStudy: beadWiseCaseStudy,
  },
  {
    slug: 'portfolio',
    name: { pt: 'Portfólio Miguel ZG', en: 'Miguel ZG Portfolio' },
    summary: portfolioSummary,
    desc: portfolioSummary,
    origin: { pt: 'pessoal', en: 'personal' },
    contribution: { pt: 'individual', en: 'individual' },
    state: { pt: 'ativo / em evolução', en: 'active / evolving' },
    stateKey: 'active',
    hierarchy: 'H3',
    decision: 'INCLUDE',
    compact: true,
    evidence: portfolioEvidence,
    stack: ['Astro', 'HTML', 'CSS', 'JavaScript'],
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
    desc: taskApiSummary,
    origin: { pt: 'acadêmico', en: 'academic' },
    contribution: { pt: 'individual', en: 'individual' },
    state: { pt: 'concluído', en: 'completed' },
    stateKey: 'completed',
    hierarchy: 'H3',
    decision: 'INCLUDE',
    compact: true,
    evidence: taskApiEvidence,
    stack: ['Java', 'Spring Boot', 'Spring Data JPA', 'MySQL', 'Maven', 'Postman'],
    href: 'https://github.com/MiguelZGobbo/API-de-Gerenciamento-de-Tarefas',
    ariaLabel: {
      pt: 'Ver o projeto API de Gerenciamento de Tarefas no GitHub',
      en: 'View the Task Management API project on GitHub',
    },
  },
];

function hasCaseStudy(project: Project): project is CaseStudyProject {
  return project.caseStudy !== undefined;
}

export const caseStudyProjects: CaseStudyProject[] = projects.filter(hasCaseStudy);

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
