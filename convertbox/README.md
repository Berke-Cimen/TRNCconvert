# ConvertBox

Tarayici uzerinden dosya donusturme uygulamasi. Dokuman, gorsel, ses ve video dosyalarini farkli formatlara cevirir.

## Ozellikler

- **Dokuman** — PDF, DOCX, TXT, ODT arasi donusum (LibreOffice + pdf2docx)
- **Gorsel** — PNG, JPG, WebP arasi donusum (Sharp)
- **Ses** — MP3, WAV arasi donusum (FFmpeg)
- **Video** — MP4, AVI, MKV arasi donusum (FFmpeg)
- **Oyunlar** — Skor tablosu ve karakter sistemi
- **Canli Yayin** — Stream yonetimi
- **Sohbet** — Global chat ve online kullanici takibi
- **Muzik** — Playlist yonetimi

## Kurulum

```bash
cd convertbox
bun install
```

## Calistirma

```bash
# Production
bun server.cjs

# Development (hot reload)
bun --hot server.cjs
```

Sunucu varsayilan olarak `http://localhost:3000` adresinde baslar. `PORT` environment variable ile degistirilebilir.

## Docker

```bash
docker build -t convertbox .
docker run -p 3000:3000 convertbox
```

Docker imaji icinde LibreOffice, FFmpeg, Python (pdf2docx) ve gerekli tum bagimliliklar bulunur.

## Proje Yapisi

```
convertbox/
├── server.cjs              # Ana sunucu dosyasi
├── routes/
│   ├── document.cjs        # Dokuman donusturme API
│   ├── image.cjs           # Gorsel donusturme API
│   ├── audio.cjs           # Ses donusturme API
│   ├── video.cjs           # Video donusturme API
│   ├── game.cjs            # Oyun skorlari ve karakter API
│   └── features.cjs        # Chat, stream, playlist API
├── utils/
│   ├── upload.cjs          # Multer dosya yukleme ayarlari
│   ├── limiter.cjs         # Eslezamanli islem sinirlandirici
│   ├── runCommand.cjs      # Shell komut calistirici
│   ├── filename.cjs        # Dosya adi sanitizasyonu
│   └── cleaner.cjs         # Gecici dosya temizleyici
├── scripts/
│   └── pdf2docx_convert.py # PDF -> DOCX donusturme scripti
├── public/
│   ├── index.html          # Ana sayfa
│   ├── css/style.css       # Stiller
│   ├── js/app.js           # Donusturme arayuzu
│   ├── js/bg.js            # Arka plan animasyonu
│   ├── js/security.js      # Frontend guvenlik modulu
│   ├── js/*.js             # Oyun dosyalari
│   ├── img/                # Gorseller
│   └── music/              # Muzik dosyalari
├── data/                   # JSON veri dosyalari
├── uploads/                # Gecici yuklenen dosyalar
├── output/                 # Gecici donusturulen dosyalar
├── foto/                   # Fotograf galerisi
├── Dockerfile
└── package.json
```

## API Endpointleri

| Yol | Metod | Aciklama |
|---|---|---|
| `/api/document` | POST | Dokuman donusturme |
| `/api/image` | POST | Gorsel donusturme |
| `/api/audio` | POST | Ses donusturme |
| `/api/video` | POST | Video donusturme |
| `/api/score` | GET/POST | Oyun skorlari |
| `/api/characters` | GET | Karakter listesi |
| `/api/chat` | GET/POST | Global sohbet |
| `/api/streams` | GET | Canli yayinlar |
| `/api/playlist` | GET | Muzik listesi |
| `/api/heartbeat` | POST | Online kullanici bildirimi |
| `/api/online-count` | GET | Online kullanici sayisi |
| `/health` | GET | Sunucu saglik kontrolu |

## Sistem Gereksinimleri

- **Node.js** 20+ veya **Bun**
- **LibreOffice** (dokuman donusturme icin)
- **FFmpeg** (ses/video donusturme icin)
- **Python 3** + pdf2docx (PDF -> DOCX icin)
- **Sharp** (gorsel donusturme, npm ile otomatik kurulur)

## Notlar

- Yuklenen ve donusturulen dosyalar 1 dakika sonra otomatik silinir
- Sunucu basladiginda 1 saatten eski gecici dosyalar temizlenir
- Maksimum dosya boyutu: 100 MB
- Eslezamanli donusturme limiti: 3
- Erisim loglari `data/accessLog.json` dosyasinda tutulur (maks 500 kayit)
- Bot korumasi aktif (wget, curl, python, postman vb. engellenir)
