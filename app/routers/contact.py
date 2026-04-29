from fastapi import APIRouter, BackgroundTasks
from app.schemas.schemas import ContactInquiry
from app.utils.email import send_contact_confirmation, send_contact_admin_notification

router = APIRouter(prefix="/api/contact", tags=["Contact"])


@router.post("", status_code=202)
async def submit_contact(
    data: ContactInquiry,
    background_tasks: BackgroundTasks,
):
    """
    Public endpoint for the customer-facing contact form.
    Fires two emails as background tasks:
    - Confirmation to the customer (immediately acknowledges receipt)
    - Notification to the Arvayo admin inbox
    """
    background_tasks.add_task(
        send_contact_confirmation,
        name=data.name,
        email=data.email,
        subject=data.subject,
        message=data.message,
    )
    background_tasks.add_task(
        send_contact_admin_notification,
        name=data.name,
        email=data.email,
        phone=data.phone,
        subject=data.subject,
        message=data.message,
    )
    return {"message": "Enquiry received. We'll be in touch within 24 hours."}
