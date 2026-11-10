import { useEffect } from 'react';

/**
 * SEO component to dynamically manage document head meta tags,
 * OpenGraph, Twitter Cards, canonical links, and Schema.org JSON-LD.
 */
export default function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  product,
  schema,
  keywords,
}) {
  useEffect(() => {
    // 1. Page Title
    const baseTitle = 'KuduMart — Find your next great thing';
    const siteName = 'KuduMart';
    const fullTitle = title
      ? title.includes(siteName)
        ? title
        : `${title} | ${siteName}`
      : baseTitle;
    document.title = fullTitle;

    // Helper to set or create meta tag
    const setMeta = (attr, key, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper for link tags (e.g. canonical)
    const setLink = (rel, href) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    const currentUrl = url || window.location.href;
    const finalDescription =
      description ||
      'Discover more with KuduMart — Nigeria’s marketplace for verified products, services, auctions, and flexible installment layaway.';
    const finalImage = image || `${window.location.origin}/kudumart-logo.png`;

    // Standard Meta
    setMeta('name', 'description', finalDescription);
    if (keywords) setMeta('name', 'keywords', keywords);

    // Canonical Link
    setLink('canonical', currentUrl);

    // OpenGraph
    setMeta('property', 'og:site_name', siteName);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', finalDescription);
    setMeta('property', 'og:url', currentUrl);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:image', finalImage);

    // Twitter Card
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', finalDescription);
    setMeta('name', 'twitter:image', finalImage);

    // Schema.org JSON-LD Structured Data
    let scriptTag = document.querySelector('script[data-seo-jsonld="true"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      scriptTag.setAttribute('data-seo-jsonld', 'true');
      document.head.appendChild(scriptTag);
    }

    let jsonLdData = null;

    if (product) {
      setMeta('property', 'product:price:amount', String(product.price || ''));
      setMeta('property', 'product:price:currency', product.currency || 'NGN');

      jsonLdData = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        image: product.image ? [product.image] : undefined,
        description: product.description || finalDescription,
        sku: product.sku || undefined,
        brand: product.brand
          ? {
              '@type': 'Brand',
              name: product.brand,
            }
          : undefined,
        offers: {
          '@type': 'Offer',
          url: currentUrl,
          priceCurrency: product.currency || 'NGN',
          price: product.price,
          availability:
            product.inStock !== false
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          itemCondition:
            product.condition === 'used'
              ? 'https://schema.org/UsedCondition'
              : 'https://schema.org/NewCondition',
          seller: product.seller
            ? {
                '@type': 'Organization',
                name: product.seller,
              }
            : undefined,
        },
      };
    } else if (schema) {
      jsonLdData = schema;
    } else {
      // Default WebSite & Organization schema
      jsonLdData = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': `${window.location.origin}/#organization`,
            name: 'KuduMart',
            url: window.location.origin,
            logo: `${window.location.origin}/kudumart-logo.png`,
            sameAs: [
              'https://facebook.com/kudumart',
              'https://twitter.com/kudumart',
              'https://instagram.com/kudumart',
            ],
          },
          {
            '@type': 'WebSite',
            '@id': `${window.location.origin}/#website`,
            url: window.location.origin,
            name: 'KuduMart',
            publisher: {
              '@id': `${window.location.origin}/#organization`,
            },
            potentialAction: {
              '@type': 'SearchAction',
              target: `${window.location.origin}/catalog?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          },
        ],
      };
    }

    if (jsonLdData) {
      scriptTag.textContent = JSON.stringify(jsonLdData);
    }
  }, [title, description, image, url, type, product, schema, keywords]);

  return null;
}
