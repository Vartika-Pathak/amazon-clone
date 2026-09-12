import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import client from '../api/client'
import ProductCard from '../components/ProductCard'
import { getProductImage, handleProductImageError } from '../utils/productImage'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [sort, setSort] = useState('featured')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const q = searchParams.get('q') || ''
  const isDashboard = !q && !category && !maxPrice

  useEffect(() => {
    setCategory(searchParams.get('category') || '')
    setMaxPrice(searchParams.get('maxPrice') || '')
  }, [searchParams])

  useEffect(() => {
    client.get('/api/products/categories').then((res) => setCategories(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = {}
    if (q) params.q = q
    if (category) params.category = category
    if (maxPrice) params.maxPrice = maxPrice

    client.get('/api/products', { params })
      .then((res) => setProducts(res.data))
      .catch(() => setError('Could not load products. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [q, category, maxPrice])

  const handleCategoryChange = (cat) => {
    setCategory(cat)
    const params = {}
    if (q) params.q = q
    if (cat) params.category = cat
    if (maxPrice) params.maxPrice = maxPrice
    setSearchParams(params)
  }

  const handlePriceFilter = (price) => {
    setCategory('')
    setMaxPrice(String(price))
    const params = { maxPrice: String(price) }
    if (q) params.q = q
    setSearchParams(params)
  }

  const dashboardProducts = products.slice(0, 8)
  const categoryProducts = Array.from(
    products.reduce((categoryMap, product) => {
      const name = product.category?.trim()
      if (name && !categoryMap.has(name)) {
        categoryMap.set(name, { name, product })
      }
      return categoryMap
    }, new Map()).values()
  )
  const availableCategories = Array.from(new Set([
    ...categories.map((name) => name.trim()).filter(Boolean),
    ...categoryProducts.map(({ name }) => name)
  ]))

  const sortedProducts = [...products].sort((a, b) => {
    if (sort === 'price-low') return Number(a.price) - Number(b.price)
    if (sort === 'price-high') return Number(b.price) - Number(a.price)
    if (sort === 'rating') return Number(b.rating || 0) - Number(a.rating || 0)
    return 0
  })
  const displayedProducts = maxPrice === '40'
    ? sortedProducts.filter(isOrganizationProduct)
    : sortedProducts

  return (
    <div className="bg-[#eaeded] min-h-full">
      {isDashboard && !loading && !error && products.length > 0 && (
        <>
          <section className="dashboard-hero max-w-[1480px] mx-auto px-4 pt-5">
            <ArrowCarousel className="-mx-4" itemClassName="w-[270px] sm:w-[310px] md:w-[340px]">
                {promoCards.map((promo) => {
                  const product = findPromoProduct(promo, products)
                  return <PromoCard key={promo.title} promo={promo} product={product} onClick={() => promo.maxPrice ? handlePriceFilter(promo.maxPrice) : handleCategoryChange(product?.category || promo.category)} />
                })}
            </ArrowCarousel>
          </section>

          <CategoryShowcase categories={categoryProducts} />

          <DashboardRail title="Keep shopping for" products={dashboardProducts.slice(0, 5)} />
          <DashboardRail title="Recommended for you" products={dashboardProducts.slice(3, 8)} />
        </>
      )}

      {!isDashboard && (
        <div className="max-w-[1480px] mx-auto px-4 py-4">
          {loading && <p className="text-gray-500 py-8">Loading products...</p>}
          {error && <p className="text-red-600 py-8">{error}</p>}
          {!loading && !error && (
            <>
              <div className="flex items-center justify-between border-b border-gray-300 pb-3 mb-4">
                <p className="text-sm">1-{displayedProducts.length} of <strong>{displayedProducts.length}</strong> results for <strong className="text-amazonOrange">{q ? `"${q}"` : maxPrice ? `Organizing products under $${maxPrice}` : category}</strong></p>
                <label className="text-sm flex items-center gap-2">Sort by:
                  <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-gray-400 rounded px-2 py-1 bg-white">
                    <option value="featured">Featured</option><option value="rating">Avg. customer review</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option>
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[190px_1fr] gap-5">
                <aside className="hidden lg:block text-sm text-gray-800">
                  <FilterGroup title="Customer Reviews"><p className="text-amazonOrange text-lg">★★★★<span className="text-gray-400">★</span> <span className="text-gray-700 text-sm">& Up</span></p></FilterGroup>
                  <FilterGroup title="Category">{availableCategories.map((item) => <button key={item} onClick={() => handleCategoryChange(item)} className={`block text-left py-1 hover:text-blue-700 ${category === item ? 'font-bold' : ''}`}>{item}</button>)}</FilterGroup>
                  {getCategoryFilters(category).map((filter) => <FilterGroup key={filter.title} title={filter.title}>{filter.options.map((option) => <label key={option} className="block py-1"><input type="checkbox" className="mr-2" />{option}</label>)}</FilterGroup>)}
                  <FilterGroup title="Deals & Discounts"><p>All Discounts</p><p>Today's Deals</p><p>Clearance</p></FilterGroup>
                </aside>
                <main>
                  <h1 className="text-2xl font-bold mb-2">Results</h1>
                  <p className="text-sm text-gray-600 mb-4">Check each product page for other buying options.</p>
                  {displayedProducts.length === 0 ? <p className="text-gray-500">No organizing products under ${maxPrice} found.</p> : <div className="space-y-3">{displayedProducts.map((p) => <AmazonResultRow key={p.id} product={p} />)}</div>}
                </main>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function isOrganizationProduct(product) {
  const name = product.name.toLowerCase()
  const category = product.category.toLowerCase()
  const organizationTerms = /organizer|organiser|storage|bin|basket|box|shelf|shelves|rack|container|drawer|closet|cabinet|file folder|folder|laminator|label|packing|pouch|holder/
  const excludedCategories = /electronics|phones|laptops|computers|headphones|books|cameras|gaming|speakers|networking|tv|wearables/
  return organizationTerms.test(name) && !excludedCategories.test(category)
}

function FilterGroup({ title, children }) {
  return <section className="mb-6"><h2 className="font-bold mb-2">{title}</h2>{children}</section>
}

function getCategoryFilters(category) {
  const filters = {
    Electronics: [
      { title: 'RAM Size', options: ['Up to 5.9 GB', '6.0 to 11.9 GB', '12.0 to 17.9 GB', '18.0 GB & above'] },
      { title: 'Operating System', options: ['Windows 11', 'Windows 10', 'Mac OS', 'Chrome OS', 'Linux'] },
      { title: 'Connectivity', options: ['Wireless', 'Bluetooth', 'USB-C', 'Wi-Fi'] }
    ],
    Fashion: [
      { title: 'Size', options: ['Small', 'Medium', 'Large', 'XL and above'] },
      { title: 'Color', options: ['Black', 'Blue', 'White', 'Red'] },
      { title: 'Department', options: ["Men's", "Women's", 'Kids'] }
    ],
    Books: [
      { title: 'Format', options: ['Paperback', 'Hardcover', 'Kindle Edition', 'Audiobook'] },
      { title: 'Language', options: ['English', 'Hindi', 'Spanish'] },
      { title: 'Books By Subject', options: ['Fiction', 'Business', 'Self-help', 'Children'] }
    ],
    'Home & Kitchen': [
      { title: 'Room', options: ['Kitchen', 'Bedroom', 'Living Room', 'Bathroom'] },
      { title: 'Customer Rating', options: ['4 Stars & Up', '3 Stars & Up'] }
    ],
    'Sports & Outdoors': [
      { title: 'Sports Type', options: ['Fitness', 'Running', 'Yoga', 'Outdoor Recreation'] },
      { title: 'Brand', options: ['Top Brands', 'New Arrivals'] }
    ]
  }
  return filters[category] || [
    { title: 'Customer Reviews', options: ['4 Stars & Up', '3 Stars & Up'] },
    { title: 'Availability', options: ['Include out of stock'] }
  ]
}

function AmazonResultRow({ product }) {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const addProductToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    await addToCart(product.id, 1)
  }

  return (
    <article className="bg-white border-b border-gray-200 min-h-[250px] p-4 flex flex-col sm:flex-row gap-5">
      <Link to={`/product/${product.id}`} className="w-full sm:w-56 h-56 shrink-0 bg-gray-50 flex items-center justify-center">
        <img src={getProductImage(product)} alt={product.name} onError={(event) => handleProductImageError(event, product)} className="max-w-full max-h-full object-contain" />
      </Link>
      <div className="flex-1 min-w-0 py-1">
        <Link to={`/product/${product.id}`} className="text-xl leading-7 hover:text-blue-700 hover:underline">{product.name}</Link>
        <div className="flex items-center gap-2 text-sm text-amazonOrange mt-2">{Number(product.rating || 0).toFixed(1)} ★★★★★ <span className="text-blue-700">({product.reviewCount ?? 0})</span></div>
        <p className="text-sm text-gray-600 mt-2">{product.stock > 0 ? `${Math.min(product.stock, 400)}+ bought in past month` : 'Currently unavailable'}</p>
        <p className="text-2xl font-semibold mt-3">${Number(product.price).toFixed(2)}</p>
        <p className="text-sm text-gray-600">Delivery available for your location</p>
        <button onClick={addProductToCart} className="mt-4 border border-yellow-600 bg-amazonYellow hover:bg-amazonOrange rounded-full px-8 py-2 text-sm font-medium">Add to cart</button>
      </div>
    </article>
  )
}

const promoCards = [
  { title: 'School essentials at every price', eyebrow: 'Shop Back to School', category: 'Sports & Outdoors', keywords: ['school', 'backpack', 'bottle', 'headphone'], color: 'bg-[#ff5b00]', text: 'text-white' },
  { title: 'Shop all things beauty', eyebrow: 'Beauty picks for every day', category: 'Beauty', keywords: ['beauty', 'makeup', 'cosmetic', 'skincare', 'hair'], color: 'bg-[#ffc7b8]', text: 'text-gray-950' },
  { title: 'Shop kitchen must-haves', eyebrow: 'Upgrade your kitchen', category: 'Home & Kitchen', color: 'bg-[#d7e1df]', text: 'text-gray-950' },
  { title: 'Organize your space under $40', eyebrow: 'Shop Back to School', category: 'Storage', maxPrice: 40, keywords: ['storage', 'organizer', 'organiser', 'bin', 'box'], color: 'bg-[#eaff4f]', text: 'text-gray-950' },
  { title: 'Start looking sharp', eyebrow: 'Fresh styles for you', category: 'Fashion', color: 'bg-[#d5ccc3]', text: 'text-gray-950' },
  { title: 'Tech for every day', eyebrow: 'Explore electronics', category: 'Electronics', color: 'bg-[#b9d5f5]', text: 'text-gray-950' }
]

function findPromoProduct(promo, products) {
  const categoryProducts = products.filter((product) => product.category === promo.category)
  const candidates = (categoryProducts.length ? categoryProducts : products).filter((product) => {
    const name = product.name.toLowerCase()
    return !promo.keywords || promo.keywords.some((keyword) => name.includes(keyword))
  })
  const affordable = promo.maxPrice ? candidates.filter((product) => Number(product.price) <= promo.maxPrice) : candidates
  return affordable[0] || (promo.maxPrice ? null : candidates[0] || categoryProducts[0] || null)
}

function PromoCard({ promo, product, onClick }) {
  const imageProduct = product || { category: promo.category }
  return (
    <button onClick={onClick} className={`relative snap-start shrink-0 w-[270px] sm:w-[310px] md:w-[360px] h-[480px] md:h-[600px] overflow-hidden rounded-2xl text-left ${promo.color} ${promo.text} group`}>
      <div className="relative z-10 h-[57%] p-5 md:p-6 pr-4">
          <p className="text-sm md:text-lg font-medium">{promo.eyebrow}</p>
        <h2 className="text-3xl md:text-4xl font-black leading-[0.98] mt-3 max-w-[280px]">{promo.title}</h2>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[43%] flex items-end justify-center p-5 pt-8 bg-gradient-to-t from-black/10 to-transparent">
          <img src={getProductImage(imageProduct)} alt={product?.name || promo.title} onError={(event) => handleProductImageError(event, imageProduct)} className="max-h-full max-w-[88%] object-contain object-bottom mix-blend-multiply transition-transform duration-300 group-hover:scale-105" />
      </div>
    </button>
  )
}

function DashboardRail({ title, products }) {
  return (
    <section className="max-w-[1480px] mx-auto px-4 mt-5">
      <div className="bg-white p-5">
        <div className="flex items-baseline gap-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <span className="text-sm text-blue-700">See all</span>
        </div>
        <ArrowCarousel itemClassName="min-w-[220px] max-w-[250px]">
          {products.map((product) => <ProductCard key={product.id} product={product} className="min-w-[220px] max-w-[250px]" />)}
        </ArrowCarousel>
      </div>
    </section>
  )
}

function CategoryShowcase({ categories }) {
  const groups = []
  for (let index = 0; index < categories.length; index += 4) {
    groups.push(categories.slice(index, index + 4))
  }

  return (
    <section className="max-w-[1480px] mx-auto px-4 mt-5 relative z-10">
      <ArrowCarousel itemClassName="w-[300px] sm:w-[350px] lg:w-[calc((100%-24px)/4)]">
        {groups.map((group, index) => (
          <div key={index} className="shrink-0 bg-white border border-gray-300 rounded-xl p-3 min-h-[430px] lg:min-h-[500px] w-[300px] sm:w-[350px] lg:w-[calc((100%-24px)/4)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">{group[0]?.name || 'Shop more'}</h2>
              <span className="text-2xl text-gray-700">›</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {group.map(({ name, product }) => (
                <Link key={name} to={`/?category=${encodeURIComponent(name)}`} className="min-w-0 group">
                  <div className="h-32 lg:h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <img src={getProductImage(product)} alt={product.name} onError={(event) => handleProductImageError(event, product)} className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105" />
                  </div>
                  <p className="text-sm mt-1 truncate">{name}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </ArrowCarousel>
    </section>
  )
}

function ArrowCarousel({ children, className = '', itemClassName = '' }) {
  const scrollRef = useRef(null)
  const scroll = (amount) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: scrollRef.current.scrollLeft + amount, behavior: 'smooth' })
    }
  }

  return (
    <div className={`relative group/carousel ${className}`}>
      <button type="button" aria-label="Scroll left" onClick={(event) => { event.preventDefault(); event.stopPropagation(); scroll(-420) }} className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-12 h-16 bg-white border border-gray-300 rounded-r-lg text-3xl shadow-md cursor-pointer">‹</button>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide snap-x pb-2">
        {React.Children.map(children, (child) => React.cloneElement(child, { className: `${child.props.className || ''} ${itemClassName} snap-start` }))}
      </div>
      <button type="button" aria-label="Scroll right" onClick={(event) => { event.preventDefault(); event.stopPropagation(); scroll(420) }} className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-12 h-16 bg-white border border-gray-300 rounded-l-lg text-3xl shadow-md cursor-pointer">›</button>
    </div>
  )
}
