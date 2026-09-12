import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const supportCards = [
  ['📦', 'A delivery, order, or return', 'Track orders and manage returns'],
  ['→', 'Help with signing in', 'Access your account securely'],
  ['prime', 'Prime', 'Explore Prime benefits'],
  ['📱', 'Kindle, Fire, Alexa, or other Amazon devices', 'Get device help'],
  ['▶', 'eBooks, Prime Videos, Music, or Games', 'Manage digital content'],
  ['💳', 'Payment, charges or gift cards', 'Review payments and gift cards'],
  ['🔒', 'Address, security & privacy', 'Update your account details'],
  ['●', 'Memberships, subscriptions or communications', 'Manage subscriptions'],
  ['♿', 'Accessibility', 'Accessibility support'],
  ['?', 'Something else', 'Find more help topics'],
  ['✉', 'Report Something Suspicious', 'Report a security concern']
]

const helpTopics = [
  ['Track your package', 'Track your packages and get delivery updates'],
  ['Return Items You Ordered', 'Return your orders using our Online Return Center'],
  ['Check status of a refund', 'Track your returns and refunds in Your Orders'],
  ['Track Your Return', 'Learn how to track your return location and status'],
  ['Manage Your Amazon Prime Membership', 'Cancel or manage your Prime membership'],
  ['Amazon Settlement', 'Learn where to find payment information'],
  ['How to Update Your Amazon Payment Method', 'Keep your payment methods up to date'],
  ['Get Product Support', 'Get help using a product or find its owner’s manual']
]

export default function CustomerService() {
  const [query, setQuery] = useState('')
  const filteredTopics = useMemo(() => helpTopics.filter(([title, description]) => `${title} ${description}`.toLowerCase().includes(query.toLowerCase())), [query])

  return (
    <div className="min-h-full bg-[#f3f6f7] text-gray-900">
      <section className="bg-[#007185] text-white">
        <div className="max-w-5xl mx-auto px-5 py-8 md:py-10">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Welcome to Amazon Customer Service</h1>
            <p className="text-sm mt-2">We can help you take care of most things here. Sign in to get started.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {supportCards.map(([icon, title, description]) => (
              <button key={title} onClick={() => setQuery(title)} className="min-h-20 bg-white text-gray-900 rounded-sm p-4 flex items-center gap-4 text-left hover:bg-gray-100">
                <span className="w-10 h-10 shrink-0 rounded-full bg-[#d8f1f3] text-[#007185] flex items-center justify-center text-lg font-bold">{icon}</span>
                <span><strong className="block text-sm leading-5">{title}</strong><span className="text-xs text-gray-600">{description}</span></span>
              </button>
            ))}
          </div>
          <div className="bg-white text-gray-900 mt-5 rounded-sm px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <Link to="/orders" className="hover:text-[#007185]"><strong className="block">Got Shopping Questions?</strong>Review all Q&A →</Link>
            <Link to="/orders" className="hover:text-[#007185]"><strong className="block">Where's my order?</strong>Track packages and delivery updates</Link>
            <Link to="/orders" className="hover:text-[#007185]"><strong className="block">Your Returns</strong>Find returns and refunds</Link>
            <Link to="/cart" className="hover:text-[#007185]"><strong className="block">Issues with your payment?</strong>Review your cart and checkout</Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 py-8">
        <h2 className="font-bold mb-2">Search our help library</h2>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type something like, 'question about a charge'" className="w-full border border-gray-400 rounded px-3 py-2 text-sm bg-white" />
        <h2 className="font-bold text-xl mt-7 mb-4">All help topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-[190px_1fr] gap-5">
          <nav className="text-sm space-y-3 font-medium">
            <p className="bg-[#007185] text-white px-3 py-2 rounded-sm">Take Quick Actions</p>
            <p>Where's my stuff</p><p>Shipping and Delivery</p><p>Returns, Refunds and Product Support</p><p>Managing Your Account</p><p>Security & Privacy</p><p>Payment, Pricing and Promotions</p><p>Devices & Digital Solutions</p>
          </nav>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredTopics.map(([title, description]) => <button key={title} className="bg-white border border-gray-300 rounded-sm p-4 text-left hover:border-[#007185]"><strong className="block text-sm">{title}</strong><span className="text-xs text-gray-600">{description}</span></button>)}
            {filteredTopics.length === 0 && <p className="text-gray-500">No help topics found.</p>}
          </div>
        </div>
      </section>
    </div>
  )
}
