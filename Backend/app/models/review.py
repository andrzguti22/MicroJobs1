from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import CheckConstraint
from sqlalchemy import UniqueConstraint

from sqlalchemy.sql import func

from sqlalchemy.orm import relationship

from app.database import Base


class Review(Base):

    __tablename__ = "reviews"

    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5", name="ck_review_rating_range"),
        # Un mismo usuario no puede calificar el mismo trabajo dos veces
        UniqueConstraint("job_id", "reviewer_id", name="uq_review_job_reviewer"),
    )

    id = Column(Integer, primary_key=True)

    job_id = Column(
        Integer,
        ForeignKey("jobs.id", ondelete="CASCADE")
    )

    reviewer_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    reviewed_user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    rating = Column(Integer)

    comment = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    reviewer = relationship(
        "User",
        foreign_keys=[reviewer_id],
        back_populates="reviews_written"
    )

    reviewed_user = relationship(
        "User",
        foreign_keys=[reviewed_user_id],
        back_populates="reviews_received"
    )