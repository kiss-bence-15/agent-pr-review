import React, { useState } from 'react';

export default function EditProductDialog({ product, onClose, onSave }) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [stock, setStock] = useState(product.stock);
  const [price, setPrice] = useState(product.price);

  const handleSubmit = e => {
    e.preventDefault();
    onSave({ ...product, name, description, stock: Number(stock), price: Number(price) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-black" onClick={onClose}>
          <span className="sr-only">Close</span>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h2 className="text-lg font-semibold mb-6 text-black">Edit Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Product Name</label>
            <input className="w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Description</label>
            <textarea className="w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} required />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-black mb-1">Price ($)</label>
              <input type="text" className="w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2" value={price} onChange={e => setPrice(e.target.value)} required />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-black mb-1">Stock</label>
              <input type="text" className="w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2" value={stock} onChange={e => setStock(e.target.value)} required />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" className="px-4 py-2 rounded-md border border-gray-200 text-black bg-white hover:bg-gray-100" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-black text-white font-medium hover:bg-gray-900">Update Product</button>
          </div>
        </form>
      </div>
    </div>
  );
}
