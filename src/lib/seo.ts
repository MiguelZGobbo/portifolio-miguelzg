import { translations, type Lang } from './i18n.ts';
import { homePath, pageUrl } from './routes.ts';

export function homeMetadata(siteOrigin: string, base: string, lang: Lang) {
  const dict = translations[lang];
  const canonicalUrl = pageUrl(siteOrigin, homePath(base, lang));
  const alternateUrls = {
    'pt-BR': pageUrl(siteOrigin, homePath(base, 'pt')),
    en: pageUrl(siteOrigin, homePath(base, 'en')),
  };
  const imageUrl = pageUrl(siteOrigin, `${base}img/foto-perfil.jpeg`);
  const title = dict['meta.title'];
  const description = dict['meta.description'];
  const personId = `${canonicalUrl}#person`;
  const structuredData = [
    {
      '@type': 'WebPage',
      '@id': canonicalUrl,
      url: canonicalUrl,
      name: title,
      description,
      inLanguage: lang === 'pt' ? 'pt-BR' : 'en',
      mainEntity: { '@id': personId },
    },
    {
      '@type': 'Person',
      '@id': personId,
      name: 'Miguel Zager Gobbo',
      jobTitle: dict['hero.title'],
      image: imageUrl,
      email: 'mailto:miguelzgobbo@gmail.com',
      sameAs: [
        'https://www.linkedin.com/in/miguel-zager-gobbo',
        'https://github.com/MiguelZGobbo',
      ],
    },
  ];
  const siteName = lang === 'pt' ? 'Portfólio de Miguel Zager Gobbo' : 'Miguel Zager Gobbo Portfolio';
  return { title, description, canonicalUrl, alternateUrls, imageUrl, imageAlt: dict['img.profile.alt'], siteName, structuredData };
}
