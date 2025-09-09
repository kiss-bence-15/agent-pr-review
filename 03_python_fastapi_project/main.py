from contextlib import asynccontextmanager
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import Product, create_tables, get_db

# --- Product Data ---
class ProductCreateRequest(BaseModel):
    name: str
    price: float
    description: str | None = None
    stock: int

class ProductUpdateRequest(BaseModel):
    name: str | None = None
    price: float | None = None
    description: str | None = None
    stock: int | None = None

class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    description: str | None = None
    stock: int

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change ["*"] to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI Template"}


# --- Product Endpoints ---
@app.get("/products/", response_model=List[ProductResponse])
async def get_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product))
    products = result.scalars().all()
    return products

@app.get("/products/{product_id}", response_model=ProductResponse)
async def get_product_by_id(product_id: int, db: AsyncSession = Depends(get_db)):
    db_product = await db.get(Product, product_id)

    if not db_product:
        raise HTTPException(status_code=404, detail="Product not registered")
    
    return db_product

@app.post("/products/", response_model=ProductResponse)
async def create_product(product: ProductCreateRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).filter(Product.name == product.name))
    db_product = result.scalars().first()

    if db_product:
        raise HTTPException(status_code=400, detail="Product already registered")

    db_product = Product(name=product.name, price=product.price, description=product.description, stock=product.stock)
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product

@app.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, product: ProductUpdateRequest, db: AsyncSession = Depends(get_db)):
    db_product = await db.get(Product, product_id)

    if not db_product:
        raise HTTPException(status_code=404, detail="Product not registered")

    if product.name is not None:
        db_product.name = product.name  # type: ignore
    if product.price is not None:
        db_product.price = product.price  # type: ignore
    if product.description is not None:
        db_product.description = product.description  # type: ignore
    if product.stock is not None:
        db_product.stock = product.stock  # type: ignore

    await db.commit()
    await db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}", status_code=204)
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    db_product = await db.get(Product, product_id)

    if not db_product:
        raise HTTPException(status_code=404, detail="Product not registered")
    
    await db.delete(db_product)
    await db.commit()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
