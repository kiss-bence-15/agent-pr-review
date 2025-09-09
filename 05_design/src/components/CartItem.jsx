import React from 'react';
import { TrashIcon, MinusIcon, PlusIcon } from './icons';

export default function CartItem({ item, onUpdateQuantity }) {
  const itemTotal = item.product.price * item.quantity;
  const canIncrease = item.product.stock > 0;

  return (
    <div className="flex items-center justify-between p-2 border-b last:border-b-0">
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{item.product.name}</span>
          <span className="text-sm text-gray-600">${itemTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              className="text-gray-500 hover:text-gray-700 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MinusIcon className="w-4 h-4" />
            </button>
            <span className="text-sm min-w-[20px] text-center">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className={`text-gray-500 p-1 ${
                canIncrease ? 'hover:text-gray-700' : 'opacity-50 cursor-not-allowed'
              }`}
              disabled={!canIncrease}
              title={!canIncrease ? 'No stock available' : 'Increase quantity'}
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => onUpdateQuantity(0)}
            className="text-red-500 hover:text-red-700 p-1"
            title="Remove from cart"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
