export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MarketPulse",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Real-time financial intelligence platform. Track stocks, crypto, and forex in one dashboard with AI-powered insights and price alerts.",
    url: "https://marketpulse-cxg.pages.dev",
    offers: [
      { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
      { "@type": "Offer", name: "Pro", price: "9.99", priceCurrency: "USD" },
      { "@type": "Offer", name: "Premium", price: "49.99", priceCurrency: "USD" },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MarketPulse",
    url: "https://marketpulse-cxg.pages.dev",
    description:
      "Free real-time market dashboard for stocks, crypto, and forex.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://marketpulse-cxg.pages.dev/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BlogPostSchema({
  title,
  description,
  slug,
  date,
  image,
}: {
  title: string;
  description: string;
  slug: string;
  date: string;
  image: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: `https://marketpulse-cxg.pages.dev${image}`,
    datePublished: date,
    dateModified: date,
    author: { "@type": "Organization", name: "MarketPulse", url: "https://marketpulse-cxg.pages.dev" },
    publisher: { "@type": "Organization", name: "MarketPulse", url: "https://marketpulse-cxg.pages.dev" },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://marketpulse-cxg.pages.dev/blog/${slug}` },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `https://marketpulse-cxg.pages.dev${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
