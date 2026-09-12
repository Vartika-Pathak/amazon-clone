import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getProductImage, handleProductImageError } from '../utils/productImage'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState(null)
  const [added, setAdded] = useState(false)
  const [adding, setAdding] = useState(false)
  const { user, logout } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    client.get(`/api/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setError('Product not found.'))
  }, [id])

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setError(null)
    setAdding(true)
    try {
      await addToCart(Number(id), quantity)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch (err) {
      if (err.response?.status === 401) {
        logout()
        navigate('/login')
        return
      }
      setError(err.response?.data?.error || 'Could not add this product to your cart.')
    } finally {
      setAdding(false)
    }
  }

  if (error) return <div className="max-w-4xl mx-auto px-4 py-8 text-red-600">{error}</div>
  if (!product) return <div className="max-w-4xl mx-auto px-4 py-8 text-gray-500">Loading...</div>

  return (
    <div className="bg-white min-h-full">
      <div className="max-w-[1480px] mx-auto px-5 py-4">
        <p className="text-xs text-gray-500 mb-5">Home › {product.category} › {product.name}</p>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(420px,1fr)_minmax(360px,1.25fr)_300px] gap-8">
          <section className="flex gap-4 min-h-[560px]">
            <div className="w-16 flex flex-col gap-3">
              {[1, 2, 3, 4].map((thumbnail) => (
                <button key={thumbnail} className="w-14 h-14 border border-gray-300 hover:border-blue-600 rounded flex items-center justify-center bg-white">
                  <img src={getProductImage(product)} alt="" onError={(event) => handleProductImageError(event, product)} className="max-w-full max-h-full object-contain" />
                </button>
              ))}
            </div>
            <div className="flex-1 flex items-start justify-center bg-white pt-5">
              <img src={getProductImage(product)} alt={product.name} onError={(event) => handleProductImageError(event, product)} className="max-h-[520px] max-w-full object-contain" />
            </div>
          </section>

          <section className="border-b border-gray-300 pb-6">
            <h1 className="text-2xl font-medium leading-8">{product.name}</h1>
            <p className="text-sm text-gray-600 mt-1">Visit the {product.category} store</p>
            <div className="flex items-center gap-2 text-sm mt-3 border-b pb-4">
              <span className="text-blue-700">{Number(product.rating || 0).toFixed(1)} ★★★★★</span>
              <span className="text-blue-700">{product.reviewCount ?? 0} ratings</span>
            </div>
            <p className="text-sm text-gray-600 mt-4">About this item</p>
            <p className="text-gray-800 leading-7 mt-2">{product.description}</p>
            <p className="text-sm text-gray-600 mt-6">Category: <span className="text-blue-700">{product.category}</span></p>
          </section>

          <aside className="border border-gray-300 rounded-lg p-5 h-fit shadow-sm">
            <p className="text-3xl font-medium">${Number(product.price).toFixed(2)}</p>
            <p className="text-sm text-blue-700 mt-2">FREE delivery available</p>
            <p className="text-sm text-gray-700 mt-4">Deliver to Vartika Pathak</p>
            <p className="text-sm mt-4">{product.stock > 0 ? <span className="text-green-700 font-medium">In Stock</span> : <span className="text-red-600">Out of Stock</span>}</p>
            <div className="flex items-center gap-3 my-4">
              <label className="text-sm">Qty:</label>
              <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="border rounded px-2 py-1">
                {Array.from({ length: Math.min(10, product.stock || 1) }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button onClick={handleAddToCart} disabled={product.stock <= 0 || adding} className="w-full bg-amazonYellow hover:bg-amazonOrange px-6 py-3 rounded-full font-medium disabled:opacity-50">
              {adding ? 'Adding...' : added ? 'Added ✓' : 'Add to Cart'}
            </button>
            <button onClick={handleAddToCart} disabled={product.stock <= 0 || adding} className="w-full mt-3 bg-amazonOrange hover:bg-[#e47900] px-6 py-3 rounded-full font-medium disabled:opacity-50">Buy Now</button>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </aside>
        </div>
      </div>
    </div>
  )
}
