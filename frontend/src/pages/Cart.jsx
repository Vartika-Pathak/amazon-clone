import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { getProductImage, handleProductImageError } from '../utils/productImage'

export default function Cart() {
  const { cart, refreshCart, updateQuantity, removeItem } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) refreshCart()
  }, [user])

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-lg mb-4">Sign in to view your cart.</p>
        <Link to="/login" className="bg-amazonYellow hover:bg-amazonOrange px-6 py-2 rounded-full font-medium">
          Sign in
        </Link>
      </div>
    )
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-lg mb-4">Your cart is empty.</p>
        <Link to="/" className="text-blue-600 hover:underline">Continue shopping</Link>
      </div>
    )
  }

  return (
    <div className="bg-[#eaeded] min-h-full px-4 py-5 md:px-8">
      <div className="max-w-[1480px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
        <section className="bg-white px-5 md:px-6 py-6">
        <div className="flex items-end justify-between border-b border-gray-300 pb-4">
          <h1 className="text-3xl font-normal">Shopping Cart</h1>
          <span className="text-sm text-gray-500">Price</span>
        </div>
        {cart.items.map((item) => (
          <div key={item.cartItemId} className="flex gap-5 border-b border-gray-300 py-6">
            <img src={getProductImage(item.product)} alt={item.product.name} onError={(event) => handleProductImageError(event, item.product)} className="w-36 h-36 md:w-44 md:h-44 object-contain shrink-0" />
            <div className="flex-1 min-w-0">
              <Link to={`/product/${item.product.id}`} className="text-lg leading-6 hover:text-blue-700 hover:underline">
                {item.product.name}
              </Link>
              <p className="text-sm text-green-700 mt-1">In Stock</p>
              <label className="flex items-center gap-2 text-sm mt-2"><input type="checkbox" /> This is a gift <span className="text-blue-700">Learn more</span></label>
              <p className="text-sm mt-3"><strong>Price:</strong> ${Number(item.product.price).toFixed(2)} each</p>
              <div className="flex items-center gap-3 mt-4">
                <span className="text-sm">Qty:</span>
                <select
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.cartItemId, Number(e.target.value))}
                  className="border border-gray-400 rounded-full px-3 py-1"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <button
                  onClick={() => removeItem(item.cartItemId)}
                  className="text-sm text-blue-700 hover:underline border-l border-gray-300 pl-3"
                >
                  Remove
                </button>
                <button className="text-sm text-blue-700 hover:underline border-l border-gray-300 pl-3">Save for later</button>
                <button className="text-sm text-blue-700 hover:underline border-l border-gray-300 pl-3">Share</button>
              </div>
            </div>
            <div className="font-bold text-lg whitespace-nowrap">${Number(item.lineTotal).toFixed(2)}</div>
          </div>
        ))}
        <div className="text-right text-xl pt-4">Subtotal ({cart.items.reduce((s, i) => s + i.quantity, 0)} item{cart.items.reduce((s, i) => s + i.quantity, 0) === 1 ? '' : 's'}): <strong>${Number(cart.total).toFixed(2)}</strong></div>
        </section>

      <aside className="bg-white p-5 h-fit">
        <p className="text-lg mb-5">
          Subtotal ({cart.items.reduce((s, i) => s + i.quantity, 0)} items):{' '}
          <span className="font-bold">${Number(cart.total).toFixed(2)}</span>
        </p>
        <label className="flex gap-2 text-sm mb-5"><input type="checkbox" /> This order contains a gift</label>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full bg-amazonYellow hover:bg-amazonOrange py-3 rounded-full font-medium"
        >
          Proceed to Checkout
        </button>
      </aside>
    </div>
    </div>
  )
}
