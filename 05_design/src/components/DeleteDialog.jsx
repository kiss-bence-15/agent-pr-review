import React from 'react';
import { DeleteIcon } from './icons.jsx';

export default function DeleteDialog({ product, onClose, onDelete }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 relative">
        <button className="absolute top-4 right-4 text-[#D4183D] hover:text-red-700" onClick={onDelete} title="Delete">
          <DeleteIcon />
        </button>
        <h2 className="text-lg font-semibold mb-6 text-black">Delete Product</h2>
        <p className="mb-6 text-gray-600">Are you sure you want to delete "{product.name}"? This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded-md border border-gray-200 text-black bg-white hover:bg-gray-100" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700" onClick={onDelete}>Delete Product</button>
        </div>
      </div>
    </div>
  );
}
