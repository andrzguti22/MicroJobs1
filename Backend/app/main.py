from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine

# Cargar modelos
import app.models

# Rutas
from app.routes import (
    auth,
    jobs,
    users,
    chat,
    messages,
    conversations,
    applications,
    notifications,
    portfolio,
)

from app.routes.review import router as review_router


app = FastAPI(
    title="MicroJobs API",
    version="1.0.0"
)

# =====================================
# CORS
# =====================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================
# CREAR TABLAS
# =====================================
Base.metadata.create_all(bind=engine)

# =====================================
# ROUTERS
# =====================================
app.include_router(auth.router, prefix="/auth")

app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(users.router)
app.include_router(chat.router)
app.include_router(messages.router)
app.include_router(conversations.router)
app.include_router(notifications.router)
app.include_router(review_router)
app.include_router(portfolio.router)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")