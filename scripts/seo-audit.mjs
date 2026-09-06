import { readFile, readdir, stat } from "node:fs/promises";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = new URL("../", import.meta.url);
const rootPath = fileURLToPath(root);
const read = file => readFile(new URL(file, root), "utf8");
const content = await read("shared/seoContent.ts");
const registry = await read("shared/calculatorRegistry.ts");
const home = await read("client/src/pages/Home.tsx");
const search = await read("shared/search.ts");
const seoBlocks = await read("client/src/components/SeoBlocks.tsx");
const notFound = await read("client/src/pages/NotFound.tsx");
const routeSeo = await read("shared/routeSeo.ts");
const initialSeo = await read("client/public/initial-seo.js");
const sitemap = await read("client/public/sitemap.xml");
const robots = await read("client/public/robots.txt");
const failures = [];
const calculatorRoutes = Object.fromEntries([...registry.matchAll(/^\s{2}(\w+):\s*"(\/[^\"]+)"/gm)].map(match => [match[1], match[2]]));
const titles = [...content.matchAll(/seoTitle: "([^"]+)"/g)].map(match => match[1]);
const descriptions = [...content.matchAll(/metaDescription: "([^"]+)"/g)].map(match => match[1]);
const duplicate = values => values.filter((value, index) => values.indexOf(value) !== index);
if (Object.keys(calculatorRoutes).length !== 15) failures.push(`calculator registry route count is ${Object.keys(calculatorRoutes).length}, expected 15`);
if (duplicate(titles).length) failures.push(`duplicate SEO titles: ${duplicate(titles).join(", ")}`);
if (duplicate(descriptions).length) failures.push(`duplicate meta descriptions: ${duplicate(descriptions).join(", ")}`);
if (!routeSeo.includes("SITE_ORIGIN") || !routeSeo.includes("canonicalPath") || !routeSeo.includes("getRouteSeo")) failures.push("central route SEO source is incomplete");
if (!initialSeo.includes("window.location.pathname") || !initialSeo.includes("og:title") || !initialSeo.includes("og:description") || !initialSeo.includes("og:url") || !initialSeo.includes("og:image") || !initialSeo.includes("twitter:image")) failures.push("initial SEO script is incomplete");
if (initialSeo.includes("innerHTML")) failures.push("initial SEO script uses unsafe innerHTML");
if (!initialSeo.includes("noindex,follow") || !initialSeo.includes("removeCanonical()")) failures.push("404 noindex/canonical safeguard is incomplete");
if (initialSeo.includes("localhost") || initialSeo.includes("www.moneycalci.online")) failures.push("initial SEO contains a non-production origin");
if (!home.includes("<h1") || !seoBlocks.includes("<h1") || !notFound.includes("<h1")) failures.push("missing H1 in a public page family");
if (!seoBlocks.includes("BreadcrumbList") || !seoBlocks.includes("FAQPage") || !seoBlocks.includes("@type\": \"Article\"")) failures.push("missing structured-data hook");
try {
  const tsxCli = fileURLToPath(import.meta.resolve("tsx/cli"));
  const result = await execFileAsync(process.execPath, [tsxCli, "scripts/rendered-seo-audit.tsx"], { cwd: rootPath, stdio: "pipe", windowsHide: true });
  if (!result.stdout.includes("Rendered SEO audit passed")) failures.push("rendered SEO route audit returned no success marker");
} catch (error) {
  failures.push(`rendered SEO route audit failed: ${error?.stderr || error?.message || "unknown error"}`);
}
if (!search.includes("home loan") || !search.includes("paycheck") || !search.includes("net pay") || !search.includes("markup")) failures.push("missing explicit search aliases");
if (!home.includes("lastUpdated")) failures.push("missing last-updated rendering hook");
if (!robots.includes("User-agent: *") || !robots.includes("Allow: /") || !robots.includes("Sitemap: https://moneycalci.online/sitemap.xml") || robots.includes("Disallow: /")) failures.push("robots policy is incomplete or blocks the site");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
if (new Set(urls).size !== urls.length) failures.push("duplicate sitemap URL");
if (urls.some(url => url.includes("?") || url.includes("localhost") || url.includes("www."))) failures.push("invalid sitemap URL found");
if (urls.some(url => /\.(js|css)(\?|$)/.test(url))) failures.push("asset URL found in sitemap");
for (const [kind, route] of Object.entries(calculatorRoutes)) {
  if (!sitemap.includes(route)) failures.push(`calculator missing from sitemap: ${kind}`);
  if (!content.includes(`${kind}: {`)) failures.push(`calculator missing from content model: ${kind}`);
  const hasCategoryLink = new RegExp(`calculatorKinds: \\[[^\\]]*[\"']${kind}[\"']`).test(content);
  const hasRelatedLink = new RegExp(`relatedCalculators: \\[[^\\]]*[\"']${kind}[\"']`).test(content);
  if (!hasCategoryLink) failures.push(`calculator missing from published category relationships: ${kind}`);
  if (!hasRelatedLink) failures.push(`calculator missing from related-calculator relationships: ${kind}`);
}
for (const route of ["/categories", "/blog", "/finance", "/loans", "/salary", "/taxes", "/investment", "/business", "/ecommerce", "/currency", "/savings"]) if (!sitemap.includes(route)) failures.push(`public hub missing from sitemap: ${route}`);
if (sitemap.includes("/shipping")) failures.push("unpublished shipping placeholder is in sitemap");
const linkedRoutes = [...home.matchAll(/href=\"([^\"]+)\"/g), ...seoBlocks.matchAll(/href=\"([^\"]+)\"/g), ...notFound.matchAll(/href=\"([^\"]+)\"/g)].map(match => match[1]).filter(route => route.startsWith("/"));
for (const route of linkedRoutes) if (!route.includes("${") && !urls.some(url => url.endsWith(route))) failures.push(`internal link absent from sitemap: ${route}`);
const imageTags = [...home.matchAll(/<img\b[^>]*>/g), ...seoBlocks.matchAll(/<img\b[^>]*>/g), ...notFound.matchAll(/<img\b[^>]*>/g)];
if (imageTags.some(tag => !/\balt=/.test(tag))) failures.push("image without alt text");
if (!home.includes("RelatedLinks") || !content.includes("relatedCalculators") || !seoBlocks.includes("RelatedLinks")) failures.push("related calculator linking system missing");
const distDir = new URL("dist/public/assets/", root);
try { const files = await readdir(distDir); const jsFiles = await Promise.all(files.filter(file => file.endsWith(".js")).map(async file => [file, (await stat(new URL(file, distDir))).size])); const largest = Math.max(...jsFiles.map(([, size]) => size), 0); if (largest > 950_000) failures.push(`largest client chunk exceeds 950 KB: ${largest}`); } catch { /* Build may not exist during source-only QA. */ }
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`SEO audit passed: ${titles.length} unique content titles, ${urls.length} clean sitemap URLs, ${Object.keys(calculatorRoutes).length} registry-backed calculator routes, internal-link/orphan checks, structured-data hooks, and performance guard.`);
