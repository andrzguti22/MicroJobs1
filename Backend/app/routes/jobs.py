from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import SessionLocal

from app.models.job import Job
from app.models.user import User
from app.models.application import Application
from app.models.job_history import JobHistory

from app.schemas.job import JobCreate

router = APIRouter()


# =========================
# DB
# =========================
def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# =========================
# GET ALL JOBS
# =========================
@router.get("/jobs")
def get_jobs(db: Session = Depends(get_db)):

    jobs = db.query(Job).order_by(desc(Job.id)).all()

    result = []

    for job in jobs:

        applications_count = db.query(Application).filter(
            Application.job_id == job.id
        ).count()

        assigned_user = None

        if job.assigned_to_id:

            user = db.query(User).filter(
                User.id == job.assigned_to_id
            ).first()

            if user:
                assigned_user = {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                }

        result.append({
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "location": job.location,
            "price": job.price,
            "status": job.status,
            "owner_id": job.owner_id,
            "assigned_to_id": job.assigned_to_id,
            "assignedTo": assigned_user,
            "applicationsCount": applications_count,
            "created_at": job.created_at
        })

    return result


# =========================
# GET JOB BY ID
# =========================
@router.get("/jobs/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):

    job = db.query(Job).filter(
        Job.id == job_id
    ).first()

    if not job:
        raise HTTPException(404, "Trabajo no encontrado")

    applications_count = db.query(Application).filter(
        Application.job_id == job.id
    ).count()

    assigned_user = None

    if job.assigned_to_id:

        user = db.query(User).filter(
            User.id == job.assigned_to_id
        ).first()

        if user:
            assigned_user = {
                "id": user.id,
                "name": user.name,
                "email": user.email,
            }

    return {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "location": job.location,
        "price": job.price,
        "status": job.status,
        "owner_id": job.owner_id,
        "assigned_to_id": job.assigned_to_id,
        "assignedTo": assigned_user,
        "applicationsCount": applications_count,
        "created_at": job.created_at
    }


# =========================
# CREATE JOB
# =========================
@router.post("/jobs")
def create_job(
    job: JobCreate,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == job.owner_id
    ).first()

    if not user:
        raise HTTPException(404, "Usuario no encontrado")
    
    if job.price <= 0:
        raise HTTPException(
            status_code=400,
            detail="El precio debe ser mayor que cero"
        )
        
    if job.price > 9999999999:
        raise HTTPException(
            status_code=400,
            detail="Precio demasiado alto"
        )

    new_job = Job(
        title=job.title,
        description=job.description,
        location=job.location,
        price=job.price,
        owner_id=user.id
    )

    db.add(new_job)

    db.commit()

    db.refresh(new_job)

    return {
        "message": "Trabajo creado",
        "job": new_job
    }


# =========================
# GET USER JOBS
# =========================
@router.get("/jobs/user/{user_id}")
def get_user_jobs(user_id: int, db: Session = Depends(get_db)):

    jobs = db.query(Job).filter(
        Job.owner_id == user_id
    ).all()

    result = []

    for job in jobs:

        result.append({
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "location": job.location,
            "price": job.price,
            "status": job.status,
            "owner_id": job.owner_id,
            "assigned_to_id": job.assigned_to_id,
            "applicationsCount": len(job.applications)
        })

    return result


# =========================
# DELETE JOB
# =========================
@router.delete("/jobs/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db)
):

    job = db.query(Job).filter(
        Job.id == job_id
    ).first()

    if not job:
        raise HTTPException(404, "Trabajo no encontrado")

    db.delete(job)

    db.commit()

    return {
        "message": "Trabajo eliminado"
    }


# =========================
# FINISH JOB
# =========================
@router.put("/jobs/{job_id}/finish")
def finish_job(
    job_id: int,
    db: Session = Depends(get_db)
):

    job = db.query(Job).filter(
        Job.id == job_id
    ).first()

    if not job:
        raise HTTPException(404, "Trabajo no encontrado")

    # 🔥 cambiar estado
    job.status = "finished"

    # 🔥 buscar trabajador aceptado
    accepted_application = db.query(Application).filter(
        Application.job_id == job.id,
        Application.status == "accepted"
    ).first()

    worker_id = (
        accepted_application.user_id
        if accepted_application
        else None
    )

    # 🔥 guardar historial
    history = JobHistory(
        job_id=job.id,

        employer_id=job.owner_id,

        worker_id=worker_id,

        title=job.title,

        location=job.location
    )

    db.add(history)

    db.commit()

    return {
        "message": "Trabajo finalizado"
    }
    
@router.get("/job-history/{user_id}")
def get_job_history(
        user_id: int,
        db: Session = Depends(get_db)
    ):

        history = db.query(JobHistory).filter(
            (JobHistory.employer_id == user_id)
            |
            (JobHistory.worker_id == user_id)
        ).order_by(
            JobHistory.finished_at.desc()
        ).all()

        return history

