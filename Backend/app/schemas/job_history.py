from pydantic import BaseModel
from datetime import datetime


class JobHistoryResponse(BaseModel):
    id: int
    job_id: int

    employer_id: int
    worker_id: int

    title: str
    location: str

    finished_at: datetime

    class Config:
        from_attributes = True