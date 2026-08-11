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
    tags: { pt: ['Python', 'Java', 'HTML', 'CSS', 'JavaScript'], en: ['Python', 'Java', 'HTML', 'CSS', 'JavaScript'] },
  },
  {
    cat: { pt: 'Backend', en: 'Backend' },
    tags: { pt: ['Flask', 'REST APIs', 'JWT', 'Spring Boot', 'Pytest', 'Docker', 'Swagger'], en: ['Flask', 'REST APIs', 'JWT', 'Spring Boot', 'Pytest', 'Docker', 'Swagger'] },
  },
  {
    cat: { pt: 'Banco de dados', en: 'Databases' },
    tags: { pt: ['PostgreSQL', 'MySQL', 'Neo4j'], en: ['PostgreSQL', 'MySQL', 'Neo4j'] },
  },
  {
    cat: { pt: 'Ferramentas', en: 'Tools' },
    tags: { pt: ['Git', 'GitHub', 'Figma', 'Draw.io', 'WSL2', 'Maven', 'Postman', 'Excel', 'PowerPoint'], en: ['Git', 'GitHub', 'Figma', 'Draw.io', 'WSL2', 'Maven', 'Postman', 'Excel', 'PowerPoint'] },
  },
  {
    cat: { pt: 'Soft Skills', en: 'Soft Skills' },
    tags: {
      pt: ['Organização', 'Comprometimento', 'Atenção a Detalhes', 'Pensamento Crítico', 'Comunicação'],
      en: ['Organization', 'Commitment', 'Attention to Detail', 'Critical Thinking', 'Communication'],
    },
  },
];
