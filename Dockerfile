FROM node:20-bullseye

ENV NODE_ENV=production

# ---- Sistem Bağımlılıkları ----
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    curl \
    libreoffice \
    ghostscript \
    ffmpeg \
    imagemagick \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# ---- ImageMagick güvenlik politikasını düzelt ----
RUN sed -i 's/disable="read"//g' /etc/ImageMagick-6/policy.xml || true

# ---- Python bağımlılıklarını sabit sürüme kilitle ----
RUN pip3 install --no-cache-dir --upgrade pip && \
    pip3 install --no-cache-dir pymupdf==1.21.1 pdf2docx==0.5.6

# ---- Node Uygulaması ----
WORKDIR /app

# Önce package dosyalarını kopyala (önbellek optimizasyonu)
COPY trncconvert/package*.json ./

# Bağımlılıkları yükle
RUN npm install --omit=dev --ignore-scripts=false && \
    npm cache clean --force

# Uygulama dosyalarını kopyala
COPY trncconvert/. .

# Gerekli klasörleri oluştur
RUN mkdir -p uploads output public data foto

# Port
EXPOSE 3000

# Sağlık kontrolü (30 saniyede bir)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Sunucuyu başlat
CMD ["node", "server.cjs"]
