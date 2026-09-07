import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTheme } from '../../../context/ThemeContext'
import Header from '../../../components/Header'
import { useCartWishlist } from '../../../context/CartWishlistContext'
import { getProductCategories } from '../productData'
import { FaRegHeart, FaHeart, FaFilter, FaChevronDown, FaTimes, FaCheck, FaArrowRight } from 'react-icons/fa'
import { IoBagHandleOutline } from 'react-icons/io5'
import { useProducts } from '../../../context/ProductContext'
import DiscountBadge from '../../../components/DiscountBadge'

export default function ShopPage() {
  const { isDark } = useTheme()
  const { products, isLoading } = useProducts()
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCartWishlist()
  const [searchParams, setSearchParams] = useSearchParams()

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [priceRange, setPriceRange] = useState('All')
  const [selectedSize, setSelectedSize] = useState('All')
  const [sortBy, setSortBy] = useState('Featured')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Quiz Modal State
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [quizStep, setQuizStep] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState({ palette: '', silhouette: '', setting: '' })
  const [quizResults, setQuizResults] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)

  // Track scrolling for floating elements
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Parse URL search parameters for category
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    } else {
      setSelectedCategory('All')
    }
  }, [searchParams])

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, priceRange, selectedSize, sortBy])



  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // 1. Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(product => {
        const productCats = getProductCategories(product)
        return productCats.includes(selectedCategory)
      })
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
  }, [selectedCategory, priceRange, selectedSize, sortBy])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(start, start + itemsPerPage)
  }, [filteredProducts, currentPage])

  // Handle banner clicks
  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setSearchParams(category === 'All' ? {} : { category })
  }

  // Quiz Handling
  const startQuiz = () => {
    setQuizAnswers({ palette: '', silhouette: '', setting: '' })
    setQuizStep(1)
    setQuizResults(null)
    setIsQuizOpen(true)
  }

  const handleQuizAnswer = (field, value) => {
    const nextAnswers = { ...quizAnswers, [field]: value }
    setQuizAnswers(nextAnswers)
    
    if (field === 'palette') {
      setQuizStep(2)
    } else if (field === 'silhouette') {
      setQuizStep(3)
    } else if (field === 'setting') {
      calculateQuizResult(nextAnswers)
      setQuizStep(4)
    }
  }

  const calculateQuizResult = (answers) => {
    // Basic recommendation logic based on answers
    let styleTitle = 'Minimalist Modernist'
    let styleDesc = 'You gravitate towards architectural proportions, monochromatic schemes, and elevated wardrobe foundations.'
    let recommendedIds = ['sculptural-wool-overcoat', 'structured-leather-bag']

    if (answers.palette === 'Warm Neutrals' || answers.silhouette === 'Fluid & Draped') {
      styleTitle = 'Sartorial Poet'
      styleDesc = 'Your style language speaks to fluid silhouettes, soft organic tones, and high-texture fabrics.'
      recommendedIds = ['ivory-slip-dress', 'tailored-wool-trousers']
    } else if (answers.palette === 'Statement Contrast' || answers.setting === 'Evening Elegance') {
      styleTitle = 'Avant-Garde Muse'
      styleDesc = 'You embrace dramatic structures, fine-crafted accessories, and a confident mix of classic tailoring and statement shapes.'
      recommendedIds = ['minimal-accent-heel', 'structured-leather-bag']
    }

    const recommendedProducts = products.filter(p => recommendedIds.includes(p.id))
    setQuizResults({
      title: styleTitle,
      description: styleDesc,
      products: recommendedProducts
    })
  }

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
        
        {/* SECTION 1: THREE TOP CATEGORY BANNERS */}
        <section className="grid gap-4 md:grid-cols-3 mb-12">
          {/* Banner 1: Women */}
          <div 
            onClick={() => handleCategorySelect('Women')}
            className={`group relative h-[90vh] overflow-hidden border cursor-pointer transition duration-500 ${
              selectedCategory === 'Women'
                ? 'border-amber-500 shadow-[0_0_20px_rgba(212,175,55,0.25)]'
                : isDark ? 'border-white/10' : 'border-black/10'
            }`}
          >
            <img 
              src="https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=600&q=80" 
              alt="Women Collection" 
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-300">Collection 2026</p>
              <h2 className="font-serif text-3xl tracking-wide group-hover:text-amber-300 transition duration-300 mt-1">Women</h2>
            </div>
            {selectedCategory === 'Women' && (
              <span className="absolute top-4 right-4 bg-amber-500 text-black px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                Selected
              </span>
            )}
          </div>

          {/* Banner 2: Men */}
          <div 
            onClick={() => handleCategorySelect('Men')}
            className={`group relative h-[90vh] overflow-hidden border cursor-pointer transition duration-500 ${
              selectedCategory === 'Men'
                ? 'border-amber-500 shadow-[0_0_20px_rgba(212,175,55,0.25)]'
                : isDark ? 'border-white/10' : 'border-black/10'
            }`}
          >
            <img 
              src="https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&q=80" 
              alt="Men Collection" 
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-300">Collection 2026</p>
              <h2 className="font-serif text-3xl tracking-wide group-hover:text-amber-300 transition duration-300 mt-1">Men</h2>
            </div>
            {selectedCategory === 'Men' && (
              <span className="absolute top-4 right-4 bg-amber-500 text-black px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                Selected
              </span>
            )}
          </div>

          {/* Banner 3: Accessories */}
          <div 
            onClick={() => handleCategorySelect('Accessories')}
            className={`group relative h-[90vh] overflow-hidden border cursor-pointer transition duration-500 ${
              selectedCategory === 'Accessories'
                ? 'border-amber-500 shadow-[0_0_20px_rgba(212,175,55,0.25)]'
                : isDark ? 'border-white/10' : 'border-black/10'
            }`}
          >
            <img 
              src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80" 
              alt="Accessories Collection" 
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-300">Bags & More</p>
              <h2 className="font-serif text-3xl tracking-wide group-hover:text-amber-300 transition duration-300 mt-1">Accessories</h2>
            </div>
            {selectedCategory === 'Accessories' && (
              <span className="absolute top-4 right-4 bg-amber-500 text-black px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                Selected
              </span>
            )}
          </div>
        </section>

        {/* SECTION 2: FILTER & SORT BAR */}
        <section className={`border-y px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 transition ${
          isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'
        }`}>
          {/* Left Panel Toggle */}
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
            {selectedCategory !== 'All' || priceRange !== 'All' || selectedSize !== 'All' ? (
              <button
                onClick={() => {
                  setSelectedCategory('All')
                  setPriceRange('All')
                  setSelectedSize('All')
                  setSearchParams({})
                }}
                className="text-[10px] font-bold text-amber-500 uppercase tracking-widest underline hover:text-amber-400 ml-2"
              >
                Clear All
              </button>
            ) : null}
          </div>

          {/* Right Sort Control */}
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
            {/* Filter 1: Category */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest font-bold text-amber-500">Gender / Type</h3>
              <div className="flex flex-col gap-2">
                {['All', 'Women', 'Men', 'Accessories'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`text-left text-xs uppercase tracking-wider transition ${
                      selectedCategory === cat
                        ? 'font-bold text-amber-400'
                        : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                    }`}
                  >
                    {cat}
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
                {['All', 'XS', 'S', 'M', 'L', 'One Size', '36', '37', '38', '39', '40'].map(sz => (
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

        {/* SECTION 3: PRODUCT GRID */}
        <section className="mb-16">
          <div className="flex justify-between items-end mb-8">
            <h2 className={`font-serif text-3xl tracking-wide ${isDark ? 'text-white' : 'text-stone-900'}`}>
              Trending This Week
            </h2>
            <button
              onClick={() => {
                setSelectedCategory('All')
                setPriceRange('All')
                setSelectedSize('All')
                setSearchParams({})
              }}
              className={`text-xs uppercase tracking-widest font-bold transition hover:text-amber-500 ${
                isDark ? 'text-stone-400' : 'text-stone-600'
              }`}
            >
              View All
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 border border-dashed rounded-2xl border-stone-500/20">
              <p className="text-sm uppercase tracking-widest text-stone-400">No products match your selected filters</p>
              <button
                onClick={() => {
                  setSelectedCategory('All')
                  setPriceRange('All')
                  setSelectedSize('All')
                  setSearchParams({})
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

                  // Determine a nice mock badge
                  let badge = isOutOfStock ? 'Sold Out' : 'Atelier Core'
                  if (!isOutOfStock) {
                    if (product.id === 'ivory-slip-dress') badge = 'New Arrival'
                    if (product.id === 'sculptural-wool-overcoat') badge = 'Best Seller'
                    if (product.id === 'structured-leather-bag') badge = 'Limited Edition'
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
                        window.scrollTo({ top: 400, behavior: 'smooth' })
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
                        window.scrollTo({ top: 400, behavior: 'smooth' })
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
                        window.scrollTo({ top: 400, behavior: 'smooth' })
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

        {/* SECTION 4: STYLE QUIZ PROMPT */}
        <section className={`grid overflow-hidden border lg:grid-cols-[1fr_1fr] mb-16 ${
          isDark ? "border-white/10 bg-stone-900/40" : "border-black/10 bg-stone-100/50"
        }`}>
          {/* Left: Editorial split photo */}
          <div className="relative min-h-[650px]">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"
              alt="Define style profile"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/35" />
          </div>

          {/* Right: Content panel */}
          <div className={`px-8 py-12 sm:px-12 sm:py-16 flex flex-col justify-center ${
            isDark ? "bg-black/45 text-white" : "bg-white/60 text-stone-900"
          }`}>
            <p className={`text-[0.68rem] uppercase tracking-[0.4em] font-bold ${isDark ? "text-amber-200/70" : "text-amber-600"}`}>
              Personalized Curation
            </p>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl leading-tight">
              Define Your Style Identity
            </h2>
            <p className={`mt-5 text-sm leading-7 ${isDark ? "text-stone-300" : "text-stone-700"}`}>
              Our proprietary algorithm analyzes your aesthetic preferences and silhouettes to curate a bespoke capsule collection tailored specifically to your visual language.
            </p>
            <div>
              <button
                onClick={startQuiz}
                className="mt-8 inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-black px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.32em] transition cursor-pointer"
              >
                <span>Start the Quiz</span>
                <FaArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 5: SOCIAL SHOWCASE */}
        <section className="text-center mb-8">
          <h2 className={`font-serif text-3xl sm:text-4xl ${isDark ? "text-white" : "text-stone-900"}`}>
            As Seen In Atelier
          </h2>
          <p className="mt-2 text-xs uppercase tracking-[0.25em] text-stone-400 font-medium">
            Tag @atelier.official to be featured in our monthly digital editorial.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-8">
            {[
              'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80'
            ].map((url, idx) => (
              <div 
                key={idx} 
                className="aspect-square overflow-hidden border border-black/5 dark:border-white/5 relative group"
              >
                <img
                  src={url}
                  alt={`Social feature ${idx + 1}`}
                  className="w-full h-full object-cover transition duration-700 grayscale group-hover:grayscale-0 group-hover:scale-105 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* FLOATING CATEGORY BADGE */}
      {isScrolled && selectedCategory !== 'All' && (
        <div className="fixed bottom-8 right-8 z-40">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-full shadow-2xl text-[10px] font-bold uppercase tracking-widest transition cursor-pointer hover:-translate-y-1 ${
              isDark ? 'bg-amber-500 text-black shadow-amber-500/20 hover:bg-amber-400' : 'bg-black text-white shadow-black/20 hover:bg-stone-800'
            }`}
          >
            Viewing: {selectedCategory}
          </button>
        </div>
      )}

      {/* QUIZ INTERACTIVE MODAL */}
      {isQuizOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85">
          <div className={`relative w-full max-w-xl border p-8 shadow-2xl transition duration-300 ${
            isDark ? 'border-white/10 bg-stone-950 text-white' : 'border-black/10 bg-white text-stone-900'
          }`}>
            <button
              onClick={() => setIsQuizOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-amber-500 transition cursor-pointer"
              aria-label="Close Quiz"
            >
              <FaTimes className="h-5 w-5" />
            </button>

            {/* STEP 1: Color Palette */}
            {quizStep === 1 && (
              <div className="space-y-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-bold">Step 1 of 3</p>
                <h3 className="font-serif text-2xl">What is your preferred color palette?</h3>
                <div className="grid gap-3">
                  {[
                    'Warm Neutrals',
                    'Monochromatic',
                    'Statement Contrast'
                  ].map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleQuizAnswer('palette', opt)}
                      className={`text-left px-5 py-4 border text-sm transition font-medium ${
                        isDark 
                          ? 'border-white/10 hover:border-amber-400 bg-white/5' 
                          : 'border-black/10 hover:border-amber-600 bg-black/5'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Silhouette */}
            {quizStep === 2 && (
              <div className="space-y-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-bold">Step 2 of 3</p>
                <h3 className="font-serif text-2xl">Which silhouette defines your personal style?</h3>
                <div className="grid gap-3">
                  {[
                    'Oversized & Structured',
                    'Fluid & Draped',
                    'Classic & Tailored'
                  ].map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleQuizAnswer('silhouette', opt)}
                      className={`text-left px-5 py-4 border text-sm transition font-medium ${
                        isDark 
                          ? 'border-white/10 hover:border-amber-400 bg-white/5' 
                          : 'border-black/10 hover:border-amber-600 bg-black/5'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Setting */}
            {quizStep === 3 && (
              <div className="space-y-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-bold">Step 3 of 3</p>
                <h3 className="font-serif text-2xl">What is the setting for your wardrobe rituals?</h3>
                <div className="grid gap-3">
                  {[
                    'Creative Director / Gallery',
                    'Evening Elegance / Dinner',
                    'Minimalist Ease / Weekend'
                  ].map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleQuizAnswer('setting', opt)}
                      className={`text-left px-5 py-4 border text-sm transition font-medium ${
                        isDark 
                          ? 'border-white/10 hover:border-amber-400 bg-white/5' 
                          : 'border-black/10 hover:border-amber-600 bg-black/5'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: Quiz Results */}
            {quizStep === 4 && quizResults && (
              <div className="space-y-6">
                <div className="text-center">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-black mb-4">
                    <FaCheck className="h-5 w-5" />
                  </span>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-bold">Your Style Identity</p>
                  <h3 className="font-serif text-3xl mt-1">{quizResults.title}</h3>
                  <p className={`mt-3 text-xs leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                    {quizResults.description}
                  </p>
                </div>

                <div className="border-t pt-5">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-bold mb-4">Recommended for You</p>
                  <div className="grid gap-4 grid-cols-2">
                    {quizResults.products.map(p => (
                      <div 
                        key={p.id} 
                        className={`flex gap-3 p-3 border transition ${
                          isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'
                        }`}
                      >
                        <img src={p.image} alt={p.name} className="h-16 w-12 object-cover border" />
                        <div className="flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs uppercase font-semibold text-stone-200 line-clamp-1">{p.name}</h4>
                            <p className="text-[10px] text-amber-400 mt-0.5">{p.price}</p>
                          </div>
                          <Link 
                            to={`/product/${p.id}`}
                            className="text-[9px] uppercase tracking-widest font-bold underline hover:text-amber-500"
                            onClick={() => setIsQuizOpen(false)}
                          >
                            View Detail
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsQuizOpen(false)}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black px-4 py-3 text-xs uppercase tracking-widest font-bold transition mt-4"
                >
                  Explore Atelier Collection
                </button>
              </div>
            )}

          </div>
        </div>
      )}

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
