from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):

    job_id: int

    reviewer_id: int

    reviewed_user_id: int

    rating: int = Field(ge=1, le=5, description="Calificación de 1 a 5 estrellas")

    comment: str = Field(min_length=5, max_length=1000)


class ReviewResponse(BaseModel):

    id: int

    job_id: int

    reviewer_id: int

    reviewed_user_id: int

    rating: int

    comment: str

    class Config:
        from_attributes = True