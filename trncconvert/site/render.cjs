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
  upload: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  weight: '<path d="M6 21h12l-2-12H8z"/><circle cx="12" cy="6" r="3"/>',
  code: '<path d="m8 8-5 4 5 4"/><path d="m16 8 5 4-5 4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
};
const icon = (name, cls = "icon") =>
  `<svg class="${cls}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_PATHS[name]}</svg>`;

const LOGO = `<svg class="logo-mark" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" focusable="false">
  <rect x="3" y="7" width="15" height="19" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
  <rect x="13" y="4" width="15" height="19" rx="2" class="logo-mark-back"/>
  <path d="M17 13.5h7m-2.5-2.5 2.5 2.5-2.5 2.5" fill="none" stroke="var(--surface)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

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
    <a class="brand" href="/" aria-label="TRNCConvert ana sayfa">${LOGO}<span class="brand-name">TRNC<span>Convert</span></span></a>
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
      <a class="brand brand-footer" href="/">${LOGO}<span class="brand-name">TRNC<span>Convert</span></span></a>
      <p>Belge, görsel, ses ve video dosyaları için ücretsiz dönüştürücü. Dosyalar 10 dakika içinde sunucudan silinir.</p>
      <p>KKTC'de geliştirildi. Kaynak kodu <a href="${legal.REPO}" rel="noopener">GitHub'da</a>.</p>
    </div>
    ${col("Sık kullanılanlar", popular)}
    ${col("Şifre kaldırma", unlock)}
    ${col("Site", [["/hakkinda", "Hakkında"], ["/gizlilik", "Gizlilik ve KVKK"], ["/kullanim-sartlari", "Kullanım şartları"], [legal.REPO, "GitHub"]])}
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
<meta name="theme-color" content="#F5F6F8" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#15181C" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:locale" content="tr_TR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/source-sans-3-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
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

function trustList() {
  const items = [
    ["clock", "Dosyalar 10 dakika içinde sunucudan silinir."],
    ["user", "Hesap açmanız gerekmez."],
    ["weight", "Dosya başına en fazla 95 MB, tek seferde 10 dosya."],
    ["code", "Kaynak kodu GitHub'da herkese açık."],
  ];
  return `<ul class="trust">${items.map(([i, t]) => `<li>${icon(i)}<span>${esc(t)}</span></li>`).join("")}</ul>`;
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
  return `<section class="tool" data-tool="convert" data-category="${esc(initial)}" data-fixed="${category ? "1" : ""}" data-from="${esc((from || []).join(","))}" data-to="${esc(to || "")}" aria-label="Dönüştürücü">
  ${tabs}
  <div class="drop" data-drop tabindex="0" role="button" aria-describedby="drop-hint">
    <input type="file" class="visually-hidden" data-file-input multiple accept="${esc(accept)}" tabindex="-1" aria-hidden="true">
    <span class="drop-icon">${icon("upload")}</span>
    <span class="drop-title">Dosyaları buraya bırakın</span>
    <span class="btn btn-secondary drop-button">Dosya seç</span>
    <span class="drop-hint" id="drop-hint" data-drop-hint>${esc(hintFormats)}. Dosya başına en fazla 95 MB.</span>
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
</section>`;
}

function unlockTool({ kinds }) {
  const accept = kinds.map((k) => "." + k).join(",");
  return `<section class="tool tool-unlock" data-tool="unlock" aria-label="Şifre kaldırma aracı">
  <div class="drop" data-drop tabindex="0" role="button" aria-describedby="unlock-hint">
    <input type="file" class="visually-hidden" data-file-input accept="${esc(accept)}" tabindex="-1" aria-hidden="true">
    <span class="drop-icon">${icon("lock")}</span>
    <span class="drop-title">Şifreli dosyayı buraya bırakın</span>
    <span class="btn btn-secondary drop-button">Dosya seç</span>
    <span class="drop-hint" id="unlock-hint">${esc(fmtList(kinds))}. En fazla 95 MB.</span>
  </div>
  <div class="unlock-file" data-unlock-file hidden>
    <span class="unlock-file-icon">${icon("file")}</span>
    <span class="unlock-file-name" data-file-name></span>
    <span class="unlock-file-state" data-file-state></span>
  </div>
  <form class="unlock-form" data-unlock-form hidden novalidate>
    <label for="unlock-password">Dosyanın şifresi</label>
    <div class="password-row">
      <input id="unlock-password" name="password" type="password" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="1024" aria-describedby="password-help" data-password>
      <button type="button" class="btn btn-ghost" data-toggle-password aria-pressed="false">Göster</button>
    </div>
    <p class="field-help" id="password-help">Büyük/küçük harfe duyarlıdır; İ ile I farklıdır.</p>
    <p class="notice notice-warn" data-signed-warning hidden>Bu PDF dijital olarak imzalanmış. Şifre kaldırıldığında imza geçersiz olur; içerik değişmez.</p>
    <button type="submit" class="btn btn-primary" data-unlock-submit>Şifreyi kaldır</button>
  </form>
  <div class="unlock-result" data-unlock-result hidden>
    <p class="notice notice-ok" data-result-text></p>
    <div class="actions">
      <a class="btn btn-primary" data-download href="#">Şifresiz dosyayı indir</a>
      <button type="button" class="btn btn-ghost" data-reset>Başka dosya</button>
    </div>
  </div>
  <p class="status" data-status role="status" aria-live="polite"></p>
  <p class="tool-note">Bu araç şifre kırmaz ya da tahmin etmez; yalnızca girdiğiniz şifreyle çalışır. Girdiğiniz şifre saklanmaz. Devam ederek dosyanın sahibi olduğunuzu ya da kullanma yetkiniz bulunduğunu onaylamış olursunuz.</p>
  <noscript><p class="status status-error">Bu araç için JavaScript'in açık olması gerekir.</p></noscript>
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
  logo: `${SITE_URL}/favicon.svg`, sameAs: [legal.REPO],
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
      ${trustList()}
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
      ${trustList()}
      <section class="unlock-promo" aria-labelledby="unlock-promo-title">
        <h2 id="unlock-promo-title">${icon("unlock")} Şifresini bildiğiniz dosyayı açın</h2>
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
    ${page.slug === "hakkinda" ? `<p><a href="${legal.REPO}" rel="noopener">GitHub'daki proje sayfası</a></p>` : ""}
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
