from contextlib import asynccontextmanager
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from config import settings
from database import Product, Cart, CartItem, create_tables, get_db

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
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    price: float
    description: str | None = None
    stock: int

# --- Cart Data ---
class CartItemRequest(BaseModel):
    product_id: int
    quantity: int

class CartItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    product_id: int
    quantity: int
    product: ProductResponse

class CartResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    items: List[CartItemResponse]

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

# --- Cart Endpoints ---
@app.get("/cart", response_model=CartResponse)
async def get_cart(db: AsyncSession = Depends(get_db)):
    """Get the cart with all its items"""
    result = await db.execute(
        select(Cart)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
        .order_by(Cart.id.asc())
        .limit(1)
    )
    cart = result.scalar_one_or_none()
    
    if not cart:
        # If no cart exists, create one
        cart = Cart()
        db.add(cart)
        await db.commit()
        await db.refresh(cart)
    
    return cart

@app.post("/cart/items", response_model=CartResponse)
async def add_to_cart(item: CartItemRequest, db: AsyncSession = Depends(get_db)):
    try:
        # Get or create the cart with explicit loading of relationships
        result = await db.execute(
            select(Cart)
            .options(selectinload(Cart.items).selectinload(CartItem.product))
            .order_by(Cart.id.asc())
            .limit(1)
        )
        cart = result.scalar_one_or_none()
        
        if not cart:
            cart = Cart()
            db.add(cart)
            await db.commit()
            await db.refresh(cart)

        # Check if product exists and has enough stock
        product_result = await db.execute(
            select(Product).filter(Product.id == item.product_id)
        )
        product = product_result.scalar_one_or_none()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail="Not enough stock available")

        # Check if item already exists in cart
        existing_item_result = await db.execute(
            select(CartItem).filter(
                CartItem.cart_id == cart.id,
                CartItem.product_id == item.product_id
            )
        )
        existing_item = existing_item_result.scalar_one_or_none()

        if existing_item:
            if product.stock < (existing_item.quantity + item.quantity):
                raise HTTPException(status_code=400, detail="Not enough stock available")
            existing_item.quantity = existing_item.quantity + item.quantity
        else:
            cart_item = CartItem(
                cart_id=cart.id,
                product_id=item.product_id,
                quantity=item.quantity
            )
            db.add(cart_item)

        # Update product stock
        product.stock = product.stock - item.quantity
        
        # Commit all changes in one transaction
        await db.commit()

        # Refresh cart with all relationships to get updated state
        await db.refresh(cart)
        await db.refresh(cart, ["items"])  # Refresh items relationship explicitly
        
        # Reload cart with all relationships to ensure we have the latest state
        result = await db.execute(
            select(Cart)
            .options(selectinload(Cart.items).selectinload(CartItem.product))
            .filter(Cart.id == cart.id)
        )
        updated_cart = result.scalar_one()
        return updated_cart

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/cart/items/{item_id}", response_model=CartResponse)
async def remove_from_cart(item_id: int, db: AsyncSession = Depends(get_db)):
    # Get cart with its items
    result = await db.execute(
        select(Cart)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
        .order_by(Cart.id.asc())
        .limit(1)
    )
    cart = result.scalar_one_or_none()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    # Get cart item
    cart_item_result = await db.execute(select(CartItem).filter(CartItem.id == item_id))
    cart_item = cart_item_result.scalar_one_or_none()
    if not cart_item or cart_item.cart_id != cart.id:
        raise HTTPException(status_code=404, detail="Cart item not found")

    # Get product and restore stock
    product_result = await db.execute(select(Product).filter(Product.id == cart_item.product_id))
    product = product_result.scalar_one_or_none()
    if product:
        product.stock = product.stock + cart_item.quantity

    await db.delete(cart_item)
    await db.commit()
    await db.refresh(cart)
    return cart

@app.put("/cart/items/{item_id}", response_model=CartResponse)
async def update_cart_item(
    item_id: int, 
    item: CartItemRequest, 
    db: AsyncSession = Depends(get_db)
):
    try:
        # Get cart with its items
        result = await db.execute(
            select(Cart)
            .options(selectinload(Cart.items).selectinload(CartItem.product))
            .order_by(Cart.id.asc())
            .limit(1)
        )
        cart = result.scalar_one_or_none()
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")

        # Get cart item with product relationship
        cart_item_result = await db.execute(
            select(CartItem)
            .options(selectinload(CartItem.product))
            .filter(CartItem.id == item_id)
        )
        cart_item = cart_item_result.scalar_one_or_none()
        if not cart_item or cart_item.cart_id != cart.id:
            raise HTTPException(status_code=404, detail="Cart item not found")

        # Get product
        product_result = await db.execute(
            select(Product).filter(Product.id == cart_item.product_id)
        )
        product = product_result.scalar_one_or_none()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # Validate the product_id matches
        if item.product_id != cart_item.product_id:
            raise HTTPException(status_code=400, detail="Cannot change product_id of cart item")

        # Calculate stock change
        stock_change = item.quantity - cart_item.quantity
        if stock_change > 0 and product.stock < stock_change:
            raise HTTPException(status_code=400, detail="Not enough stock available")

        # Update product stock and cart item quantity
        product.stock = product.stock - stock_change
        cart_item.quantity = item.quantity

        # Commit changes
        await db.commit()

        # Refresh relationships
        await db.refresh(cart)
        await db.refresh(cart, ["items"])

        # Reload cart with all relationships to ensure we have the latest state
        result = await db.execute(
            select(Cart)
            .options(selectinload(Cart.items).selectinload(CartItem.product))
            .filter(Cart.id == cart.id)
        )
        updated_cart = result.scalar_one()
        
        return updated_cart

    except Exception as e:
        await db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
