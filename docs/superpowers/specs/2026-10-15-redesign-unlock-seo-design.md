# TRNCConvert: yeni tasarım, şifre kaldırma, format genişletme ve SEO

Tarih: 2026-10-15. Durum: kullanıcı tarafından onaylandı (lacivert/bakır açık tema).

## Amaç

1. "Yapay" görünen koyu neon tasarımı sade, güven veren açık bir tasarımla değiştirmek.
2. Dönüştürülebilen dosya türlerini artırmak.
3. Kullanıcının bildiği şifreyi PDF, DOCX, PPTX ve XLSX dosyalarından kaldıran, çalıştığı kanıtlanmış bir araç eklemek.
4. Google'da dosya, ses ve video dönüştürme aramalarında görünür olacak bir site yapısı kurmak.

## Kısıtlar

- Dağıtım Coolify ile yapılıyor. Coolify depodaki Dockerfile'ı build edip konteyneri çalıştırıyor. Sunucuya elle müdahale yok; her bağımlılık Dockerfile'da olmalı.
- Önde Cloudflare var. Ücretsiz planda istek gövdesi 100 MB ile sınırlı ve 125 saniyeyi aşan yanıtlar 524 ile kesiliyor.
- Arayüz dili Türkçe.
- Node 20 ve Debian 11 güvenlik desteği dışında. Yeni taban `node:24-trixie-slim` (Node 24 desteği 2028-04-30'a kadar).

## Mimari

### Altyapı

- Kök `Dockerfile` ve `trncconvert/Dockerfile` aynı imajı üretir; hangisini Coolify kullanıyorsa çalışır.
- apt: `libreoffice-writer libreoffice-calc libreoffice-impress ffmpeg python3 python3-venv fonts-dejavu-core fonts-liberation2 fonts-crosextra-carlito fonts-crosextra-caladea fonts-noto-core curl`. ImageMagick ve Ghostscript kaldırılır; artık kullanılmıyorlar.
- Python bağımlılıkları `/opt/venv` içinde sabit sürümlerle: `pikepdf==10.17.0 msoffcrypto-tool==6.0.0 PyMuPDF==1.28.2 pdf2docx==0.5.13 pillow==12.3.0 pillow-heif==1.8.1`.
- Konteyner `node` kullanıcısıyla çalışır. `HEALTHCHECK` `/health` üzerinden devam eder.
- Node bağımlılıkları: `express@4`, `multer@2` (2025 DoS CVE'leri kapalı), `sharp`, `archiver@7`, kendi sunucumuzdan sunulan fontlar için `@fontsource-variable/*`.

### Sunucu katmanları

| Dosya | Görev |
|---|---|
| `lib/formats.cjs` | Tek doğruluk kaynağı: kategori, giriş uzantısı, motor, izin verilen çıktılar. Sunucu doğrulaması ve istemci arayüzü buradan beslenir. |
| `lib/run.cjs` | `spawn` ile argüman dizisi çalıştırır. Kabuk yok, zaman aşımında süreç ağacını öldürür, çıktıyı sınırlar, stdin'e veri yazabilir. |
| `lib/jobs.cjs` | Bellekte iş kuyruğu. Durumlar: queued, running, done, error. Eşzamanlılık 3. İşler 10 dakika sonra dosyalarıyla silinir. |
| `lib/engines/*.cjs` | office (LibreOffice), pdf (Python yardımcı), image (sharp ve Pillow), media (FFmpeg argüman tablosu), unlock (Python yardımcı). |
| `scripts/pyhelper.py` | Tek Python yardımcı: pdf2docx, pdf→txt, pdf→görsel, görsel→pdf, görsel normalleştirme (HEIC, BMP), şifre inceleme, şifre kaldırma. Şifre yalnızca stdin'den JSON olarak gelir. Çıkış kodları sabittir. |
| `lib/ratelimit.cjs` | IP başına kayan pencere sınırı. IP, `CF-Connecting-IP` başlığından alınır. |
| `site/*.cjs` | Sunucuda üretilen sayfalar, içerik manifesti, robots.txt, sitemap.xml. |

### API

- `POST /api/convert` (multipart: file, target, quality) → `{jobId}`. İş arka planda çalışır.
- `GET /api/jobs/:id` → `{status, position, error, download: {url, name, size}}`. İstemci saniyede bir sorgular. Bu, Cloudflare'in 125 saniye sınırını aşar.
- `GET /dl/:id/:token` → dosyayı `Content-Disposition: attachment; filename*=UTF-8''...` ile verir. Türkçe dosya adı korunur. `/output` artık statik sunulmaz.
- `POST /api/zip` → başarılı işleri tek ZIP olarak verir.
- `POST /api/unlock/inspect` (multipart: file) → `{jobId, kind, state, signed}`. `state` şu değerlerden biridir: `needs_password`, `restrictions_only`, `not_encrypted`, `unsupported`.
- `POST /api/unlock/:id` (JSON: password) → `{download}` ya da `{error: "wrong_password", attemptsLeft}`. Üç yanlış denemeden sonra dosya silinir.
- Hatalar sabit Türkçe mesajlarla döner. Ham stderr istemciye ve loglara gitmez.
- Yükleme sınırı 95 MB. Ayrıca uzantı ve dosya imzası (magic bytes) kontrol edilir.

### Şifre kaldırma kuralları

- PDF: pikepdf. Önce şifresiz açmayı dener. `PasswordError` alırsa açılış şifresi var demektir. Şifresiz açılıp `is_encrypted` doğruysa yalnızca kısıtlama şifresi vardır; bu durumda şifre sorulmaz, kısıtlama kaldırılır.
- PDF şifre deneme sırası: yazıldığı gibi, NFC, NFKC, cp1254 baytları. Böylece eski PDF'lerde ş, ğ ve İ içeren şifreler de çalışır.
- Dijital imzalı PDF'lerde, imzanın geçersiz olacağı kullanıcıya önceden söylenir.
- Office: msoffcrypto-tool, `load_key(verify_password=True)` ile. Böylece yanlış şifrede çıktı yazılmaz. Dosya ZIP ise şifreli değildir. CFB kapsayıcısı ise şifreli OOXML olup olmadığı kontrol edilir. XLSX için Excel'in varsayılan şifresi `VelvetSweatshop` ayrıca denenir.
- Çıktı doğrulaması: PDF'ler şifresiz yeniden açılır. Office çıktısının geçerli ZIP olduğu ve `[Content_Types].xml` içerdiği kontrol edilir.
- Araç şifre kırmaz ve şifre tahmini yapmaz. Sayfada bu açıkça yazılır.
- Şifre loglanmaz ve diske yazılmaz. Unlock uç noktası IP başına 10 dakikada 20 istekle sınırlıdır.

### Formatlar

| Kategori | Giriş | Çıkış | Motor |
|---|---|---|---|
| Belge (metin) | docx doc odt rtf txt | pdf docx odt rtf txt | LibreOffice |
| Belge (tablo) | xlsx xls ods csv | pdf xlsx ods csv | LibreOffice |
| Belge (sunum) | pptx ppt odp | pdf pptx odp | LibreOffice |
| PDF | pdf | docx txt jpg png | pdf2docx, PyMuPDF |
| Görsel | jpg jpeg png webp avif gif tiff bmp heic heif svg | jpg png webp avif gif tiff pdf | sharp; HEIC/BMP için Pillow |
| Ses | mp3 wav m4a aac ogg opus flac wma aiff | mp3 wav m4a ogg opus flac | FFmpeg |
| Video | mp4 mov mkv webm avi wmv m4v 3gp | mp4 mov mkv webm avi gif mp3 m4a wav | FFmpeg |

Çok sayfalı PDF'nin görsele çevrilmesi ZIP üretir. FFmpeg komutları çıktı formatına göre codec, CRF ve `-pix_fmt yuv420p` ayarlarını açıkça verir. Boyutlar çift sayıya yuvarlanır. MP4, MOV ve M4A'da `+faststart` kullanılır. GIF palet yöntemiyle, en fazla 30 saniye ve 480 piksel genişlikte üretilir.

## Görsel tasarım

- Renkler: sayfa `#F5F6F8`, yüzey `#FFFFFF`, metin `#16181D`, ikincil metin `#5C6470`, çizgi `#D5D9E0`, ana renk lacivert `#1F3A5F`, vurgu bakır `#B4532A` (yalnızca logo ve seçili sekme çizgisi), başarı `#0F766E`, hata `#B42318`.
- Koyu mod: sayfa `#15181C`, yüzey `#1E2228`, metin `#E7E9EC`, ikincil `#A2A8B1`, ana renk `#7DB7F0`, vurgu `#E07A4A`. İşletim sistemi tercihi izlenir. Elle seçim `localStorage`'da saklanır.
- Yazı tipleri kendi sunucumuzdan sunulur: başlıklar Bricolage Grotesque, gövde Source Sans 3. Gövde 16px, etiketler en az 14px.
- Köşe yarıçapı: kart 6px, buton ve çip 4px. Hap şekli, glow, gradyan metin, parçacık animasyonu ve tuval yok. Hareket 150–200 ms ile sınırlıdır ve `prefers-reduced-motion` dikkate alınır.
- İkonlar satır içi SVG'dir. Font Awesome kaldırılır.
- `security.js` (sağ tık ve F12 engeli, debugger tuzağı) ve `bg.js` silinir.
- Erişilebilirlik: görünür "Dosya seç" butonu, odak halkası, `aria-live` durum alanı, format seçimi için radyo grubu, en az 24×24 px dokunma hedefi.
- Her araç kartının yanında güven bilgisi: "Dosyalar 10 dakika içinde silinir", "En fazla 95 MB", "Hesap gerekmez", GitHub bağlantısı.

## Sayfalar ve SEO

- Ana sayfa, 4 kategori merkezi, 4 şifre kaldırma sayfası ve yaklaşık 26 dönüşüm çifti sayfası olur. Ayrıca hakkında, gizlilik (KVKK) ve kullanım şartları sayfaları eklenir.
- Her sayfanın kendine özgü `<title>`, açıklaması, H1'i, canonical bağlantısı ve elle yazılmış Türkçe metni olur. Bu metin giriş, 3 adım, 4 soru-cevap ve ilgili bağlantılardan oluşur.
- JSON-LD: Organization ve WebSite (ana sayfa); WebApplication ve BreadcrumbList (araç sayfaları). FAQ ve HowTo şeması eklenmez; Google bu zengin sonuçları kaldırdı.
- `robots.txt` ve `sitemap.xml` manifestten üretilir. 404 sayfası `noindex` taşır. `www` ile gelen istekler 301 ile ana alan adına yönlendirilir.
- Yalnızca gerçekten desteklenen çiftler için sayfa olur. Makine çevirisi ya da şablonla şişirilmiş sayfa yok.

## Test ve doğrulama

- `tests/make_fixtures.py` test dosyalarını üretir: PDF, görsel, ses, video ve LibreOffice belgeleri. Ayrıca R4/AES-128 ve R6/AES-256 şifreli, Türkçe şifreli ve yalnızca kısıtlamalı PDF'ler üretir.
- `tests/fixtures/office/`: gerçek Microsoft Word, PowerPoint ve Excel ile Türkçe şifre kullanılarak kaydedilmiş dosyalar.
- `tests/e2e.test.cjs`: çalışan sunucuya karşı her dönüşümü ve şifre kaldırma senaryosunu dener. Çıktıyı dosya imzasıyla doğrular.
- `.github/workflows/ci.yml`: Dockerfile'ı build eder, konteyneri başlatır, sağlık kontrolünü bekler ve testleri konteyner içinde çalıştırır. Coolify'ın build edeceği imajın kanıtı budur.

## Kapsam dışı

- Şifre kurtarma veya şifre kırma.
- Office "düzenlemeyi kısıtla" korumasının kaldırılması (ayrı bir araç olarak ileride).
- İngilizce sayfalar ve hreflang.
- PDF birleştirme, bölme ve sıkıştırma.
