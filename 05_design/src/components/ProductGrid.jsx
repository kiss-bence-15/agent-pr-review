
import React from 'react';
import { ViewIcon, EditIcon, DeleteIcon } from './icons.jsx';

export default function ProductGrid({ products, onView, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <div
          key={product.id}
          className="bg-white border border-black/10 rounded-[12.75px] p-6 flex flex-col min-h-[235px] shadow-sm"
        >
          {/* Product name */}
          <div className="mb-2">
            <h4 className="text-[13.2px] font-normal leading-tight text-black mb-2">
              {product.name}
            </h4>
          </div>
          {/* Description */}
          <div className="mb-4">
            <p className="text-[11.3px] text-[#717182] leading-[1.55]">{product.description}</p>
          </div>
          {/* Stock and price (stock right, price left, Figma order) */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-[11.3px] text-[#717182]">Stock: {product.stock}</span>
            <span className="text-[12.8px] font-medium text-[#030213]">${product.price}</span>
          </div>
          {/* Action buttons: View, Edit, Delete (icon only for delete) */}
          <div className="flex gap-2 mt-auto items-center">
            <button
              onClick={() => onView(product)}
              className="inline-flex items-center border border-black/10 rounded-[6.75px] px-4 py-1.5 text-xs font-medium text-black bg-white hover:bg-gray-100 gap-1"
            >
              <span>View</span>
              <span className="ml-1"><ViewIcon /></span>
            </button>
            <button
              onClick={() => onEdit(product)}
              className="inline-flex items-center border border-black/10 rounded-[6.75px] px-4 py-1.5 text-xs font-medium text-black bg-white hover:bg-gray-100 gap-1"
            >
              <span>Edit</span>
              <span className="ml-1"><EditIcon /></span>
            </button>
            <button
              onClick={() => onDelete(product)}
              className="inline-flex items-center justify-center rounded-[6.75px] w-8 h-8 text-white bg-[#D4183D] hover:bg-red-700"
              title="Delete"
            >
              <DeleteIcon />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
