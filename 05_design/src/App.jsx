import React, { useState, useEffect } from 'react';
import ProductGrid from './components/ProductGrid';
import ProductDialog from './components/ProductDialog';
import EditProductDialog from './components/EditProductDialog';
import DeleteDialog from './components/DeleteDialog';
import ProductDetailsDialog from './components/ProductDetailsDialog';
import SearchBar from './components/SearchBar';
import AddButton from './components/AddButton';
import Cart from './components/Cart';

export default function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Function to fetch products
    const fetchProducts = async () => {
      try {
        const res = await fetch('/products/');
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.detail || 'Failed to load products');
        }
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        alert(error.message || 'Failed to load products');
      }
    };
    
    // Initialize cart
    const initializeCart = async () => {
      try {
        const res = await fetch('/cart', {
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.detail || 'Failed to initialize cart');
        }
        
        const cartData = await res.json();
        setCart(cartData);
        setCartItems(cartData.items || []);
      } catch (error) {
        // Silent fail on cart initialization as it's not critical
      }
    };

    // Execute fetches
    fetchProducts();
    initializeCart();
  }, []);

  const refreshCart = async () => {
    try {
      const res = await fetch('/cart', { headers: { Accept: 'application/json' } });
      if (!res.ok) return;
      const cartData = await res.json();
      setCart(cartData);
      setCartItems(cartData.items || []);
    } catch (e) {
      // ignore
    }
  };

  const handleAdd = async (product) => {
    try {
      const res = await fetch('/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!res.ok) {
        let errMsg = 'Failed to add product.';
        try {
          const err = await res.json();
          errMsg = err.detail || JSON.stringify(err);
        } catch {}
        alert(errMsg);
        return;
      }
      const newProduct = await res.json();
      setProducts([...products, newProduct]);
      setShowAdd(false);
    } catch (e) {
      alert('Failed to add product.');
    }
  };

  const handleEdit = async (product) => {
    try {
      const res = await fetch(`/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!res.ok) {
        let errMsg = 'Failed to update product.';
        try {
          const err = await res.json();
          errMsg = err.detail || JSON.stringify(err);
        } catch {}
        alert(errMsg);
        return;
      }
      const updated = await res.json();
      setProducts(products.map(p => p.id === updated.id ? updated : p));
      setShowEdit(false);
      // Refresh cart to reflect updated product prices
      await refreshCart();
    } catch (e) {
      alert('Failed to update product.');
    }
  };

  const handleDelete = (id) => {
    fetch(`/products/${id}`, { method: 'DELETE' })
      .then(async () => {
        setProducts(products.filter(p => p.id !== id));
        // Refresh cart in case deleted product was in cart
        await refreshCart();
      });
    setShowDelete(false);
  };

  const filtered = products.filter(p =>
    (p.name ? p.name.toLowerCase() : '').includes(search.toLowerCase())
  );

  const handleAddToCart = async (product) => {
    if (product.stock <= 0) {
      alert('Product is out of stock');
      return;
    }

    try {
      const res = await fetch(`/cart/items`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Failed to add item to cart');
      }

      const updatedCart = await res.json();
      // Prefer to refresh cart from server to get canonical state
      await refreshCart();
      
      // Update product stock in the UI
      setProducts(prev =>
        prev.map(p =>
          p.id === product.id ? { ...p, stock: Math.max(0, p.stock - 1) } : p
        )
      );
    } catch (error) {
      alert(error.message || 'Failed to add item to cart');
    }
  };

  const handleUpdateCartItem = async (itemId, newQuantity) => {
    try {
      // Find the current cart item
      const cartItem = cartItems.find(item => item.id === itemId);
      if (!cartItem) {
        throw new Error('Cart item not found');
      }

      // Handle item removal
      if (newQuantity <= 0) {
        const res = await fetch(`/cart/items/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.detail || 'Failed to remove item from cart');
        }

        // Refresh cart from server to ensure UI matches backend
        await refreshCart();

        // Update product stock in the UI after successful removal
        setProducts(prev =>
          prev.map(p =>
            p.id === cartItem.product_id
              ? { ...p, stock: p.stock + cartItem.quantity }
              : p
          )
        );
        return;
      }

      // Handle quantity update
      const product = products.find(p => p.id === cartItem.product_id);
      if (!product) {
        throw new Error('Product not found');
      }

      const quantityDiff = newQuantity - cartItem.quantity;
      
      // Validate stock availability client-side
      if (quantityDiff > 0 && product.stock < quantityDiff) {
        throw new Error('Not enough stock available');
      }

      // Send update request
      const res = await fetch(`/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          product_id: cartItem.product_id,
          quantity: newQuantity
        })
      });

      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await res.json();
          throw new Error(error.detail || 'Failed to update item quantity');
        } else {
          throw new Error('Failed to update item quantity');
        }
      }

      // Prefer to refresh cart to get canonical state and updated product info
      await refreshCart();

      // Adjust product stock locally based on the requested change
      const actualQuantityDiff = newQuantity - cartItem.quantity;
      if (actualQuantityDiff !== 0) {
        setProducts(prev =>
          prev.map(p =>
            p.id === cartItem.product_id
              ? { ...p, stock: Math.max(0, p.stock - actualQuantityDiff) }
              : p
          )
        );
      }
    } catch (error) {
      alert(error.message || 'Failed to update cart item');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <div className="max-w-7xl w-full px-4 py-8">
        {/* Title */}
        <h1 className="text-[1.3rem] font-normal leading-tight mb-6 text-black">Product Management</h1>
        {/* Search/add bar aligned */}
        <div className="mb-8 flex flex-row items-center justify-between w-full">
          <div className="flex-1 min-w-0">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <div className="ml-4 flex-shrink-0">
            <AddButton onClick={() => setShowAdd(true)} />
          </div>
        </div>
        {/* Product grid */}
        <ProductGrid
          products={filtered}
          onView={p => { setSelected(p); setShowDetails(true); }}
          onEdit={p => { setSelected(p); setShowEdit(true); }}
          onDelete={p => { setSelected(p); setShowDelete(true); }}
          onAddToCart={handleAddToCart}
        />
        {/* Shopping Cart */}
        <Cart 
          items={cartItems} 
          onUpdateItem={handleUpdateCartItem} 
        />
      </div>
      {/* Dialogs */}
      {showAdd && <ProductDialog onClose={() => setShowAdd(false)} onSave={handleAdd} />}
      {showEdit && selected && <EditProductDialog product={selected} onClose={() => setShowEdit(false)} onSave={handleEdit} />}
      {showDelete && selected && <DeleteDialog product={selected} onClose={() => setShowDelete(false)} onDelete={() => handleDelete(selected.id)} />}
      {showDetails && selected && <ProductDetailsDialog product={selected} onClose={() => setShowDetails(false)} />}
    </div>
  );
}
