FROM node:20-bullseye

ENV DISABLE_IMAGE_OPTIMIZATION=true
ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1
ENV NODE_ENV=production
ENV NEXT_DISABLE_OPTIMIZED_IMAGES=1

# ---- System Dependencies (Python, LibreOffice, FFmpeg) ----
RUN apt-get update && apt-get install -y \
    python3 python3-pip \
    libreoffice \
    unoconv \
    ghostscript \
    ffmpeg \
    imagemagick \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*

# ---- Fix ImageMagick Security Policy for PDF conversions ----
RUN sed -i 's/disable="read"//g' /etc/ImageMagick-6/policy.xml || true

# ---- Python Dependencies ----
RUN pip3 install --upgrade pip
RUN pip3 install pymupdf==1.21.1
RUN pip3 install pdf2docx==0.5.6

# ---- Node App Setup ----
WORKDIR /app

# Önce package dosyalarını kopyala (Cache optimization)
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install --omit=dev

# Geri kalan tüm proje dosyalarını kopyala
COPY . .

# Gerekli klasörleri oluştur ve izinlerini ayarla
RUN mkdir -p uploads output public/img/characters public/music foto data scripts
RUN chmod -R 777 uploads output public/img/characters public/music foto data

# Portu dışarı aç
EXPOSE 3000

# Sağlık kontrolü (Her 30 saniyede bir kontrol et)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Sunucuyu başlat
CMD ["node", "server.cjs"]