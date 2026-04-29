from pathlib import Path
from jinja2 import Environment, FileSystemLoader
import httpx
from app.config import settings
from app.models.models import Order

TEMPLATES_DIR = Path(__file__).parent.parent / "templates"
jinja_env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)), autoescape=True)

RESEND_API = "https://api.resend.com/emails"


async def _send(to: str, subject: str, html: str) -> None:
    """Internal helper — all outbound emails go through here."""
    if not settings.resend_api_key:
        print(f"[EMAIL] RESEND_API_KEY not set — skipping '{subject}' to {to}")
        return
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                RESEND_API,
                headers={
                    "Authorization": f"Bearer {settings.resend_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": f"{settings.resend_from_name} <{settings.resend_from_email}>",
                    "to": [to],
                    "subject": subject,
                    "html": html,
                },
            )
        if response.status_code in (200, 201):
            print(f"[EMAIL] ✓ '{subject}' → {to}")
        else:
            print(f"[EMAIL] Resend {response.status_code}: {response.text}")
    except Exception as exc:
        print(f"[EMAIL] Failed to send '{subject}' → {to}: {exc}")


# ─── Booking confirmation ──────────────────────────────────────────────────────

async def send_booking_confirmation(order: Order) -> None:
    html = jinja_env.get_template("email_confirmation.html").render(
        order=order,
        service=order.service,
        company_name=settings.company_name,
        company_phone=settings.company_phone,
        company_email=settings.company_email,
        frontend_url=settings.frontend_url,
    )
    await _send(
        to=order.customer_email,
        subject=f"Booking Confirmed – {order.order_number} | Arvayo LLC",
        html=html,
    )


# ─── Order completed ──────────────────────────────────────────────────────────

async def send_order_completed(order: Order) -> None:
    html = jinja_env.get_template("order_completed.html").render(
        order=order,
        service=order.service,
        company_name=settings.company_name,
        company_phone=settings.company_phone,
        company_email=settings.company_email,
        frontend_url=settings.frontend_url,
    )
    await _send(
        to=order.customer_email,
        subject=f"Your Cleaning is Complete ✓ | Arvayo LLC",
        html=html,
    )


# ─── Contact form ─────────────────────────────────────────────────────────────

async def send_contact_confirmation(
    name: str, email: str, subject: str, message: str
) -> None:
    """Acknowledgement sent to the customer who submitted the enquiry."""
    html = jinja_env.get_template("contact_confirmation.html").render(
        name=name,
        subject=subject,
        message=message,
        company_name=settings.company_name,
        company_phone=settings.company_phone,
        company_email=settings.company_email,
    )
    await _send(
        to=email,
        subject=f"We've Received Your Enquiry – Arvayo LLC",
        html=html,
    )


async def send_contact_admin_notification(
    name: str, email: str, phone: str | None, subject: str, message: str
) -> None:
    """Alert sent to the Arvayo admin inbox for every new enquiry."""
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8fafc;">
      <div style="background:#0A2540;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h2 style="color:#00C4B4;margin:0;font-size:16px;">📬 New Customer Enquiry</h2>
      </div>
      <div style="background:#fff;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0;border-top:none;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#64748b;width:100px;font-weight:600;">From</td>
              <td style="padding:8px 0;color:#1e293b;">{name}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-weight:600;">Email</td>
              <td style="padding:8px 0;"><a href="mailto:{email}" style="color:#00C4B4;">{email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-weight:600;">Phone</td>
              <td style="padding:8px 0;color:#1e293b;">{phone or "Not provided"}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-weight:600;">Subject</td>
              <td style="padding:8px 0;color:#1e293b;font-weight:600;">{subject}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
        <p style="font-size:12px;color:#64748b;font-weight:600;margin-bottom:8px;">MESSAGE</p>
        <p style="color:#334155;font-size:14px;line-height:1.6;white-space:pre-wrap;">{message}</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
        <a href="mailto:{email}?subject=Re: {subject}"
           style="background:#00C4B4;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">
          Reply to {name} →
        </a>
      </div>
    </div>
    """
    await _send(
        to=settings.company_email,
        subject=f"[Enquiry] {subject} — from {name}",
        html=html,
    )
