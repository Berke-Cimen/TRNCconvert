"""Uçtan uca testler için örnek dosyalar üretir.

Kullanım: python3 tests/make_fixtures.py OUT_DIR

Üretilenler: düz ve şifreli PDF'ler (R6 AES-256, R4 AES-128, yalnızca kısıtlama),
görseller (PNG, JPG, WebP, GIF, TIFF, BMP, HEIC, AVIF, SVG), metin belgeleri
(TXT, CSV, RTF) ve FFmpeg varsa ses/video örnekleri. Gerçek Office dosyaları
tests/fixtures/office altında hazır gelir.
"""

import json
import os
import shutil
import subprocess
import sys

MARKER = "TRNCConvert test \u00c7\u011e\u0130\u00d6\u015e\u00dc"  # ÇĞİÖŞÜ

PASSWORDS = {
    "pdf-r6-user.pdf": "\u015eifre123!",              # Şifre123!
    "pdf-r4-user.pdf": "çözüm-ı",   # çözüm-ı (R4 yalnızca PDFDocEncoding kabul eder)
    "pdf-r6-owner-only.pdf": "",
}

def make_pdfs(out):
    import pikepdf
    import pymupdf

    doc = pymupdf.open()
    for i in range(3):
        page = doc.new_page(width=595, height=842)
        # insert_htmlbox, Türkçe harfler için ToUnicode eşlemesi olan bir yazı tipi gömer.
        page.insert_htmlbox(pymupdf.Rect(72, 80, 520, 140), "<p>%s sayfa %d</p>" % (MARKER, i + 1))
        page.draw_rect(pymupdf.Rect(72, 150, 300, 300), color=(0.12, 0.23, 0.37), fill=(0.7, 0.33, 0.16))
    plain = os.path.join(out, "plain.pdf")
    doc.save(plain)
    doc.close()

    with pikepdf.open(plain) as pdf:
        pdf.save(os.path.join(out, "pdf-r6-user.pdf"),
                 encryption=pikepdf.Encryption(owner="Sahip-Anahtar-99", user=PASSWORDS["pdf-r6-user.pdf"], R=6))
    with pikepdf.open(plain) as pdf:
        pdf.save(os.path.join(out, "pdf-r4-user.pdf"),
                 encryption=pikepdf.Encryption(owner="Sahip-Anahtar-44", user=PASSWORDS["pdf-r4-user.pdf"], R=4, aes=True))
    with pikepdf.open(plain) as pdf:
        perms = pikepdf.Permissions(print_lowres=False, print_highres=False, extract=False, modify_other=False)
        pdf.save(os.path.join(out, "pdf-r6-owner-only.pdf"),
                 encryption=pikepdf.Encryption(owner="Sahip-\u011e\u0130-99", user="", R=6, allow=perms))


def make_images(out):
    from PIL import Image, ImageDraw
    import pillow_heif

    pillow_heif.register_heif_opener()
    rgba = Image.new("RGBA", (320, 240), (31, 58, 95, 255))
    d = ImageDraw.Draw(rgba)
    d.rectangle((40, 40, 200, 160), fill=(180, 83, 42, 255))
    d.ellipse((180, 100, 300, 220), fill=(255, 255, 255, 120))
    rgb = rgba.convert("RGB")

    rgba.save(os.path.join(out, "sample.png"))
    rgb.save(os.path.join(out, "sample.jpg"), quality=90)
    rgba.save(os.path.join(out, "sample.webp"), quality=90)
    frames = [rgb.convert("P"), rgb.rotate(90).convert("P")]
    frames[0].save(os.path.join(out, "sample.gif"), save_all=True, append_images=frames[1:], duration=200, loop=0)
    rgb.save(os.path.join(out, "sample.tiff"))
    rgb.save(os.path.join(out, "sample.bmp"))
    rgb.save(os.path.join(out, "sample.heic"), format="HEIF", quality=80)
    try:
        rgb.save(os.path.join(out, "sample.avif"), format="AVIF", quality=70)
    except Exception as exc:  # Pillow AVIF desteği yoksa atla
        print("avif skipped:", type(exc).__name__)
    with open(os.path.join(out, "sample.svg"), "w", encoding="utf-8") as f:
        f.write('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120">'
                '<rect width="200" height="120" fill="#1F3A5F"/><circle cx="100" cy="60" r="40" fill="#B4532A"/></svg>')


def make_texts(out):
    with open(os.path.join(out, "sample.txt"), "w", encoding="utf-8") as f:
        f.write(MARKER + "\nIkinci satir: \u015fehir, \u0131\u015f\u0131k, \u011f\u00fcne\u015f.\n")
    with open(os.path.join(out, "sample.csv"), "w", encoding="utf-8") as f:
        f.write("ad,soyad,puan\nAy\u015fe,Y\u0131lmaz,90\n\u0130smail,\u00c7elik,85\n")
    with open(os.path.join(out, "sample.rtf"), "w", encoding="ascii") as f:
        f.write(r"{\rtf1\ansi\deff0{\fonttbl{\f0 Arial;}}\f0\fs24 TRNCConvert RTF \u350?ehir\par}")


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y", *args], check=True)


def make_media(out):
    if not shutil.which("ffmpeg"):
        print("ffmpeg not found; media fixtures skipped")
        return
    tone = ["-f", "lavfi", "-i", "sine=frequency=440:duration=2"]
    ffmpeg(*tone, os.path.join(out, "sample.wav"))
    ffmpeg(*tone, "-c:a", "libmp3lame", "-b:a", "128k", os.path.join(out, "sample.mp3"))
    ffmpeg(*tone, "-c:a", "aac", "-b:a", "128k", os.path.join(out, "sample.m4a"))
    ffmpeg(*tone, "-c:a", "libvorbis", os.path.join(out, "sample.ogg"))
    ffmpeg(*tone, "-c:a", "flac", os.path.join(out, "sample.flac"))
    # Tek sayılı boyut ve 4:4:4 piksel formatı: kodlayıcı ayarlarının dayanıklılığını sınar.
    video = ["-f", "lavfi", "-i", "testsrc=size=321x241:rate=25:duration=2",
             "-f", "lavfi", "-i", "sine=frequency=330:duration=2"]
    ffmpeg(*video, "-c:v", "libx264", "-pix_fmt", "yuv444p", "-vf", "pad=322:242",
           "-c:a", "aac", "-shortest", os.path.join(out, "sample.mp4"))
    ffmpeg(*video, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-vf", "scale=320:240",
           "-c:a", "aac", "-shortest", os.path.join(out, "sample.mov"))
    ffmpeg(*video, "-c:v", "libx264", "-vf", "scale=320:240", "-c:a", "libvorbis", "-shortest",
           os.path.join(out, "sample.mkv"))
    ffmpeg(*video, "-c:v", "libvpx-vp9", "-b:v", "200k", "-vf", "scale=320:240", "-c:a", "libopus",
           "-shortest", os.path.join(out, "sample.webm"))
    ffmpeg(*video, "-c:v", "mpeg4", "-vf", "scale=320:240", "-c:a", "libmp3lame", "-shortest",
           os.path.join(out, "sample.avi"))


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "tests/.fixtures"
    os.makedirs(out, exist_ok=True)
    make_pdfs(out)
    make_images(out)
    make_texts(out)
    make_media(out)
    with open(os.path.join(out, "passwords.json"), "w", encoding="utf-8") as f:
        json.dump(PASSWORDS, f, ensure_ascii=False)
    files = sorted(os.listdir(out))
    print(json.dumps(files, ensure_ascii=False))


if __name__ == "__main__":
    main()
