import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    client.get('/api/products/categories').then((res) => setCategories(res.data)).catch(() => {})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/?q=${encodeURIComponent(query)}`)
  }

  return (
    <nav className="bg-amazonBlue text-white sticky top-0 z-50">
      <div className="flex items-center gap-4 px-4 py-3 max-w-[1480px] mx-auto">
        <Link to="/" className="text-xl font-bold whitespace-nowrap px-2 py-1 border border-transparent hover:border-white rounded">
          amazon<span className="text-amazonYellow">.clone</span>
        </Link>

        <div className="hidden lg:block text-xs leading-tight whitespace-nowrap border border-transparent hover:border-white px-2 py-1 rounded">
          <span className="text-gray-300">Deliver to</span><br /><strong>{user ? user.fullName : 'your location'}</strong>
        </div>

        <form onSubmit={handleSearch} className="flex-1 flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-3 py-2 rounded-l text-black focus:outline-none"
          />
          <button type="submit" className="bg-amazonYellow px-4 rounded-r hover:bg-amazonOrange">
            🔍
          </button>
        </form>

        <div className="flex items-center gap-3 whitespace-nowrap">
          {user ? (
            <>
              <span className="text-xs hidden md:inline leading-tight">Hello, {user.fullName?.split(' ')[0]}<br /><strong className="text-sm">Account & Lists</strong></span>
              <Link to="/orders" className="hover:underline text-sm leading-tight">Returns<br /><strong>& Orders</strong></Link>
              <button onClick={() => { logout(); navigate('/') }} className="hover:underline text-sm">
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:underline text-sm px-2 py-1 border border-transparent hover:border-white rounded">
              Sign in
            </Link>
          )}

          <Link to="/cart" className="relative px-2 py-1 border border-transparent hover:border-white rounded">
            🛒 Cart
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amazonOrange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      <div className="bg-amazonBlueLight text-sm overflow-x-auto">
        <div className="max-w-[1480px] mx-auto flex items-center gap-7 px-5 py-3 whitespace-nowrap">
          <button type="button" onClick={() => setMenuOpen(true)} className="font-semibold hover:underline">☰ All</button>
          <Link to="/" className="hover:underline">Prime Video</Link>
          <Link to="/coupons" className="hover:underline">Coupons</Link>
          <Link to="/customer-service" className="hover:underline">Customer Service</Link>
          <Link to="/" className="hover:underline">Today's Deals</Link>
          <Link to="/" className="hover:underline">Registry</Link>
          <Link to="/" className="hover:underline">Gift Cards</Link>
          <Link to="/" className="hover:underline">Sell</Link>
        </div>
      </div>
      {menuOpen && (
        <>
          <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="fixed inset-0 bg-black/50 z-40 cursor-default" />
          <aside className="fixed left-0 top-0 bottom-0 w-[min(360px,88vw)] bg-white text-gray-900 z-50 overflow-y-auto shadow-2xl">
            <div className="bg-amazonBlueLight text-white px-6 py-5 flex items-center justify-between">
              <strong className="text-lg">Hello, {user?.fullName || 'sign in'}</strong>
              <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="text-2xl leading-none">×</button>
            </div>
            <div className="p-6 border-b">
              <h2 className="font-bold text-lg mb-3">Shop by Department</h2>
              {categories.map((category) => (
                <button key={category} onClick={() => { setMenuOpen(false); navigate(`/?category=${encodeURIComponent(category)}`) }} className="w-full flex justify-between py-2 text-left hover:text-blue-700">
                  <span>{category}</span><span className="text-gray-400">›</span>
                </button>
              ))}
            </div>
            <div className="p-6 border-b">
              <h2 className="font-bold text-lg mb-3">Programs & Features</h2>
              <Link onClick={() => setMenuOpen(false)} to="/orders" className="block py-2 hover:text-blue-700">Your Orders</Link>
              <Link onClick={() => setMenuOpen(false)} to="/cart" className="block py-2 hover:text-blue-700">Your Cart</Link>
              <Link onClick={() => setMenuOpen(false)} to="/" className="block py-2 hover:text-blue-700">Today's Deals</Link>
            </div>
            <div className="p-6">
              <h2 className="font-bold text-lg mb-3">Help & Settings</h2>
              <Link onClick={() => setMenuOpen(false)} to={user ? '/orders' : '/login'} className="block py-2 hover:text-blue-700">{user ? 'Your Account' : 'Sign in'}</Link>
              {user && <button onClick={() => { logout(); setMenuOpen(false); navigate('/') }} className="block py-2 hover:text-blue-700">Sign out</button>}
              <p className="py-2 text-gray-600">English</p>
            </div>
          </aside>
        </>
      )}
    </nav>
  )
}
