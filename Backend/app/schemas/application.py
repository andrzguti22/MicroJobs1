from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    user_id: int
    job_id: int


class ApplicationResponse(BaseModel):
    id: int
    status: str
    user_id: int
    job_id: int

    class Config:
        from_attributes = True