import os

import httpx
from dotenv import load_dotenv

load_dotenv()


# RESEND_API_KEY.
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_API_URL = "https://api.resend.com/emails"

EMAIL_FROM_NAME = os.getenv("EMAIL_FROM_NAME", "MicroJobs")
EMAIL_FROM_ADDRESS = os.getenv("EMAIL_FROM_ADDRESS", "onboarding@resend.dev")


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """
    Envía un correo HTML usando la API de Resend.
    Retorna True si se envió correctamente.
    """

    if not RESEND_API_KEY:
        print(
            "⚠️  Resend no configurado. Define RESEND_API_KEY en las variables de "
            "entorno para poder enviar correos reales. Correo NO enviado a:", to_email
        )
        return False

    payload = {
        "from": f"{EMAIL_FROM_NAME} <{EMAIL_FROM_ADDRESS}>",
        "to": [to_email],
        "subject": subject,
        "html": html_body,
    }

    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        response = httpx.post(
            RESEND_API_URL, json=payload, headers=headers, timeout=10
        )

        if response.status_code >= 400:
            print(
                "❌ Error enviando el correo:",
                response.status_code,
                response.text,
            )
            return False

        return True

    except Exception as e:
        print("❌ Error enviando el correo:", e)
        return False


def send_password_reset_email(to_email: str, name: str, reset_link: str) -> bool:
    subject = "Recupera tu contraseña - MicroJobs"

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="color: #4f46e5;">MicroJobs</h2>
        <p>Hola {name or ''},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva contraseña:</p>
        <p style="text-align: center; margin: 32px 0;">
            <a href="{reset_link}"
               style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
               Restablecer contraseña
            </a>
        </p>
        <p>Este enlace es válido durante 30 minutos. Si no solicitaste este cambio, puedes ignorar este correo.</p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br>{reset_link}</p>
    </div>
    """

    return send_email(to_email, subject, html_body)


def send_verification_email(to_email: str, name: str, verify_link: str) -> bool:
    subject = "Confirma tu correo - MicroJobs"

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="color: #4f46e5;">MicroJobs</h2>
        <p>Hola {name or ''},</p>
        <p>Gracias por registrarte. Confirma tu correo electrónico para activar todas las funciones de tu cuenta:</p>
        <p style="text-align: center; margin: 32px 0;">
            <a href="{verify_link}"
               style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
               Confirmar mi correo
            </a>
        </p>
        <p>Este enlace es válido durante 24 horas. Si tú no creaste esta cuenta, puedes ignorar este correo.</p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br>{verify_link}</p>
    </div>
    """

    return send_email(to_email, subject, html_body)