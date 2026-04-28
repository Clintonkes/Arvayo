"""Auto-seeds default admin and services if the database is empty."""
import json
from sqlalchemy import select, func
from app.database import AsyncSessionLocal
from app.models.models import Service, AdminUser
from app.utils.auth import get_password_hash

SERVICES = [
    {
        "name": "Standard House Cleaning",
        "short_description": "Regular maintenance cleaning to keep your home fresh and tidy.",
        "description": "Our standard house cleaning covers all the essentials to keep your home in top shape. Perfect for regular maintenance, this service includes dusting surfaces, vacuuming carpets, mopping floors, cleaning bathrooms, and wiping down kitchen counters and appliances.",
        "price": 120.00,
        "duration_minutes": 150,
        "icon": "home",
        "features": json.dumps(["Dusting all surfaces", "Vacuum & mop floors", "Clean bathrooms", "Wipe kitchen surfaces", "Empty trash bins", "Make beds"]),
    },
    {
        "name": "Deep Cleaning",
        "short_description": "Thorough top-to-bottom cleaning for a truly immaculate home.",
        "description": "Our deep cleaning service goes beyond the surface to tackle built-up dirt, grime, and hard-to-reach areas. Ideal for spring cleaning, post-renovation, or homes that haven't been professionally cleaned recently.",
        "price": 220.00,
        "duration_minutes": 270,
        "icon": "sparkles",
        "features": json.dumps(["Everything in Standard", "Inside oven & fridge", "Baseboards & window sills", "Light fixtures & fans", "Grout scrubbing", "Behind furniture"]),
    },
    {
        "name": "Move-In / Move-Out Cleaning",
        "short_description": "Leave the old place spotless or start fresh in your new home.",
        "description": "Moving is stressful enough – let us handle the cleaning. Our move-in/move-out service ensures you get your security deposit back or walk into a pristine new home.",
        "price": 280.00,
        "duration_minutes": 330,
        "icon": "truck",
        "features": json.dumps(["Full deep clean", "Inside all cabinets", "Appliance interiors", "Window cleaning", "Garage sweep", "Pressure wash patio"]),
    },
    {
        "name": "Commercial Office Cleaning",
        "short_description": "Professional office cleaning for a productive work environment.",
        "description": "Maintain a clean, professional workspace that impresses clients and boosts employee productivity. Our commercial cleaning team handles workstations, conference rooms, restrooms, and common areas.",
        "price": 180.00,
        "duration_minutes": 240,
        "icon": "building-2",
        "features": json.dumps(["Workstation sanitizing", "Conference room cleaning", "Restroom deep clean", "Kitchen/break room", "Floor care", "Trash & recycling"]),
    },
    {
        "name": "Post-Construction Cleaning",
        "short_description": "Remove construction dust, debris, and residue completely.",
        "description": "After construction or renovation, our post-construction team removes concrete dust, paint drips, adhesive residue, and debris from every surface.",
        "price": 350.00,
        "duration_minutes": 420,
        "icon": "hard-hat",
        "features": json.dumps(["Debris removal", "Dust elimination", "Paint & adhesive removal", "Window frame cleaning", "Vent cleaning", "Final polish & shine"]),
    },
    {
        "name": "Window Cleaning",
        "short_description": "Crystal clear windows inside and out for a brighter home.",
        "description": "Using streak-free solutions and professional squeegees, we clean interior and exterior windows, tracks, sills, and screens.",
        "price": 95.00,
        "duration_minutes": 90,
        "icon": "sun",
        "features": json.dumps(["Interior & exterior", "Streak-free finish", "Window tracks & sills", "Screen cleaning", "Frame wipe-down", "Up to 2-story homes"]),
    },
]


async def auto_seed() -> None:
    """Create default admin and services if the tables are empty."""
    async with AsyncSessionLocal() as session:
        # ── Admin ──────────────────────────────────────────────────────────
        admin_count = await session.scalar(select(func.count(AdminUser.id)))
        if not admin_count:
            session.add(AdminUser(
                email="admin@arvayollc.com",
                hashed_password=get_password_hash("Arvayo2026!"),
                full_name="Arvayo Admin",
                is_active=True,
            ))
            print("[SEED] Admin created  →  admin@arvayollc.com / Arvayo2026!")

        # ── Services ───────────────────────────────────────────────────────
        svc_count = await session.scalar(select(func.count(Service.id)))
        if not svc_count:
            for svc in SERVICES:
                session.add(Service(**svc))
            print(f"[SEED] {len(SERVICES)} services created")

        await session.commit()
