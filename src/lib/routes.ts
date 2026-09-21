import type { Lang } from './i18n';

export type RouteSection = 'home' | 'projects' | 'skills' | 'about' | 'resume' | 'contact';

export const routeConfig = {
  pt: {
    home: '',
    caseStudySegment: 'projetos',
    sections: {
      home: 'home',
      projects: 'projetos',
      skills: 'competencias',
      about: 'sobre',
      resume: 'cv',
      contact: 'contato',
    },
  },
  en: {
    home: 'en',
    caseStudySegment: 'en/projects',
    sections: {
      home: 'home',
      projects: 'projects',
      skills: 'skills',
      about: 'about',
      resume: 'resume',
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

function validSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function homePath(base: string, lang: Lang, section?: RouteSection): string {
  const path = pathFor(base, routeConfig[lang].home);
  return section ? `${path}#${routeConfig[lang].sections[section]}` : path;
}

export function caseStudyPath(base: string, lang: Lang, slug: string): string {
  if (!validSlug(slug)) throw new TypeError('Case-study slug must be a non-empty URL-safe identifier.');
  return pathFor(base, `${routeConfig[lang].caseStudySegment}/${slug}`);
}

export function pageUrl(siteBase: string, path: string): string {
  return new URL(path.startsWith('/') ? path : `/${path}`, siteBase).href;
}
