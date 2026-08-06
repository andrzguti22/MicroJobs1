from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal

from app.models.conversation import Conversation
from app.models.user import User

from app.schemas.conversation import ConversationCreate
from app.dependencies import get_current_user

router = APIRouter()


# DB
def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


@router.post("/conversations")
def create_conversation(
    conversation: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.id not in (conversation.user_one_id, conversation.user_two_id):
        raise HTTPException(403, "No puedes crear una conversación en la que no participas")

    # 🔥 verificar si ya existe
    existing = db.query(Conversation).filter(
        Conversation.job_id == conversation.job_id,

        (
            (
                Conversation.user_one_id == conversation.user_one_id
            ) &
            (
                Conversation.user_two_id == conversation.user_two_id
            )
        )
        |
        (
            (
                Conversation.user_one_id == conversation.user_two_id
            ) &
            (
                Conversation.user_two_id == conversation.user_one_id
            )
        )

    ).first()

    # 🔥 si existe devolverla
    if existing:
        return existing

    # 🔥 crear nueva
    new_conversation = Conversation(
        job_id=conversation.job_id,
        user_one_id=conversation.user_one_id,
        user_two_id=conversation.user_two_id
    )

    db.add(new_conversation)

    db.commit()

    db.refresh(new_conversation)

    return new_conversation

