import { writeFile } from "node:fs/promises";
import { getIndexableSeoEntries, SITE_ORIGIN, SOCIAL_IMAGE_PATH } from "../shared/routeSeo";

const output = new URL("../client/public/initial-seo.js", import.meta.url);
const routes = getIndexableSeoEntries();
const serializedRoutes = JSON.stringify(routes, null, 2);

const source = `(function () {
  'use strict';

  var ORIGIN = ${JSON.stringify(SITE_ORIGIN)};
  var SOCIAL_IMAGE = ORIGIN + ${JSON.stringify(SOCIAL_IMAGE_PATH)};
  var routes = ${serializedRoutes};

  function normalizePath(pathname) {
    if (!pathname || pathname === '/') return '/';
    return pathname.split('?')[0].replace(/\\/+$/, '') || '/';
  }

  function upsertMeta(attribute, key, content) {
    var node = document.head.querySelector('meta[' + attribute + '="' + key + '"]');
    if (!node) {
      node = document.createElement('meta');
      node.setAttribute(attribute, key);
      document.head.appendChild(node);
    }
    node.setAttribute('content', content);
  }

  function setCanonical(url) {
    var link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  function removeCanonical() {
    var link = document.head.querySelector('link[rel="canonical"]');
    if (link) link.remove();
  }

  function applySeo() {
    var path = normalizePath(window.location.pathname);
    var config = routes[path];

    if (!config) {
      var notFoundTitle = 'Page Not Found | MoneyCalci';
      var notFoundDescription = 'The MoneyCalci page you requested could not be found.';
      document.title = notFoundTitle;
      upsertMeta('name', 'description', notFoundDescription);
      upsertMeta('name', 'robots', 'noindex,follow');
      removeCanonical();
      upsertMeta('property', 'og:type', 'website');
      upsertMeta('property', 'og:site_name', 'MoneyCalci');
      upsertMeta('property', 'og:title', notFoundTitle);
      upsertMeta('property', 'og:description', notFoundDescription);
      upsertMeta('property', 'og:url', ORIGIN + path);
      upsertMeta('property', 'og:image', SOCIAL_IMAGE);
      upsertMeta('name', 'twitter:card', 'summary');
      upsertMeta('name', 'twitter:title', notFoundTitle);
      upsertMeta('name', 'twitter:description', notFoundDescription);
      upsertMeta('name', 'twitter:image', SOCIAL_IMAGE);
      return;
    }

    document.title = config.title;
    upsertMeta('name', 'description', config.description);
    upsertMeta('name', 'robots', 'index,follow,max-image-preview:large');
    var canonical = ORIGIN + (config.canonicalPath === '/' ? '/' : config.canonicalPath);
    setCanonical(canonical);
    upsertMeta('property', 'og:type', config.ogType);
    upsertMeta('property', 'og:site_name', 'MoneyCalci');
    upsertMeta('property', 'og:title', config.title);
    upsertMeta('property', 'og:description', config.description);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', SOCIAL_IMAGE);
    upsertMeta('name', 'twitter:card', 'summary');
    upsertMeta('name', 'twitter:title', config.title);
    upsertMeta('name', 'twitter:description', config.description);
    upsertMeta('name', 'twitter:image', SOCIAL_IMAGE);
  }

  window.MoneyCalciInitialSEO = { routes: routes, apply: applySeo };
  applySeo();
})();
`;

await writeFile(output, source, "utf8");
console.log(`Generated ${output.pathname} from shared/routeSeo.ts (${Object.keys(routes).length} route entries).`);
