from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
import os
import shutil
import uuid
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.utils.security import hash_password, verify_password
from app.schemas.user import UserProfile
from app.schemas.user import ForgotPasswordRequest, ResetPasswordRequest
from app.utils.email_sender import send_password_reset_email
from app.utils.jwt_handler import create_access_token
from app.dependencies import get_current_user

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

RESET_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter()

# 🔌 DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 🟢 REGISTER
@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.email == user.email).first()

    if exists:
        raise HTTPException(400, "El usuario ya existe")

    new_user = User(
        name=user.name,
        email=user.email.lower(),
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": str(new_user.id)})

    return {
        "message": "Usuario creado",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
        },
    }

# 🔵 LOGIN
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(
        User.email == user.email.lower()
    ).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(401, "Credenciales inválidas")

    access_token = create_access_token(data={"sub": str(db_user.id)})

    return {
        "message": "Login exitoso",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "name": db_user.name,
            "role": db_user.role,

            "city": db_user.city,
            "phone": db_user.phone,
            "experience": db_user.experience,
            "bio": db_user.bio,

            "skills": db_user.skills.split(",") if db_user.skills else [],

            "profile_image": db_user.profile_image
        }
    }
# PERFIL
@router.put("/profile/{email}")
async def update_profile(
    email: str,
    city: str = Form(...),
    phone: str = Form(...),
    experience: str = Form(...),
    bio: str = Form(...),
    skills: str = Form(...),
    profile_image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if current_user.id != user.id and current_user.role != "admin":
        raise HTTPException(403, "No puedes editar el perfil de otro usuario")

    user.city = city
    user.phone = phone
    user.experience = experience
    user.bio = bio
    user.skills = skills

    # -------------------------
    # Subir imagen
    # -------------------------

    if profile_image:

        os.makedirs("uploads/profile_images", exist_ok=True)

        extension = profile_image.filename.split(".")[-1]

        filename = f"{uuid.uuid4()}.{extension}"

        filepath = os.path.join("uploads/profile_images", filename)

        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(profile_image.file, buffer)

        user.profile_image = filepath.replace("\\", "/")

    db.commit()
    db.refresh(user)

    return {
        "message": "Perfil actualizado",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "city": user.city,
            "phone": user.phone,
            "experience": user.experience,
            "bio": user.bio,
            "skills": user.skills.split(",") if user.skills else [],
            "profile_image": user.profile_image,
        },
    }


# 🟠 SOLICITAR RECUPERACIÓN DE CONTRASEÑA
@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.email == payload.email.lower()
    ).first()

    # Por seguridad, siempre respondemos lo mismo exista o no el correo,
    # para no revelar qué correos están registrados.
    generic_response = {
        "message": "Si el correo existe en nuestro sistema, te enviamos las instrucciones para recuperar tu contraseña."
    }

    if not user:
        return generic_response

    token = secrets.token_urlsafe(32)

    user.reset_token = token
    user.reset_token_expires = datetime.now(timezone.utc) + timedelta(
        minutes=RESET_TOKEN_EXPIRE_MINUTES
    )

    db.commit()

    reset_link = f"{FRONTEND_URL}/reset-password/{token}"

    send_password_reset_email(user.email, user.name, reset_link)

    return generic_response


# 🟢 RESTABLECER CONTRASEÑA CON TOKEN
@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.reset_token == payload.token
    ).first()

    if not user:
        raise HTTPException(400, "El enlace de recuperación no es válido")

    if not user.reset_token_expires:
        raise HTTPException(400, "El enlace de recuperación no es válido")

    expires_at = user.reset_token_expires

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(400, "El enlace de recuperación ha expirado, solicita uno nuevo")

    if len(payload.new_password) < 6:
        raise HTTPException(400, "La contraseña debe tener al menos 6 caracteres")

    user.password = hash_password(payload.new_password)
    user.reset_token = None
    user.reset_token_expires = None

    db.commit()

    return {"message": "Contraseña actualizada correctamente"}