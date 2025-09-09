from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from sqlalchemy.orm import declarative_base, DeclarativeBase
from sqlalchemy.ext.asyncio import async_sessionmaker

from config import settings


class Base(DeclarativeBase):
    pass
engine = create_async_engine(settings.database_url, echo=settings.debug)
AsyncSessionLocal = async_sessionmaker(
    bind=engine, expire_on_commit=False, class_=AsyncSession
)

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    price = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    stock = Column(Integer, default=0)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
