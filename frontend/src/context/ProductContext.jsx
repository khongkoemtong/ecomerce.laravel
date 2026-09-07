import { createContext, useContext, useState, useEffect } from 'react'

const ProductContext = createContext(null)

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000/api'
const BACKEND_URL = API_BASE_URL.replace(/\/api$/, '')

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [promotions, setPromotions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const [catRes, brandRes, prodRes, promoRes] = await Promise.all([
          fetch(`${API_BASE_URL}/categories`),
          fetch(`${API_BASE_URL}/brands`),
          fetch(`${API_BASE_URL}/products?per_page=100`),
          fetch(`${API_BASE_URL}/promotions?per_page=100`).catch(() => ({ ok: false }))
        ])

        // Parse Categories
        let fetchedCategories = []
        if (catRes.ok) {
          const catData = await catRes.json()
          fetchedCategories = Array.isArray(catData) 
            ? catData 
            : (Array.isArray(catData.categories) 
                ? catData.categories 
                : (Array.isArray(catData.category)
                    ? catData.category
                    : (Array.isArray(catData.categories?.data) ? catData.categories.data : [])))
          const mappedCategories = fetchedCategories.map(c => ({
            ...c,
            image: c.image 
              ? (c.image.startsWith('http') ? c.image : `${BACKEND_URL}${c.image}`)
              : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80'
          }))
          setCategories(mappedCategories)
        }

        // Parse Brands
        let fetchedBrands = []
        if (brandRes.ok) {
          const brandData = await brandRes.json()
          fetchedBrands = Array.isArray(brandData)
            ? brandData
            : (Array.isArray(brandData.brands) 
                ? brandData.brands 
                : (Array.isArray(brandData.brand)
                    ? brandData.brand
                    : (Array.isArray(brandData['Brand ']) 
                        ? brandData['Brand '] 
                        : (Array.isArray(brandData.brands?.data) ? brandData.brands.data : []))))
          const mappedBrands = fetchedBrands.map(b => ({
            ...b,
            image: b.logo || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80'
          }))
          setBrands(mappedBrands)
        }

        // Parse Promotions
        if (promoRes && promoRes.ok) {
          const promoData = await promoRes.json()
          setPromotions(promoData.promotions || [])
        }

        // Parse Products
        let rawProducts = []
        if (prodRes.ok) {
          const prodData = await prodRes.json()
          if (Array.isArray(prodData)) {
            rawProducts = prodData
          } else if (Array.isArray(prodData.products)) {
            rawProducts = prodData.products
          } else if (Array.isArray(prodData.products?.data)) {
            rawProducts = prodData.products.data
          } else if (Array.isArray(prodData.data)) {
            rawProducts = prodData.data
          }
        }

        // Map backend product data to frontend structure
        const mappedProducts = rawProducts.map(p => {
          // Resolve category name
          const catObj = fetchedCategories.find(c => Number(c.id) === Number(p.category_id))
          const categoryName = catObj ? catObj.name : 'New Season'

          // Resolve brand name
          const brandObj = fetchedBrands.find(b => Number(b.id) === Number(p.brand_id))
          const brandName = brandObj ? brandObj.name : 'Atelier'

          // Determine sizes based on category/name
          let sizes = ['XS', 'S', 'M', 'L']
          const lowerName = (p.name || '').toLowerCase()
          if (lowerName.includes('shoe') || lowerName.includes('boot') || lowerName.includes('heel')) {
            sizes = ['36', '37', '38', '39', '40', '41', '42']
          } else if (lowerName.includes('bag') || lowerName.includes('jewelry') || lowerName.includes('earring')) {
            sizes = ['One Size']
          }

          // Determine colors based on details
          let colors = ['#1C1C1C', '#ECE7DF']
          if (lowerName.includes('slip dress') || lowerName.includes('ivory')) {
            colors = ['#FFFFFF', '#E6E1DA', '#1C1C1C']
          } else if (lowerName.includes('heel') || lowerName.includes('red')) {
            colors = ['#D32F2F', '#000000', '#D0C9B0']
          } else if (lowerName.includes('trench')) {
            colors = ['#D2B48C', '#1C1C1C']
          }

          const imageUrl = p.image 
            ? (p.image.startsWith('http') ? p.image : `${BACKEND_URL}${p.image}`)
            : 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80'

          const originalPriceVal = Number(p.price) || 0;
          const hasDbDiscount = p.discount_price !== null && Number(p.discount_price) > 0 && Number(p.discount_price) < originalPriceVal;
          
          const discountPriceVal = hasDbDiscount ? Number(p.discount_price) : null;
          const discountPercent = hasDbDiscount ? Math.round(((originalPriceVal - discountPriceVal) / originalPriceVal) * 100) : 0;

          const finalPriceStr = discountPriceVal 
            ? `$${discountPriceVal.toFixed(2)}` 
            : `$${originalPriceVal.toFixed(2)}`;
            
          const originalPriceStr = `$${originalPriceVal.toFixed(2)}`;

          return {
            id: p.slug || String(p.id),
            dbId: p.id,
            name: p.name,
            sku: p.sku || `SKU-${p.id}`,
            brand: brandName,
            category: categoryName,
            breadcrumbs: `${categoryName.toUpperCase()} / ${p.name.toUpperCase()}`,
            price: finalPriceStr,
            originalPrice: originalPriceStr,
            hasDiscount: hasDbDiscount,
            discountPercent,
            discountPrice: discountPriceVal,
            rawPrice: originalPriceVal,
            rawFinalPrice: discountPriceVal || originalPriceVal,
            stock: Number(p.stock_qty ?? 10),
            stock: Number(p.stock_qty ?? 0),
            isOutOfStock: Number(p.stock_qty ?? 0) <= 0,
            image: imageUrl,
            detailImages: [imageUrl],
            colors,
            sizes,
            description: p.description || 'A refined piece crafted for modern wardrobe rituals, balancing structural form and quiet luxury.',
            stylingAdvisory: 'Pair with tailored base layers and minimal leather accessories for an elevated daily uniform.',
            materialsDetails: 'Premium crafted construction. Dry clean or specialty care recommended.'
          }
        })

        setProducts(mappedProducts)
      } catch (err) {
        console.error('Failed to fetch data from backend API:', err)
        setError(err.message || 'Failed to fetch database products')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <ProductContext.Provider value={{ products, categories, brands, promotions, isLoading, error }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider')
  }
  return context
}
