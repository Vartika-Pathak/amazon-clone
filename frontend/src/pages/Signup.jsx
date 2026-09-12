import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (fullName.trim().length < 2) {
      setError('Please enter your full name.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await register(fullName, email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Sign up failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="min-h-[calc(100vh-80px)] bg-white px-4 pt-5 pb-12">
        <div className="max-w-[460px] mx-auto">
          <Link to="/" className="block text-center text-4xl font-bold tracking-tight text-gray-900 mb-5">
            amazon<span className="text-[#f08804]">.clone</span>
          </Link>
          <div className="border border-gray-300 rounded-lg p-7 bg-white">
            <h1 className="text-3xl font-normal leading-tight mb-5">Sign in or create account</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
          <div>
              <label className="block text-base font-bold mb-1">Your name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
                placeholder="First and last name"
                className="w-full border border-gray-500 rounded px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
              <label className="block text-base font-bold mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
                className="w-full border border-gray-500 rounded px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
              <label className="block text-base font-bold mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              aria-describedby="password-requirement"
                placeholder="At least 8 characters"
                className="w-full border border-gray-500 rounded px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p id="password-requirement" className="text-xs text-gray-500 mt-1">Use at least 8 characters.</p>
          </div>
          <div>
              <label className="block text-base font-bold mb-1">Re-enter password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
                className="w-full border border-gray-500 rounded px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
              className="w-full bg-[#ffd814] hover:bg-[#f7ca00] py-3 rounded-full font-medium disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
            </form>
            <p className="text-sm leading-5 mt-5">By continuing, you agree to Amazon.clone's <a href="#terms" className="text-blue-700 hover:underline">Conditions of Use</a> and <a href="#privacy" className="text-blue-700 hover:underline">Privacy Notice</a>.</p>
            <p className="mt-5"><a href="#help" className="text-blue-700 hover:underline">Need help?</a></p>
            <hr className="my-6" />
            <p className="font-bold">Already have an account?</p>
            <Link to="/login" className="text-blue-700 hover:underline inline-block mt-2">Sign in instead</Link>
            <hr className="my-6" />
            <p className="font-bold">Buying for work?</p>
            <a href="#business" className="text-blue-700 hover:underline inline-block mt-2">Create a free business account</a>
          </div>
          <div className="text-center text-sm text-blue-700 mt-12 border-t pt-6">
            <div className="flex justify-center gap-5"><a href="#terms">Conditions of Use</a><a href="#privacy">Privacy Notice</a><a href="#help">Help</a></div>
            <p className="text-gray-700 mt-4">© 1996-2026, Amazon.clone, Inc. or its affiliates</p>
          </div>
      </div>
    </div>
  )
}
