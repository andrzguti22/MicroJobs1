from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func, or_

from app.database import SessionLocal

from app.models.job import Job
from app.models.user import User
from app.models.application import Application
from app.models.job_history import JobHistory

from app.schemas.job import JobCreate, JobUpdate
from app.dependencies import get_current_user

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
# GET ALL JOBS (paginado + filtros)
# =========================
@router.get("/jobs")
def get_jobs(
    skip: int = Query(0, ge=0, description="Cuántos resultados saltar"),
    limit: int = Query(20, ge=1, le=100, description="Tamaño de página (máx. 100)"),
    search: str | None = Query(None, description="Busca en título y descripción"),
    location: str | None = Query(None, description="Filtra por ubicación (coincidencia parcial)"),
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),
    status: str | None = Query(
        None,
        description="Filtra por estado exacto. 'all' = sin filtro. Por defecto, excluye 'finished'."
    ),
    sort: str = Query(
        "recent",
        description="'recent' (más nuevos primero), 'price_asc' o 'price_desc'"
    ),
    db: Session = Depends(get_db),
):

    query = db.query(Job)

    # ---- estado ----
    if status == "all":
        pass
    elif status:
        query = query.filter(Job.status == status)
    else:
        # comportamiento por defecto de "Explorar trabajos": no mostrar finalizados
        query = query.filter(Job.status != "finished")

    # ---- búsqueda de texto (título o descripción) ----
    if search:
        like = f"%{search.strip()}%"
        query = query.filter(
            or_(Job.title.ilike(like), Job.description.ilike(like))
        )

    # ---- ubicación ----
    if location:
        query = query.filter(Job.location.ilike(f"%{location.strip()}%"))

    # ---- rango de precio ----
    if min_price is not None:
        query = query.filter(Job.price >= min_price)

    if max_price is not None:
        query = query.filter(Job.price <= max_price)

    total = query.count()

    # ---- orden ----
    if sort == "price_asc":
        query = query.order_by(Job.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Job.price.desc())
    else:
        query = query.order_by(desc(Job.id))

    jobs = (
        query
        .options(joinedload(Job.assigned_user))  # evita 1 query extra por trabajo
        .offset(skip)
        .limit(limit)
        .all()
    )

    job_ids = [job.id for job in jobs]

    counts_map = {}
    if job_ids:
        counts = (
            db.query(Application.job_id, func.count(Application.id))
            .filter(Application.job_id.in_(job_ids))
            .group_by(Application.job_id)
            .all()
        )
        counts_map = dict(counts)

    result = []

    for job in jobs:

        assigned_user = None

        if job.assigned_user:
            assigned_user = {
                "id": job.assigned_user.id,
                "name": job.assigned_user.name,
                "email": job.assigned_user.email,
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
            "applicationsCount": counts_map.get(job.id, 0),
            "created_at": job.created_at
        })

    return {
        "items": result,
        "total": total,
        "skip": skip,
        "limit": limit,
        "has_more": skip + limit < total,
    }


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
            
    owner_data = None
    
    owner = db.query(User).filter(
        User.id == job.owner_id
    ).first()
        
    if owner:
        owner_data = {
            "id": owner.id,
            "name": owner.name,
            "email": owner.email,
            }

    return {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "location": job.location,
        "price": job.price,
        "status": job.status,
        "owner_id": job.owner_id,
        "owner": owner_data,
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if not current_user.email_verified and current_user.role != "admin":
        raise HTTPException(
            403,
            "Debes verificar tu correo electrónico antes de publicar un trabajo",
        )

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
        owner_id=current_user.id
    )

    db.add(new_job)

    db.commit()

    db.refresh(new_job)

    return {
        "message": "Trabajo creado",
        "job": new_job
    }


# =========================
# UPDATE JOB (solo el dueño, y solo mientras esté activo y sin asignar)
# =========================
@router.put("/jobs/{job_id}")
def update_job(
    job_id: int,
    job_data: JobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(404, "Trabajo no encontrado")

    if job.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(403, "No puedes editar un trabajo que no es tuyo")

    if job.status == "finished":
        raise HTTPException(400, "No se puede editar un trabajo ya finalizado")

    if job.assigned_to_id is not None:
        raise HTTPException(
            400,
            "No se puede editar un trabajo que ya tiene a alguien asignado"
        )

    if job_data.price <= 0:
        raise HTTPException(400, "El precio debe ser mayor que cero")

    if job_data.price > 9999999999:
        raise HTTPException(400, "Precio demasiado alto")

    job.title = job_data.title
    job.description = job_data.description
    job.location = job_data.location
    job.price = job_data.price

    db.commit()
    db.refresh(job)

    return {
        "message": "Trabajo actualizado",
        "job": job
    }
    
    
# =========================
# GET USER JOBS
# =========================
@router.get("/jobs/user/{user_id}")
def get_user_jobs(user_id: int, db: Session = Depends(get_db)):

    jobs = (
        db.query(Job)
        .filter(Job.owner_id == user_id)
        .order_by(desc(Job.id))
        .all()
    )

    job_ids = [job.id for job in jobs]

    counts_map = {}
    pending_counts_map = {}

    if job_ids:
        counts = (
            db.query(Application.job_id, func.count(Application.id))
            .filter(Application.job_id.in_(job_ids))
            .group_by(Application.job_id)
            .all()
        )
        counts_map = dict(counts)

        pending_counts = (
            db.query(Application.job_id, func.count(Application.id))
            .filter(Application.job_id.in_(job_ids), Application.status == "pending")
            .group_by(Application.job_id)
            .all()
        )
        pending_counts_map = dict(pending_counts)

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
            "applicationsCount": counts_map.get(job.id, 0),
            "pendingApplicationsCount": pending_counts_map.get(job.id, 0),
            "created_at": job.created_at
        })

    return result


# =========================
# DELETE JOB
# =========================
@router.delete("/jobs/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    job = db.query(Job).filter(
        Job.id == job_id
    ).first()

    if not job:
        raise HTTPException(404, "Trabajo no encontrado")

    if job.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(403, "No puedes eliminar un trabajo que no te pertenece")

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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    job = db.query(Job).filter(
        Job.id == job_id
    ).first()

    if not job:
        raise HTTPException(404, "Trabajo no encontrado")

    if job.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(403, "No puedes finalizar un trabajo que no te pertenece")

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