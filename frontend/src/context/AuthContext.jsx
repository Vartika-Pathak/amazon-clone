import React, { createContext, useContext, useState } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const email = localStorage.getItem('userEmail')
    const fullName = localStorage.getItem('userFullName')
    return email && localStorage.getItem('token') ? { email, fullName } : null
  })

  const login = async (email, password) => {
    const res = await client.post('/api/auth/login', { email, password })
    persist(res.data)
    return res.data
  }

  const register = async (fullName, email, password) => {
    const res = await client.post('/api/auth/register', { fullName, email, password })
    persist(res.data)
    return res.data
  }

  const persist = (data) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('userEmail', data.email)
    localStorage.setItem('userFullName', data.fullName)
    setUser({ email: data.email, fullName: data.fullName })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userFullName')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
