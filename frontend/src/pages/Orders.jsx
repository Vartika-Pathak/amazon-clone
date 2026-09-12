import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getProductImage, handleProductImageError } from '../utils/productImage'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [buyingProduct, setBuyingProduct] = useState(null)
  const [actionError, setActionError] = useState(null)
  const { user } = useAuth()
  const { addToCart } = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const justPlacedOrderId = location.state?.justPlacedOrderId

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    client.get('/api/orders')
      .then(async (res) => {
        const ordersWithImages = await Promise.all(res.data.map(async (order) => ({
          ...order,
          items: await Promise.all(order.items.map(async (item) => {
            if (item.imageUrl) return item
            try {
              const product = await client.get(`/api/products/${item.productId}`)
              return { ...item, imageUrl: product.data.imageUrl }
            } catch {
              return item
            }
          }))
        })))
        setOrders(ordersWithImages)
      })
      .finally(() => setLoading(false))
  }, [user])

  const visibleOrders = useMemo(() => (
    filter === 'all' ? orders : orders.filter((order) => order.status.toLowerCase() === filter)
  ), [filter, orders])

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-lg mb-4">Sign in to view your orders.</p>
        <Link to="/login" className="bg-amazonYellow hover:bg-amazonOrange px-6 py-2 rounded-full font-medium">
          Sign in
        </Link>
      </div>
    )
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 text-gray-500">Loading orders...</div>

  if (orders.length === 0) {
    return <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-500">You have no orders yet.</div>
  }

  const formatDate = (date) => new Date(date).toLocaleDateString(undefined, {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  const handleBuyAgain = async (item) => {
    setBuyingProduct(item.productId)
    setActionError(null)
    try {
      await addToCart(item.productId, item.quantity)
      navigate('/cart')
    } catch {
      setActionError('Could not add the item to your cart.')
    } finally {
      setBuyingProduct(null)
    }
  }

  const showOrderDetails = (orderId) => {
    document.getElementById(`order-items-${orderId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="bg-white min-h-full">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Account</p>
            <h1 className="text-3xl font-semibold text-gray-900">Your Orders</h1>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span>Filter orders</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-gray-400 rounded px-3 py-2 bg-white">
              <option value="all">All orders</option>
              <option value="placed">Placed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </label>
        </div>

        {justPlacedOrderId && (
          <div className="bg-green-50 border border-green-300 text-green-800 rounded-lg p-4 mb-5">
            Order #{justPlacedOrderId} placed successfully.
          </div>
        )}
        {actionError && <p className="text-red-600 text-sm mb-4">{actionError}</p>}

        {visibleOrders.length === 0 && <p className="text-gray-500 py-10 text-center">No orders match this filter.</p>}

        <div className="space-y-5">
          {visibleOrders.map((order) => {
            const isDelivered = order.status === 'DELIVERED'
            return (
              <section key={order.id} className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-100 border-b border-gray-300 px-5 py-4 grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
                  <div><p className="uppercase text-xs text-gray-500">Order placed</p><p className="text-gray-800">{formatDate(order.createdAt)}</p></div>
                  <div><p className="uppercase text-xs text-gray-500">Total</p><p className="text-gray-800">${Number(order.total).toFixed(2)}</p></div>
                  <div><p className="uppercase text-xs text-gray-500">Ship to</p><p className="text-blue-700 truncate" title={order.shippingAddress}>{user.fullName}</p><p className="text-xs text-gray-500 truncate" title={order.shippingAddress}>{order.shippingAddress || 'Address unavailable'}</p></div>
                  <div className="sm:text-right"><p className="uppercase text-xs text-gray-500">Order #</p><p className="text-gray-800">{order.orderNumber || order.id}</p><span className={`inline-block mt-1 text-xs font-medium px-2 py-1 rounded-full ${isDelivered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status}</span></div>
                </div>
                <div className="px-5 py-3 border-b border-gray-200 flex flex-wrap justify-end gap-x-3 gap-y-1 text-sm">
                  <button onClick={() => showOrderDetails(order.id)} className="text-blue-700 hover:underline">View order details</button>
                  <span className="text-gray-400">|</span>
                  <button onClick={() => window.print()} className="text-blue-700 hover:underline">Invoice</button>
                </div>

                <div id={`order-items-${order.id}`} className="px-5 py-5">
                  <p className={`font-semibold mb-4 ${isDelivered ? 'text-green-700' : 'text-gray-900'}`}>
                    {isDelivered ? 'Delivered' : order.status === 'SHIPPED' ? 'Arriving soon' : 'Order placed'}
                  </p>
                  <div className="space-y-6">
                    {order.items.map((item) => (
                      <div key={`${order.id}-${item.productId}`} className="flex gap-4">
                        <div className="w-24 h-24 shrink-0 flex items-center justify-center bg-white">
                          <img src={getProductImage({ imageUrl: item.imageUrl, productName: item.productName })} alt="" onError={(event) => handleProductImageError(event, { imageUrl: item.imageUrl })} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link to={`/product/${item.productId}`} className="text-blue-700 hover:underline font-medium leading-6">{item.productName}</Link>
                          <p className="text-sm text-gray-600 mt-1">${Number(item.priceAtPurchase).toFixed(2)} × {item.quantity}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <button onClick={() => handleBuyAgain(item)} disabled={buyingProduct === item.productId} className="bg-amazonYellow hover:bg-amazonOrange border border-yellow-600 rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60">
                              {buyingProduct === item.productId ? 'Adding...' : 'Buy it again'}
                            </button>
                            <Link to={`/product/${item.productId}`} className="border border-gray-400 hover:border-gray-700 rounded-full px-4 py-2 text-sm">View your item</Link>
                          </div>
                          <div className="flex flex-wrap gap-4 mt-3 text-sm">
                            <Link to={`/product/${item.productId}`} className="text-blue-700 hover:underline">Write a product review</Link>
                            <Link to={`/product/${item.productId}`} className="text-blue-700 hover:underline">Ask Product Question</Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
