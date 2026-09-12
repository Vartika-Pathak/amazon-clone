import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { getProductImage, handleProductImageError } from '../utils/productImage'

const couponTabs = ['Video Games', 'Lawn & Garden', 'Automotive', 'Camera & Photo', 'Books', 'Jewelry', 'Baby', 'Office Supplies', 'Musical Instruments', 'Refurbished Products', 'Coupons']

export default function Coupons() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      client.get('/api/products'),
      client.get('/api/products/categories')
    ]).then(([productResponse, categoryResponse]) => {
      setProducts(productResponse.data)
      setCategories(categoryResponse.data)
    }).finally(() => setLoading(false))
  }, [])

  const couponProducts = useMemo(() => {
    const filtered = selectedCategory
      ? products.filter((product) => product.category === selectedCategory)
      : products
    return filtered.slice(0, 60)
  }, [products, selectedCategory])

  return (
    <div className="bg-white min-h-full text-gray-900">
      <div className="border-b border-gray-300 bg-gray-50">
        <div className="max-w-[1320px] mx-auto flex gap-2 overflow-x-auto px-4 py-4">
          <Link to="/" className="shrink-0 border border-gray-300 rounded px-5 py-2 text-sm hover:border-amazonOrange">Today's Deals</Link>
          <button className="shrink-0 border-2 border-blue-600 rounded px-5 py-2 text-sm font-semibold bg-white">Coupons</button>
          <Link to="/" className="shrink-0 border border-gray-300 rounded px-5 py-2 text-sm hover:border-amazonOrange">Renewed Deals</Link>
          <Link to="/" className="shrink-0 border border-gray-300 rounded px-5 py-2 text-sm hover:border-amazonOrange">Outlet</Link>
          <Link to="/" className="shrink-0 border border-gray-300 rounded px-5 py-2 text-sm hover:border-amazonOrange">Amazon Resale</Link>
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-4 py-7">
        <div className="flex gap-2 overflow-x-auto pb-5">
          {couponTabs.map((tab) => <button key={tab} className={`shrink-0 rounded border px-4 py-2 text-sm ${tab === 'Coupons' ? 'border-blue-600 text-blue-700 font-semibold' : 'border-gray-300 hover:border-gray-700'}`}>{tab}</button>)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[210px_1fr] gap-8">
          <aside className="text-sm">
            <p className="font-bold mb-2">Filtered by</p>
            <button onClick={() => setSelectedCategory('')} className="border-2 border-blue-600 rounded px-3 py-1 text-blue-700 mb-2">Coupons</button>
            {selectedCategory && <button onClick={() => setSelectedCategory('')} className="block text-blue-700 hover:underline mb-6">Clear Filters</button>}
            <FilterSection title="Department">
              <label className="block py-1"><input type="radio" checked={!selectedCategory} onChange={() => setSelectedCategory('')} className="mr-2" />All</label>
              {categories.map((category) => <label key={category} className="block py-1"><input type="radio" checked={selectedCategory === category} onChange={() => setSelectedCategory(category)} className="mr-2" />{category}</label>)}
            </FilterSection>
            <FilterSection title="Customer Reviews">
              <p className="text-amazonOrange text-lg">★★★★<span className="text-gray-400">★</span> <span className="text-gray-700 text-sm">& Up</span></p>
            </FilterSection>
            <FilterSection title="Discount">
              <p className="font-medium mb-2">0% - 100%</p>
              <input type="range" min="0" max="100" defaultValue="100" className="w-full accent-blue-600" />
            </FilterSection>
          </aside>

          <main>
            <h1 className="text-2xl font-bold mb-1">Coupons</h1>
            <p className="text-sm text-gray-600 mb-5">Save more on products with available coupons.</p>
            {loading ? <p className="text-gray-500">Loading coupons...</p> : <>
              <p className="text-sm text-gray-600 mb-4">Showing {couponProducts.length} coupon products</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
                {couponProducts.map((product) => <CouponCard key={product.id} product={product} />)}
              </div>
            </>}
          </main>
        </div>
      </div>
    </div>
  )
}

function CouponCard({ product }) {
  return (
    <article className="min-w-0">
      <Link to={`/product/${product.id}`} className="block">
        <div className="h-44 bg-gray-50 flex items-center justify-center mb-2">
          <img src={getProductImage(product)} alt={product.name} onError={(event) => handleProductImageError(event, product)} className="max-h-full max-w-full object-contain" />
        </div>
        <p className="text-red-600 font-semibold text-sm">Save 10% with coupon</p>
        <p className="text-xs text-gray-500 mt-1">${Number(product.price).toFixed(2)}</p>
        <h2 className="text-sm leading-5 line-clamp-3 mt-2 hover:text-blue-700 hover:underline">{product.name}</h2>
        <p className="text-amazonOrange text-sm mt-1">{'★'.repeat(Math.round(product.rating || 0))} <span className="text-blue-700">({product.reviewCount ?? 0})</span></p>
      </Link>
    </article>
  )
}

function FilterSection({ title, children }) {
  return <section className="border-t border-gray-200 pt-4 mt-4"><h2 className="font-bold mb-2">{title}</h2>{children}</section>
}
