from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database import SessionLocal

from app.models.review import Review

from app.schemas.review import ReviewCreate

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
    db: Session = Depends(get_db)
):

    new_review = Review(
        job_id=review.job_id,
        reviewer_id=review.reviewer_id,
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