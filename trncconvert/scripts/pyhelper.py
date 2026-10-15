import io
import json
import os
import sys
import unicodedata
import zipfile

EXIT_OK = 0
EXIT_WRONG_PASSWORD = 2
EXIT_NOT_ENCRYPTED = 3
EXIT_UNSUPPORTED = 4
EXIT_INTERNAL = 5
EXIT_LIMIT = 6
EXIT_ENCRYPTED_INPUT = 8

MAX_PDF_PAGES_TO_IMAGE = 300
RENDER_DPI = 150

CFB_MAGIC = bytes.fromhex("d0cf11e0a1b11ae1")

class HelperExit(Exception):
    def __init__(self, code, reason=""):
        super().__init__(reason)
        self.code = code
        self.reason = reason

def head(path, n=1024):
    with open(path, "rb") as f:
        return f.read(n)

def file_kind(path):
    h = head(path)
    if b"%PDF-" in h:
        return "pdf"
    if h[:4] == b"PK\x03\x04":
        return "zip"
    if h[:8] == CFB_MAGIC:
        return "cfb"
    return "unknown"

def remove_quietly(path):
    try:
        if path and os.path.exists(path):
            os.remove(path)
    except OSError:
        pass

def open_pdf_for_reading(path):
    import pymupdf

    try:
        doc = pymupdf.open(path)
    except Exception as exc:
        raise HelperExit(EXIT_UNSUPPORTED, "open failed: %s" % type(exc).__name__)
    if doc.needs_pass:
        doc.close()
        raise HelperExit(EXIT_ENCRYPTED_INPUT, "pdf requires a password")
    return doc

def cmd_pdf2docx(src, dst):
    open_pdf_for_reading(src).close()
    from pdf2docx import Converter

    cv = Converter(src)
    try:
        cv.convert(dst, start=0, end=None)
    finally:
        cv.close()
    if not os.path.exists(dst) or os.path.getsize(dst) == 0:
        remove_quietly(dst)
        raise HelperExit(EXIT_INTERNAL, "pdf2docx produced no output")

def cmd_pdf2txt(src, dst):
    doc = open_pdf_for_reading(src)
    try:
        parts = [page.get_text("text") for page in doc]
    finally:
        doc.close()
    with open(dst, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(parts))

def cmd_pdf2img(src, outdir, fmt, basename):
    if fmt not in ("jpg", "png"):
        raise HelperExit(EXIT_UNSUPPORTED, "bad image format")
    doc = open_pdf_for_reading(src)
    try:
        if doc.page_count > MAX_PDF_PAGES_TO_IMAGE:
            raise HelperExit(EXIT_LIMIT, "too many pages")
        if doc.page_count == 0:
            raise HelperExit(EXIT_UNSUPPORTED, "empty pdf")
        width = len(str(doc.page_count))
        created = []
        for page in doc:
            pix = page.get_pixmap(dpi=RENDER_DPI, alpha=False)
            name = "%s-%s.%s" % (basename, str(page.number + 1).zfill(width), fmt)
            path = os.path.join(outdir, name)
            if fmt == "jpg":
                pix.save(path, jpg_quality=88)
            else:
                pix.save(path)
            created.append(path)
    finally:
        doc.close()
    print(json.dumps(created))

def cmd_img2pdf(src, dst):
    import pymupdf

    try:
        img = pymupdf.open(src)
        pdf_bytes = img.convert_to_pdf()
        img.close()
    except Exception as exc:
        raise HelperExit(EXIT_UNSUPPORTED, "image open failed: %s" % type(exc).__name__)
    pdf = pymupdf.open("pdf", pdf_bytes)
    try:
        pdf.save(dst, garbage=3, deflate=True)
    finally:
        pdf.close()

def cmd_normalize(src, dst):
    from PIL import Image, ImageOps
    import pillow_heif

    pillow_heif.register_heif_opener()
    try:
        with Image.open(src) as im:
            im.seek(0)
            im = ImageOps.exif_transpose(im)
            if im.mode not in ("RGB", "RGBA"):
                im = im.convert("RGBA" if "A" in im.getbands() or im.mode == "P" else "RGB")
            im.save(dst, format="PNG")
    except HelperExit:
        raise
    except Exception as exc:
        raise HelperExit(EXIT_UNSUPPORTED, "image decode failed: %s" % type(exc).__name__)

def pdf_has_signature(pdf):
    try:
        acro = pdf.Root.get("/AcroForm")
        if acro is None:
            return False
        flags = acro.get("/SigFlags")
        if flags is not None and int(flags) & 1:
            return True
        stack = list(acro.get("/Fields") or [])
        seen = 0
        while stack and seen < 5000:
            field = stack.pop()
            seen += 1
            if field.get("/FT") == "/Sig":
                return True
            stack.extend(list(field.get("/Kids") or []))
    except Exception:
        return False
    return False

def inspect_pdf(path):
    import pikepdf

    try:
        with pikepdf.open(path) as pdf:
            state = "restrictions_only" if pdf.is_encrypted else "not_encrypted"
            return {"kind": "pdf", "state": state, "signed": pdf_has_signature(pdf)}
    except pikepdf.PasswordError:
        return {"kind": "pdf", "state": "needs_password", "signed": False}
    except Exception:
        return {"kind": "pdf", "state": "unsupported", "signed": False}

def inspect_office(path, kind):
    if kind == "zip":
        return {"kind": "ooxml", "state": "not_encrypted", "signed": False}
    import msoffcrypto

    try:
        with open(path, "rb") as f:
            of = msoffcrypto.OfficeFile(f)
            if getattr(of, "format", "") != "ooxml":
                return {"kind": "legacy", "state": "unsupported", "signed": False}
            state = "needs_password" if of.is_encrypted() else "not_encrypted"
            return {"kind": "ooxml", "state": state, "signed": False}
    except Exception:
        return {"kind": "unknown", "state": "unsupported", "signed": False}

def cmd_inspect(src):
    kind = file_kind(src)
    if kind == "pdf":
        result = inspect_pdf(src)
    elif kind in ("zip", "cfb"):
        result = inspect_office(src, kind)
    else:
        result = {"kind": "unknown", "state": "unsupported", "signed": False}
    print(json.dumps(result))

def read_password():
    raw = sys.stdin.buffer.read(64 * 1024)
    try:
        data = json.loads(raw.decode("utf-8") or "{}")
    except (UnicodeDecodeError, ValueError):
        raise HelperExit(EXIT_INTERNAL, "bad stdin")
    password = data.get("password", "")
    if not isinstance(password, str):
        raise HelperExit(EXIT_INTERNAL, "bad password type")
    return password

def text_variants(password):
    out = []
    for v in (password, unicodedata.normalize("NFC", password), unicodedata.normalize("NFKC", password)):
        if v not in out:
            out.append(v)
    return out

def pdf_password_candidates(password):
    import pikepdf  # noqa: F401  ('pdfdoc' codec'ini kaydeder)

    candidates = []

    def add(value):
        if value not in candidates:
            candidates.append(value)

    for v in text_variants(password):
        add(v)
    for v in text_variants(password):
        for enc in ("pdfdoc", "cp1254", "utf-8"):
            try:
                add(v.encode(enc))
            except (UnicodeEncodeError, LookupError):
                pass
    add("")
    return candidates

def unlock_pdf(src, dst, password):
    import pikepdf

    last_error = None
    for candidate in pdf_password_candidates(password):
        try:
            pdf = pikepdf.open(src, password=candidate)
        except pikepdf.PasswordError as exc:
            last_error = exc
            continue
        except Exception as exc:
            raise HelperExit(EXIT_UNSUPPORTED, "pdf open failed: %s" % type(exc).__name__)
        with pdf:
            if not pdf.is_encrypted:
                raise HelperExit(EXIT_NOT_ENCRYPTED, "pdf not encrypted")
            pdf.save(dst, encryption=False)
        break
    else:
        raise HelperExit(EXIT_WRONG_PASSWORD, "wrong password (%s)" % type(last_error).__name__)

    try:
        with pikepdf.open(dst) as check:
            if check.is_encrypted:
                raise HelperExit(EXIT_INTERNAL, "output still encrypted")
            if len(check.pages) == 0:
                raise HelperExit(EXIT_INTERNAL, "output has no pages")
    except HelperExit:
        remove_quietly(dst)
        raise
    except Exception as exc:
        remove_quietly(dst)
        raise HelperExit(EXIT_INTERNAL, "output verify failed: %s" % type(exc).__name__)

def verify_ooxml(path):
    with zipfile.ZipFile(path) as z:
        if "[Content_Types].xml" not in z.namelist():
            raise HelperExit(EXIT_INTERNAL, "output missing content types")
        bad = z.testzip()
        if bad is not None:
            raise HelperExit(EXIT_INTERNAL, "output zip corrupt")

def unlock_office(src, dst, password):
    import msoffcrypto
    from msoffcrypto import exceptions as mexc

    with open(src, "rb") as f:
        data = f.read()

    try:
        probe = msoffcrypto.OfficeFile(io.BytesIO(data))
    except Exception as exc:
        raise HelperExit(EXIT_UNSUPPORTED, "office open failed: %s" % type(exc).__name__)
    if getattr(probe, "format", "") != "ooxml":
        raise HelperExit(EXIT_UNSUPPORTED, "legacy office format")
    if not probe.is_encrypted():
        raise HelperExit(EXIT_NOT_ENCRYPTED, "office not encrypted")

    candidates = text_variants(password) + ["VelvetSweatshop"]
    for candidate in candidates:
        of = msoffcrypto.OfficeFile(io.BytesIO(data))
        try:
            of.load_key(password=candidate, verify_password=True)
        except mexc.InvalidKeyError:
            continue
        except Exception as exc:
            raise HelperExit(EXIT_UNSUPPORTED, "office key setup failed: %s" % type(exc).__name__)
        try:
            with open(dst, "wb") as out:
                of.decrypt(out)
        except mexc.InvalidKeyError:
            remove_quietly(dst)
            continue
        except Exception as exc:
            remove_quietly(dst)
            raise HelperExit(EXIT_UNSUPPORTED, "office decrypt failed: %s" % type(exc).__name__)
        try:
            verify_ooxml(dst)
        except HelperExit:
            remove_quietly(dst)
            raise
        except Exception as exc:
            remove_quietly(dst)
            raise HelperExit(EXIT_INTERNAL, "output verify failed: %s" % type(exc).__name__)
        return
    raise HelperExit(EXIT_WRONG_PASSWORD, "wrong password")

def cmd_unlock(src, dst):
    password = read_password()
    kind = file_kind(src)
    if kind == "pdf":
        unlock_pdf(src, dst, password)
    elif kind == "cfb":
        unlock_office(src, dst, password)
    elif kind == "zip":
        raise HelperExit(EXIT_NOT_ENCRYPTED, "office not encrypted")
    else:
        raise HelperExit(EXIT_UNSUPPORTED, "unknown file kind")

COMMANDS = {
    "pdf2docx": (cmd_pdf2docx, 2),
    "pdf2txt": (cmd_pdf2txt, 2),
    "pdf2img": (cmd_pdf2img, 4),
    "img2pdf": (cmd_img2pdf, 2),
    "normalize": (cmd_normalize, 2),
    "inspect": (cmd_inspect, 1),
    "unlock": (cmd_unlock, 2),
}

def main(argv):
    if len(argv) < 2 or argv[1] not in COMMANDS:
        sys.stderr.write("usage: pyhelper.py <%s> ...\n" % "|".join(COMMANDS))
        return EXIT_INTERNAL
    func, nargs = COMMANDS[argv[1]]
    args = argv[2:]
    if len(args) != nargs:
        sys.stderr.write("wrong argument count\n")
        return EXIT_INTERNAL
    try:
        func(*args)
        return EXIT_OK
    except HelperExit as exc:
        sys.stderr.write("pyhelper: %s\n" % exc.reason)
        return exc.code
    except Exception as exc:
        sys.stderr.write("pyhelper: internal %s\n" % type(exc).__name__)
        return EXIT_INTERNAL

if __name__ == "__main__":
    sys.exit(main(sys.argv))
