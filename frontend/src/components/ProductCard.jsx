import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getProductImage, handleProductImageError } from '../utils/productImage'

export default function ProductCard({ product, className = '' }) {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const handleAdd = async (event) => {
    event.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    await addToCart(product.id, 1)
  }

  return (
    <article className={`bg-white border border-gray-200 p-3 flex flex-col hover:shadow-lg transition-shadow ${className}`}>
      <div className="h-40 flex items-center justify-center mb-3 overflow-hidden rounded">
        <Link to={`/product/${product.id}`} className="h-full w-full flex items-center justify-center">
          <img src={getProductImage(product)} alt={product.name} onError={(event) => handleProductImageError(event, product)} className="max-h-full max-w-full object-contain" />
        </Link>
      </div>
      <Link to={`/product/${product.id}`} className="text-sm font-medium line-clamp-2 mb-1 hover:text-blue-700 hover:underline">{product.name}</Link>
      <div className="flex items-center gap-1 text-xs text-amazonOrange mb-1">
        {'★'.repeat(Math.round(product.rating || 0))}
        <span className="text-gray-500">({product.reviewCount ?? 0})</span>
      </div>
      <div className="mt-auto">
        <span className="text-lg font-bold">${Number(product.price).toFixed(2)}</span>
        <p className="text-xs text-gray-500 mb-2">2K+ bought in past month</p>
        <button onClick={handleAdd} className="w-full bg-amazonYellow hover:bg-amazonOrange border border-yellow-600 rounded-full py-2 text-sm font-medium">Add to cart</button>
      </div>
    </article>
  )
}
