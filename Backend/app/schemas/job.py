from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10, max_length=1000)
    location: str = Field(..., min_length=2, max_length=150)
    price: float
    owner_id: int


class JobUpdate(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10, max_length=1000)
    location: str = Field(..., min_length=2, max_length=150)
    price: float