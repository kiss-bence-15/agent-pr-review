import React, { useState, useEffect } from 'react';
import ProductGrid from './components/ProductGrid';
import ProductDialog from './components/ProductDialog';
import EditProductDialog from './components/EditProductDialog';
import DeleteDialog from './components/DeleteDialog';
import ProductDetailsDialog from './components/ProductDetailsDialog';
import SearchBar from './components/SearchBar';
import AddButton from './components/AddButton';

export default function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch('/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);

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
    } catch (e) {
      alert('Failed to update product.');
    }
  };

  const handleDelete = (id) => {
    fetch(`/products/${id}`, { method: 'DELETE' })
      .then(() => setProducts(products.filter(p => p.id !== id)));
    setShowDelete(false);
  };

  const filtered = products.filter(p =>
    (p.name ? p.name.toLowerCase() : '').includes(search.toLowerCase())
  );

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
