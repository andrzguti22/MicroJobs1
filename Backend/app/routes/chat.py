from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal

from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User
from app.models.notification import Notification

from app.schemas.message import MessageCreate
from app.schemas.conversation import ConversationCreate

router = APIRouter()


# ==============================
# DB
# ==============================
def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ==============================
# 🔥 CREAR CONVERSACIÓN
# ==============================
@router.post("/conversations")
def create_conversation(
    conversation: ConversationCreate,
    db: Session = Depends(get_db)
):

    # 🔥 validar usuarios
    if conversation.user_one_id is None:
        raise HTTPException(400, "user_one_id es requerido")

    if conversation.user_two_id is None:
        raise HTTPException(400, "user_two_id es requerido")

    # 🔥 verificar si ya existe
    existing = db.query(Conversation).filter(

        Conversation.job_id == conversation.job_id,

        (
            (
                Conversation.user_one_id == conversation.user_one_id
            )
            &
            (
                Conversation.user_two_id == conversation.user_two_id
            )
        )

        |

        (
            (
                Conversation.user_one_id == conversation.user_two_id
            )
            &
            (
                Conversation.user_two_id == conversation.user_one_id
            )
        )

    ).first()

    # 🔥 si existe devolverla
    if existing:
        return existing

    # 🔥 crear nueva conversación
    new_conversation = Conversation(
        job_id=conversation.job_id,
        user_one_id=conversation.user_one_id,
        user_two_id=conversation.user_two_id
    )

    db.add(new_conversation)

    db.commit()

    db.refresh(new_conversation)

    return new_conversation


# ==============================
# 🔥 OBTENER CONVERSACIONES
# ==============================
@router.get("/conversations/user/{user_id}")
def get_user_conversations(
    user_id: int,
    db: Session = Depends(get_db)
):

    conversations = db.query(Conversation).filter(
        (Conversation.user_one_id == user_id)
        |
        (Conversation.user_two_id == user_id)
    ).all()

    result = []

    for convo in conversations:

        # 🔥 otro usuario
        other_user_id = (
            convo.user_two_id
            if convo.user_one_id == user_id
            else convo.user_one_id
        )

        other_user = db.query(User).filter(
            User.id == other_user_id
        ).first()

        # 🔥 último mensaje
        last_message = db.query(Message).filter(
            Message.conversation_id == convo.id
        ).order_by(
            Message.created_at.desc()
        ).first()

        # 🔥 mensajes sin leer
        unread_count = db.query(Message).filter(
            Message.conversation_id == convo.id,
            Message.sender_id != user_id,
            Message.is_read == False
        ).count()

        updated_at = (
            last_message.created_at
            if last_message
            else convo.updated_at
        )

        if updated_at:
            updated_at = updated_at.replace(tzinfo=None)

        result.append({

            "id": convo.id,

            "job_id": convo.job_id,

            "last_message": (
                last_message.text
                if last_message
                else ""
            ),

            "updated_at": updated_at,

            "unread_count": unread_count,

            "other_user": {
                "id": other_user.id,
                "name": other_user.name,
                "email": other_user.email
            }

        })

    # 🔥 conversaciones más recientes primero
    result.sort(
        key=lambda x: x["updated_at"],
        reverse=True
    )

    return result

# ==============================
# 🔥 ENVIAR MENSAJE
# ==============================
@router.post("/messages")
def send_message(
    message: MessageCreate,
    db: Session = Depends(get_db)
):

    # 🔥 validar conversación
    conversation = db.query(Conversation).filter(
        Conversation.id == message.conversation_id
    ).first()

    if not conversation:
        raise HTTPException(404, "Conversación no encontrada")

    # =========================================
    # 🔥 CREAR MENSAJE
    # =========================================
    new_message = Message(
        conversation_id=message.conversation_id,
        sender_id=message.sender_id,
        text=message.text,
        is_read=False
    )

    db.add(new_message)

    # =========================================
    # 🔥 ACTUALIZAR CONVERSACIÓN
    # =========================================
    conversation.last_message = message.text

    # =========================================
    # 🔥 OBTENER RECEPTOR
    # =========================================
    receiver_id = (
        conversation.user_two_id
        if conversation.user_one_id == message.sender_id
        else conversation.user_one_id
    )

    # =========================================
    # 🔥 CREAR NOTIFICACIÓN
    # =========================================
    sender = db.query(User).filter(
        User.id == message.sender_id
    ).first()

    notification = Notification(
        user_id=receiver_id,
        text=f"{sender.name} te envió un mensaje 💬"
    )

    db.add(notification)

    # =========================================
    # 🔥 GUARDAR TODO
    # =========================================
    db.commit()

    db.refresh(new_message)

    return new_message


# ==============================
# 🔥 OBTENER MENSAJES
# ==============================
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
            "sender_name": user.name if user else "Usuario",
            "created_at": msg.created_at,
            "is_read": msg.is_read
        })

    return result


# ==============================
# 🔥 MARCAR MENSAJES LEÍDOS
# ==============================
@router.put("/messages/read/{conversation_id}/{user_id}")
def mark_as_read(
    conversation_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):

    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.sender_id != user_id,
        Message.is_read == False
    ).all()

    for msg in messages:
        msg.is_read = True

    db.commit()

    return {
        "message": "Mensajes leídos"
    }