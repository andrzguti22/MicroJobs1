from pydantic import BaseModel

class ConversationCreate(BaseModel):
    job_id: int
    user_one_id: int
    user_two_id: int