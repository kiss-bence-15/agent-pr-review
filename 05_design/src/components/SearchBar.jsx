import React from 'react';
import { SearchIcon } from './icons.jsx';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full max-w-[320px]">
      <input
        type="text"
        className="w-full pl-9 pr-4 py-2 rounded-[6.75px] bg-[#F3F3F5] text-black border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black text-[11.3px]"
        placeholder="Search products..."
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <span className="absolute left-3 top-2.5 text-black pointer-events-none">
        <SearchIcon />
      </span>
    </div>
  );
}
