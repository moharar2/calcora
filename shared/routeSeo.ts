import { calculatorRegistry, publishedCalculatorKinds } from "./calculatorRegistry";
import { blogArticles, calculatorContent, categoryContent, publishedCategoryOrder } from "./seoContent";
import type { CalculatorKind } from "./calculators";

export const SITE_ORIGIN = "https://moneycalci.online";
export const SOCIAL_IMAGE_PATH = "/social-card.svg";

export type RouteSeo = {
  title: string;
  description: string;
  canonicalPath: string;
  ogType: "website" | "article";
  indexable: true;
};

const staticRoutes: Record<string, Omit<RouteSeo, "canonicalPath"> & { canonicalPath?: string }> = {
  "/": {
    title: "MoneyCalci — Calculate Smarter. Decide Better.",
    description: "Free, easy-to-understand financial calculators for loans, mortgages, savings, investments, and more.",
    ogType: "website",
    indexable: true,
  },
  "/calculators": {
    title: "Financial Calculators — MoneyCalci",
    description: "Explore free financial calculators for loans, mortgages, savings, investments, salary, taxes, and business decisions.",
    ogType: "website",
    indexable: true,
  },
  "/categories": {
    title: "Financial Calculator Categories — MoneyCalci",
    description: "Browse MoneyCalci calculators by financial category, including loans, salary, taxes, investment, business, ecommerce, currency, and savings.",
    ogType: "website",
    indexable: true,
  },
  "/blog": {
    title: "Financial Guides & Calculations — MoneyCalci",
    description: "Read practical MoneyCalci guides explaining loans, compound interest, profit margin, ROI, gross pay, and net pay.",
    ogType: "website",
    indexable: true,
  },
  "/about": {
    title: "About MoneyCalci",
    description: "Learn how MoneyCalci creates clear educational financial estimates.",
    ogType: "website",
    indexable: true,
  },
  "/contact": {
    title: "Contact MoneyCalci",
    description: "Contact MoneyCalci with questions or feedback about the calculators.",
    ogType: "website",
    indexable: true,
  },
  "/privacy-policy": {
    title: "Privacy Policy | MoneyCalci",
    description: "Read how MoneyCalci handles local calculator preferences, shareable URLs, analytics, and data-use information.",
    ogType: "website",
    indexable: true,
  },
  "/terms": {
    title: "Terms of Use | MoneyCalci",
    description: "Read the MoneyCalci terms of use and estimate disclaimer.",
    ogType: "website",
    indexable: true,
  },
  "/disclaimer": {
    title: "Financial Disclaimer | MoneyCalci",
    description: "Read the MoneyCalci financial disclaimer and understand the limits of calculator estimates.",
    ogType: "website",
    indexable: true,
  },
};

const aliases: Record<string, string> = {
  "/tools": "/calculators",
  "/savings": "/savings-calculator",
};

export function normalizeSeoPath(pathname: string): string {
  const path = pathname.split("?")[0] || "/";
  if (path === "/") return "/";
  return path.replace(/\/+$/, "") || "/";
}

function calculatorRouteSeo(kind: CalculatorKind): RouteSeo {
  const entry = calculatorRegistry[kind];
  const content = calculatorContent[kind];
  return {
    title: `${content.seoTitle} | MoneyCalci`,
    description: content.metaDescription,
    canonicalPath: entry.path,
    ogType: "website",
    indexable: true,
  };
}

export function getRouteSeo(pathname: string): RouteSeo | null {
  const normalizedPath = normalizeSeoPath(pathname);
  const canonicalPath = aliases[normalizedPath] ?? normalizedPath;
  const staticRoute = staticRoutes[canonicalPath];
  if (staticRoute) {
    return { ...staticRoute, canonicalPath: staticRoute.canonicalPath ?? canonicalPath };
  }

  const calculatorKind = publishedCalculatorKinds.find(kind => calculatorRegistry[kind].path === canonicalPath);
  if (calculatorKind) return calculatorRouteSeo(calculatorKind);

  if (publishedCategoryOrder.includes(canonicalPath.slice(1))) {
    const category = categoryContent[canonicalPath.slice(1)];
    return {
      title: category.seoTitle,
      description: category.metaDescription,
      canonicalPath,
      ogType: "website",
      indexable: true,
    };
  }

  const article = blogArticles.find(item => `/blog/${item.slug}` === canonicalPath);
  if (article) {
    return {
      title: `${article.title} | MoneyCalci`,
      description: article.description,
      canonicalPath,
      ogType: "article",
      indexable: true,
    };
  }

  return null;
}

export function getIndexableSeoEntries(): Record<string, RouteSeo> {
  const entries: Record<string, RouteSeo> = {};
  for (const route of Object.keys(staticRoutes)) {
    const seo = getRouteSeo(route);
    if (seo) entries[route] = seo;
  }
  for (const kind of publishedCalculatorKinds) {
    const route = calculatorRegistry[kind].path;
    entries[route] = calculatorRouteSeo(kind);
  }
  for (const slug of publishedCategoryOrder) {
    const route = `/${slug}`;
    const seo = getRouteSeo(route);
    if (seo) entries[route] = seo;
  }
  for (const article of blogArticles) {
    const route = `/blog/${article.slug}`;
    const seo = getRouteSeo(route);
    if (seo) entries[route] = seo;
  }
  entries["/tools"] = getRouteSeo("/tools") as RouteSeo;
  entries["/savings"] = getRouteSeo("/savings") as RouteSeo;
  return entries;
}
