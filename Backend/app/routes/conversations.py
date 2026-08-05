from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal

from app.models.conversation import Conversation

from app.schemas.conversation import ConversationCreate

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
    db: Session = Depends(get_db)
):
    print(conversation.dict())

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

