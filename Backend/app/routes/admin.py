from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc

from app.database import SessionLocal
from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.models.review import Review
from app.dependencies import get_current_admin

router = APIRouter(prefix="/admin", tags=["admin"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ====================================
# 🔥 ESTADÍSTICAS GENERALES
# ====================================
@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    total_users = db.query(User).count()
    total_admins = db.query(User).filter(User.role == "admin").count()

    total_jobs = db.query(Job).count()
    active_jobs = db.query(Job).filter(Job.status == "active").count()
    in_progress_jobs = db.query(Job).filter(Job.status == "in-progress").count()
    finished_jobs = db.query(Job).filter(Job.status == "finished").count()

    total_applications = db.query(Application).count()
    total_reviews = db.query(Review).count()

    average_rating = db.query(func.avg(Review.rating)).scalar()

    return {
        "total_users": total_users,
        "total_admins": total_admins,
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "in_progress_jobs": in_progress_jobs,
        "finished_jobs": finished_jobs,
        "total_applications": total_applications,
        "total_reviews": total_reviews,
        "average_rating": round(float(average_rating), 1) if average_rating else 0,
    }


# ====================================
# 🔥 LISTAR USUARIOS
# ====================================
@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    users = db.query(User).order_by(desc(User.id)).all()

    # Antes: len(u.jobs_created) y len(u.applications) por cada usuario
    # -> 2 queries extra POR USUARIO (N+1). Ahora: 2 queries en total,
    # sin importar cuántos usuarios haya.
    jobs_counts = dict(
        db.query(Job.owner_id, func.count(Job.id))
        .group_by(Job.owner_id)
        .all()
    )

    applications_counts = dict(
        db.query(Application.user_id, func.count(Application.id))
        .group_by(Application.user_id)
        .all()
    )

    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "city": u.city,
            "phone": u.phone,
            "profile_image": u.profile_image,
            "jobs_created": jobs_counts.get(u.id, 0),
            "applications": applications_counts.get(u.id, 0),
        }
        for u in users
    ]


# ====================================
# 🔥 CAMBIAR ROL DE UN USUARIO
# ====================================
@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    allowed_roles = ["user", "admin"]

    if role not in allowed_roles:
        raise HTTPException(400, "Rol inválido. Usa 'user' o 'admin'")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(404, "Usuario no encontrado")

    if user.id == current_admin.id and role != "admin":
        raise HTTPException(400, "No puedes quitarte el rol de administrador a ti mismo")

    user.role = role

    db.commit()

    return {"message": f"Rol actualizado a '{role}'", "user_id": user.id, "role": user.role}


# ====================================
# 🔥 ELIMINAR USUARIO
# ====================================
@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    if user_id == current_admin.id:
        raise HTTPException(400, "No puedes eliminar tu propia cuenta de administrador")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(404, "Usuario no encontrado")

    db.delete(user)
    db.commit()

    return {"message": "Usuario eliminado correctamente"}


# ====================================
# 🔥 LISTAR TODOS LOS TRABAJOS
# ====================================
@router.get("/jobs")
def list_jobs(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    # Antes: 1 query de owner + len(job.applications) POR CADA trabajo (N+1).
    # Ahora: joinedload trae el owner en la misma query, y el conteo de
    # postulaciones se hace en 1 sola query agrupada.
    jobs = (
        db.query(Job)
        .options(joinedload(Job.owner))
        .order_by(desc(Job.id))
        .all()
    )

    applications_counts = dict(
        db.query(Application.job_id, func.count(Application.id))
        .group_by(Application.job_id)
        .all()
    )

    result = []

    for job in jobs:
        result.append({
            "id": job.id,
            "title": job.title,
            "location": job.location,
            "price": float(job.price) if job.price is not None else 0,
            "status": job.status,
            "owner_id": job.owner_id,
            "owner_name": job.owner.name if job.owner else "Usuario eliminado",
            "applications_count": applications_counts.get(job.id, 0),
            "created_at": job.created_at,
        })

    return result


# ====================================
# 🔥 ELIMINAR CUALQUIER TRABAJO
# ====================================
@router.delete("/jobs/{job_id}")
def delete_job_admin(
    job_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(404, "Trabajo no encontrado")

    db.delete(job)
    db.commit()

    return {"message": "Trabajo eliminado correctamente"}