import React from 'react';
import { PlusIcon } from './icons.jsx';

export default function AddButton({ onClick }) {
  return (
    <button
      className="inline-flex items-center bg-[#030213] text-white px-6 py-2 rounded-[6.75px] font-medium text-[11.3px] hover:bg-black gap-2"
      onClick={onClick}
    >
      <span className="mr-1"><PlusIcon /></span>
      <span>Add Product</span>
    </button>
  );
}
