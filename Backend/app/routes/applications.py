from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import SessionLocal
from app.models.application import Application
from app.models.job import Job
from app.models.user import User
from app.schemas.application import ApplicationCreate
from app.models.notification import Notification
from app.dependencies import get_current_user

router = APIRouter()


# 🔌 DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==================================================
# 🔥 CREAR POSTULACIÓN
# ==================================================
@router.post("/applications")
def create_application(
    application: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if not current_user.email_verified and current_user.role != "admin":
        raise HTTPException(
            403,
            "Debes verificar tu correo electrónico antes de postularte a un trabajo",
        )

    # 🔍 validar trabajo
    job = db.query(Job).filter(
        Job.id == application.job_id
    ).first()

    if not job:
        raise HTTPException(404, "Trabajo no encontrado")

    user = current_user

    if job.owner_id == user.id:
        raise HTTPException(400, "No puedes postularte a tu propio trabajo")

    # 🔥 validar duplicado
    exists = db.query(Application).filter(
        Application.user_id == user.id,
        Application.job_id == application.job_id
    ).first()

    if exists:
        raise HTTPException(400, "Ya aplicaste a este trabajo")

    # 🔥 crear postulación
    new_application = Application(
        user_id=user.id,
        job_id=application.job_id,
        status="pending"
    )

    db.add(new_application)
    
    notification = Notification(
    user_id=job.owner_id,
    text=f"{user.name} aplicó a tu trabajo '{job.title}'"
    )

    db.add(notification)

    db.commit()

    db.refresh(new_application)

    return {
        "message": "Postulación enviada",
        "application": new_application
    }


# ==================================================
# 🔥 MIS POSTULACIONES
# ==================================================
@router.get("/applications/user/{user_id}")
def get_my_applications(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(403, "No puedes ver las postulaciones de otro usuario")

    applications = db.query(Application).filter(
        Application.user_id == user_id
    ).order_by(
        Application.id.desc()
    ).all()

    job_ids = [a.job_id for a in applications]

    jobs = {
        job.id: job
        for job in db.query(Job).filter(Job.id.in_(job_ids)).all()
    } if job_ids else {}

    result = []

    for app in applications:

        job = jobs.get(app.job_id)

        if not job:
            continue

        result.append({
            "id": app.id,
            "status": app.status,
            "job_id": app.job_id,
            "job_title": job.title,
            "location": job.location,
            "job_status": job.status
        })

    return result


# ==================================================
# 🔥 POSTULACIONES DE UN TRABAJO
# ==================================================
@router.get("/applications/job/{job_id}")
def get_job_applications(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(404, "Trabajo no encontrado")

    if job.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(403, "No puedes ver las postulaciones de este trabajo")

    applications = db.query(Application).filter(
        Application.job_id == job_id
    ).order_by(
        Application.id.desc()
    ).all()

    result = []

    for app in applications:

        user = db.query(User).filter(
            User.id == app.user_id
        ).first()

        result.append({
            "id": app.id,
            "status": app.status,
            "user_id": user.id if user else None,
            "user_name": user.name if user else "Usuario eliminado",
            "user_email": user.email if user else "Sin email",
            "job_id": app.job_id,
            "profile_image": user.profile_image
        })

    return result


# ==================================================
# 🔥 ACTUALIZAR ESTADO POSTULACIÓN
# ==================================================
@router.put("/applications/{application_id}")
def update_application_status(
    application_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # 🔍 buscar aplicación
    application = db.query(Application).filter(
        Application.id == application_id
    ).first()

    if not application:
        raise HTTPException(404, "Postulación no encontrada")

    # 🔍 buscar trabajo
    job = db.query(Job).filter(
        Job.id == application.job_id
    ).first()

    if not job:
        raise HTTPException(404, "Trabajo no encontrado")

    if job.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(403, "No puedes modificar postulaciones de otro usuario")

    # 🔥 validar estado
    allowed_status = ["accepted", "rejected"]

    if status not in allowed_status:
        raise HTTPException(400, "Estado inválido")

    # ==================================================
    # 🔥 SI SE ACEPTA
    # ==================================================
    if status == "accepted":

        # rechazar demás postulaciones
        other_applications = db.query(Application).filter(
            Application.job_id == application.job_id,
            Application.id != application.id
        ).all()

        for app in other_applications:
            app.status = "rejected"

        # actualizar trabajo
        job.status = "in-progress"
        
        job.assigned_to_id = application.user_id

    # 🔥 actualizar actual
    application.status = status
    
    notification = Notification(

    user_id=application.user_id,

    text=(
        f"Tu postulación para '{job.title}' fue "
        f"{'aceptada' if status == 'accepted' else 'rechazada'}"
    )
    )

    db.add(notification)

    db.commit()

    return {
        "message": f"Postulación {status}",
        "application_id": application.id,
        "status": application.status
    }