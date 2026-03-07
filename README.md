<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/FFmpeg-8.x-007808?style=for-the-badge&logo=ffmpeg&logoColor=white" alt="FFmpeg">
  <img src="https://img.shields.io/badge/LibreOffice-7.x-18A303?style=for-the-badge&logo=libreoffice&logoColor=white" alt="LibreOffice">
  <img src="https://img.shields.io/badge/Sharp-0.33-99CC00?style=for-the-badge&logo=sharp&logoColor=white" alt="Sharp">
  <img src="https://img.shields.io/badge/Docker-Hazır-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
</p>

# TRNCConvert

> Kendi sunucunuzda çalışan, tarayıcı tabanlı dosya dönüştürme platformu.
> Doküman, görsel, ses ve video dosyalarını birleşik bir REST API ve modern web arayüzü üzerinden dönüştürür.

TRNCConvert, kuyruk tabanlı bir ön yüz ile eşzamanlı sunucu taraflı dönüştürme motorlarını (LibreOffice, FFmpeg, Sharp, pdf2docx) birleştirerek harici API bağımlılığı olmadan hızlı ve güvenilir format dönüşümü sağlar.

---

## İçindekiler

- [Mimari](#mimari)
- [Desteklenen Formatlar](#desteklenen-formatlar)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Docker ile Dağıtım](#docker-ile-dağıtım)
- [API Referansı](#api-referansı)
- [Proje Yapısı](#proje-yapısı)
- [Yapılandırma ve Limitler](#yapılandırma-ve-limitler)
- [Güvenlik](#güvenlik)
- [Lisans](#lisans)

---

## Mimari

```
İstemci (Tek Sayfa Uygulama)       Sunucu (Express.js)
┌─────────────────┐   multipart   ┌──────────────────────────────────────┐
│  Sürükle & Bırak │─────────────>│  Multer (disk depolama, 100MB)       │
│  Dosya Kuyruğu   │   /api/*     │         │                            │
│  Format Seçimi   │<─────────────│  ┌──────▼────────────────────────┐   │
│  ZIP İndirme     │   JSON yanıt │  │  Eşzamanlılık Sınırlayıcı    │   │
└─────────────────┘               │  │  (maksimum 3 paralel işlem)   │   │
                                  │  └──────┬────────────────────────┘   │
                                  │         │                            │
                                  │  ┌──────▼────────────────────────┐   │
                                  │  │  Dönüştürme Motorları         │   │
                                  │  │  ├─ LibreOffice (doküman)     │   │
                                  │  │  ├─ pdf2docx   (PDF→DOCX)    │   │
                                  │  │  ├─ Sharp      (görsel)      │   │
                                  │  │  └─ FFmpeg     (ses/video)   │   │
                                  │  └──────┬────────────────────────┘   │
                                  │         │                            │
                                  │  ┌──────▼────────────────────────┐   │
                                  │  │  /output (otomatik temizlik)  │   │
                                  │  └───────────────────────────────┘   │
                                  └──────────────────────────────────────┘
```

**İstek yaşam döngüsü:** Yükleme → Multer doğrulama → Eşzamanlılık kapısı → Motor yönlendirme → Çıktı dosyası → İndirme bağlantısı / ZIP paketi

---

## Desteklenen Formatlar

| Kategori | Giriş Formatları | Çıkış Formatları | Motor | Zaman Aşımı |
|----------|-----------------|-----------------|-------|-------------|
| Doküman | `PDF` `DOCX` `TXT` `ODT` | `PDF` `DOCX` `TXT` `ODT` | LibreOffice / pdf2docx | 120sn |
| Görsel | `PNG` `JPG` `WebP` | `PNG` `JPG` `WebP` | Sharp | 120sn |
| Ses | `MP3` `WAV` | `MP3` `WAV` | FFmpeg | 120sn |
| Video | `MP4` `AVI` `MKV` | `MP4` `AVI` `MKV` | FFmpeg | 300sn |

### Kalite Ön Ayarları (Ses ve Video)

| Ön Ayar | Ses Bit Hızı | Video Bit Hızı |
|---------|-------------|---------------|
| `high` (Yüksek) | 192 kbps | 2500 kbps |
| `low` (Düşük) | 96 kbps | 800 kbps |

---

## Hızlı Başlangıç

### Ön Gereksinimler

| Bağımlılık | Kullanım Amacı | macOS | Ubuntu/Debian |
|------------|---------------|-------|---------------|
| **Node.js** 20+ | Çalışma ortamı | `brew install node` | `apt install nodejs` |
| **LibreOffice** | Doküman dönüştürme | `brew install --cask libreoffice` | `apt install libreoffice` |
| **FFmpeg** | Ses/Video dönüştürme | `brew install ffmpeg` | `apt install ffmpeg` |
| **Python 3** + pdf2docx | PDF → DOCX dönüşümü | `pip3 install pdf2docx` | `pip3 install pdf2docx` |

> Sharp ve Archiver paketleri `npm install` ile otomatik olarak kurulur.

### Kurulum

```bash
cd trncconvert
npm install
```

### Çalıştırma

```bash
# Canlı ortam
node server.cjs

# Bun çalışma ortamı ile
bun server.cjs

# Geliştirme (otomatik yeniden yükleme)
bun --hot server.cjs
```

Sunucu varsayılan olarak `http://localhost:3000` adresinde başlar.

```bash
# Özel port tanımlama
PORT=8080 node server.cjs
```

---

## Docker ile Dağıtım

```bash
# İmaj oluştur
docker build -t trncconvert .

# Kapsayıcı başlat
docker run -d -p 3000:3000 --name trncconvert trncconvert
```

Docker imajı (`node:20-bullseye`) tüm sistem bağımlılıklarını hazır olarak içerir:
- LibreOffice, FFmpeg, Ghostscript, ImageMagick
- Python 3 (`pymupdf==1.21.1`, `pdf2docx==0.5.6`)
- DejaVu yazı tipleri (doküman oluşturma için)
- Dahili sağlık kontrolü (`/health` uç noktası, 30sn aralık)

```bash
# Kapsayıcı sağlık durumunu kontrol et
docker inspect --format='{{.State.Health.Status}}' trncconvert
```

---

## API Referansı

Tüm dönüştürme uç noktaları `multipart/form-data` ile dosya alır ve JSON yanıt döner.

### Yanıt Formatı

```json
// Başarılı
{ "success": true, "downloadUrl": "/output/dosya_abc123.pdf" }

// Hata
{ "success": false, "error": "Hata açıklaması" }
```

### Dönüştürme Uç Noktaları

| Uç Nokta | Metod | Parametreler | Açıklama |
|----------|-------|-------------|----------|
| `/api/document` | `POST` | `file`, `format` (pdf/docx/txt/odt) | Doküman dönüştürme |
| `/api/image` | `POST` | `file`, `format` (png/jpg/webp) | Görsel dönüştürme |
| `/api/audio` | `POST` | `file`, `format` (mp3/wav), `quality` (low/high) | Ses dönüştürme |
| `/api/video` | `POST` | `file`, `format` (mp4/avi/mkv), `quality` (low/high) | Video dönüştürme |

### Yardımcı Uç Noktalar

| Uç Nokta | Metod | Gövde | Açıklama |
|----------|-------|-------|----------|
| `/api/download-zip` | `POST` | `{ "files": ["/output/a.pdf", "/output/b.png"] }` | Birden fazla çıktı dosyasını tek ZIP olarak indirir |
| `/health` | `GET` | — | Sunucu sağlık kontrolü, `200 OK` döner |

### Örnek: PDF Dosyasını DOCX Formatına Dönüştürme

```bash
curl -X POST http://localhost:3000/api/document \
  -F "file=@belge.pdf" \
  -F "format=docx"
```

### Örnek: Kalite Ayarı ile Video Dönüştürme

```bash
curl -X POST http://localhost:3000/api/video \
  -F "file=@video.mp4" \
  -F "format=avi" \
  -F "quality=high"
```

---

## Proje Yapısı

```
trncconvert/
├── server.cjs                 # Express uygulaması, ara katman, rota bağlama, ZIP uç noktası
│
├── routes/
│   ├── document.cjs           # POST /api/document  — LibreOffice + pdf2docx
│   ├── image.cjs              # POST /api/image     — Sharp
│   ├── audio.cjs              # POST /api/audio     — FFmpeg
│   └── video.cjs              # POST /api/video     — FFmpeg
│
├── utils/
│   ├── upload.cjs             # Multer yapılandırması (100MB limit, disk depolama)
│   ├── limiter.cjs            # Eşzamanlılık sınırlayıcı (maks 3 paralel işlem)
│   ├── runCommand.cjs         # Kabuk komutu çalıştırıcı (zaman aşımı + arabellek limiti)
│   ├── filename.cjs           # Dosya adı temizleyici (Türkçe karakter desteği)
│   └── cleaner.cjs            # Geçici dosya temizleyici (10dk ömür, periyodik tarama)
│
├── scripts/
│   └── pdf2docx_convert.py    # PDF → DOCX dönüşümü için Python köprüsü
│
├── public/
│   ├── index.html             # Tek sayfa uygulama giriş noktası
│   ├── css/style.css          # Koyu endüstriyel tema
│   ├── js/app.js              # Kuyruk sistemi, dönüştürme mantığı, ZIP indirme
│   ├── js/bg.js               # Arka plan animasyonları (parçacık, ızgara, ışıma)
│   └── js/security.js         # İstemci tarafı güvenlik modülü
│
├── data/                      # Çalışma zamanı verileri (erişim günlüğü)
├── uploads/                   # Geçici — yüklenen dosyalar (otomatik temizlenir)
├── output/                    # Geçici — dönüştürülen dosyalar (otomatik temizlenir)
├── Dockerfile                 # Üretime hazır çok katmanlı Docker yapılandırması
└── package.json               # Bağımlılıklar: express, multer, sharp, archiver
```

---

## Yapılandırma ve Limitler

| Parametre | Değer | Konum |
|-----------|-------|-------|
| Maksimum dosya boyutu | 100 MB | İstemci + Multer |
| Maksimum kuyruk boyutu | 10 dosya | İstemci tarafı |
| Maksimum eşzamanlı dönüştürme | 3 işlem | `utils/limiter.cjs` |
| Geçici dosya ömrü | 10 dakika | `utils/cleaner.cjs` |
| Başlangıç temizlik eşiği | 1 saat | `server.cjs` |
| Temizlik tarama aralığı | 15 dakika | `server.cjs` |
| Kabuk zaman aşımı (doküman/ses) | 120 saniye | `utils/runCommand.cjs` |
| Kabuk zaman aşımı (video) | 300 saniye | `utils/runCommand.cjs` |
| Erişim günlüğü maks kayıt | 500 adet | `server.cjs` |
| İstek gövdesi limiti | 100 KB | `server.cjs` |

---

## Güvenlik

| Katman | Mekanizma | Detay |
|--------|-----------|-------|
| **Yükleme doğrulama** | Çift katmanlı boyut kontrolü | İstemci tarafı ön kontrol + Multer sunucu tarafı zorlama |
| **Yükleme hata yönetimi** | Multer hata ara katmanı | Boyut aşımı ve yükleme hataları yapılandırılmış JSON olarak döner |
| **Yol geçişi koruması** | `path.basename()` + önek kontrolü | ZIP uç noktası `/output` dışına erişimi reddeder |
| **Bot koruması** | Kullanıcı Aracısı filtreleme | `wget`, `curl`, `python`, `postman`, `httpclient`, `axios` engellenir |
| **Dosya adı temizleme** | Regex + karakter dönüşümü | Özel karakterleri temizler, Türkçe karakterleri normalleştirir |
| **Format beyaz listesi** | Rota bazlı doğrulama | Her rota yalnızca tanımlı format listesini kabul eder |
| **Süreç yalıtımı** | Kabuk zaman aşımı + arabellek sınırı | Komutlar zaman aşımında otomatik sonlandırılır; stdout/stderr sınırlıdır |
| **Erişim günlüğü** | Tamponlanmış asenkron yazma | Tüm istekler IP, Kullanıcı Aracısı ve zaman bilgisiyle kaydedilir (5sn boşaltma) |
| **Zarif kapatma** | SIGTERM/SIGINT işleyicileri | Günlükleri boşaltır, bağlantıları kapatır, 10sn zorla kapatma yedekleme |

---

## Lisans

Bu proje özel kullanım içindir.
