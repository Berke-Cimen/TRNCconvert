# TRNCConvert yeni tasarım, şifre kaldırma ve SEO — uygulama planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Siteyi açık lacivert/bakır tasarıma taşımak, format sayısını artırmak, kanıtlanmış bir şifre kaldırma aracı eklemek ve sunucuda üretilen SEO sayfaları kurmak.

**Architecture:** Express 4 sunucusu tek bir format kataloğundan (`lib/formats.cjs`) beslenir. Dönüşümler bellekte bir iş kuyruğunda, kabuksuz `spawn` ile çalışır. İstemci işi sorgular, böylece Cloudflare'in 125 saniye sınırına takılmaz. Python işleri (PDF, Pillow, şifre) tek bir yardımcı betikte toplanır. Sayfalar bir içerik manifestinden sunucuda üretilir.

**Tech Stack:** Node 24, Express 4, multer 2, sharp, archiver 7, LibreOffice 25.2, FFmpeg 7.1, Python 3.13 venv (pikepdf, msoffcrypto-tool, PyMuPDF, pdf2docx, Pillow, pillow-heif), Docker (node:24-trixie-slim), Coolify, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-15-redesign-unlock-seo-design.md`

## Global Constraints

- Taban imaj `node:24-trixie-slim`. Konteyner `node` kullanıcısıyla çalışır ve `/health` sağlık kontrolü korunur.
- Python sürümleri: `pikepdf==10.17.0 msoffcrypto-tool==6.0.0 PyMuPDF==1.28.2 pdf2docx==0.5.13 pillow==12.3.0 pillow-heif==1.8.1`.
- Yükleme sınırı 95 MB. İşler ve dosyalar 10 dakika sonra silinir.
- Dış süreçler yalnızca `lib/run.cjs` ile çalışır: argüman dizisi, kabuk yok.
- Şifre yalnızca stdin'den JSON olarak geçer. Hiçbir log, hata mesajı veya dosya şifre içermez.
- Kullanıcıya giden hatalar sabit Türkçe metinlerdir; ham stderr gitmez.
- Arayüz metinleri Türkçe ve cümle düzeninde yazılır. Büyük harfli etiket, ok ile biten buton ve orta nokta ile birleştirilmiş meta metni kullanılmaz.
- Renkler, yazı tipleri ve yarıçaplar spec'teki değerlerdir.

## Review Focus

- Türkçe karakterli şifre (ş, ğ, İ): PDF R4 ve R6 ile Office dosyalarında doğru şifre kabul edilmeli. Test: Görev 3 ve Görev 10.
- Uzantısı yanlış dosya (adı .pdf olan bir PNG): net bir "dosya türü desteklenmiyor" hatası vermeli, motor çökmemeli. Test: Görev 2.
- Türkçe dosya adı (ör. `Özgeçmiş şubat.docx`): indirilen dosya aynı adı yeni uzantıyla taşımalı. Test: Görev 5.
- Aynı anda çok iş gelmesi: kuyruk sıralı ilerlemeli, "sunucu meşgul" hatası olmamalı. Test: Görev 4.
- Yanlış şifre ardı ardına üç kez girilirse dosya silinmeli; dördüncü deneme "iş bulunamadı" dönmeli. Test: Görev 7.

---

### Task 1: Altyapı — Dockerfile, bağımlılıklar, temizlik

**Files:** Modify `Dockerfile`, `trncconvert/Dockerfile`, `trncconvert/package.json`, `.dockerignore`, `trncconvert/.dockerignore`. Delete `trncconvert/public/js/security.js`, `trncconvert/public/js/bg.js`, `.DS_Store`.

- [ ] Dockerfile'ı spec'teki apt paketleri ve `/opt/venv` ile yeniden yaz. `PATH=/opt/venv/bin:$PATH`, `USER node`, `/app/uploads /app/output /app/data` dizinleri node kullanıcısına ait olsun.
- [ ] `package.json`: `express ^4.21.2`, `multer ^2.0.2`, `sharp ^0.35.5`, `archiver ^7.0.1`, `@fontsource-variable/source-sans-3`, `@fontsource-variable/bricolage-grotesque`. `"engines": {"node": ">=22"}`, `"test": "node --test tests/"`.
- [ ] `npm install` ile lock dosyasını üret ve commit et.

### Task 2: Çekirdek kütüphaneler — run, formats, upload, sniff

**Files:** Create `lib/run.cjs`, `lib/formats.cjs`, `lib/upload.cjs`, `lib/sniff.cjs`, `lib/filename.cjs` (taşınır). Test: `tests/unit/formats.test.cjs`, `tests/unit/run.test.cjs`, `tests/unit/sniff.test.cjs`.

**Interfaces (Produces):**
- `run(cmd: string, args: string[], {timeoutMs, input?: string|Buffer, cwd?, env?}) => Promise<{code, stdout, stderr}>`. Sıfır olmayan çıkışta reddetmez; çağıran kodu yorumlar. Zaman aşımında `{code: null, timedOut: true}` döner.
- `formats.categories`: `[{id, label, accept: string[]}]`.
- `formats.targetsFor(ext: string) => string[]`.
- `formats.engineFor(ext, target) => 'office'|'pdf'|'image'|'media'|null`.
- `formats.clientCatalog()`: istemciye gömülen JSON.
- `sniff(filePath) => Promise<'pdf'|'zip'|'cfb'|'png'|'jpeg'|'gif'|'webp'|'riff'|'heic'|'unknown'|...>`.
- `sniffMatches(ext, kind) => boolean`.

- [ ] Testler: `targetsFor('pdf')` sonucu `['docx','txt','jpg','png']` olmalı. `targetsFor('heic')` `pdf` içermeli. `targetsFor('exe')` boş dönmeli. Kaynak ve hedef aynıysa çift olarak listelenmemeli.
- [ ] Testler: `run('node', ['-e', 'process.stdin.pipe(process.stdout)'], {input:'şifre'})` çıktısı `şifre` olmalı. Zaman aşımı `timedOut: true` vermeli.
- [ ] Testler: PDF başlığıyla yazılmış bir dosyaya `sniff` sonucu `pdf` olmalı. `.pdf` adlı PNG için `sniffMatches('pdf','png')` false olmalı.

### Task 3: Python yardımcı — `scripts/pyhelper.py`

**Files:** Create `scripts/pyhelper.py`. Test: `tests/unit/pyhelper.test.cjs` (yerel venv ile).

Alt komutlar ve çıkış kodları:
- `pdf2docx IN OUT`, `pdf2txt IN OUT`, `pdf2img IN OUTDIR FMT` (oluşan dosyaları stdout'a JSON liste olarak basar), `img2pdf IN OUT`, `normalize IN OUT.png` (Pillow ve pillow-heif ile, EXIF yönünü uygular).
- `inspect IN` → stdout JSON: `{kind:'pdf'|'ooxml', state, signed}`.
- `unlock IN OUT` → stdin JSON `{"password": "..."}`.
- Çıkış kodları: 0 başarılı, 2 yanlış şifre, 3 şifreli değil, 4 desteklenmiyor/bozuk, 5 iç hata.

- [ ] Testler pikepdf ile fixture üretir: R6 kullanıcı şifresi `Şifre123!`, R4 AES-128 şifresi `ışığa`, yalnızca kısıtlamalı R6. Doğru şifre 0 dönmeli ve çıktı şifresiz açılmalı. Yanlış şifre 2 dönmeli ve çıktı dosyası olmamalı. Şifresiz PDF 3 dönmeli.
- [ ] Office testleri `tests/fixtures/office/*` (Görev 10) dosyalarıyla çalışır. Dosyalar yoksa msoffcrypto ile 4096 bayttan büyük fixture üretilir.

### Task 4: İş kuyruğu — `lib/jobs.cjs`

**Interfaces (Produces):** `createJob({inputPath, originalName, ext, kind, target, quality, ip}) => job`; `enqueue(job, workerFn)`; `getJob(id)`; `publicView(job)`; `removeJob(id)`; `sweep()`. `job.token` 128 bitlik rastgele değerdir.

- [ ] Testler: 5 iş eşzamanlılık 3 ile kuyruğa alınınca en fazla 3 iş aynı anda `running` olmalı. Hepsi `done` olmalı. `position` alanı doğru azalmalı.
- [ ] Testler: `sweep` 10 dakikadan eski işleri ve dosyalarını silmeli.

### Task 5: Motorlar ve API rotaları

**Files:** Create `lib/engines/office.cjs`, `lib/engines/pdf.cjs`, `lib/engines/image.cjs`, `lib/engines/media.cjs`, `routes/api.cjs`. Delete `routes/document.cjs`, `routes/image.cjs`, `routes/audio.cjs`, `routes/video.cjs`, `utils/*`.

- [ ] Her motor `convert(job) => Promise<{path, name}>` imzasını uygular. Çıktı adı orijinal adın gövdesi ile yeni uzantıdan oluşur.
- [ ] FFmpeg argüman tablosu spec'teki gibi olur. Görüntü işleme sharp ile yapılır. HEIC ve BMP önce `normalize` ile PNG'ye çevrilir. Görselden PDF için `img2pdf` kullanılır.
- [ ] Rotalar: `POST /api/convert`, `GET /api/jobs/:id`, `GET /dl/:id/:token`, `POST /api/zip`.
- [ ] Test: sunucuyu başlatıp PNG'yi WebP'ye çevir ve çıktının sniff sonucunun `webp` olduğunu doğrula. `Özgeçmiş şubat.png` dosyası için `Content-Disposition` başlığı `filename*=UTF-8''%C3%96zge%C3%A7mi%C5%9F%20%C5%9Fubat.webp` içermeli.

### Task 6: Hız sınırı, güvenlik başlıkları, sunucu

**Files:** Create `lib/ratelimit.cjs`. Modify `server.cjs`.

- [ ] Testler: aynı IP'den sınırın üstünde istek gelirse 429 ve Türkçe mesaj dönmeli.
- [ ] Başlıklar: CSP yalnızca `self` kaynaklarına izin verir (JSON-LD için `script-src 'self'`; satır içi stil yok). Ayrıca `X-Content-Type-Options`, `Referrer-Policy` ve `Permissions-Policy` başlıkları eklenir. `www.` ile gelen istek 301 ile ana alana yönlenir.

### Task 7: Şifre kaldırma rotaları

**Files:** Create `routes/unlock.cjs`, `lib/engines/unlock.cjs`.

- [ ] Testler (sunucuya karşı): R6 Türkçe şifreli PDF için inspect sonucu `needs_password` olmalı. Doğru şifre indirme bağlantısı vermeli; indirilen dosya şifresiz açılmalı. Yalnızca kısıtlamalı PDF'de inspect `restrictions_only` dönmeli ve boş şifreyle kaldırma başarılı olmalı. Üç yanlış şifreden sonraki deneme 404 dönmeli. Şifresiz DOCX'te inspect `not_encrypted` dönmeli.

### Task 8: Tasarım sistemi ve istemci betikleri

**Files:** Create `public/css/site.css`, `public/js/converter.js`, `public/js/unlock.js`, `public/js/theme.js`. Delete `public/css/style.css`, `public/js/app.js`, `public/index.html`.

- [ ] Dönüştürücü bileşeni: kategori sekmeleri, görünür "Dosya seç" butonu, sürükle-bırak, kuyruk listesi, hedef format için radyo çipleri (kuyruktaki dosyaların ortak hedefleri), kalite seçimi, iş sorgulama, satır bazlı ilerleme, indirme ve ZIP.
- [ ] Şifre bileşeni: yükleme, inceleme, şifre alanı (göster/gizle, `autocapitalize=off`), kalan deneme sayısı, imza uyarısı, sonuç.
- [ ] Tarayıcıda elle doğrulama: ekran görüntüsü masaüstünde ve 375 px genişlikte alınır; klavye ile tüm akış denenir.

### Task 9: Sayfalar, içerik ve SEO

**Files:** Create `site/content.cjs` (manifest), `site/render.cjs`, `site/router.cjs`.

- [ ] Her sayfa: benzersiz title, açıklama, H1, canonical, JSON-LD, breadcrumb ve ilgili bağlantılar.
- [ ] `robots.txt`, `sitemap.xml` ve 404 sayfası.
- [ ] Testler: her manifest sayfası 200 dönmeli. Başlıklar benzersiz olmalı. Sitemap'teki her URL 200 dönmeli. Bilinmeyen yol 404 ve `noindex` dönmeli.

### Task 10: Gerçek Office fixture'ları ve uçtan uca test

**Files:** Create `tests/fixtures/office/` (Word, PowerPoint ve Excel COM ile Türkçe şifreli kaydedilmiş dosyalar), `tests/make_fixtures.py`, `tests/e2e.test.cjs`, `tests/office-fixtures.ps1`.

- [ ] Fixture'ları gerçek Office ile üret: şifre `Gizli-Şğİ-2026`, her uygulama için bir dosya.
- [ ] `e2e.test.cjs` her format çiftinden bir örneği ve tüm şifre senaryolarını çalışan sunucuya karşı dener.

### Task 11: CI — Docker build ve konteyner içi test

**Files:** Create `.github/workflows/ci.yml`.

- [ ] Adımlar: build, `docker run -d`, sağlık kontrolünü bekleme, `docker exec` ile `python3 tests/make_fixtures.py` ve `node --test tests/`, son olarak loglar.
- [ ] Dal GitHub'a gönderilir (kullanıcı onayıyla) ve CI'ın yeşil olduğu doğrulanır.

### Task 12: README ve SEO eylem raporu

**Files:** Modify `README.md`. Create `docs/SEO-PLANI.md`.

- [ ] README: yeni formatlar, API, Coolify dağıtım notları (bellek limiti, `www` alan adı).
- [ ] SEO planı: Search Console, Yandex, IndexNow, Cloudflare ayarları ve içerik takvimi.
