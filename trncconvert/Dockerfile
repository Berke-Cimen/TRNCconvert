FROM node:24-trixie-slim

ENV NODE_ENV=production     PATH=/opt/venv/bin:$PATH     PYTHONDONTWRITEBYTECODE=1     PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update && apt-get install -y --no-install-recommends         libreoffice-writer libreoffice-calc libreoffice-impress         ffmpeg         python3 python3-venv         fonts-dejavu-core fonts-liberation2 fonts-crosextra-carlito         fonts-crosextra-caladea fonts-noto-core         curl ca-certificates     && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/venv     && /opt/venv/bin/pip install --no-cache-dir         pikepdf==10.17.0         msoffcrypto-tool==6.0.0         PyMuPDF==1.28.2         pdf2docx==0.5.13         pillow==12.3.0         pillow-heif==1.8.1

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY . .

RUN mkdir -p uploads output data     && chown -R node:node /app/uploads /app/output /app/data

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3   CMD curl -fsS http://localhost:3000/health || exit 1

CMD ["node", "server.cjs"]
