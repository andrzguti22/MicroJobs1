from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import SessionLocal

from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User
from app.models.notification import Notification

from app.schemas.message import MessageCreate
from app.schemas.conversation import ConversationCreate
from app.dependencies import get_current_user

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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # 🔥 validar usuarios
    if conversation.user_one_id is None:
        raise HTTPException(400, "user_one_id es requerido")

    if conversation.user_two_id is None:
        raise HTTPException(400, "user_two_id es requerido")

    if current_user.id not in (conversation.user_one_id, conversation.user_two_id):
        raise HTTPException(403, "No puedes crear una conversación en la que no participas")

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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(403, "No puedes ver las conversaciones de otro usuario")

    conversations = db.query(Conversation).filter(
        (Conversation.user_one_id == user_id)
        |
        (Conversation.user_two_id == user_id)
    ).all()

    conversation_ids = [c.id for c in conversations]

    # Antes: por cada conversación se hacían 3 queries (otro usuario,
    # último mensaje, mensajes sin leer) -> 3N+1 en total. Ahora: 3
    # queries agregadas en total, sin importar cuántas conversaciones haya.

    # 🔥 otros usuarios (batch)
    other_user_ids = {
        (convo.user_two_id if convo.user_one_id == user_id else convo.user_one_id)
        for convo in conversations
    }

    other_users = {
        u.id: u
        for u in db.query(User).filter(User.id.in_(other_user_ids)).all()
    } if other_user_ids else {}

    # 🔥 último mensaje de cada conversación (1 query con DISTINCT ON)
    last_messages = {}
    if conversation_ids:
        last_messages_query = (
            db.query(Message)
            .filter(Message.conversation_id.in_(conversation_ids))
            .order_by(Message.conversation_id, Message.created_at.desc())
            .distinct(Message.conversation_id)
            .all()
        )
        last_messages = {m.conversation_id: m for m in last_messages_query}

    # 🔥 mensajes sin leer por conversación (1 query agrupada)
    unread_counts = {}
    if conversation_ids:
        unread_query = (
            db.query(Message.conversation_id, func.count(Message.id))
            .filter(
                Message.conversation_id.in_(conversation_ids),
                Message.sender_id != user_id,
                Message.is_read == False,
            )
            .group_by(Message.conversation_id)
            .all()
        )
        unread_counts = dict(unread_query)

    result = []

    for convo in conversations:

        other_user_id = (
            convo.user_two_id
            if convo.user_one_id == user_id
            else convo.user_one_id
        )

        other_user = other_users.get(other_user_id)

        last_message = last_messages.get(convo.id)

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

            "unread_count": unread_counts.get(convo.id, 0),

            "other_user": {
                "id": other_user.id,
                "name": other_user.name,
                "email": other_user.email
            } if other_user else None

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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # 🔥 validar conversación
    conversation = db.query(Conversation).filter(
        Conversation.id == message.conversation_id
    ).first()

    if not conversation:
        raise HTTPException(404, "Conversación no encontrada")

    if current_user.id not in (conversation.user_one_id, conversation.user_two_id):
        raise HTTPException(403, "No participas en esta conversación")

    # =========================================
    # 🔥 CREAR MENSAJE
    # =========================================
    new_message = Message(
        conversation_id=message.conversation_id,
        sender_id=current_user.id,
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
        if conversation.user_one_id == current_user.id
        else conversation.user_one_id
    )

    # =========================================
    # 🔥 CREAR NOTIFICACIÓN
    # =========================================
    notification = Notification(
        user_id=receiver_id,
        text=f"{current_user.name} te envió un mensaje 💬"
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()

    if not conversation:
        raise HTTPException(404, "Conversación no encontrada")

    if current_user.id not in (conversation.user_one_id, conversation.user_two_id) and current_user.role != "admin":
        raise HTTPException(403, "No participas en esta conversación")

    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc()).all()

    # Antes: 1 query por mensaje para buscar el nombre del remitente (N+1).
    # Con historiales largos esto se nota mucho. Ahora: 1 sola query trae
    # a todos los remitentes distintos del hilo completo.
    sender_ids = {msg.sender_id for msg in messages}

    senders = {
        u.id: u
        for u in db.query(User).filter(User.id.in_(sender_ids)).all()
    } if sender_ids else {}

    result = []

    for msg in messages:

        sender = senders.get(msg.sender_id)

        result.append({
            "id": msg.id,
            "text": msg.text,
            "sender_id": msg.sender_id,
            "sender_name": sender.name if sender else "Usuario",
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(403, "No puedes marcar como leídos los mensajes de otro usuario")

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