export interface Localized {
  pt: string;
  en: string;
}

export interface SkillGroup {
  cat: Localized;
  tags: { pt: string[]; en: string[] };
}

export const skillGroups: SkillGroup[] = [
  {
    cat: { pt: 'Linguagens', en: 'Languages' },
    tags: { pt: ['Python', 'Java', 'JavaScript', 'C#'], en: ['Python', 'Java', 'JavaScript', 'C#'] },
  },
  {
    cat: { pt: 'Backend', en: 'Backend' },
    tags: { pt: ['Flask', 'Spring Boot', 'APIs REST'], en: ['Flask', 'Spring Boot', 'REST APIs'] },
  },
  {
    cat: { pt: 'Dados e persistência', en: 'Data & Persistence' },
    tags: { pt: ['SQL', 'PostgreSQL', 'MySQL', 'SQLAlchemy', 'Spring Data JPA'], en: ['SQL', 'PostgreSQL', 'MySQL', 'SQLAlchemy', 'Spring Data JPA'] },
  },
  {
    cat: { pt: 'Testes e qualidade', en: 'Testing & Quality' },
    tags: { pt: ['Testes automatizados', 'Pytest'], en: ['Automated Testing', 'Pytest'] },
  },
  {
    cat: { pt: 'Ambiente e desenvolvimento', en: 'Development Environment' },
    tags: { pt: ['Docker', 'Docker Compose', 'Git'], en: ['Docker', 'Docker Compose', 'Git'] },
  },
];
