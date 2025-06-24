import { Memorial } from '@/types/memorial';

// Base configuration for SEO
export const seoConfig = {
  siteName: 'Eternal Capsule',
  defaultTitle: 'Eternal Capsule - Digital Memorial Platform',
  defaultDescription: 'Create lasting digital memorials to honor and remember loved ones. Share memories, photos, and stories in a beautiful, interactive memorial.',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://eternal-capsule.com',
  defaultOgImage: '/images/og-default.jpg',
  twitterHandle: '@eternalcapsule',
  themeColor: '#1f2937',
  keywords: [
    'digital memorial',
    'online memorial',
    'memorial website',
    'remembrance',
    'tribute',
    'obituary',
    'memory sharing',
    'digital legacy',
    'virtual memorial',
    'commemoration'
  ],
};

// Generate page title for memorial
export function generateMemorialTitle(memorial: Memorial): string {
  return `${memorial.name} - Memorial | ${seoConfig.siteName}`;
}

// Generate page description for memorial
export function generateMemorialDescription(memorial: Memorial): string {
  const bornYear = memorial.born ? new Date(memorial.born).getFullYear() : 'Unknown';
  const diedYear = memorial.died ? new Date(memorial.died).getFullYear() : 'Unknown';
  return `Remembering ${memorial.name} (${bornYear} - ${diedYear}). ${memorial.subtitle || 'A life celebrated and remembered.'} Share memories and pay tribute.`;
}

// Generate keywords for memorial
export function generateMemorialKeywords(memorial: Memorial): string {
  const keywords = [
    memorial.name,
    'memorial',
    'tribute',
    'remembrance',
    ...(memorial.tags || []),
    ...seoConfig.keywords
  ];
  return keywords.join(', ');
}

// Generate structured data (JSON-LD) for memorial
export function generateMemorialStructuredData(memorial: Memorial) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: memorial.name,
    description: memorial.subtitle,
    birthDate: memorial.born,
    deathDate: memorial.died,
    birthPlace: memorial.bornAt?.location,
    deathPlace: memorial.diedAt?.location,
    url: `${seoConfig.siteUrl}/memorial/${memorial.slug.current}`,
    sameAs: [], // Could include social media links if available
    knowsAbout: memorial.tags,
    memorialWebsite: {
      '@type': 'WebSite',
      name: `${memorial.name} Memorial`,
      url: `${seoConfig.siteUrl}/memorial/${memorial.slug.current}`,
      publisher: {
        '@type': 'Organization',
        name: seoConfig.siteName,
        url: seoConfig.siteUrl,
      },
    },
  };
}

// Generate breadcrumb structured data
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Generate organization structured data
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    logo: `${seoConfig.siteUrl}/logo.png`,
    description: seoConfig.defaultDescription,
    sameAs: [
      // Add social media links when available
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'English',
    },
  };
}

// Generate sitemap URLs
export interface SitemapUrl {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export function generateSitemapUrls(memorials: Memorial[]): SitemapUrl[] {
  const staticUrls: SitemapUrl[] = [
    {
      url: seoConfig.siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${seoConfig.siteUrl}/memorial/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${seoConfig.siteUrl}/memorial/create`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  const memorialUrls: SitemapUrl[] = memorials
    .filter(memorial => memorial.privacy === 'public')
    .map(memorial => ({
      url: `${seoConfig.siteUrl}/memorial/${memorial.slug.current}`,
      lastModified: new Date(memorial.updatedAt || memorial.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));

  return [...staticUrls, ...memorialUrls];
}

// Robots.txt generation
export function generateRobotsTxt(): string {
  const rules = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    'Disallow: /studio',
    'Disallow: /memorial/create',
    '',
    `Sitemap: ${seoConfig.siteUrl}/sitemap.xml`,
    '',
    '# Private memorial pages are handled by meta robots tags',
  ];

  return rules.join('\n');
}

// Performance-focused image optimization for SEO
export function optimizeImageForSEO(
  imageUrl: string,
  options: {
    width: number;
    height: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  }
): string {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // For Sanity images, add optimization parameters
  if (imageUrl.includes('cdn.sanity.io')) {
    return `${imageUrl}?w=${width}&h=${height}&q=${quality}&fm=${format}&fit=crop`;
  }
  
  // For other images, return as is (could integrate with other CDNs)
  return imageUrl;
}

// Generate canonical URL
export function generateCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${seoConfig.siteUrl}${cleanPath}`;
}

// Generate Open Graph meta tags
export function generateOpenGraphTags(memorial: Memorial): Record<string, string> {
  return {
    'og:title': generateMemorialTitle(memorial),
    'og:description': generateMemorialDescription(memorial),
    'og:type': 'profile',
    'og:url': `${seoConfig.siteUrl}/memorial/${memorial.slug.current}`,
    'og:site_name': seoConfig.siteName,
    'og:image': seoConfig.defaultOgImage,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:alt': `Memorial photo of ${memorial.name}`,
    'og:locale': 'en_US',
  };
}

// Generate Twitter Card meta tags
export function generateTwitterCardTags(memorial: Memorial): Record<string, string> {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:site': seoConfig.twitterHandle,
    'twitter:creator': seoConfig.twitterHandle,
    'twitter:title': generateMemorialTitle(memorial),
    'twitter:description': generateMemorialDescription(memorial),
    'twitter:image': seoConfig.defaultOgImage,
  };
}

// Generate all meta tags for a memorial
export function generateAllMetaTags(memorial: Memorial): Record<string, string> {
  return {
    title: generateMemorialTitle(memorial),
    description: generateMemorialDescription(memorial),
    keywords: generateMemorialKeywords(memorial),
    author: seoConfig.siteName,
    'theme-color': seoConfig.themeColor,
    'canonical': `${seoConfig.siteUrl}/memorial/${memorial.slug.current}`,
    'robots': memorial.privacy === 'public' ? 'index,follow' : 'noindex,nofollow',
    ...generateOpenGraphTags(memorial),
    ...generateTwitterCardTags(memorial),
  };
}

// SEO validation utility
export function validateSEOContent(title: string, description: string): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check title length
  if (title) {
    const titleLength = title.length;
    if (titleLength > 60) {
      warnings.push(`Title is ${titleLength} characters (recommended: 50-60)`);
    }
    if (titleLength < 30) {
      warnings.push(`Title is ${titleLength} characters (recommended: 30-60)`);
    }
  } else {
    errors.push('Title is missing');
  }

  // Check description length
  if (description) {
    const descLength = description.length;
    if (descLength > 160) {
      warnings.push(`Description is ${descLength} characters (recommended: 120-160)`);
    }
    if (descLength < 120) {
      warnings.push(`Description is ${descLength} characters (recommended: 120-160)`);
    }
  } else {
    errors.push('Description is missing');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}

// Bundle size analysis utility
export function analyzeBundleSize() {
  return {
    // This would integrate with webpack-bundle-analyzer or similar
    // For now, just provide structure for future implementation
    totalSize: 0,
    chunks: [],
    recommendations: [],
  };
} 