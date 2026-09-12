const fallbackImages = {
  electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600',
  'home & kitchen': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600',
  fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600',
  books: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600',
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600',
  beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',
  storage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
  default: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600'
}

export function getProductImage(product) {
  return product.imageUrl || fallbackImages[product.category?.toLowerCase()] || fallbackImages.default
}

export function handleProductImageError(event, product) {
  const fallback = fallbackImages[product.category?.toLowerCase()] || fallbackImages.default
  if (event.currentTarget.src !== fallback) {
    event.currentTarget.src = fallback
  }
}