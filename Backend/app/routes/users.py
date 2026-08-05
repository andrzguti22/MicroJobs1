from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User

router = APIRouter()


# DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 🔥 OBTENER USUARIO POR ID
@router.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(404, "Usuario no encontrado")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "city": user.city,
        "phone": user.phone,
        "experience": user.experience,
        "bio": user.bio,
        "skills": user.skills.split(",") if user.skills else [],
        "profile_image": user.profile_image
    }