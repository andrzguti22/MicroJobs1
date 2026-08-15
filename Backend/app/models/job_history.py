from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class JobHistory(Base):
    __tablename__ = "job_history"

    id = Column(Integer, primary_key=True, index=True)

    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)

    employer_id = Column(Integer)
    worker_id = Column(Integer)

    title = Column(String)
    location = Column(String)

    finished_at = Column(DateTime(timezone=True), server_default=func.now())