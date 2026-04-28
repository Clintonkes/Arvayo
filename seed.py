#!/usr/bin/env python3
"""Seed the database with initial admin user and services."""
import asyncio
import json
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.asyncio import async_sessionmaker
from app.models.models import Base, Service, AdminUser
from app.utils.auth import get_password_hash
from app.config import settings


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
        "description": "Our deep cleaning service goes beyond the surface to tackle built-up dirt, grime, and hard-to-reach areas. Ideal for spring cleaning, post-renovation, or homes that haven't been professionally cleaned recently. Every corner gets attention.",
        "price": 220.00,
        "duration_minutes": 270,
        "icon": "sparkles",
        "features": json.dumps(["Everything in Standard", "Inside oven & fridge", "Baseboards & window sills", "Light fixtures & fans", "Grout scrubbing", "Behind furniture"]),
    },
    {
        "name": "Move-In / Move-Out Cleaning",
        "short_description": "Leave the old place spotless or start fresh in your new home.",
        "description": "Moving is stressful enough – let us handle the cleaning. Our move-in/move-out service ensures you get your security deposit back or walk into a pristine new home. We clean every inch from top to bottom, including inside cabinets and appliances.",
        "price": 280.00,
        "duration_minutes": 330,
        "icon": "truck",
        "features": json.dumps(["Full deep clean", "Inside all cabinets", "Appliance interiors", "Window cleaning", "Garage sweep", "Pressure wash patio"]),
    },
    {
        "name": "Commercial Office Cleaning",
        "short_description": "Professional office cleaning for a productive work environment.",
        "description": "Maintain a clean, professional workspace that impresses clients and boosts employee productivity. Our commercial cleaning team is trained for office environments, handling workstations, conference rooms, restrooms, and common areas efficiently.",
        "price": 180.00,
        "duration_minutes": 240,
        "icon": "building-2",
        "features": json.dumps(["Workstation sanitizing", "Conference room cleaning", "Restroom deep clean", "Kitchen/break room", "Floor care", "Trash & recycling"]),
    },
    {
        "name": "Post-Construction Cleaning",
        "short_description": "Remove construction dust, debris, and residue completely.",
        "description": "After construction or renovation, a specialized cleaning is essential. Our post-construction team removes concrete dust, paint drips, adhesive residue, and debris from every surface. We make your newly renovated space move-in ready.",
        "price": 350.00,
        "duration_minutes": 420,
        "icon": "hard-hat",
        "features": json.dumps(["Debris removal", "Dust elimination", "Paint & adhesive removal", "Window frame cleaning", "Vent cleaning", "Final polish & shine"]),
    },
    {
        "name": "Window Cleaning",
        "short_description": "Crystal clear windows inside and out for a brighter home.",
        "description": "Let the light in with our professional window cleaning service. Using streak-free solutions and professional squeegees, we clean interior and exterior windows, tracks, sills, and screens to leave them sparkling clean.",
        "price": 95.00,
        "duration_minutes": 90,
        "icon": "sun",
        "features": json.dumps(["Interior & exterior", "Streak-free finish", "Window tracks & sills", "Screen cleaning", "Frame wipe-down", "Up to 2-story homes"]),
    },
]


async def seed():
    engine = create_async_engine(settings.database_url, echo=True)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("✓ Tables created")

    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        from sqlalchemy import select

        # Admin user
        existing_admin = await session.execute(
            select(AdminUser).where(AdminUser.email == "admin@arvayollc.com")
        )
        if not existing_admin.scalar_one_or_none():
            admin = AdminUser(
                email="admin@arvayollc.com",
                hashed_password=get_password_hash("Arvayo2026!"),
                full_name="Arvayo Admin",
                is_active=True,
            )
            session.add(admin)
            print("✓ Admin user created: admin@arvayollc.com / Arvayo2026!")
        else:
            print("  Admin user already exists, skipping.")

        # Services
        existing_svcs = await session.execute(select(Service))
        if not existing_svcs.scalars().first():
            for svc_data in SERVICES:
                session.add(Service(**svc_data))
            print(f"✓ {len(SERVICES)} services seeded")
        else:
            print("  Services already exist, skipping.")

        await session.commit()

    await engine.dispose()
    print("\n🎉 Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
