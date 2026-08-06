import os
import shutil
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User
from app.models.portfolio import PortfolioImage
from app.schemas.portfolio import PortfolioImageOut
from app.dependencies import get_current_user

router = APIRouter()

# Extensiones de imagen permitidas
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif"}

# Peso máximo por imagen: 5 MB
MAX_FILE_SIZE = 5 * 1024 * 1024

# Máximo de imágenes en el portafolio por usuario
MAX_PORTFOLIO_IMAGES = 12


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ====================================
# 🔥 LISTAR PORTAFOLIO DE UN USUARIO
# ====================================
@router.get("/users/{user_id}/portfolio", response_model=list[PortfolioImageOut])
def get_portfolio(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(404, "Usuario no encontrado")

    images = (
        db.query(PortfolioImage)
        .filter(PortfolioImage.user_id == user_id)
        .order_by(PortfolioImage.created_at.desc())
        .all()
    )

    return images


# ====================================
# 🔥 SUBIR IMAGEN AL PORTAFOLIO
# ====================================
@router.post("/users/{user_id}/portfolio", response_model=PortfolioImageOut)
async def upload_portfolio_image(
    user_id: int,
    description: str = Form(""),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(403, "No puedes subir imágenes al portafolio de otro usuario")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(404, "Usuario no encontrado")

    current_count = (
        db.query(PortfolioImage)
        .filter(PortfolioImage.user_id == user_id)
        .count()
    )

    if current_count >= MAX_PORTFOLIO_IMAGES:
        raise HTTPException(
            400,
            f"Solo puedes tener hasta {MAX_PORTFOLIO_IMAGES} imágenes en tu portafolio",
        )

    extension = image.filename.split(".")[-1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            400,
            "Formato de imagen no permitido. Usa jpg, png, webp o gif",
        )

    # Validar tamaño del archivo
    contents = await image.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(400, "La imagen no puede superar los 5MB")

    folder = f"uploads/portfolio/{user_id}"

    os.makedirs(folder, exist_ok=True)

    filename = f"{uuid.uuid4()}.{extension}"

    filepath = os.path.join(folder, filename)

    with open(filepath, "wb") as buffer:
        buffer.write(contents)

    new_image = PortfolioImage(
        user_id=user_id,
        image_path=filepath.replace("\\", "/"),
        description=description or None,
    )

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return new_image


# ====================================
# 🔥 ELIMINAR IMAGEN DEL PORTAFOLIO
# ====================================
@router.delete("/portfolio/{image_id}")
def delete_portfolio_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    image = db.query(PortfolioImage).filter(PortfolioImage.id == image_id).first()

    if not image:
        raise HTTPException(404, "Imagen no encontrada")

    if current_user.id != image.user_id and current_user.role != "admin":
        raise HTTPException(403, "No puedes eliminar imágenes del portafolio de otro usuario")

    # Borrar el archivo físico si existe
    if image.image_path and os.path.exists(image.image_path):
        try:
            os.remove(image.image_path)
        except OSError:
            pass

    db.delete(image)
    db.commit()

    return {"message": "Imagen eliminada correctamente"}
