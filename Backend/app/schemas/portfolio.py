from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PortfolioImageOut(BaseModel):
    id: int
    user_id: int
    image_path: str
    description: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
