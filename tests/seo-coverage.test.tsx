import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RouteContent } from "../client/src/pages/Home";
import { calculatorContent, categoryContent, publishedCategoryOrder, blogArticles } from "../shared/seoContent";
import { calculatorLabelMap, calculatorPathMap, publishedCalculatorKinds } from "../shared/calculatorRegistry";
import { getRouteSeo, SITE_ORIGIN } from "../shared/routeSeo";

function renderRoute(location: string) {
  Object.defineProperty(globalThis, "window", { value: { location: { origin: SITE_ORIGIN, pathname: location } }, configurable: true });
  Object.defineProperty(globalThis, "location", { value: { pathname: location }, configurable: true });
  return renderToStaticMarkup(<RouteContent location={location} />);
}

describe("SEO route coverage", () => {
  it("covers all 15 registry calculators with one H1, matching canonical, title, description, and real related links", () => {
    expect(publishedCalculatorKinds).toHaveLength(15);
    const categoryKinds = publishedCategoryOrder.flatMap(slug => categoryContent[slug].calculatorKinds);
    for (const kind of publishedCalculatorKinds) {
      const route = calculatorPathMap[kind];
      const content = calculatorContent[kind];
      const markup = renderRoute(route);
      const seo = getRouteSeo(route);
      expect(seo?.title, route).toBe(`${content.seoTitle} | MoneyCalci`);
      expect(seo?.description, route).toBe(content.metaDescription);
      expect(seo?.canonicalPath, route).toBe(route);
      expect((markup.match(/<h1\b/g) ?? []).length, route).toBe(1);
      expect(markup).toContain(`>${calculatorLabelMap[kind]}<`);
      expect(markup).toContain(`href="/${content.category}"`);
      expect(markup).toContain(`Updated ${content.lastUpdated}`);
      expect(categoryKinds).toContain(kind);
      for (const relatedKind of content.relatedCalculators) expect(markup).toContain(`href="${calculatorPathMap[relatedKind]}"`);
    }
  });

  it("covers every published category, blog article, and information page with one H1 and route-specific SEO data", () => {
    for (const slug of publishedCategoryOrder) {
      const route = `/${slug}`;
      const markup = renderRoute(route);
      expect(getRouteSeo(route), route).toBeTruthy();
      expect((markup.match(/<h1\b/g) ?? []).length, route).toBe(1);
    }
    expect((renderRoute("/blog").match(/<h1\b/g) ?? []).length).toBe(1);
    for (const article of blogArticles) {
      const route = `/blog/${article.slug}`;
      const markup = renderRoute(route);
      expect(getRouteSeo(route)?.ogType, route).toBe("article");
      expect((markup.match(/<h1\b/g) ?? []).length, route).toBe(1);
      expect(markup).toContain(`>${article.title}<`);
      const jsonTexts = markup.split('<script type="application/ld+json">').slice(1).map(part => part.split("</script>")[0]);
      const schemas = jsonTexts.map(value => JSON.parse(value) as Record<string, unknown>);
      expect(schemas.some(schema => schema["@type"] === "Article" && schema.dateModified === calculatorContent[article.calculatorKind].lastUpdated)).toBe(true);
    }
    for (const route of ["/about", "/contact", "/privacy-policy", "/terms", "/disclaimer"]) {
      expect(getRouteSeo(route), route).toBeTruthy();
      expect((renderRoute(route).match(/<h1\b/g) ?? []).length, route).toBe(1);
    }
  });

  it("keeps the 404 route non-indexable and free of a canonical target", () => {
    const initialSeo = readFileSync(new URL("../client/public/initial-seo.js", import.meta.url), "utf8");
    expect(initialSeo).toContain("noindex,follow");
    expect(initialSeo).toContain("removeCanonical()");
    expect(initialSeo).not.toContain("canonicalPath: '/'");
  });

  it("keeps sitemap and robots aligned with the production crawl policy", () => {
    const sitemap = readFileSync(new URL("../client/public/sitemap.xml", import.meta.url), "utf8");
    const robots = readFileSync(new URL("../client/public/robots.txt", import.meta.url), "utf8");
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Sitemap: https://moneycalci.online/sitemap.xml");
    expect(robots).not.toContain("Disallow: /");
    for (const kind of publishedCalculatorKinds) expect(sitemap).toContain(`https://moneycalci.online${calculatorPathMap[kind]}`);
    for (const article of blogArticles) expect(sitemap).toContain(`https://moneycalci.online/blog/${article.slug}`);
    for (const route of ["/", "/calculators", "/categories", "/blog", "/about", "/contact", "/privacy-policy", "/terms", "/disclaimer"]) expect(sitemap).toContain(`https://moneycalci.online${route}`);
    expect(sitemap).not.toContain("/does-not-exist");
    expect(sitemap).not.toContain("/shipping");
    expect(sitemap).not.toContain("localhost");
    expect(sitemap).not.toContain("www.moneycalci.online");
    expect(sitemap).not.toContain("?");
  });
});
