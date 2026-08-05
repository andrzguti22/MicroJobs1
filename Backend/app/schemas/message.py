from pydantic import BaseModel


class MessageCreate(BaseModel):
    conversation_id: int
    sender_id: int
    text: str