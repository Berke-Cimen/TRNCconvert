FROM node:20-bullseye

ENV NODE_ENV=production

# ---- System Dependencies ----
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    libreoffice \
    ghostscript \
    ffmpeg \
    imagemagick \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# ---- Fix ImageMagick ----
RUN sed -i 's/disable="read"//g' /etc/ImageMagick-6/policy.xml || true

# ---- Python Paketlerini Stabil Sürüme Sabitle ----
RUN pip3 install --no-cache-dir --upgrade pip && \
    pip3 install --no-cache-dir pymupdf==1.21.1 pdf2docx==0.5.6

# ---- Node App ----
WORKDIR /app

# package.json ve package-lock.json kopyala
COPY trncconvert/package*.json ./

# Bağımlılıkları yükle (--omit=dev production için devDependencies'i atlar)
RUN npm install --omit=dev --ignore-scripts=false && \
    npm cache clean --force

# Uygulama dosyalarını kopyala
COPY trncconvert/. .

# Gerekli klasörleri oluştur
RUN mkdir -p uploads output public

# Port
EXPOSE 3000

# Uygulama başlat
CMD ["node", "server.cjs"]