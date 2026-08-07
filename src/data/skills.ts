export interface SkillGroup {
  cat: string;
  tags: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    cat: 'Linguagens',
    tags: ['Python', 'Java', 'HTML', 'CSS', 'JavaScript'],
  },
  {
    cat: 'Backend',
    tags: ['Flask', 'REST APIs', 'JWT', 'Spring Boot', 'Pytest', 'Docker', 'Swagger'],
  },
  {
    cat: 'Banco de dados',
    tags: ['PostgreSQL', 'MySQL', 'Neo4j'],
  },
  {
    cat: 'Ferramentas',
    tags: ['Git', 'GitHub', 'Figma', 'Draw.io', 'WSL2', 'Maven', 'Postman', 'Excel', 'PowerPoint'],
  },
  {
    cat: 'Soft Skills',
    tags: ['Organização', 'Comprometimento', 'Atenção a Detalhes', 'Pensamento Crítico', 'Comunicação'],
  },
];
