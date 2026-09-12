import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import client from '../api/client'
import { useCart } from '../context/CartContext'

export default function Checkout() {
  const { cart, refreshCart } = useCart()
  const [address, setAddress] = useState('')
  const [placing, setPlacing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (searchParams.get('payment') !== 'success' || !sessionId) return

    setPaymentStatus('processing')
    const completePayment = async () => {
      try {
        const res = await client.post(`/api/payments/checkout-session/${sessionId}/complete`)
        await refreshCart()
        navigate('/orders', { state: { justPlacedOrderId: res.data.orderId }, replace: true })
      } catch (err) {
        setError(err.response?.data?.error || 'Could not verify Stripe payment.')
      } finally {
        setPaymentStatus('idle')
      }
    }

    completePayment()
  }, [searchParams, navigate, refreshCart])

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!address.trim()) {
      setError('Please enter a shipping address.')
      return
    }
    setPlacing(true)
    setError(null)
    setPaymentStatus('processing')
    try {
      const res = await client.post('/api/payments/checkout-session', { shippingAddress: address })
      window.location.assign(res.data.url)
    } catch (err) {
      setPaymentStatus('failed')
      setError(err.response?.data?.error || 'Could not start Stripe Checkout.')
    } finally {
      setPlacing(false)
    }
  }

  if (!cart.items || cart.items.length === 0) {
    return <div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-500">Your cart is empty.</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
      <form onSubmit={handlePlaceOrder} className="space-y-4">
        <h1 className="text-2xl font-semibold">Checkout</h1>

        <div>
          <label className="block text-sm font-medium mb-1">Shipping Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="w-full border rounded px-3 py-2"
            placeholder="123 Main St, Springfield, USA"
          />
        </div>

        <div className="bg-white border rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Payment</h2>
            <span className="text-xs text-blue-700 border border-blue-300 rounded px-2 py-1">Stripe Test Mode</span>
          </div>
          <p className="text-sm text-gray-600">You will be redirected to Stripe’s secure test checkout. No real payment is taken.</p>
          {paymentStatus === 'processing' && <p className="text-sm text-blue-700">Opening Stripe Checkout...</p>}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={placing}
          className="w-full bg-amazonYellow hover:bg-amazonOrange py-2 rounded-full font-medium disabled:opacity-50"
        >
          {placing ? 'Opening Stripe...' : 'Pay with Stripe'}
        </button>
      </form>

      <div className="bg-white border rounded-lg p-6 h-fit">
        <h2 className="font-semibold mb-3">Order Summary</h2>
        {cart.items.map((item) => (
          <div key={item.cartItemId} className="flex justify-between text-sm mb-2">
            <span>{item.product.name} × {item.quantity}</span>
            <span>${Number(item.lineTotal).toFixed(2)}</span>
          </div>
        ))}
        <hr className="my-2" />
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>${Number(cart.total).toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
