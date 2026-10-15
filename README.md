# TRNCConvert

Belge, görsel, ses ve video dosyalarını tarayıcıdan dönüştüren; şifresi bilinen PDF, Word, Excel ve PowerPoint dosyalarından şifreyi kaldıran, kendi sunucunuzda çalışan bir site.

Canlı adres: https://trncconvert.com

## Özellikler

- Her araç için ayrı, sunucuda üretilen Türkçe sayfa. Sayfa, site haritası ve bağlantılar `trncconvert/site/content.cjs` dosyasından üretilir.
- Dosyalar 10 dakika içinde silinir. Hesap gerekmez. Dosya başına en fazla 95 MB, tek seferde 10 dosya.
- Uzun süren dönüşümler Cloudflare'in 125 saniyelik sınırına takılmaz: istemci önce dosyayı yükler, sonra işin durumunu sorgular.
- Şifre yalnızca Python yardımcısının standart girdisinden geçer. Diske yazılmaz ve kayıtlara girmez. Üç yanlış denemeden sonra dosya silinir.
- Şifre kaldırma toplu çalışır: tek seferde 10 dosya, her dosyaya ayrı şifre ya da tek ortak şifre, sonuçlar tek tek ya da tek ZIP olarak indirilir.

## Desteklenen dönüşümler

| Kategori | Giriş | Çıkış | Motor |
|---|---|---|---|
| Metin belgeleri | DOCX, DOC, ODT, RTF, TXT | PDF, DOCX, ODT, RTF, TXT | LibreOffice |
| Tablolar | XLSX, XLS, ODS, CSV | PDF, XLSX, ODS, CSV | LibreOffice |
| Sunumlar | PPTX, PPT, ODP | PDF, PPTX, ODP | LibreOffice |
| PDF | PDF | DOCX, TXT, JPG, PNG | pdf2docx, PyMuPDF |
| Görsel | JPG, PNG, WebP, AVIF, GIF, TIFF, BMP, HEIC, SVG | JPG, PNG, WebP, AVIF, GIF, TIFF, PDF | sharp, Pillow |
| Ses | MP3, WAV, M4A, AAC, OGG, Opus, FLAC, WMA, AIFF | MP3, WAV, M4A, OGG, Opus, FLAC | FFmpeg |
| Video | MP4, MOV, MKV, WebM, AVI, WMV, M4V, 3GP | MP4, MOV, MKV, WebM, AVI, GIF, MP3, M4A, WAV | FFmpeg |

## Şifre kaldırma

| Tür | Kitaplık | Kapsam |
|---|---|---|
| PDF | pikepdf (qpdf) | RC4, AES-128 ve AES-256 şifreler. Yalnızca kısıtlama şifresi olan PDF'ler şifre sorulmadan açılır. |
| DOCX, XLSX, PPTX | msoffcrypto-tool | Office 2007 ve sonrası "açılış parolası" (Standard ve Agile şifreleme). |

Desteklenmeyenler: eski `.doc`, `.xls`, `.ppt` dosyaları; ODF dosyalarının parolaları; sertifika ile şifrelenmiş PDF'ler; şifreleme içermeyen "düzenlemeyi kısıtla" koruması. Araç şifre kırmaz ve tahmin etmez.

Doğrulama: `tests/fixtures/office` klasöründeki dosyalar gerçek Microsoft Word, Excel ve PowerPoint ile Türkçe karakterli bir parolayla kaydedildi. Şifresi kaldırılan kopyaların aynı uygulamalarda parola sorulmadan açıldığı denendi.

## Coolify ile dağıtım

Coolify, depodaki `Dockerfile` dosyasını build eder. Kök dizindeki ve `trncconvert/` altındaki Dockerfile aynı imajı üretir; Coolify'da hangi temel dizin seçiliyse o kullanılır.

- Taban imaj: `node:24-trixie-slim`. Node 24 2028'e, Debian 13 2028 sonrasına kadar destekleniyor. Önceki Node 20 ve Debian 11 imajının desteği 2026'da sona erdi.
- Port 3000, sağlık kontrolü `GET /health`. Konteyner `node` kullanıcısıyla çalışır.
- Önerilen bellek limiti en az 2 GB. LibreOffice ve büyük Office dosyalarının şifre çözümü bellek kullanır.
- Domains alanına `https://trncconvert.com` ile birlikte `https://www.trncconvert.com` da eklenmeli; uygulama `www` adresini 301 ile yönlendirir.
- Cloudflare SSL/TLS modu Full (strict) olmalı.

Ortam değişkenleri, hepsi isteğe bağlı:

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `PORT` | 3000 | Dinlenen port |
| `SITE_URL` | https://trncconvert.com | Canonical adresler ve site haritası için |
| `MAX_CONCURRENT_JOBS` | 3 | Aynı anda çalışan dönüşüm sayısı |
| `MAX_UNLOCK_JOBS` | 2 | Aynı anda çalışan şifre kaldırma sayısı |
| `RATE_LIMIT_SCALE` | 1 | IP başına istek sınırlarının çarpanı |

## Yerelde çalıştırma

Gerekenler: Node 22 veya üstü, Python 3.11 veya üstü, LibreOffice ve FFmpeg.

```bash
cd trncconvert
npm install
python3 -m venv .venv
.venv/bin/pip install pikepdf==10.17.0 msoffcrypto-tool==6.0.0 PyMuPDF==1.28.2 pdf2docx==0.5.13 pillow==12.3.0 pillow-heif==1.8.1
PYTHON=.venv/bin/python node server.cjs
```

## Testler

```bash
python3 tests/make_fixtures.py tests/.fixtures
npm test
```

Birim testleri yardımcıları ve şifre kaldırmayı doğrudan dener. Uçtan uca testler çalışan sunucuya HTTP ile gider; `BASE_URL` değişkeni sunucunun adresini verir.

GitHub Actions (`.github/workflows/ci.yml`) her gönderimde iki Dockerfile'ı da build eder, konteyneri başlatır ve bütün testleri konteynerin içinde çalıştırır.

## API

| Uç nokta | Açıklama |
|---|---|
| `POST /api/convert` | multipart: `file`, `target`, `quality` (`low`, `normal`, `high`), `name`. Yanıt: `{ id, status }` |
| `GET /api/jobs/:id` | `queued`, `running`, `done` ya da `error`; tamamlanınca indirme bağlantısı |
| `GET /dl/:id/:token` | Dosyayı orijinal Türkçe adıyla indirir |
| `POST /api/zip` | `{ items: [{ id, token }] }` ile birden fazla sonucu ZIP olarak indirir |
| `POST /api/unlock/inspect` | multipart: `file`. Yanıt: `needs_password`, `restrictions_only`, `not_encrypted` ya da `unsupported` |
| `POST /api/unlock/:id` | JSON: `{ password }`. Yanlış şifrede 401 ve kalan deneme sayısı döner |

## SEO

Yapılanlar ve yayından sonra yapılması gerekenler için `docs/SEO-PLANI.md` dosyasına bakın.
