import React, { createContext, useContext, useState, useCallback } from 'react'
import client from '../api/client'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(false)

  const refreshCart = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setCart({ items: [], total: 0 })
      return
    }
    setLoading(true)
    try {
      const res = await client.get('/api/cart')
      setCart(res.data)
    } catch (e) {
      // not logged in or backend unreachable - keep cart empty
    } finally {
      setLoading(false)
    }
  }, [])

  const addToCart = async (productId, quantity = 1) => {
    const res = await client.post('/api/cart', { productId, quantity })
    setCart(res.data)
  }

  const updateQuantity = async (cartItemId, quantity) => {
    const res = await client.put(`/api/cart/${cartItemId}`, { quantity })
    setCart(res.data)
  }

  const removeItem = async (cartItemId) => {
    const res = await client.delete(`/api/cart/${cartItemId}`)
    setCart(res.data)
  }

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, loading, refreshCart, addToCart, updateQuantity, removeItem, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
