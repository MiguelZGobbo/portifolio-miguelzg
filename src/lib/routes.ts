import type { Lang } from './i18n';

export type RouteSection = 'home' | 'projects' | 'skills' | 'about' | 'contact';

export const routeConfig = {
  pt: {
    home: '',
    sections: {
      home: 'home',
      projects: 'projetos',
      skills: 'competencias',
      about: 'sobre',
      contact: 'contato',
    },
  },
  en: {
    home: 'en',
    sections: {
      home: 'home',
      projects: 'projects',
      skills: 'skills',
      about: 'about',
      contact: 'contact',
    },
  },
} as const;

function normalizedBase(base: string): string {
  const value = base.trim().replace(/^\/+|\/+$/g, '');
  return value ? `/${value}` : '';
}

function pathFor(base: string, segment: string): string {
  return `${normalizedBase(base)}${segment ? `/${segment}` : ''}/`;
}

export function homePath(base: string, lang: Lang, section?: RouteSection): string {
  const path = pathFor(base, routeConfig[lang].home);
  return section ? `${path}#${routeConfig[lang].sections[section]}` : path;
}

export function pageUrl(siteBase: string, path: string): string {
  return new URL(path.startsWith('/') ? path : `/${path}`, siteBase).href;
}
