"""
Script para convertir un usuario existente en administrador.

Uso:
    cd Backend
    python create_admin.py correo@ejemplo.com

El usuario debe haberse registrado previamente desde la aplicación
(con /register). Este script solo actualiza su rol a "admin".
"""

import sys

from app.database import SessionLocal
from app.models.user import User


def make_admin(email: str):
    db = SessionLocal()

    try:
        user = db.query(User).filter(User.email == email.lower()).first()

        if not user:
            print(f"❌ No se encontró ningún usuario con el correo: {email}")
            return

        if user.role == "admin":
            print(f"ℹ️  {user.name} ({user.email}) ya es administrador.")
            return

        user.role = "admin"
        db.commit()

        print(f"✅ {user.name} ({user.email}) ahora es administrador.")

    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python create_admin.py correo@ejemplo.com")
        sys.exit(1)

    make_admin(sys.argv[1])
