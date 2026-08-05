from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class PortfolioImage(Base):

    __tablename__ = "portfolio_images"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    image_path = Column(String, nullable=False)

    description = Column(String, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # 🔥 relación con el usuario dueño del trabajo
    user = relationship(
        "User",
        back_populates="portfolio_images"
    )
