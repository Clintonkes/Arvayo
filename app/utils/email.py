import ssl
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
from app.models.models import Order

TEMPLATES_DIR = Path(__file__).parent.parent / "templates"
jinja_env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)), autoescape=True)


async def send_booking_confirmation(order: Order) -> None:
    try:
        template = jinja_env.get_template("email_confirmation.html")
        html_content = template.render(
            order=order,
            service=order.service,
            company_name=settings.company_name,
            company_phone=settings.company_phone,
            company_email=settings.company_email,
            frontend_url=settings.frontend_url,
        )

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Booking Confirmation – {order.order_number} | Arvayo LLC"
        msg["From"] = f"{settings.from_name} <{settings.from_email}>"
        msg["To"] = order.customer_email

        msg.attach(MIMEText(html_content, "html"))

        await aiosmtplib.send(
            msg,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_username,
            password=settings.smtp_password,
            start_tls=True,
        )
    except Exception as exc:
        # Log but don't crash the booking flow
        print(f"[EMAIL] Failed to send confirmation to {order.customer_email}: {exc}")
