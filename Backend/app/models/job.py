from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship


from app.database import Base


class Job(Base):

    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String)

    description = Column(String)

    location = Column(String)

    price = Column(Numeric(12, 2))

    status = Column(String, default="active")

    owner_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE")
    )

    assigned_to_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    owner = relationship(
        "User",
        foreign_keys=[owner_id],
        back_populates="jobs_created"
    )

    assigned_user = relationship(
        "User",
        foreign_keys=[assigned_to_id],
        back_populates="assigned_jobs"
    )

    applications = relationship(
        "Application",
        back_populates="job"
    )
    
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )