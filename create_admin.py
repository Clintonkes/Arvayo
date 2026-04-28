#!/usr/bin/env python3
"""Script to create an admin account in the database."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import sessionmaker
from app.models.models import Base, AdminUser
from app.utils.auth import get_password_hash
from app.config import settings


async def create_admin():
    """Create an admin user in the database."""
    # Connect to the database
    engine = create_async_engine(settings.database_url, echo=True)
    
    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("✓ Tables verified/created")
    
    # Create session
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check if admin already exists
        existing_admin = await session.execute(
            select(AdminUser).where(AdminUser.email == "admin@arvayollc.com")
        )
        
        if existing_admin.scalar_one_or_none():
            print("ℹ Admin user already exists: admin@arvayollc.com")
            print("  Password: Arvayo2026!")
        else:
            # Create admin user
            admin = AdminUser(
                email="admin@arvayollc.com",
                hashed_password=get_password_hash("Arvayo2026!"),
                full_name="Arvayo Admin",
                is_active=True,
            )
            session.add(admin)
            await session.commit()
            print("✓ Admin user created successfully!")
            print("  Email: admin@arvayollc.com")
            print("  Password: Arvayo2026!")
            print("  Full Name: Arvayo Admin")
            print("  Active: True")
        
        # Check for existing admin users
        result = await session.execute(select(AdminUser))
        all_admins = result.scalars().all()
        print(f"\nTotal admin users in database: {len(all_admins)}")
        for admin in all_admins:
            print(f"  - {admin.email} ({'Active' if admin.is_active else 'Inactive'})")
    
    await engine.dispose()
    print("\n🎉 Done!")


if __name__ == "__main__":
    asyncio.run(create_admin())