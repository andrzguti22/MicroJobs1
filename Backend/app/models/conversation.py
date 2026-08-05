from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Conversation(Base):

    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)

    job_id = Column(
        Integer,
        ForeignKey("jobs.id", ondelete="CASCADE")
    )

    user_one_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE")
    )

    user_two_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE")
    )

    last_message = Column(Text, nullable=True)

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )