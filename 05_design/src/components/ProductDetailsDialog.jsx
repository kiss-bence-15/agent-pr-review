import React from 'react';

export default function ProductDetailsDialog({ product, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 relative">
        {/* Title and close button row */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-black">Product Details</h2>
          <button className="text-gray-400 hover:text-black" onClick={onClose}>
            <span className="sr-only">Close</span>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {/* Product name */}
        <div className="text-xl font-bold text-black mb-1">{product.name}</div>
        {/* Description */}
        <div className="text-base text-gray-500 mb-4">{product.description}</div>
        {/* Divider */}
        <div className="border-t border-gray-200 mb-4"></div>
        {/* Details row */}
        <div className="flex flex-row gap-32 mb-2">
          <div>
            <div className="text-xs text-gray-500 mb-1">Price:</div>
            <div className="text-base font-semibold text-black">${product.price}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Stock:</div>
            <div className="text-base font-semibold text-black">{product.stock} units</div>
          </div>
        </div>
        {/* Product ID */}
        <div className="text-xs text-gray-400 mt-2">Product ID:<br /><span className="text-black">{product.id}</span></div>
      </div>
    </div>
  );
}
