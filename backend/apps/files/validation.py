"""Upload validation: size, extension allowlist, and a magic-byte check so a
renamed executable can't pass as a PDF. No content is ever executed or
rendered server-side."""
import hashlib

from django.conf import settings
from rest_framework.exceptions import ValidationError

# extension -> (kind, content type, accepted leading-byte signatures; None = text)
ALLOWED = {
    "pdf": ("pdf", "application/pdf", [b"%PDF-"]),
    "png": ("image", "image/png", [b"\x89PNG\r\n\x1a\n"]),
    "jpg": ("image", "image/jpeg", [b"\xff\xd8\xff"]),
    "jpeg": ("image", "image/jpeg", [b"\xff\xd8\xff"]),
    "gif": ("image", "image/gif", [b"GIF87a", b"GIF89a"]),
    "webp": ("image", "image/webp", [b"RIFF"]),
    "docx": ("doc", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", [b"PK\x03\x04"]),
    "xlsx": ("sheet", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", [b"PK\x03\x04"]),
    "pptx": ("slides", "application/vnd.openxmlformats-officedocument.presentationml.presentation", [b"PK\x03\x04"]),
    "doc": ("doc", "application/msword", [b"\xd0\xcf\x11\xe0"]),
    "xls": ("sheet", "application/vnd.ms-excel", [b"\xd0\xcf\x11\xe0"]),
    "mp4": ("video", "video/mp4", [b"ftyp"]),  # checked at offset 4
    "mp3": ("audio", "audio/mpeg", [b"ID3", b"\xff\xfb", b"\xff\xf3", b"\xff\xf2"]),
    "txt": ("text", "text/plain", None),
    "csv": ("text", "text/csv", None),
}


def inspect_upload(upload):
    """Validate an UploadedFile; return (kind, content_type, sha256)."""
    limit = settings.FILE_UPLOAD_MAX_MB * 1024 * 1024
    if upload.size > limit:
        raise ValidationError({"file": f"Files must be {settings.FILE_UPLOAD_MAX_MB} MB or smaller."})
    if upload.size == 0:
        raise ValidationError({"file": "The file is empty."})
    name = upload.name or ""
    ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
    if ext not in ALLOWED:
        raise ValidationError({"file": f"'.{ext}' files aren't allowed."})
    kind, content_type, signatures = ALLOWED[ext]

    upload.seek(0)
    head = upload.read(16)
    if signatures is None:
        if b"\x00" in head:
            raise ValidationError({"file": "This doesn't look like a text file."})
    else:
        window = head[4:12] if ext == "mp4" else head
        if not any(window.startswith(sig) for sig in signatures):
            raise ValidationError({"file": f"The file content doesn't match '.{ext}'."})

    digest = hashlib.sha256()
    upload.seek(0)
    for chunk in upload.chunks():
        digest.update(chunk)
    upload.seek(0)
    return kind, content_type, digest.hexdigest()
