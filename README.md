<p align="center">
  <img src="https://img.shields.io/badge/Node.js-24_LTS-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/FFmpeg-7.x-007808?style=for-the-badge&logo=ffmpeg&logoColor=white" alt="FFmpeg">
  <img src="https://img.shields.io/badge/LibreOffice-25.x-18A303?style=for-the-badge&logo=libreoffice&logoColor=white" alt="LibreOffice">
  <img src="https://img.shields.io/badge/Sharp-0.35-99CC00?style=for-the-badge&logo=sharp&logoColor=white" alt="Sharp">
  <img src="https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Docker-Hazır-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Coolify-Uyumlu-6B16ED?style=for-the-badge" alt="Coolify">
</p>

# TRNCConvert

> Kendi sunucunuzda çalışan, tarayıcı tabanlı dosya dönüştürme ve şifre kaldırma platformu.
> Doküman, görsel, ses ve video dosyalarını dönüştürür; şifresini bildiğiniz PDF, Word, Excel ve PowerPoint dosyalarından şifreyi kaldırır.

**Canlı adres:** [trncconvert.com](https://trncconvert.com)

TRNCConvert, iş kuyruğu tabanlı bir sunucuyu açık kaynak dönüştürme motorlarıyla (LibreOffice, FFmpeg, Sharp, PyMuPDF, pdf2docx, pikepdf, msoffcrypto-tool) birleştirir. Harici bir API'ye bağımlı değildir. Her araç için arama motorlarında listelenebilen ayrı bir Türkçe sayfa üretir.

---

## İçindekiler

- [Özellikler](#özellikler)
- [Mimari](#mimari)
- [Desteklenen Formatlar](#desteklenen-formatlar)
- [Şifre Kaldırma](#şifre-kaldırma)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Coolify ve Docker ile Dağıtım](#coolify-ve-docker-ile-dağıtım)
- [API Referansı](#api-referansı)
- [Proje Yapısı](#proje-yapısı)
- [Yapılandırma ve Limitler](#yapılandırma-ve-limitler)
- [Güvenlik](#güvenlik)
- [SEO](#seo)
- [Testler](#testler)
- [Lisans](#lisans)

---

## Özellikler

| Özellik | Açıklama |
|---------|----------|
| **50'ye yakın format** | Belge, tablo, sunum, PDF, görsel, ses ve video |
| **Toplu işlem** | Tek seferde 10 dosya; sonuçlar tek tek ya da tek ZIP olarak indirilir |
| **Şifre kaldırma** | PDF, DOCX, XLSX, PPTX; her dosyaya ayrı şifre ya da tek ortak şifre |
| **Uzun işler** | Yükle, sorgula, indir akışı; Cloudflare'in 125 sn sınırına takılmaz |
| **Gizlilik** | Hesap yok, çerez yok, takip yok; dosyalar 10 dakika içinde silinir |
| **SEO** | 38 sunucuda üretilen Türkçe sayfa, site haritası, robots.txt, JSON-LD |
| **Tasarım** | Açık ve koyu tema, mobil uyumlu, klavye ile kullanılabilir |

---

## Mimari

```
İstemci (sunucuda üretilen sayfalar)      Sunucu (Express 5)
┌──────────────────────┐   multipart   ┌───────────────────────────────────────────┐
│  Sürükle & Bırak     │──────────────>│  Multer (95 MB, uzantı + imza kontrolü)   │
│  Dosya Kuyruğu       │  /api/convert │                │                          │
│  Şifre Alanları      │  /api/unlock  │  ┌─────────────▼──────────────────────┐   │
│  İlerleme Takibi     │<──────────────│  │  İş Kuyruğu (eşzamanlı 3 iş)       │   │
│  ZIP İndirme         │  iş durumu    │  │  IP başına istek sınırı            │   │
└──────────────────────┘               │  └─────────────┬──────────────────────┘   │
                                       │                │                          │
                                       │  ┌─────────────▼──────────────────────┐   │
                                       │  │  Dönüştürme Motorları              │   │
                                       │  │  ├─ LibreOffice  belge/tablo/sunum │   │
                                       │  │  ├─ pdf2docx     PDF → DOCX        │   │
                                       │  │  ├─ PyMuPDF      PDF → görsel      │   │
                                       │  │  ├─ Sharp/Pillow görsel, HEIC      │   │
                                       │  │  ├─ FFmpeg       ses, video        │   │
                                       │  │  └─ pikepdf/msoffcrypto  şifre     │   │
                                       │  └─────────────┬──────────────────────┘   │
                                       │                │                          │
                                       │  ┌─────────────▼──────────────────────┐   │
                                       │  │  /dl/:id/:anahtar  (10 dk sonra    │   │
                                       │  │   otomatik silinir)                │   │
                                       │  └────────────────────────────────────┘   │
                                       └───────────────────────────────────────────┘
```

**İstek yaşam döngüsü:** Yükleme → boyut, uzantı ve dosya imzası kontrolü → iş kuyruğu → motor → çıktı doğrulama → anahtarlı indirme bağlantısı → 10 dakika sonra silme

---

## Desteklenen Formatlar

| Kategori | Giriş Formatları | Çıkış Formatları | Motor |
|----------|------------------|------------------|-------|
| Metin belgeleri | `DOCX` `DOC` `ODT` `RTF` `TXT` | `PDF` `DOCX` `ODT` `RTF` `TXT` | LibreOffice |
| Tablolar | `XLSX` `XLS` `ODS` `CSV` | `PDF` `XLSX` `ODS` `CSV` | LibreOffice |
| Sunumlar | `PPTX` `PPT` `ODP` | `PDF` `PPTX` `ODP` | LibreOffice |
| PDF | `PDF` | `DOCX` `TXT` `JPG` `PNG` | pdf2docx / PyMuPDF |
| Görsel | `JPG` `PNG` `WebP` `AVIF` `GIF` `TIFF` `BMP` `HEIC` `SVG` | `JPG` `PNG` `WebP` `AVIF` `GIF` `TIFF` `PDF` | Sharp / Pillow |
| Ses | `MP3` `WAV` `M4A` `AAC` `OGG` `Opus` `FLAC` `WMA` `AIFF` | `MP3` `WAV` `M4A` `OGG` `Opus` `FLAC` | FFmpeg |
| Video | `MP4` `MOV` `MKV` `WebM` `AVI` `WMV` `M4V` `3GP` | `MP4` `MOV` `MKV` `WebM` `AVI` `GIF` `MP3` `M4A` `WAV` | FFmpeg |

### Kalite Ön Ayarları

| Ön Ayar | MP3 | Video (H.264) | JPG / WebP |
|---------|-----|---------------|------------|
| `low` (Daha küçük dosya) | 128 kbps | CRF 28 | %70 |
| `normal` (Dengeli) | 192 kbps | CRF 23 | %82 |
| `high` (En yüksek kalite) | 320 kbps | CRF 20 | %92 |

Video çıktıları web uyumludur: `yuv420p`, çift sayılı boyutlar ve MP4/MOV için `+faststart`. GIF en fazla 30 saniye, 480 px ve 12 fps olarak üretilir.

---

## Şifre Kaldırma

| Tür | Kitaplık | Kapsam |
|-----|----------|--------|
| PDF | pikepdf (qpdf) | RC4, AES-128 ve AES-256. Yalnızca kısıtlama şifresi olan PDF'ler şifre sorulmadan açılır. |
| DOCX, XLSX, PPTX | msoffcrypto-tool | Office 2007 ve sonrası açılış parolası (Standard ve Agile şifreleme). |

- Araç **şifre kırmaz ve tahmin etmez**; yalnızca kullanıcının girdiği şifreyi dener.
- Toplu kullanım: tek seferde 10 dosya, her dosyaya ayrı şifre ya da "aynı şifreyi hepsine uygula".
- Üç yanlış denemeden sonra o dosya sunucudan silinir.
- Türkçe karakterli şifreler desteklenir (ş, ğ, ı, İ, ç, ö, ü).
- Desteklenmeyenler: eski `.doc`, `.xls`, `.ppt`; ODF parolaları; sertifikalı PDF şifrelemesi; şifreleme içermeyen "düzenlemeyi kısıtla" koruması.

**Doğrulama:** `trncconvert/tests/fixtures/office` altındaki dosyalar gerçek Microsoft Word, Excel ve PowerPoint ile Türkçe karakterli bir parolayla kaydedildi. Şifresi kaldırılan kopyaların aynı uygulamalarda parola sorulmadan açıldığı test edildi.

---

## Hızlı Başlangıç

### Ön Gereksinimler

| Bağımlılık | Kullanım Amacı | Ubuntu / Debian |
|------------|----------------|-----------------|
| **Node.js** 22+ | Çalışma ortamı | `apt install nodejs` |
| **LibreOffice** | Belge dönüştürme | `apt install libreoffice-writer libreoffice-calc libreoffice-impress` |
| **FFmpeg** | Ses / video | `apt install ffmpeg` |
| **Python** 3.11+ | PDF, HEIC ve şifre işlemleri | `apt install python3 python3-venv` |

### Kurulum ve Çalıştırma

```bash
cd trncconvert
npm install
python3 -m venv .venv
.venv/bin/pip install pikepdf==10.17.0 msoffcrypto-tool==6.0.0 PyMuPDF==1.28.2 pdf2docx==0.5.13 pillow==12.3.0 pillow-heif==1.8.1
PYTHON=.venv/bin/python node server.cjs
```

Sunucu varsayılan olarak `http://localhost:3000` adresinde başlar.

---

## Coolify ve Docker ile Dağıtım

Coolify, depodaki `Dockerfile` dosyasını build edip konteyneri çalıştırır. Kök dizindeki ve `trncconvert/` altındaki Dockerfile aynı imajı üretir; Coolify'da hangi temel dizin seçiliyse o kullanılır.

| Ayar | Değer |
|------|-------|
| Taban imaj | `node:24-trixie-slim` (Node 24 LTS, Debian 13) |
| Port | `3000` |
| Sağlık kontrolü | `GET /health` → `OK` |
| Kullanıcı | `node` (root değil) |
| Önerilen bellek | En az 2 GB |
| Alan adları | `https://trncconvert.com,https://www.trncconvert.com` |
| Cloudflare SSL/TLS | Full (strict) |

```bash
docker build -t trncconvert .
docker run -d -p 3000:3000 --name trncconvert trncconvert
docker inspect --format='{{.State.Health.Status}}' trncconvert
```

---

## API Referansı

Dönüştürme ve şifre kaldırma uç noktaları `multipart/form-data` alır, JSON döner. Her iş için 128 bitlik bir anahtar (`token`) üretilir; durum sorgusu ve indirme bu anahtarı ister.

| Uç Nokta | Metod | Parametreler | Açıklama |
|----------|-------|--------------|----------|
| `/api/convert` | `POST` | `file`, `target`, `quality`, `name` | Dönüştürme işi başlatır → `{ id, token, status }` |
| `/api/jobs/:id?t=` | `GET` | `t` (anahtar) | `queued`, `running`, `done` ya da `error` |
| `/dl/:id/:token` | `GET` | — | Sonucu orijinal Türkçe adıyla indirir |
| `/api/zip` | `POST` | `{ items: [{ id, token }] }` | Birden fazla sonucu tek ZIP olarak indirir |
| `/api/unlock/inspect` | `POST` | `file`, `name` | `needs_password`, `restrictions_only`, `not_encrypted` ya da `unsupported` |
| `/api/unlock/:id` | `POST` | `{ password, token }` | Şifreyi kaldırır; yanlış şifrede `401` ve kalan deneme |
| `/api/catalog` | `GET` | — | Desteklenen format eşleşmeleri |
| `/health` | `GET` | — | Sağlık kontrolü |

### Örnek: PDF'i Word'e Dönüştürme

```bash
curl -A "Mozilla/5.0" -F "file=@belge.pdf" -F "target=docx" https://trncconvert.com/api/convert
```

---

## Proje Yapısı

```
trncconvert/
├── server.cjs                 # Express uygulaması, güvenlik başlıkları, sayfalar, temizlik
├── routes/
│   ├── api.cjs                # Dönüştürme, iş durumu, indirme, ZIP
│   └── unlock.cjs             # Şifre inceleme ve kaldırma
├── lib/
│   ├── formats.cjs            # Format kataloğu (sunucu ve istemci için tek kaynak)
│   ├── jobs.cjs               # İş kuyruğu, anahtarlar, süre dolunca silme
│   ├── run.cjs                # Kabuksuz komut çalıştırıcı (zaman aşımı, stdin)
│   ├── sniff.cjs              # Dosya imzası kontrolü
│   ├── upload.cjs             # Multer yapılandırması (95 MB)
│   ├── ratelimit.cjs          # IP başına istek sınırı (Cloudflare uyumlu)
│   └── engines/               # office, pdf, image, media motorları
├── scripts/
│   └── pyhelper.py            # PDF, HEIC ve şifre işlemleri (şifre yalnızca stdin)
├── site/
│   ├── content.cjs            # 34 araç sayfasının Türkçe içeriği
│   ├── legal.cjs              # Hakkında, gizlilik/KVKK, kullanım şartları
│   └── render.cjs             # HTML, JSON-LD, sitemap, robots.txt
├── public/
│   ├── css/site.css           # Tasarım sistemi (açık/koyu tema)
│   ├── js/app.js              # Dönüştürücü ve şifre kaldırma arayüzü
│   └── js/theme.js            # Tema tercihi
└── tests/
    ├── unit/                  # Çekirdek, kuyruk ve Python yardımcısı testleri
    ├── e2e/                   # Çalışan sunucuya karşı uçtan uca testler
    ├── fixtures/office/       # Gerçek Office ile şifrelenmiş örnek dosyalar
    └── make_fixtures.py       # PDF, görsel, ses ve video örnekleri üretir
```

---

## Yapılandırma ve Limitler

| Parametre | Değer | Ortam Değişkeni |
|-----------|-------|-----------------|
| Maksimum dosya boyutu | 95 MB | — |
| Tek seferde dosya | 10 | — |
| Eşzamanlı dönüştürme | 3 | `MAX_CONCURRENT_JOBS` |
| Eşzamanlı şifre kaldırma | 2 | `MAX_UNLOCK_JOBS` |
| Çıktı saklama süresi | İş bittikten sonra 10 dakika | — |
| Şifre bekleme süresi | 15 dakika | — |
| Yanlış şifre hakkı | Dosya başına 3 | — |
| Dönüşüm istek sınırı | IP başına 10 dakikada 60 | `RATE_LIMIT_SCALE` (çarpan) |
| Şifre kaldırma istek sınırı | IP başına 10 dakikada 30 | `RATE_LIMIT_SCALE` (çarpan) |
| Canonical adres | `https://trncconvert.com` | `SITE_URL` |
| Port | 3000 | `PORT` |

---

## Güvenlik

| Katman | Mekanizma |
|--------|-----------|
| **Şifreler** | Yalnızca Python yardımcısının stdin'ine yazılır; diske, argümanlara, ortam değişkenlerine ve kayıtlara girmez |
| **Dosya doğrulama** | Uzantı beyaz listesi + dosya imzası (magic bytes) kontrolü + 95 MB sınırı |
| **Erişim** | Her iş için 128 bitlik rastgele anahtar; anahtarsız indirme ve sorgu yok |
| **Komut çalıştırma** | `spawn` ile argüman dizisi, kabuk yok; her motorda zaman aşımı |
| **Kötüye kullanım** | IP başına istek sınırı; `CF-Connecting-IP` yalnızca Cloudflare adreslerinden kabul edilir |
| **Başlıklar** | Sıkı CSP, HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` |
| **Hata mesajları** | İstemciye yalnızca sabit Türkçe mesajlar; motor çıktısı gönderilmez |
| **Dosya ömrü** | Yüklemeler iş bitince, çıktılar 10 dakika sonra, yarım dosyalar hemen silinir |
| **Konteyner** | `node` kullanıcısıyla çalışır; ImageMagick ve Ghostscript kaldırıldı |
| **Bağımlılıklar** | `npm audit` ve `pip-audit` temiz; Python paketleri sabit sürümlü |

---

## SEO

Her araç için sunucuda üretilen, kendine özgü başlık, açıklama, H1, canonical bağlantı ve Türkçe içerik taşıyan bir sayfa vardır. `robots.txt`, `sitemap.xml` ve JSON-LD (Organization, WebSite, WebApplication, BreadcrumbList) otomatik üretilir.

Yeni bir araç sayfası eklemek için `trncconvert/site/content.cjs` dosyasına bir kayıt eklemek yeterlidir; sayfa, site haritası ve bağlantılar kendiliğinden oluşur. Yayından sonra yapılacaklar (Search Console, Yandex, Cloudflare ayarları) için [docs/SEO-PLANI.md](docs/SEO-PLANI.md) dosyasına bakın.

---

## Testler

```bash
cd trncconvert
python3 tests/make_fixtures.py tests/.fixtures
FIXTURES=tests/.fixtures npm test
```

| Test Grubu | Kapsam |
|------------|--------|
| Birim testleri | Format kataloğu, komut çalıştırıcı, dosya imzası, kuyruk ve silme, şifre kaldırma |
| Uçtan uca testler | Her motorun dönüşümleri, toplu şifre kaldırma, ZIP, güvenlik, tüm sayfalar |

GitHub Actions (`.github/workflows/ci.yml`) her gönderimde iki Dockerfile'ı da build eder, konteyneri başlatır ve bütün testleri konteynerin içinde çalıştırır.

---

## Lisans

Bu proje özel kullanım içindir.
