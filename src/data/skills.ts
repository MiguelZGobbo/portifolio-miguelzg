export interface Localized {
  pt: string;
  en: string;
}

export interface SkillGroup {
  cat: Localized;
  icon: 'code' | 'server' | 'database' | 'check' | 'terminal';
  tags: { pt: string[]; en: string[] };
}

export const skillGroups: SkillGroup[] = [
  {
    cat: { pt: 'Linguagens', en: 'Languages' },
    icon: 'code',
    tags: { pt: ['Python', 'Java', 'JavaScript', 'C#'], en: ['Python', 'Java', 'JavaScript', 'C#'] },
  },
  {
    cat: { pt: 'Backend', en: 'Backend' },
    icon: 'server',
    tags: { pt: ['Flask', 'Spring Boot', 'APIs REST'], en: ['Flask', 'Spring Boot', 'REST APIs'] },
  },
  {
    cat: { pt: 'Dados e persistência', en: 'Data & Persistence' },
    icon: 'database',
    tags: { pt: ['SQL', 'PostgreSQL', 'MySQL', 'SQLAlchemy', 'Spring Data JPA'], en: ['SQL', 'PostgreSQL', 'MySQL', 'SQLAlchemy', 'Spring Data JPA'] },
  },
  {
    cat: { pt: 'Testes e qualidade', en: 'Testing & Quality' },
    icon: 'check',
    tags: { pt: ['Testes automatizados', 'Pytest'], en: ['Automated Testing', 'Pytest'] },
  },
  {
    cat: { pt: 'Ambiente e desenvolvimento', en: 'Development Environment' },
    icon: 'terminal',
    tags: { pt: ['Docker', 'Docker Compose', 'Git'], en: ['Docker', 'Docker Compose', 'Git'] },
  },
];
