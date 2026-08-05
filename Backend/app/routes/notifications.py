from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal

from app.models.notification import Notification

from app.schemas.notification import NotificationCreate

router = APIRouter()


# DB
def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ====================================
# 🔥 CREAR NOTIFICACIÓN
# ====================================
@router.post("/notifications")
def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db)
):

    new_notification = Notification(
        user_id=notification.user_id,
        text=notification.text
    )

    db.add(new_notification)

    db.commit()

    db.refresh(new_notification)

    return new_notification


# ====================================
# 🔥 OBTENER NOTIFICACIONES
# ====================================
@router.get("/notifications/{user_id}")
def get_notifications(
    user_id: int,
    db: Session = Depends(get_db)
):

    notifications = db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(
        Notification.created_at.desc()
    ).all()

    return notifications


# ====================================
# 🔥 MARCAR LEÍDA
# ====================================
@router.put("/notifications/read/{notification_id}")
def read_notification(
    notification_id: int,
    db: Session = Depends(get_db)
):

    notification = db.query(Notification).filter(
        Notification.id == notification_id
    ).first()

    if notification:

        notification.is_read = True

        db.commit()

    return {
        "message": "Notificación actualizada"
    }


# ====================================
# 🔥 CONTADOR
# ====================================
@router.get("/notifications/unread/{user_id}")
def unread_notifications(
    user_id: int,
    db: Session = Depends(get_db)
):

    count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()

    return {
        "unread": count
    }
    
@router.put("/notifications/read-all/{user_id}")
def read_all_notifications(
    user_id: int,
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(
        Notification.user_id == user_id
    ).update(
        {"is_read": True}
    )

    db.commit()

    return {"message": "Todas leídas"}