"use strict";
const formats = require("../lib/formats.cjs");
const content = require("./content.cjs");
const legal = require("./legal.cjs");

const SITE_URL = (process.env.SITE_URL || "https://trncconvert.com").replace(/\/$/, "");
const SITE_NAME = "TRNCConvert";

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const jsonForScript = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");

const pageBySlug = new Map(content.pages.map((p) => [p.slug, p]));
const urlOf = (slug) => (slug ? `/${slug}` : "/");

const CATEGORY_HUB = {
  document: "belge-donusturucu", image: "gorsel-donusturucu", audio: "ses-donusturucu",
  video: "video-donusturucu", unlock: "sifre-kaldirma",
};
const CATEGORY_NAME = {
  document: "Belge", image: "Görsel", audio: "Ses", video: "Video", unlock: "Şifre kaldırma",
};

const ICON_PATHS = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
};
const icon = (name, cls = "icon") =>
  `<svg class="${cls}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_PATHS[name]}</svg>`;

const LOGO = `<span class="brand-mark" aria-hidden="true"></span>`;

let ASSET_VERSION = "1";
const setAssetVersion = (v) => { ASSET_VERSION = v; };
const asset = (p) => `${p}?v=${ASSET_VERSION}`;

const NAV = [
  ["belge-donusturucu", "Belge"],
  ["gorsel-donusturucu", "Görsel"],
  ["ses-donusturucu", "Ses"],
  ["video-donusturucu", "Video"],
  ["sifre-kaldirma", "Şifre kaldır"],
];

function header(current) {
  const links = NAV.map(([slug, label]) =>
    `<li><a href="${urlOf(slug)}"${slug === current ? ' aria-current="page"' : ""}>${esc(label)}</a></li>`).join("");
  return `<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/" aria-label="TRNCConvert ana sayfa">${LOGO}<span class="brand-name">TRNCConvert</span></a>
    <nav class="site-nav" aria-label="Araçlar"><ul>${links}</ul></nav>
    <button type="button" class="theme-toggle" data-theme-toggle aria-label="Koyu temaya geç">${icon("moon", "icon icon-moon")}${icon("sun", "icon icon-sun")}</button>
  </div>
</header>`;
}

function footer() {
  const col = (title, items) => `<div class="footer-col"><h2 class="footer-title">${esc(title)}</h2><ul>${items.map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join("")}</ul></div>`;
  const popular = ["pdf-word-cevirme", "word-pdf-cevirme", "jpg-pdf-cevirme", "heic-jpg-cevirme", "mp4-mp3-donusturucu", "mov-mp4-cevirme"]
    .map((s) => [urlOf(s), pageBySlug.get(s).h1]);
  const unlock = ["pdf-sifre-kaldirma", "word-sifre-kaldirma", "excel-sifre-kaldirma", "powerpoint-sifre-kaldirma"]
    .map((s) => [urlOf(s), pageBySlug.get(s).h1]);
  return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-about">
      <a class="brand brand-footer" href="/">${LOGO}<span class="brand-name">TRNCConvert</span></a>
      <p>Belge, görsel, ses ve video dosyaları için ücretsiz dönüştürücü. Dosyalar 10 dakika içinde sunucudan silinir.</p>
      <p>Berke Çimen tarafından KKTC'de geliştirildi. İletişim: <a href="mailto:${legal.CONTACT}">${legal.CONTACT}</a></p>
    </div>
    ${col("Sık kullanılanlar", popular)}
    ${col("Şifre kaldırma", unlock)}
    ${col("Site", [["/hakkinda", "Hakkında"], ["/gizlilik", "Gizlilik ve KVKK"], ["/kullanim-sartlari", "Kullanım şartları"], ["mailto:" + legal.CONTACT, "İletişim"]])}
  </div>
</footer>`;
}

function layout({ title, description, path, body, jsonLd = [], noindex = false, current = "", catalog = false }) {
  const canonical = SITE_URL + path;
  const ld = jsonLd.map((o) => `<script type="application/ld+json">${jsonForScript(o)}</script>`).join("\n");
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${esc(canonical)}">`}
<meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:locale" content="tr_TR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/archivo-latin-wdth-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${asset("/css/site.css")}">
<script src="${asset("/js/theme.js")}"></script>
${ld}
</head>
<body>
<a class="skip-link" href="#icerik">İçeriğe geç</a>
${header(current)}
<main id="icerik">
${body}
</main>
${footer()}
${catalog ? `<script type="application/json" id="catalog">${jsonForScript(formats.clientCatalog())}</script>` : ""}
${catalog ? `<script src="${asset("/js/app.js")}" defer></script>` : ""}
</body>
</html>`;
}

const fmtList = (exts) => [...new Set(exts.map((e) => formats.canon(e)))].map((e) => e.toUpperCase()).join(", ");

function notes() {
  return `<p class="notes">Dosyalar sunucuya HTTPS ile yüklenir ve iş bittikten 10 dakika sonra silinir. Beklemek istemezseniz her sonucun yanındaki Şimdi sil düğmesiyle hemen silebilirsiniz. Hesap, reklam ve ücret yok. Dosya başına en fazla 95 MB, tek seferde 10 dosya.</p>`;
}

const pairLabel = (exts) => {
  const uniq = [...new Set((exts || []).map((e) => formats.canon(e)))];
  return uniq.length === 1 ? uniq[0].toUpperCase() : null;
};

function pairLine(from, to) {
  return `<p class="pair" aria-hidden="true"><span class="pair-from" data-pair-from>${esc(from)}</span><svg class="pair-arrow" viewBox="0 0 64 32" focusable="false"><path d="M2 16h54M42 3l15 13-15 13" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="square"/></svg><span class="pair-to" data-pair-to>${esc(to)}</span></p>`;
}

function converterTool({ category = null, from = null, to = null }) {
  const cats = formats.CATEGORIES;
  const initial = category || "document";
  const inputsOf = (cat) => formats.GROUPS.filter((g) => g.category === cat).flatMap((g) => g.inputs);
  const acceptExts = from || (category ? inputsOf(category) : formats.allInputs());
  const accept = acceptExts.map((e) => "." + e).join(",");
  const tabs = category ? "" : `<div class="tabs" role="tablist" aria-label="Dosya türü">
    ${cats.map((c) => `<button type="button" role="tab" class="tab" id="tab-${c.id}" data-category="${c.id}" aria-selected="${c.id === initial}" tabindex="${c.id === initial ? 0 : -1}">${esc(c.label)}</button>`).join("")}
  </div>`;
  const hintFormats = fmtList(from || inputsOf(initial));
  const pairFrom = pairLabel(from) || (category ? formats.CATEGORIES.find((c) => c.id === category).label : "Dosya");
  const pairTo = to ? to.toUpperCase() : "?";
  return `<section class="tool" data-tool="convert" data-category="${esc(initial)}" data-fixed="${category ? "1" : ""}" data-from="${esc((from || []).join(","))}" data-to="${esc(to || "")}" data-pair-default="${esc(pairFrom)}" aria-label="Dönüştürücü">
  ${tabs}
  <div class="folder">
  ${pairLine(pairFrom, pairTo)}
  <div class="drop" data-drop tabindex="0" role="button" aria-describedby="drop-hint">
    <input type="file" class="visually-hidden" data-file-input multiple accept="${esc(accept)}" tabindex="-1" aria-hidden="true">
    <span class="drop-title">Dosyaları buraya bırakın ya da</span>
    <span class="btn btn-secondary drop-button">Dosya seç</span>
    <span class="drop-hint" id="drop-hint" data-drop-hint>${esc(hintFormats)}. Dosya başına en fazla 95 MB.</span>
    <span class="drop-paste">Kopyaladığınız bir dosyayı Ctrl+V ile de yapıştırabilirsiniz.</span>
  </div>
  <ol class="queue" data-queue aria-label="Seçilen dosyalar"></ol>
  <div class="options" data-options hidden>
    <fieldset class="targets">
      <legend>Hedef format</legend>
      <div class="chips" data-targets></div>
    </fieldset>
    <div class="quality" data-quality-wrap hidden>
      <label for="quality">Kalite</label>
      <select id="quality" data-quality>
        <option value="low">Daha küçük dosya</option>
        <option value="normal" selected>Dengeli</option>
        <option value="high">En yüksek kalite</option>
      </select>
    </div>
  </div>
  <div class="actions">
    <button type="button" class="btn btn-primary" data-convert disabled>Dönüştür</button>
    <button type="button" class="btn btn-ghost" data-zip hidden>Tümünü ZIP olarak indir</button>
    <button type="button" class="btn btn-ghost" data-reset hidden>Temizle</button>
  </div>
  <p class="status" data-status role="status" aria-live="polite"></p>
  <noscript><p class="status status-error">Dönüştürücü için JavaScript'in açık olması gerekir.</p></noscript>
  </div>
</section>`;
}

function unlockTool({ kinds }) {
  const accept = kinds.map((k) => "." + k).join(",");
  return `<section class="tool tool-unlock" data-tool="unlock" aria-label="Şifre kaldırma aracı">
  <div class="folder">
  ${pairLine(pairLabel(kinds) || "Şifreli", "şifresiz")}
  <div class="drop" data-drop tabindex="0" role="button" aria-describedby="unlock-hint">
    <input type="file" class="visually-hidden" data-file-input multiple accept="${esc(accept)}" tabindex="-1" aria-hidden="true">
    <span class="drop-title">Şifreli dosyaları buraya bırakın ya da</span>
    <span class="btn btn-secondary drop-button">Dosya seç</span>
    <span class="drop-hint" id="unlock-hint">${esc(fmtList(kinds))}. Dosya başına en fazla 95 MB, tek seferde 10 dosya.</span>
    <span class="drop-paste">Kopyaladığınız bir dosyayı Ctrl+V ile de yapıştırabilirsiniz.</span>
  </div>
  <form class="unlock-form" data-unlock-form novalidate>
    <ol class="queue" data-queue aria-label="Seçilen dosyalar"></ol>
    <div class="unlock-controls" data-controls hidden>
      <label class="check"><input type="checkbox" data-same-password><span>Tüm dosyalar için aynı şifreyi kullan</span></label>
      <div class="shared-password" data-shared-wrap hidden>
        <label for="shared-password">Ortak şifre</label>
        <input id="shared-password" type="password" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="1024" aria-describedby="password-help" data-shared-password>
      </div>
      <label class="check"><input type="checkbox" data-show-passwords><span>Şifreleri göster</span></label>
      <p class="field-help" id="password-help">Şifreler büyük/küçük harfe duyarlıdır; İ ile I farklıdır.</p>
      <button type="submit" class="btn btn-primary" data-unlock-submit>Şifreleri kaldır</button>
    </div>
  </form>
  <div class="actions" data-after hidden>
    <button type="button" class="btn btn-primary" data-zip hidden>Tümünü ZIP olarak indir</button>
    <button type="button" class="btn btn-ghost" data-reset>Başka dosyalar</button>
  </div>
  <p class="status" data-status role="status" aria-live="polite"></p>
  <p class="tool-note">Bu araç şifre kırmaz ya da tahmin etmez; yalnızca girdiğiniz şifreyle çalışır. Girdiğiniz şifreler saklanmaz. Devam ederek dosyaların sahibi olduğunuzu ya da kullanma yetkiniz bulunduğunu onaylamış olursunuz.</p>
  <noscript><p class="status status-error">Bu araç için JavaScript'in açık olması gerekir.</p></noscript>
  </div>
</section>`;
}

function stepsBlock(steps) {
  return `<section class="steps" aria-labelledby="steps-title">
  <h2 id="steps-title">Nasıl yapılır</h2>
  <ol>${steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
</section>`;
}

function faqBlock(faq) {
  return `<section class="faq" aria-labelledby="faq-title">
  <h2 id="faq-title">Sık sorulan sorular</h2>
  ${faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}
</section>`;
}

function relatedBlock(slugs, title = "İlgili araçlar") {
  const items = slugs.map((s) => pageBySlug.get(s)).filter(Boolean);
  if (!items.length) return "";
  return `<nav class="related" aria-labelledby="related-title">
  <h2 id="related-title">${esc(title)}</h2>
  <ul>${items.map((p) => `<li><a href="${urlOf(p.slug)}">${esc(p.h1)}</a></li>`).join("")}</ul>
</nav>`;
}

function breadcrumb(trail) {
  return `<nav class="breadcrumb" aria-label="Konum"><ol>${trail.map(([href, label], i) =>
    i === trail.length - 1 ? `<li aria-current="page">${esc(label)}</li>` : `<li><a href="${href}">${esc(label)}</a></li>`).join("")}</ol></nav>`;
}

const ORG = {
  "@type": "Organization", "@id": `${SITE_URL}/#org`, name: SITE_NAME, url: `${SITE_URL}/`,
  logo: `${SITE_URL}/favicon.svg`, email: legal.CONTACT,
};
const WEBSITE = { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME, url: `${SITE_URL}/`, inLanguage: "tr", publisher: { "@id": `${SITE_URL}/#org` } };

function webAppLd(page) {
  return {
    "@context": "https://schema.org", "@type": "WebApplication",
    name: page.h1, url: SITE_URL + urlOf(page.slug), description: page.description,
    applicationCategory: "UtilitiesApplication", operatingSystem: "Web", inLanguage: "tr",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
    publisher: { "@id": `${SITE_URL}/#org` },
  };
}

function breadcrumbLd(trail) {
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: trail.map(([href, label], i) => ({
      "@type": "ListItem", position: i + 1, name: label, item: SITE_URL + href,
    })),
  };
}

function trailFor(page) {
  const trail = [["/", "Ana sayfa"]];
  if (page.type !== "hub") {
    const hub = pageBySlug.get(CATEGORY_HUB[page.category]);
    trail.push([urlOf(hub.slug), hub.h1]);
  }
  trail.push([urlOf(page.slug), page.h1]);
  return trail;
}

function hubLinks(page) {
  const children = content.pages.filter((p) => p.category === page.category && p.type !== "hub");
  return `<nav class="tool-list" aria-labelledby="tools-title">
  <h2 id="tools-title">${page.category === "unlock" ? "Dosya türüne göre şifre kaldırma" : "Bu kategorideki dönüşümler"}</h2>
  <ul>${children.map((p) => `<li><a href="${urlOf(p.slug)}"><span class="tool-list-name">${esc(p.h1)}</span><span class="tool-list-desc">${esc(p.intro)}</span></a></li>`).join("")}</ul>
</nav>`;
}

function toolFor(page) {
  if (page.type === "unlock" || page.category === "unlock") {
    return unlockTool({ kinds: page.unlockKind ? [page.unlockKind] : formats.UNLOCKABLE });
  }
  if (page.type === "hub") return converterTool({ category: page.category });
  return converterTool({ category: page.category, from: page.from, to: page.to });
}

function toolPage(page) {
  const trail = trailFor(page);
  const body = `<div class="wrap">
  ${breadcrumb(trail)}
  <div class="hero">
    <div class="hero-text">
      <h1>${esc(page.h1)}</h1>
      <p class="lead">${esc(page.intro)}</p>
    </div>
  </div>
  <div class="tool-grid">
    ${toolFor(page)}
    <aside class="tool-aside" aria-label="Önemli bilgiler">
      ${notes()}
      ${stepsBlock(page.steps)}
    </aside>
  </div>
  ${page.type === "hub" ? hubLinks(page) : ""}
  <article class="prose">
    ${page.body.map((p) => `<p>${esc(p)}</p>`).join("\n    ")}
  </article>
  ${faqBlock(page.faq)}
  ${relatedBlock(page.related)}
</div>`;
  return layout({
    title: page.title, description: page.description, path: urlOf(page.slug), body,
    current: CATEGORY_HUB[page.category], catalog: true,
    jsonLd: [webAppLd(page), breadcrumbLd(trail)],
  });
}

function homePage() {
  const h = content.home;
  const groups = ["document", "image", "audio", "video"].map((cat) => {
    const hub = pageBySlug.get(CATEGORY_HUB[cat]);
    const items = content.pages.filter((p) => p.category === cat && p.type === "convert");
    return `<div class="popular-group"><h3><a href="${urlOf(hub.slug)}">${esc(hub.h1)}</a></h3><ul>${items.map((p) => `<li><a href="${urlOf(p.slug)}">${esc(p.h1)}</a></li>`).join("")}</ul></div>`;
  }).join("");
  const unlockItems = content.pages.filter((p) => p.type === "unlock");
  const body = `<div class="wrap">
  <div class="hero hero-home">
    <div class="hero-text">
      <h1>${esc(h.h1)}</h1>
      <p class="lead">${esc(h.intro)}</p>
    </div>
  </div>
  <div class="tool-grid">
    ${converterTool({})}
    <aside class="tool-aside" aria-label="Önemli bilgiler">
      ${notes()}
      <section class="unlock-promo" aria-labelledby="unlock-promo-title">
        <h2 id="unlock-promo-title">Şifresini bildiğiniz dosyayı açın</h2>
        <p>PDF, Word, Excel ve PowerPoint dosyalarından açılış şifresini kaldırın. Şifre saklanmaz.</p>
        <ul>${unlockItems.map((p) => `<li><a href="${urlOf(p.slug)}">${esc(p.h1)}</a></li>`).join("")}</ul>
      </section>
    </aside>
  </div>
  <section class="popular" aria-labelledby="popular-title">
    <h2 id="popular-title">Sık kullanılan dönüşümler</h2>
    <div class="popular-grid">${groups}</div>
  </section>
  <article class="prose">
    ${h.body.map((p) => `<p>${esc(p)}</p>`).join("\n    ")}
  </article>
  ${faqBlock(h.faq)}
</div>`;
  return layout({
    title: h.title, description: h.description, path: "/", body, catalog: true,
    jsonLd: [{ "@context": "https://schema.org", "@graph": [ORG, WEBSITE] }],
  });
}

function legalPage(page) {
  const trail = [["/", "Ana sayfa"], [urlOf(page.slug), page.h1]];
  const sections = page.sections.map((s) => `${s.h ? `<h2>${esc(s.h)}</h2>` : ""}${(s.p || []).map((p) => `<p>${esc(p)}</p>`).join("")}${s.list ? `<ul>${s.list.map((li) => `<li>${esc(li)}</li>`).join("")}</ul>` : ""}`).join("\n");
  const body = `<div class="wrap">
  ${breadcrumb(trail)}
  <div class="hero"><div class="hero-text"><h1>${esc(page.h1)}</h1></div></div>
  <article class="prose prose-legal">
    ${sections}
    ${page.slug === "hakkinda" ? `<p>İletişim: <a href="mailto:${legal.CONTACT}">${legal.CONTACT}</a></p>` : ""}
    <p class="updated">Son güncelleme: 15 Ekim 2026</p>
  </article>
</div>`;
  return layout({ title: page.title, description: page.description, path: urlOf(page.slug), body, jsonLd: [breadcrumbLd(trail)] });
}

function notFoundPage() {
  const body = `<div class="wrap">
  <div class="hero"><div class="hero-text">
    <h1>Sayfa bulunamadı</h1>
    <p class="lead">Aradığınız adres değişmiş ya da hiç var olmamış olabilir. Ana sayfadan tüm araçlara ulaşabilirsiniz.</p>
    <p><a class="btn btn-primary" href="/">Ana sayfaya dön</a></p>
  </div></div>
  ${relatedBlock(["pdf-word-cevirme", "word-pdf-cevirme", "jpg-pdf-cevirme", "mp4-mp3-donusturucu", "pdf-sifre-kaldirma"], "Sık kullanılan araçlar")}
</div>`;
  return layout({ title: "Sayfa bulunamadı | TRNCConvert", description: "Aradığınız sayfa bulunamadı.", path: "/404", body, noindex: true });
}

const LASTMOD = "2026-10-15";

function allPaths() {
  return ["/", ...content.pages.map((p) => urlOf(p.slug)), ...legal.pages.map((p) => urlOf(p.slug))];
}

function sitemapXml() {
  const urls = allPaths().map((p) => `  <url><loc>${esc(SITE_URL + p)}</loc><lastmod>${LASTMOD}</lastmod></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function robotsTxt() {
  return `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /dl/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

module.exports = {
  SITE_URL, esc, setAssetVersion, homePage, toolPage, legalPage, notFoundPage, sitemapXml, robotsTxt, allPaths,
  pageBySlug, legalBySlug: new Map(legal.pages.map((p) => [p.slug, p])),
};
