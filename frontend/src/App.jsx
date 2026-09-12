import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Orders from './pages/Orders'
import Coupons from './pages/Coupons'
import CustomerService from './pages/CustomerService'
import { useAuth } from './context/AuthContext'
import { useCart } from './context/CartContext'

export default function App() {
  const { user } = useAuth()
  const { refreshCart } = useCart()
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  useEffect(() => {
    if (user) refreshCart()
  }, [user])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {!isAuthPage && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/customer-service" element={<CustomerService />} />
        </Routes>
      </main>
      <footer className="bg-amazonBlueLight text-white text-center py-4 text-sm">
        Built as a take-home assignment clone — not affiliated with Amazon.com
      </footer>
    </div>
  )
}
