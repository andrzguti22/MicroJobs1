from pydantic import BaseModel

class JobCreate(BaseModel):
    title: str
    description: str
    location: str
    price: float
    owner_id: int
    
