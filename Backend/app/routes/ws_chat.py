"""
Chat en tiempo real vía WebSocket.

Reemplaza el polling que hacía Chat.jsx (pedía GET /messages/{id} cada
1 segundo, sin importar si había mensajes nuevos o no -- el peor caso
de polling agresivo que encontramos en la auditoría). Con WebSocket,
el mensaje se empuja al instante a quien esté conectado a esa
conversación, sin pedir nada de forma repetida.

Los endpoints REST existentes (GET /messages/{id} para el historial al
entrar al chat, POST /messages como respaldo) se mantienen intactos --
este WebSocket solo se encarga de la entrega en tiempo real de
mensajes nuevos mientras el chat está abierto.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from jose import JWTError

from app.database import SessionLocal
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.notification import Notification
from app.utils.jwt_handler import decode_access_token

router = APIRouter()


class ConnectionManager:

    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, conversation_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(conversation_id, []).append(websocket)

    def disconnect(self, conversation_id: int, websocket: WebSocket):
        connections = self.active_connections.get(conversation_id, [])

        if websocket in connections:
            connections.remove(websocket)

        if not connections and conversation_id in self.active_connections:
            del self.active_connections[conversation_id]

    async def broadcast(self, conversation_id: int, message: dict):
        for connection in list(self.active_connections.get(conversation_id, [])):
            try:
                await connection.send_json(message)
            except Exception:
                pass


manager = ConnectionManager()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.websocket("/ws/chat/{conversation_id}")
async def chat_websocket(
    websocket: WebSocket,
    conversation_id: int,
    token: str = Query(..., description="JWT igual al que usa el resto de la API"),
):
    

    db: Session = SessionLocal()

    try:
        # 🔒 autenticar
        try:
            payload = decode_access_token(token)
            user_id = int(payload.get("sub"))
        except (JWTError, TypeError, ValueError):
            await websocket.close(code=4401)
            return

        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            await websocket.close(code=4401)
            return

        # 🔒 el usuario debe ser participante real de esta conversación
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()

        if not conversation or user.id not in (
            conversation.user_one_id,
            conversation.user_two_id,
        ):
            await websocket.close(code=4403)
            return

        await manager.connect(conversation_id, websocket)

        try:
            while True:
                data = await websocket.receive_json()

                text = (data.get("text") or "").strip()

                if not text:
                    continue

                # Mismo límite razonable que tendría el endpoint REST
                text = text[:2000]

                new_message = Message(
                    conversation_id=conversation_id,
                    sender_id=user.id,
                    text=text,
                    is_read=False,
                )

                db.add(new_message)

                conversation.last_message = text

                receiver_id = (
                    conversation.user_two_id
                    if conversation.user_one_id == user.id
                    else conversation.user_one_id
                )

                notification = Notification(
                    user_id=receiver_id,
                    text=f"{user.name} te envió un mensaje 💬",
                )

                db.add(notification)

                db.commit()
                db.refresh(new_message)

                payload_out = {
                    "id": new_message.id,
                    "conversation_id": conversation_id,
                    "sender_id": user.id,
                    "sender_name": user.name,
                    "text": new_message.text,
                    "created_at": new_message.created_at.isoformat(),
                    "is_read": new_message.is_read,
                }

                await manager.broadcast(conversation_id, payload_out)

        except WebSocketDisconnect:
            manager.disconnect(conversation_id, websocket)

    finally:
        db.close()