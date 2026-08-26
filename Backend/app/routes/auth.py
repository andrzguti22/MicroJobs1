from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
import os
import uuid
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.utils.security import hash_password, verify_password
from app.schemas.user import UserProfile
from app.schemas.user import ForgotPasswordRequest, ResetPasswordRequest, VerifyEmailRequest
from app.utils.email_sender import send_password_reset_email, send_verification_email
from app.utils.jwt_handler import create_access_token
from app.dependencies import get_current_user
from app.rate_limiter import limiter
from app.utils.image_validation import validate_and_read_image
from app.utils.storage import upload_image

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

RESET_TOKEN_EXPIRE_MINUTES = 30

EMAIL_VERIFICATION_EXPIRE_HOURS = 24

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
@limiter.limit("5/minute")
def register(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.email == user.email).first()

    if exists:
        raise HTTPException(400, "El usuario ya existe")

    verification_token = secrets.token_urlsafe(32)

    new_user = User(
        name=user.name,
        email=user.email.lower(),
        password=hash_password(user.password),
        email_verified=False,
        email_verification_token=verification_token,
        email_verification_token_expires=datetime.now(timezone.utc)
        + timedelta(hours=EMAIL_VERIFICATION_EXPIRE_HOURS),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    verify_link = f"{FRONTEND_URL}/verify-email/{verification_token}"

    send_verification_email(new_user.email, new_user.name, verify_link)

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
            "email_verified": new_user.email_verified,
        },
    }

# 🔵 LOGIN
@router.post("/login")
@limiter.limit("10/minute")
def login(request: Request, user: UserLogin, db: Session = Depends(get_db)):
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
            "email_verified": db_user.email_verified,

            "city": db_user.city,
            "phone": db_user.phone,
            "experience": db_user.experience,
            "bio": db_user.bio,

            "skills": db_user.skills.split(",") if db_user.skills else [],

            "profile_image": db_user.profile_image
        }
    }

# 🟣 PERFIL DEL USUARIO ACTUAL (según el token)
@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role,
        "email_verified": current_user.email_verified,

        "city": current_user.city,
        "phone": current_user.phone,
        "experience": current_user.experience,
        "bio": current_user.bio,

        "skills": current_user.skills.split(",") if current_user.skills else [],

        "profile_image": current_user.profile_image
    }

# PERFIL
@router.put("/profile/{email}")
async def update_profile(
    email: str,
    name: str = Form(...),
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

    user.name = name
    user.city = city
    user.phone = phone
    user.experience = experience
    user.bio = bio
    user.skills = skills

    # -------------------------
    # Subir imagen
    # -------------------------

    if profile_image:

        contents, extension = await validate_and_read_image(profile_image)

        user.profile_image = await upload_image(contents, extension, "profile_images")

    db.commit()
    db.refresh(user)

    return {
        "message": "Perfil actualizado",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "email_verified": user.email_verified,
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
@limiter.limit("3/minute")
def forgot_password(request: Request, payload: ForgotPasswordRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.email == payload.email.lower()
    ).first()

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

    user.password = hash_password(payload.new_password)
    user.reset_token = None
    user.reset_token_expires = None

    db.commit()

    return {"message": "Contraseña actualizada correctamente"}


# 🟢 CONFIRMAR EMAIL
@router.post("/verify-email")
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.email_verification_token == payload.token
    ).first()

    if not user:
        raise HTTPException(400, "El enlace de verificación no es válido")

    if user.email_verified:
        return {"message": "Este correo ya estaba verificado"}

    if not user.email_verification_token_expires:
        raise HTTPException(400, "El enlace de verificación no es válido")

    expires_at = user.email_verification_token_expires

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            400,
            "El enlace de verificación ha expirado, solicita uno nuevo desde tu perfil",
        )

    user.email_verified = True


    db.commit()

    return {"message": "Correo verificado correctamente"}


# 🟠 REENVIAR CORREO DE VERIFICACIÓN
@router.post("/resend-verification")
@limiter.limit("3/minute")
def resend_verification(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if current_user.email_verified:
        return {"message": "Tu correo ya está verificado"}

    verification_token = secrets.token_urlsafe(32)

    current_user.email_verification_token = verification_token
    current_user.email_verification_token_expires = datetime.now(
        timezone.utc
    ) + timedelta(hours=EMAIL_VERIFICATION_EXPIRE_HOURS)

    db.commit()

    verify_link = f"{FRONTEND_URL}/verify-email/{verification_token}"

    send_verification_email(current_user.email, current_user.name, verify_link)

    return {"message": "Te reenviamos el correo de verificación"}