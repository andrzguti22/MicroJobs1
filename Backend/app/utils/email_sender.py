import os
import smtplib
import socket
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "MicroJobs")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USER)


def _create_ipv4_connection(address, timeout, source_address=None):
    """
    Reemplazo de socket.create_connection que fuerza IPv4.

    Algunos proveedores (Render incluido) resuelven smtp.gmail.com a una
    direccion IPv6 sin tener salida IPv6 configurada, lo que produce
    "Network is unreachable" al conectar. Forzamos AF_INET para evitar
    ese problema.
    """
    host, port = address

    err = None
    for res in socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM):
        family, socktype, proto, _, sockaddr = res

        sock = None
        try:
            sock = socket.socket(family, socktype, proto)
            sock.settimeout(timeout)

            if source_address:
                sock.bind(source_address)

            sock.connect(sockaddr)

            return sock
        except OSError as exc:
            err = exc

            if sock is not None:
                sock.close()

    if err is not None:
        raise err

    raise OSError("No se pudo resolver una direccion IPv4 para el host SMTP")


class _IPv4SMTP(smtplib.SMTP):
    """SMTP que siempre conecta usando IPv4."""

    def _get_socket(self, host, port, timeout):
        if timeout is not None and not timeout:
            raise ValueError("El timeout no puede ser 0")

        return _create_ipv4_connection((host, port), timeout, self.source_address)


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """
    Envía un correo HTML usando las credenciales SMTP configuradas
    en el archivo .env. Retorna True si se envió correctamente.
    """

    if not SMTP_USER or not SMTP_PASSWORD:
        print(
            "⚠️  SMTP no configurado. Define SMTP_USER y SMTP_PASSWORD en el archivo .env "
            "para poder enviar correos reales. Correo NO enviado a:", to_email
        )
        return False

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
    message["To"] = to_email

    message.attach(MIMEText(html_body, "html"))

    try:
        context = ssl.create_default_context()

        with _IPv4SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.starttls(context=context)
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM_EMAIL, to_email, message.as_string())

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