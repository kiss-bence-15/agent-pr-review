import React from 'react';
import CartItem from './CartItem';

export default function Cart({ items = [], onUpdateItem }) {
  if (!items || items.length === 0) {
    return null;
  }

  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div className="fixed bottom-4 left-4 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Shopping Cart</h2>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {items.map(item => (
          <CartItem 
            key={item.id} 
            item={item} 
            onUpdateQuantity={(quantity) => onUpdateItem(item.id, quantity)}
          />
        ))}
      </div>
      <div className="p-4 border-t">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total:</span>
          <span className="font-semibold">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
