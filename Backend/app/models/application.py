from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class Application(Base):

    __tablename__ = "applications"

    __table_args__ = (
        # Evita postulaciones duplicadas incluso bajo requests concurrentes
        # (antes solo se validaba en Python, con condición de carrera posible)
        UniqueConstraint("user_id", "job_id", name="uq_application_user_job"),
    )

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE")
    )

    job_id = Column(
        Integer,
        ForeignKey("jobs.id", ondelete="CASCADE")
    )

    status = Column(String, default="pending")

    applicant = relationship(
        "User",
        back_populates="applications"
    )

    job = relationship(
        "Job",
        back_populates="applications"
    )