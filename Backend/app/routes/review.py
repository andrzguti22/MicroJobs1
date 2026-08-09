from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database import SessionLocal

from app.models.review import Review
from app.models.user import User
from app.models.job import Job

from app.schemas.review import ReviewCreate

from app.dependencies import get_current_user

from sqlalchemy import func


router = APIRouter()


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ====================================
# CREAR RESEÑA
# ====================================
@router.post("/reviews")
def create_review(
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if review.reviewer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(403, "No puedes crear una reseña en nombre de otro usuario")

    job = db.query(Job).filter(Job.id == review.job_id).first()

    if not job:
        raise HTTPException(404, "Trabajo no encontrado")

    if job.status != "finished":
        raise HTTPException(400, "Solo puedes calificar trabajos que ya finalizaron")

    # 🔒 el que califica debe haber participado realmente en ESTE trabajo,
    # ya sea como dueño o como trabajador asignado (antes: cualquier usuario
    # autenticado podía calificar a cualquiera, para cualquier job_id)
    if current_user.id not in (job.owner_id, job.assigned_to_id):
        raise HTTPException(403, "No participaste en este trabajo, no puedes calificarlo")

    # 🔒 solo se puede calificar a la contraparte real de ese trabajo
    # (el dueño solo puede calificar al trabajador asignado, y viceversa)
    expected_reviewed_id = (
        job.assigned_to_id
        if current_user.id == job.owner_id
        else job.owner_id
    )

    if review.reviewed_user_id != expected_reviewed_id:
        raise HTTPException(
            400,
            "Solo puedes calificar a la persona con la que trabajaste en este trabajo",
        )

    # 🔒 evitar reseñas duplicadas para el mismo trabajo
    # (la UniqueConstraint del modelo también lo protege a nivel de BD)
    existing_review = db.query(Review).filter(
        Review.job_id == review.job_id,
        Review.reviewer_id == current_user.id,
    ).first()

    if existing_review:
        raise HTTPException(400, "Ya calificaste este trabajo")

    new_review = Review(
        job_id=review.job_id,
        reviewer_id=current_user.id,
        reviewed_user_id=review.reviewed_user_id,
        rating=review.rating,
        comment=review.comment
    )

    db.add(new_review)

    db.commit()

    db.refresh(new_review)

    return new_review


# ====================================
# RESEÑAS DE UN USUARIO
# ====================================
@router.get("/reviews/user/{user_id}")
def get_user_reviews(
    user_id: int,
    db: Session = Depends(get_db)
):

    reviews = db.query(Review).filter(
        Review.reviewed_user_id == user_id
    ).all()

    return [
        {
            "id": review.id,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at,
            "reviewer_name": review.reviewer.name
        }
        for review in reviews
    ]

@router.get("/reviews/average/{user_id}")
def get_average_rating(
    user_id: int,
    db: Session = Depends(get_db)
):

    average = db.query(
        func.avg(Review.rating)
    ).filter(
        Review.reviewed_user_id == user_id
    ).scalar()

    return {
        "average_rating": round(float(average), 1)
        if average else 0
    }