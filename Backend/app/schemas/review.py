from pydantic import BaseModel


class ReviewCreate(BaseModel):

    job_id: int

    reviewer_id: int

    reviewed_user_id: int

    rating: int

    comment: str


class ReviewResponse(BaseModel):

    id: int

    job_id: int

    reviewer_id: int

    reviewed_user_id: int

    rating: int

    comment: str

    class Config:
        from_attributes = True