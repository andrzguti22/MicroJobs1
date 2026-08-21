import os
import uuid

import httpx
from fastapi import HTTPException

# =========================================
# Supabase Storage
# =========================================
# Antes, las imágenes se guardaban en el disco local del servidor
# (carpeta uploads/). En Render, ese disco NO es persistente: se borra
# en cada redeploy o reinicio, por lo que las imágenes "desaparecían".
# Ahora se guardan en Supabase Storage, que persiste igual que la base
# de datos.
SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "uploads")

_MIME_TYPES = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
    "gif": "image/gif",
}


def _require_config():
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(
            500,
            "El almacenamiento de imágenes no está configurado en el servidor "
            "(faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
        )


async def upload_image(contents: bytes, extension: str, folder: str) -> str:
    """
    Sube una imagen a Supabase Storage y devuelve su URL pública completa.

    folder: carpeta dentro del bucket, ej. "profile_images" o
    "portfolio/12".
    """

    _require_config()

    filename = f"{uuid.uuid4()}.{extension}"
    object_path = f"{folder}/{filename}"

    content_type = _MIME_TYPES.get(extension, "application/octet-stream")

    upload_url = (
        f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_STORAGE_BUCKET}/{object_path}"
    )

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            upload_url,
            content=contents,
            headers={
                "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": content_type,
                "x-upsert": "false",
            },
        )

    if response.status_code >= 400:
        raise HTTPException(
            502,
            f"No se pudo subir la imagen al almacenamiento ({response.status_code}): "
            f"{response.text}",
        )

    return (
        f"{SUPABASE_URL}/storage/v1/object/public/"
        f"{SUPABASE_STORAGE_BUCKET}/{object_path}"
    )


async def delete_image(image_url: str) -> None:
    """
    Elimina una imagen de Supabase Storage a partir de su URL pública.
    No lanza error si la imagen ya no existe o la URL no pertenece al
    bucket (por ejemplo, imágenes viejas guardadas localmente antes de
    esta migración) -- simplemente no hace nada en ese caso.
    """

    if not image_url:
        return

    marker = f"/storage/v1/object/public/{SUPABASE_STORAGE_BUCKET}/"

    if marker not in image_url:
        return

    _require_config()

    object_path = image_url.split(marker, 1)[1]

    delete_url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_STORAGE_BUCKET}"

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            await client.request(
                "DELETE",
                delete_url,
                json={"prefixes": [object_path]},
                headers={
                    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                },
            )
    except Exception as e:
        # No queremos que un fallo al borrar el archivo tumbe la
        # petición del usuario (ej. borrar su perfil o su reseña).
        print("⚠️  No se pudo eliminar la imagen del storage:", e)
