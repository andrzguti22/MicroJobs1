
from io import BytesIO

from fastapi import HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif"}

# Debe coincidir con los formatos que Pillow reporta para cada extensión
ALLOWED_PIL_FORMATS = {"JPEG", "PNG", "WEBP", "GIF"}

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


async def validate_and_read_image(file: UploadFile) -> tuple[bytes, str]:
    """
    Valida extensión, tamaño y contenido real de una imagen subida.
    Devuelve (bytes_del_archivo, extension_normalizada) si es válida,
    o lanza HTTPException(400) con un mensaje claro si no lo es.
    """

    if not file.filename or "." not in file.filename:
        raise HTTPException(400, "El archivo no tiene una extensión válida")

    extension = file.filename.rsplit(".", 1)[-1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            400,
            "Formato no permitido. Usa jpg, jpeg, png, webp o gif",
        )

    contents = await file.read()

    if len(contents) == 0:
        raise HTTPException(400, "El archivo está vacío")

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(400, "La imagen no puede superar los 5MB")

    try:
        image = Image.open(BytesIO(contents))
        image.verify()

        if image.format not in ALLOWED_PIL_FORMATS:
            raise HTTPException(
                400,
                "El contenido del archivo no coincide con un formato de imagen permitido",
            )

    except UnidentifiedImageError:
        raise HTTPException(
            400,
            "El archivo no es una imagen válida (puede estar corrupto o no ser una imagen real)",
        )

    return contents, extension