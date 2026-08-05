from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal

from app.models.message import Message
from app.models.conversation import Conversation
from app.models.user import User

from app.schemas.message import MessageCreate

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 🔥 OBTENER MENSAJES
@router.get("/messages/{conversation_id}")
def get_messages(
    conversation_id: int,
    db: Session = Depends(get_db)
):

    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc()).all()

    result = []

    for msg in messages:

        user = db.query(User).filter(
            User.id == msg.sender_id
        ).first()

        result.append({
            "id": msg.id,
            "text": msg.text,
            "sender_id": msg.sender_id,
            "sender_name": user.name,
            "created_at": msg.created_at
        })

    return result


# 🔥 ENVIAR MENSAJE
@router.post("/messages")
def send_message(
    data: MessageCreate,
    db: Session = Depends(get_db)
):

    conversation = db.query(Conversation).filter(
        Conversation.id == data.conversation_id
    ).first()

    if not conversation:
        raise HTTPException(404, "Conversación no encontrada")

    message = Message(
        conversation_id=data.conversation_id,
        sender_id=data.sender_id,
        text=data.text
    )

    db.add(message)

    db.commit()

    db.refresh(message)

    return {
        "message": "Mensaje enviado"
    }