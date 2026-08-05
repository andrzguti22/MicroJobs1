from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String)

    email = Column(String, unique=True, index=True)

    password = Column(String)

    role = Column(String, default="user")

    city = Column(String, nullable=True)

    phone = Column(String, nullable=True)

    experience = Column(String, nullable=True)

    bio = Column(String, nullable=True)

    skills = Column(String, nullable=True)
    
    profile_image = Column(String, nullable=True)

    # 🔥 recuperación de contraseña
    reset_token = Column(String, nullable=True, index=True)

    reset_token_expires = Column(DateTime(timezone=True), nullable=True)

    # 🔥 trabajos creados
    jobs_created = relationship(
        "Job",
        foreign_keys="Job.owner_id",
        back_populates="owner"
    )

    # 🔥 trabajos asignados
    assigned_jobs = relationship(
        "Job",
        foreign_keys="Job.assigned_to_id",
        back_populates="assigned_user"
    )

    # 🔥 postulaciones
    applications = relationship(
        "Application",
        back_populates="applicant"
    )
    
        # 🔥 reseñas escritas
    reviews_written = relationship(
        "Review",
        foreign_keys="Review.reviewer_id",
        back_populates="reviewer"
    )

    # 🔥 reseñas recibidas
    reviews_received = relationship(
        "Review",
        foreign_keys="Review.reviewed_user_id",
        back_populates="reviewed_user"
    )

    # 🔥 portafolio de imágenes (trabajos realizados)
    portfolio_images = relationship(
        "PortfolioImage",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    