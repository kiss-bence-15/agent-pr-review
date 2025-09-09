import React from 'react';

export default function ProductDetailsDialog({ product, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-black" onClick={onClose}>
          <span className="sr-only">Close</span>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h2 className="text-lg font-semibold mb-6 text-black">Product Details</h2>
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Product ID:</div>
          <div className="text-base text-black font-medium mb-2">{product.id}</div>
        </div>
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Product Name:</div>
          <div className="text-base text-black font-medium mb-2">{product.name}</div>
        </div>
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Description:</div>
          <div className="text-base text-gray-700 mb-2">{product.description}</div>
        </div>
        <div className="mb-4 flex gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Stock:</div>
            <div className="text-base text-black font-medium">{product.stock} units</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Price:</div>
            <div className="text-base text-black font-medium">${product.price}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
