import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RouteContent } from "../client/src/pages/Home";
import { blogArticles, calculatorContent, publishedCategoryOrder } from "../shared/seoContent";
import { calculatorLabelMap, calculatorPathMap, publishedCalculatorKinds } from "../shared/calculatorRegistry";
import { getRouteSeo, SITE_ORIGIN } from "../shared/routeSeo";

const representatives = ["/", "/calculators", "/categories", ...publishedCategoryOrder.map(slug => `/${slug}`), "/blog", ...blogArticles.map(article => `/blog/${article.slug}`), "/about", "/contact", "/privacy-policy", "/terms", "/disclaimer", "/does-not-exist"];

function renderRoute(route: string) {
  Object.defineProperty(globalThis, "window", { value: { location: { origin: SITE_ORIGIN, pathname: route } }, configurable: true });
  Object.defineProperty(globalThis, "location", { value: { pathname: route }, configurable: true });
  return renderToStaticMarkup(<RouteContent location={route} />);
}

function schemas(markup: string): Record<string, unknown>[] {
  return Array.from(markup.matchAll(/<script\b(?=[^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g), match => JSON.parse(match[1]) as Record<string, unknown>);
}

function assertRouteSeo(route: string) {
  const seo = getRouteSeo(route);
  if (!seo) throw new Error(`${route}: missing route SEO configuration`);
  if (!seo.canonicalPath.startsWith("/")) throw new Error(`${route}: invalid canonical path`);
  if (seo.canonicalPath !== "/" && seo.canonicalPath.endsWith("/")) throw new Error(`${route}: canonical has trailing slash`);
  if (seo.canonicalPath.includes("?") || seo.canonicalPath.includes("#")) throw new Error(`${route}: canonical contains query/hash`);
  const canonical = `${SITE_ORIGIN}${seo.canonicalPath === "/" ? "/" : seo.canonicalPath}`;
  if (!canonical.startsWith(SITE_ORIGIN) || canonical.includes("localhost") || canonical.includes("www.")) throw new Error(`${route}: invalid canonical origin`);
  if (!seo.title || !seo.description) throw new Error(`${route}: missing title or description`);
}

const failures: string[] = [];
for (const route of representatives) {
  if (route !== "/does-not-exist") assertRouteSeo(route);
  const markup = renderRoute(route);
  const h1Count = (markup.match(/<h1\b/g) ?? []).length;
  if (h1Count !== 1) failures.push(`${route}: expected exactly one real H1, found ${h1Count}`);
  for (const schema of schemas(markup)) {
    if (schema["@context"] !== "https://schema.org" || typeof schema["@type"] !== "string") failures.push(`${route}: invalid JSON-LD context/type`);
  }
}

for (const kind of publishedCalculatorKinds) {
  const route = calculatorPathMap[kind];
  const markup = renderRoute(route);
  const parsed = schemas(markup);
  const content = calculatorContent[kind];
  const seo = getRouteSeo(route);
  if (!seo || seo.canonicalPath !== route) failures.push(`${route}: canonical does not match route`);
  if (!markup.includes(`>${calculatorLabelMap[kind]}<`)) failures.push(`${route}: calculator H1 label is not rendered`);
  if (!parsed.some(schema => schema["@type"] === "BreadcrumbList")) failures.push(`${route}: missing BreadcrumbList`);
  if (!parsed.some(schema => schema["@type"] === "FAQPage" && Array.isArray(schema.mainEntity) && schema.mainEntity.length === content.faq.length)) failures.push(`${route}: missing valid FAQPage schema`);
  const appSchema = parsed.find(schema => schema["@type"] === "SoftwareApplication");
  const offers = appSchema?.offers as { price?: string } | undefined;
  if (!appSchema || appSchema.applicationCategory !== "FinanceApplication" || offers?.price !== "0") failures.push(`${route}: missing valid SoftwareApplication schema`);
}

for (const article of blogArticles) {
  const route = `/blog/${article.slug}`;
  const parsed = schemas(renderRoute(route));
  if (!parsed.some(schema => schema["@type"] === "Article" && schema.dateModified === calculatorContent[article.calculatorKind].lastUpdated)) failures.push(`${route}: missing current Article dateModified`);
}

if (publishedCalculatorKinds.length !== 15) failures.push(`expected 15 published calculators, found ${publishedCalculatorKinds.length}`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Rendered SEO audit passed: ${representatives.length} representative routes, ${publishedCalculatorKinds.length} calculator routes, route metadata, H1 coverage, and parsed JSON-LD payloads.`);
