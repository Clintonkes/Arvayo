from pathlib import Path
from jinja2 import Environment, FileSystemLoader
import httpx
from app.config import settings
from app.models.models import Order

TEMPLATES_DIR = Path(__file__).parent.parent / "templates"
jinja_env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)), autoescape=True)

RESEND_API = "https://api.resend.com/emails"


async def send_booking_confirmation(order: Order) -> None:
    if not settings.resend_api_key:
        print("[EMAIL] RESEND_API_KEY not configured — skipping confirmation email")
        return

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

        from_address = f"{settings.resend_from_name} <{settings.resend_from_email}>"

        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                RESEND_API,
                headers={
                    "Authorization": f"Bearer {settings.resend_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": from_address,
                    "to": [order.customer_email],
                    "subject": f"Booking Confirmed – {order.order_number} | Arvayo LLC",
                    "html": html_content,
                },
            )

        if response.status_code in (200, 201):
            print(f"[EMAIL] Confirmation sent → {order.customer_email} ({order.order_number})")
        else:
            print(f"[EMAIL] Resend {response.status_code}: {response.text}")

    except Exception as exc:
        # Never crash the booking flow over an email failure
        print(f"[EMAIL] Failed to send to {order.customer_email}: {exc}")
