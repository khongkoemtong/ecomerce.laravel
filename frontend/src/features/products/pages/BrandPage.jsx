import { useState, useMemo, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTheme } from '../../../context/ThemeContext'
import Header from '../../../components/Header'
import { useCartWishlist } from '../../../context/CartWishlistContext'
import { useProducts } from '../../../context/ProductContext'
import { FaRegHeart, FaHeart, FaFilter } from 'react-icons/fa'
import { IoBagHandleOutline } from 'react-icons/io5'
import DiscountBadge from '../../../components/DiscountBadge'

export default function BrandPage() {
  const { brandName } = useParams()
  const { isDark } = useTheme()
  const { products, isLoading } = useProducts()
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCartWishlist()

  // Filter States
  const [selectedType, setSelectedType] = useState('All')
  const [priceRange, setPriceRange] = useState('All')
  const [selectedSize, setSelectedSize] = useState('All')
  const [sortBy, setSortBy] = useState('Featured')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Resolve matching products for this brand (case insensitive)
  const brandProducts = useMemo(() => {
    return products.filter(product => 
      product.brand && product.brand.toLowerCase() === brandName?.toLowerCase()
    )
  }, [products, brandName])

  // Resolve display name for the brand
  const displayName = useMemo(() => {
    if (brandProducts.length > 0) {
      return brandProducts[0].brand
    }
    // Fallback formatting
    return brandName ? brandName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : ''
  }, [brandName, brandProducts])

  // Dynamic list of product types (categories) available in this Brand's collection
  const availableTypes = useMemo(() => {
    const types = new Set()
    brandProducts.forEach(p => {
      if (p.category) types.add(p.category)
    })
    return ['All', ...Array.from(types)]
  }, [brandProducts])

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...brandProducts]

    // 1. Type (Subcategory) Filter
    if (selectedType !== 'All') {
      result = result.filter(product => product.category === selectedType)
    }

    // 2. Price Range Filter
    if (priceRange !== 'All') {
      result = result.filter(product => {
        const numericPrice = parseFloat(product.price.replace('$', ''))
        if (priceRange === 'under150') return numericPrice < 150
        if (priceRange === '150-250') return numericPrice >= 150 && numericPrice <= 250
        if (priceRange === 'over250') return numericPrice > 250
        return true
      })
    }

    // 3. Size Filter
    if (selectedSize !== 'All') {
      result = result.filter(product => product.sizes && product.sizes.includes(selectedSize))
    }

    // 4. Sorting
    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', '')))
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', '')))
    } else if (sortBy === 'Name: A to Z') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    return result
  }, [brandProducts, selectedType, priceRange, selectedSize, sortBy])

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(start, start + itemsPerPage)
  }, [filteredProducts, currentPage])

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedType, priceRange, selectedSize, sortBy, brandName])

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-sans ${isDark ? 'bg-stone-950 text-stone-200' : 'bg-stone-50 text-stone-850'}`}>
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-500 font-bold animate-pulse">Loading Collection</p>
          <div className="mt-4 h-1 w-24 bg-amber-500/20 mx-auto rounded overflow-hidden">
            <div className="h-full bg-amber-500 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-all duration-300 font-sans ${
      isDark 
        ? "bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.18),_transparent_35%),linear-gradient(135deg,_#090909_0%,_#111111_45%,_#050505_100%)] text-stone-100" 
        : "bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.12),_transparent_35%),linear-gradient(135deg,_#fbf9f6_0%,_#f5f2eb_45%,_#ece7df_100%)] text-stone-900"
    }`}>
      <Header />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        
        {/* HERO SECTION */}
        <section className="relative h-[45vh] min-h-[300px] overflow-hidden border border-amber-500/20 mb-12 group">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80" 
            alt={`${displayName} Collection`} 
            className="h-full w-full object-cover transition duration-700 group-hover:scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-10 left-8 md:left-12 text-white max-w-xl">
            <p className="text-[0.7rem] uppercase tracking-[0.4em] text-amber-200/80 mb-2 font-semibold">Brand Showcase</p>
            <h1 className="font-serif text-4xl sm:text-5xl tracking-wide leading-tight mb-4">{displayName}</h1>
            <p className="text-sm leading-relaxed text-stone-300">
              Explore the curated selection of tailoring, outerwear, and accessories from {displayName}.
            </p>
          </div>
        </section>

        {/* FILTER & SORT BAR */}
        <section className={`border-y px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 transition ${
          isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'
        }`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-widest transition cursor-pointer ${
                isDark ? 'text-stone-300 hover:text-amber-300' : 'text-stone-700 hover:text-amber-600'
              }`}
            >
              <FaFilter className="h-3.5 w-3.5" />
              <span>Filter</span>
            </button>
            <div className={`h-4 w-px ${isDark ? 'bg-white/15' : 'bg-black/15'}`} />
            <p className="text-xs uppercase tracking-widest text-stone-400 font-medium">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Item' : 'Items'}
            </p>
            {selectedType !== 'All' || priceRange !== 'All' || selectedSize !== 'All' ? (
              <button
                onClick={() => {
                  setSelectedType('All')
                  setPriceRange('All')
                  setSelectedSize('All')
                }}
                className="text-[10px] font-bold text-amber-500 uppercase tracking-widest underline hover:text-amber-400 ml-2"
              >
                Clear All
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`text-xs font-semibold uppercase tracking-widest border px-3 py-1.5 outline-none rounded bg-transparent ${
                isDark ? 'border-white/10 text-white' : 'border-black/10 text-stone-900'
              }`}
            >
              <option value="Featured" className={isDark ? 'bg-stone-900 text-white' : 'bg-white text-stone-950'}>Featured</option>
              <option value="Price: Low to High" className={isDark ? 'bg-stone-900 text-white' : 'bg-white text-stone-950'}>Price: Low to High</option>
              <option value="Price: High to Low" className={isDark ? 'bg-stone-900 text-white' : 'bg-white text-stone-950'}>Price: High to Low</option>
              <option value="Name: A to Z" className={isDark ? 'bg-stone-900 text-white' : 'bg-white text-stone-950'}>Name: A to Z</option>
            </select>
          </div>
        </section>

        {/* Collapsible Filter Panel */}
        {isFilterOpen && (
          <section className={`p-6 border-b grid gap-6 grid-cols-1 sm:grid-cols-3 mb-8 transition-all duration-300 ${
            isDark ? 'border-white/10 bg-black/40' : 'border-black/10 bg-stone-100/60'
          }`}>
            {/* Filter 1: Type */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest font-bold text-amber-500">Category</h3>
              <div className="flex flex-col gap-2">
                {availableTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`text-left text-xs uppercase tracking-wider transition ${
                      selectedType === type
                        ? 'font-bold text-amber-400'
                        : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 2: Price */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest font-bold text-amber-500">Price</h3>
              <div className="flex flex-col gap-2">
                {[
                  { value: 'All', label: 'All Prices' },
                  { value: 'under150', label: 'Under $150' },
                  { value: '150-250', label: '$150 - $250' },
                  { value: 'over250', label: 'Over $250' },
                ].map(p => (
                  <button
                    key={p.value}
                    onClick={() => setPriceRange(p.value)}
                    className={`text-left text-xs uppercase tracking-wider transition ${
                      priceRange === p.value
                        ? 'font-bold text-amber-400'
                        : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 3: Sizes */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest font-bold text-amber-500">Size</h3>
              <div className="flex flex-wrap gap-2">
                {['All', 'XS', 'S', 'M', 'L', 'One Size', '36', '37', '38', '39', '40', '41', '42', '43'].map(sz => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`border px-3 py-1.5 text-xs font-semibold rounded transition ${
                      selectedSize === sz
                        ? 'border-amber-500 bg-amber-500 text-black'
                        : isDark
                          ? 'border-white/10 bg-white/5 text-stone-300 hover:border-white/20'
                          : 'border-black/10 bg-black/5 text-stone-700 hover:border-black/20'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* PRODUCT GRID */}
        <section className="mb-16">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 border border-dashed rounded-2xl border-stone-500/20">
              <p className="text-sm uppercase tracking-widest text-stone-400">No products match your selected filters</p>
              <button
                onClick={() => {
                  setSelectedType('All')
                  setPriceRange('All')
                  setSelectedSize('All')
                }}
                className="mt-4 bg-amber-500 text-black px-6 py-2.5 text-xs uppercase tracking-widest font-bold hover:bg-amber-400 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
                {paginatedProducts.map((product) => {
                  const wishlisted = isInWishlist(product.id)
                  const isOutOfStock = (product.stock ?? 0) <= 0;
                  const originalVal = product.originalPrice ? parseFloat(product.originalPrice.replace('$', '')) : 0;
                  const currentVal = product.price ? parseFloat(product.price.replace('$', '')) : 0;
                  const discountPercent = originalVal && currentVal && originalVal > currentVal
                    ? Math.round(((originalVal - currentVal) / originalVal) * 100)
                    : 0;

                  let badge = isOutOfStock ? 'Sold Out' : 'Atelier Core'
                  if (!isOutOfStock) {
                    if (product.id === 'ivory-slip-dress') badge = 'New Arrival'
                    if (product.id === 'sculptural-wool-overcoat') badge = 'Best Seller'
                  }

                  return (
                    <div
                      key={product.id}
                      className={`group border transition-all duration-300 ${
                        isDark 
                          ? "border-white/10 bg-stone-900/90 shadow-[0_12px_40px_rgba(0,0,0,0.3)] hover:border-amber-500/30" 
                          : "border-black/10 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.05)] hover:border-amber-600/30"
                      }`}
                    >
                      {/* Image Box */}
                      <div className={`relative overflow-hidden border-b ${isDark ? 'bg-stone-900 border-white/10' : 'bg-[#ece7df] border-black/10'}`}>
                        <Link to={`/product/${product.id}`}>
                          <img
                            src={product.image}
                            alt={product.name}
                            className={`h-64 sm:h-80 w-full object-cover transition duration-500 group-hover:scale-105 ${
                              isOutOfStock ? 'grayscale-[0.3] opacity-85' : ''
                            }`}
                          />
                        </Link>

                        {/* Top-Right Badge */}
                        <span className={`absolute top-3 right-3 text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 z-10 ${
                          isOutOfStock 
                            ? 'bg-stone-950/90 text-rose-400 border border-rose-500/40 shadow-sm backdrop-blur-xs' 
                            : 'bg-black/80 text-white'
                        }`}>
                          {badge}
                        </span>

                        {/* Top-Left: Discount Percentage Badge */}
                        {discountPercent > 0 && !isOutOfStock && (
                          <DiscountBadge
                            discount={discountPercent}
                            className="absolute top-2 left-2"
                          />
                        )}

                        {/* Bottom-Left: Add to Bag Quick Button */}
                        <button
                          disabled={isOutOfStock}
                          onClick={() => {
                            if (!isOutOfStock) {
                              const defaultSize = product.sizes ? product.sizes[0] : 'S'
                              const defaultColor = product.colors ? product.colors[0] : '#000000'
                              addToCart(product, defaultSize, defaultColor, 1)
                            }
                          }}
                          className={`absolute left-3 bottom-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border transition shadow-md cursor-pointer ${
                            isOutOfStock
                              ? "border-white/5 bg-black/40 text-stone-600 cursor-not-allowed opacity-40"
                              : isDark
                                ? "border-white/10 bg-black/80 text-stone-300 hover:bg-black hover:text-white hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                : "border-black/10 bg-white/90 text-stone-700 hover:bg-white hover:text-black hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300"
                          }`}
                          aria-label={isOutOfStock ? "Sold Out" : "Add to Bag"}
                        >
                          <IoBagHandleOutline className="h-4 w-4" />
                        </button>

                        {/* Bottom-Right: Wishlist Button */}
                        <button
                          onClick={() => {
                            if (wishlisted) {
                              removeFromWishlist(product.id)
                            } else {
                              addToWishlist(product)
                            }
                          }}
                          className={`absolute right-3 bottom-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border transition shadow-md hover:scale-110 cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                            isDark
                              ? "border-white/10 bg-black/80 text-stone-300 hover:bg-black hover:text-white"
                              : "border-black/10 bg-white/90 text-stone-700 hover:bg-white hover:text-black"
                          }`}
                          aria-label="Add to Wishlist"
                        >
                          {wishlisted ? <FaHeart className="h-4 w-4 text-amber-500" /> : <FaRegHeart className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Details Box */}
                      <div className="p-4">
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                          {product.category}
                        </p>
                        <h3 className={`mt-2 font-medium text-sm transition duration-300 ${
                          isDark ? "text-white group-hover:text-amber-300" : "text-stone-900 group-hover:text-amber-600"
                        }`}>
                          <Link to={`/product/${product.id}`}>
                            {product.name}
                          </Link>
                        </h3>
                        {isOutOfStock ? (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs font-semibold text-rose-500">
                              Sold Out
                            </span>
                            <span className={`text-xs opacity-50 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                              {product.price}
                            </span>
                          </div>
                        ) : discountPercent > 0 ? (
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`text-sm font-semibold ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                              {product.price}
                            </span>
                            <span className={`text-xs line-through opacity-60 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                              {product.originalPrice}
                            </span>
                          </div>
                        ) : (
                          <p className={`mt-2 text-sm font-semibold ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                            {product.price}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* PAGINATION CONTROL */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12 border-t pt-8 border-stone-500/10">
                  <button
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1)
                        window.scrollTo({ top: 300, behavior: 'smooth' })
                      }
                    }}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold border transition ${
                      currentPage === 1
                        ? 'opacity-40 cursor-not-allowed border-stone-500/10 text-stone-500'
                        : isDark
                          ? 'border-white/10 text-stone-300 hover:border-amber-500 hover:text-amber-400 bg-white/5'
                          : 'border-black/10 text-stone-700 hover:border-amber-600 hover:text-amber-700 bg-black/5'
                    }`}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page)
                        window.scrollTo({ top: 300, behavior: 'smooth' })
                      }}
                      className={`h-9 w-9 text-xs font-bold transition rounded-full ${
                        currentPage === page
                          ? 'bg-amber-500 text-black border border-amber-500'
                          : isDark
                            ? 'border border-white/10 text-stone-300 hover:border-amber-400 hover:text-amber-400 bg-white/5'
                            : 'border border-black/10 text-stone-700 hover:border-amber-600 hover:text-amber-700 bg-black/5'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      if (currentPage < totalPages) {
                        setCurrentPage(currentPage + 1)
                        window.scrollTo({ top: 300, behavior: 'smooth' })
                      }
                    }}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold border transition ${
                      currentPage === totalPages
                        ? 'opacity-40 cursor-not-allowed border-stone-500/10 text-stone-500'
                        : isDark
                          ? 'border-white/10 text-stone-300 hover:border-amber-500 hover:text-amber-400 bg-white/5'
                          : 'border-black/10 text-stone-700 hover:border-amber-600 hover:text-amber-700 bg-black/5'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>

      </main>

      {/* FOOTER */}
      <footer className={`border-t transition-all duration-300 px-5 py-12 sm:px-6 lg:px-8 ${
        isDark ? "border-white/10 bg-[#070707]" : "border-black/10 bg-[#f4f1eb]"
      }`}>
        <div className="mx-auto max-w-7xl grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className={`font-serif text-2xl tracking-[0.22em] ${isDark ? "text-white" : "text-stone-900"}`}>ATELIER</p>
            <p className={`mt-3 max-w-xs text-sm leading-6 ${isDark ? "text-stone-400" : "text-stone-600"}`}>
              Refining the everyday through tailored silhouettes and purposeful texture.
            </p>
          </div>

          <div>
            <p className={`text-xs uppercase tracking-[0.28em] ${isDark ? "text-amber-200/70" : "text-amber-600"}`}>Customer Care</p>
            <div className={`mt-3 space-y-2 text-sm ${isDark ? "text-stone-400" : "text-stone-600"}`}>
              <p className="hover:text-amber-500 cursor-pointer transition">Store locator</p>
              <p className="hover:text-amber-500 cursor-pointer transition">Shipping &amp; Returns</p>
              <p className="hover:text-amber-500 cursor-pointer transition">Accessibility</p>
            </div>
          </div>

          <div>
            <p className={`text-xs uppercase tracking-[0.28em] ${isDark ? "text-amber-200/70" : "text-amber-600"}`}>About</p>
            <div className={`mt-3 space-y-2 text-sm ${isDark ? "text-stone-400" : "text-stone-600"}`}>
              <p className="hover:text-amber-500 cursor-pointer transition">Journal</p>
              <p className="hover:text-amber-500 cursor-pointer transition">Craftsmanship</p>
              <p className="hover:text-amber-500 cursor-pointer transition">Privacy Policy</p>
            </div>
          </div>

          <div>
            <p className={`text-xs uppercase tracking-[0.28em] ${isDark ? "text-amber-200/70" : "text-amber-600"}`}>Newsletter</p>
            <div className={`mt-3 flex items-center gap-3 border-b pb-3 text-sm ${
              isDark ? "border-white/20 text-stone-200" : "border-black/20 text-stone-800"
            }`}>
              <input
                type="email"
                placeholder="Enter email"
                className={`bg-transparent outline-none w-full text-sm ${
                  isDark ? "text-stone-200 placeholder:text-stone-600" : "text-stone-800 placeholder:text-stone-400"
                }`}
              />
              <button 
                type="button" 
                className={`transition ${isDark ? "text-amber-500 hover:text-amber-400" : "text-amber-600 hover:text-amber-500"}`} 
                aria-label="Subscribe"
              >
                &rarr;
              </button>
            </div>
          </div>
        </div>

        <div className={`mx-auto max-w-7xl mt-12 flex flex-col gap-3 border-t pt-5 text-xs uppercase tracking-[0.22em] sm:flex-row sm:items-center sm:justify-between ${
          isDark ? "border-white/10 text-stone-500" : "border-black/10 text-stone-400"
        }`}>
          <p>2026 Atelier. All rights reserved.</p>
          <p>Crafted for modern wardrobe rituals.</p>
        </div>
      </footer>
    </div>
  )
}
