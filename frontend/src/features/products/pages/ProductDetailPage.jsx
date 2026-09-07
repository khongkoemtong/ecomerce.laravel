import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTheme } from '../../../context/ThemeContext'
import Header from '../../../components/Header'
import { useProducts } from '../../../context/ProductContext'
import { FaChevronDown, FaChevronUp, FaHeart, FaRegHeart } from 'react-icons/fa'
import { IoBagHandleOutline } from 'react-icons/io5'
import { useCartWishlist } from '../../../context/CartWishlistContext'
import DiscountBadge from '../../../components/DiscountBadge'

function ProductDetailPage() {
  const { id } = useParams()
  const { isDark } = useTheme()
  const { products, isLoading } = useProducts()
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCartWishlist()

  // Find product by id
  const product = useMemo(() => {
    return products.find((p) => String(p.id) === String(id) || String(p.dbId) === String(id))
  }, [products, id])

  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('S')
  const [isStylingOpen, setIsStylingOpen] = useState(true)
  const [isMaterialsOpen, setIsMaterialsOpen] = useState(false)
  const [addedToBagFeedback, setAddedToBagFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [isErrorFeedback, setIsErrorFeedback] = useState(false)

  // Initialize selection when product loads
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] || '')
      setSelectedSize(product.sizes[0] || 'S')
    }
  }, [product])

  // Scroll to top when loading a new product
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const wishlisted = product ? isInWishlist(product.id) : false
  const isOutOfStock = (product?.stock ?? 0) <= 0

  // Get complete the look recommendations (filter out current product)
  const completeTheLookItems = useMemo(() => {
    if (!product) return []
    return products.filter((p) => p.id !== product.id).slice(0, 4)
  }, [products, product])

  // As Seen On dummy social feed images
  const asSeenOnImages = [
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1529250856085-b9f2eb42a8b5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80'
  ]

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-sans ${isDark ? 'bg-stone-950 text-stone-200' : 'bg-stone-50 text-stone-850'}`}>
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-500 font-bold animate-pulse">Loading Product Details</p>
          <div className="mt-4 h-1 w-24 bg-amber-500/20 mx-auto rounded overflow-hidden">
            <div className="h-full bg-amber-500 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-sans ${isDark ? 'bg-stone-950 text-stone-200' : 'bg-stone-50 text-stone-850'}`}>
        <Header />
        <div className="text-center space-y-4">
          <p className="text-sm uppercase tracking-widest text-stone-400">Product Not Found</p>
          <Link to="/shop" className="inline-block bg-amber-500 text-black px-6 py-2.5 text-xs uppercase tracking-widest font-bold hover:bg-amber-400 transition">
            Back to Shop
          </Link>
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
      
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        {/* Product Details Section */}
        <div className="grid gap-12 lg:grid-cols-2">
          
          {/* Left Column: Product Images */}
          <div className="space-y-6">
            <div className={`overflow-hidden border relative ${isDark ? 'border-white/10 bg-stone-950/40' : 'border-black/10 bg-[#ece7df]/40'}`}>
              <img
                src={product.image}
                alt={product.name}
                className={`w-full object-cover max-h-[640px] ${isOutOfStock ? 'grayscale-[30%] opacity-90' : ''}`}
              />

              {isOutOfStock && (
                <div className="absolute top-4 left-4 bg-rose-600 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 shadow-md">
                  Sold Out
                </div>
              )}

              <div className={`py-4 text-center text-xs uppercase tracking-[0.4em] font-medium border-t ${
                isDark ? 'border-white/10 text-stone-400' : 'border-black/10 text-stone-500'
              }`}>
                {product.name}
              </div>
            </div>
            
            {/* Secondary details row */}
            <div className="grid grid-cols-2 gap-4">
              {product.detailImages.slice(0, 2).map((imgUrl, i) => (
                <div key={i} className={`overflow-hidden border ${isDark ? 'border-white/10 bg-stone-950/40' : 'border-black/10 bg-[#ece7df]/40'}`}>
                  <img
                    src={imgUrl}
                    alt={`${product.name} detail ${i + 1}`}
                    className="h-64 w-full object-cover sm:h-80"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Information & Controls */}
          <div className="flex flex-col justify-start space-y-8">
            <div>
              {/* Breadcrumbs */}
              <p className={`text-[0.7rem] uppercase tracking-[0.35em] font-semibold ${isDark ? 'text-amber-200/70' : 'text-amber-600'}`}>
                {product.breadcrumbs}
              </p>
              
              {/* Product Title */}
              <h1 className={`mt-3 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-wide ${isDark ? 'text-white' : 'text-stone-900'}`}>
                {product.name}
              </h1>
              
              {/* Price & Stock Info */}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <p className={`text-2xl font-serif ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                  {product.price}
                </p>

                {isOutOfStock ? (
                  <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/30">
                    Out of Stock
                  </span>
                ) : product.stock <= 5 ? (
                  <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30 animate-pulse">
                    Only {product.stock} Left in Stock
                  </span>
                ) : (
                  <span className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    In Stock ({product.stock})
                  </span>
                )}
              </div>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <span className={`block text-xs uppercase tracking-[0.25em] font-semibold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Double Color:
                </span>
                <div className="flex gap-4">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color }}
                      className={`h-7 w-7 rounded-full border transition cursor-pointer ${
                        selectedColor === color
                          ? 'ring-2 ring-amber-500 scale-110'
                          : isDark
                            ? 'border-white/20'
                            : 'border-black/20'
                      }`}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] font-semibold">
                  <span className={isDark ? 'text-stone-400' : 'text-stone-600'}>Size Selection</span>
                  <button type="button" className={`underline cursor-pointer transition ${isDark ? 'text-stone-300 hover:text-amber-300' : 'text-stone-700 hover:text-amber-600'}`}>
                    Size Guide
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`border py-3.5 text-xs font-semibold uppercase tracking-[0.2em] transition cursor-pointer ${
                        selectedSize === size
                          ? isDark 
                            ? 'bg-amber-500 text-black border-amber-500' 
                            : 'bg-stone-900 text-white border-stone-900'
                          : isDark
                            ? 'border-white/10 bg-white/5 text-white hover:border-amber-400/50 hover:bg-white/10'
                            : 'border-black/10 bg-white text-stone-900 hover:border-stone-900 hover:bg-stone-50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Call to Actions */}
            <div className="space-y-4 pt-4">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => {
                  const res = addToCart(product, selectedSize, selectedColor, 1)
                  if (res?.success === false) {
                    setFeedbackMessage(res.message || 'Cannot add item to bag.')
                    setIsErrorFeedback(true)
                  } else {
                    setFeedbackMessage('Added to Bag')
                    setIsErrorFeedback(false)
                  }
                  setAddedToBagFeedback(true)
                  setTimeout(() => setAddedToBagFeedback(false), 2500)
                }}
                className={`w-full py-4 text-xs font-semibold uppercase tracking-[0.35em] transition shadow-[0_8px_30px_rgba(0,0,0,0.1)] ${
                  isOutOfStock
                    ? 'bg-stone-500/20 text-stone-500 cursor-not-allowed border border-stone-500/30'
                    : isDark
                      ? 'bg-amber-500 text-black hover:bg-amber-400 cursor-pointer'
                      : 'bg-stone-900 text-white hover:bg-stone-800 cursor-pointer'
                }`}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
              </button>
              
              {addedToBagFeedback && (
                <p className={`text-xs font-semibold uppercase tracking-widest text-center mt-1 ${
                  isErrorFeedback ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {feedbackMessage}
                </p>
              )}
              
              <button
                type="button"
                onClick={() => {
                  if (wishlisted) {
                    removeFromWishlist(product.id)
                  } else {
                    addToWishlist(product)
                  }
                }}
                className={`w-full border py-4 text-xs font-semibold uppercase tracking-[0.35em] transition cursor-pointer ${
                  isDark
                    ? 'border-white/20 bg-transparent text-white hover:bg-white/5 hover:border-amber-400'
                    : 'border-black/20 bg-transparent text-stone-900 hover:bg-stone-50 hover:border-stone-900'
                }`}
              >
                {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Accordion / Details Dropdowns */}
            <div className={`border-t divide-y ${isDark ? 'border-white/10 divide-white/10' : 'border-black/10 divide-black/10'}`}>
              
              {/* Styling Advisory */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => setIsStylingOpen(!isStylingOpen)}
                  className="flex w-full items-center justify-between py-2 text-left cursor-pointer"
                >
                  <span className={`text-xs uppercase tracking-[0.3em] font-semibold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                    Styling Advisory
                  </span>
                  {isStylingOpen ? <FaChevronUp className="h-3.5 w-3.5" /> : <FaChevronDown className="h-3.5 w-3.5" />}
                </button>
                
                {isStylingOpen && (
                  <div className={`mt-3 text-sm leading-7 transition-all ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                    <p>{product.stylingAdvisory}</p>
                    <p className="mt-2 text-xs italic opacity-75">{product.description}</p>
                  </div>
                )}
              </div>

              {/* Materials & Details */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => setIsMaterialsOpen(!isMaterialsOpen)}
                  className="flex w-full items-center justify-between py-2 text-left cursor-pointer"
                >
                  <span className={`text-xs uppercase tracking-[0.3em] font-semibold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                    Materials &amp; Details
                  </span>
                  {isMaterialsOpen ? <FaChevronUp className="h-3.5 w-3.5" /> : <FaChevronDown className="h-3.5 w-3.5" />}
                </button>
                
                {isMaterialsOpen && (
                  <div className={`mt-3 text-sm leading-7 transition-all ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                    <p>{product.materialsDetails}</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Complete the Look Section */}
        {completeTheLookItems.length > 0 && (
          <section className={`mt-24 border-t pt-16 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
            <div className="mb-10 text-center">
              <h2 className={`font-serif text-3xl sm:text-4xl tracking-wide ${isDark ? 'text-white' : 'text-stone-900'}`}>
                Complete The Look
              </h2>
            </div>
            
            <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
              {completeTheLookItems.map((item) => {
                const wishlisted = isInWishlist(item.id);
                const isOutOfStock = (item.stock ?? 0) <= 0;
                const originalVal = item.originalPrice ? parseFloat(item.originalPrice.replace('$', '')) : 0;
                const currentVal = item.price ? parseFloat(item.price.replace('$', '')) : 0;
                const discountPercent = originalVal && currentVal && originalVal > currentVal
                  ? Math.round(((originalVal - currentVal) / originalVal) * 100)
                  : 0;

                return (
                  <Link
                    key={item.id}
                    to={`/product/${item.id}`}
                    className={`group relative border transition-all duration-300 ${
                      isDark 
                        ? "border-white/10 bg-stone-900/90 hover:border-amber-500/30" 
                        : "border-black/10 bg-white hover:border-amber-600/30"
                    }`}
                  >
                    <div className={`relative overflow-hidden border-b ${isDark ? 'bg-stone-900 border-white/10' : 'bg-[#ece7df] border-black/10'}`}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className={`h-56 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-72 ${
                          isOutOfStock ? 'grayscale-[0.3] opacity-85' : ''
                        }`}
                      />

                      {/* Top-Left: Discount Percentage Badge */}
                      {discountPercent > 0 && !isOutOfStock && (
                        <DiscountBadge
                          discount={discountPercent}
                          className="absolute top-2 left-2"
                        />
                      )}

                      {/* Top-Right: Sold Out Badge */}
                      {isOutOfStock && (
                        <span className="absolute top-2.5 right-2.5 bg-stone-950/90 text-rose-400 border border-rose-500/40 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 z-10 shadow-sm backdrop-blur-xs">
                          Sold Out
                        </span>
                      )}

                      {/* Bottom-Left: Add to Bag Quick Button */}
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (!isOutOfStock) {
                            addToCart(item, 'S', item.colors[0], 1)
                          }
                        }}
                        className={`absolute left-3 bottom-3 z-10 flex h-8.5 w-8.5 items-center justify-center rounded-full border transition shadow-md cursor-pointer ${
                          isOutOfStock
                            ? "border-white/5 bg-black/40 text-stone-600 cursor-not-allowed opacity-40"
                            : isDark
                              ? "border-white/10 bg-black/80 text-stone-300 hover:bg-black hover:text-white hover:scale-110"
                              : "border-black/10 bg-white/90 text-stone-700 hover:bg-white hover:text-black hover:scale-110"
                        }`}
                        aria-label={isOutOfStock ? "Sold Out" : "Add to Bag"}
                      >
                        <IoBagHandleOutline className="h-3.5 w-3.5" />
                      </button>

                      {/* Bottom-Right: Toggle Wishlist Quick Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (wishlisted) {
                            removeFromWishlist(item.id)
                          } else {
                            addToWishlist(item)
                          }
                        }}
                        className={`absolute right-3 bottom-3 z-10 flex h-8.5 w-8.5 items-center justify-center rounded-full border transition shadow-md hover:scale-110 cursor-pointer ${
                          isDark
                            ? "border-white/10 bg-black/80 text-stone-300 hover:bg-black hover:text-white"
                            : "border-black/10 bg-white/90 text-stone-700 hover:bg-white hover:text-black"
                        }`}
                        aria-label="Toggle Wishlist"
                      >
                        {wishlisted ? (
                          <FaHeart className="h-3.5 w-3.5 text-amber-500" />
                        ) : (
                          <FaRegHeart className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className={`text-xs uppercase tracking-[0.2em] font-medium transition ${
                        isDark ? 'text-stone-300 group-hover:text-amber-300' : 'text-stone-800 group-hover:text-amber-600'
                      }`}>
                        {item.name}
                      </h3>
                      {isOutOfStock ? (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs font-semibold text-rose-500">
                            Sold Out
                          </span>
                          <span className={`text-[10px] opacity-50 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                            {item.price}
                          </span>
                        </div>
                      ) : discountPercent > 0 ? (
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`text-xs font-semibold ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                            {item.price}
                          </span>
                          <span className={`text-[10px] line-through opacity-60 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                            {item.originalPrice}
                          </span>
                        </div>
                      ) : (
                        <p className={`mt-2 text-xs font-semibold ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                          {item.price}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* As Seen On Section */}
        <section className={`mt-24 border-t pt-16 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
          <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-end">
            <div className="text-center sm:text-left">
              <h2 className={`font-serif text-3xl tracking-wide ${isDark ? 'text-white' : 'text-stone-900'}`}>
                As Seen On
              </h2>
            </div>
            <div>
              <a href="#" className={`text-xs uppercase tracking-[0.25em] font-semibold underline transition ${
                isDark ? 'text-stone-300 hover:text-amber-300' : 'text-stone-700 hover:text-amber-600'
              }`}>
                Share Your Style #AtelierHouse
              </a>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {asSeenOnImages.map((src, idx) => (
              <div key={idx} className="overflow-hidden aspect-[4/5] relative group">
                <img
                  src={src}
                  alt={`Atelier style feed ${idx + 1}`}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-300" />
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
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
              <p className={`hover:text-amber-500 cursor-pointer transition ${isDark ? "hover:text-amber-300" : "hover:text-amber-600"}`}>Store locator</p>
              <p className={`hover:text-amber-500 cursor-pointer transition ${isDark ? "hover:text-amber-300" : "hover:text-amber-600"}`}>Shipping &amp; Returns</p>
              <p className={`hover:text-amber-500 cursor-pointer transition ${isDark ? "hover:text-amber-300" : "hover:text-amber-600"}`}>Accessibility</p>
            </div>
          </div>

          <div>
            <p className={`text-xs uppercase tracking-[0.28em] ${isDark ? "text-amber-200/70" : "text-amber-600"}`}>About</p>
            <div className={`mt-3 space-y-2 text-sm ${isDark ? "text-stone-400" : "text-stone-600"}`}>
              <p className={`hover:text-amber-500 cursor-pointer transition ${isDark ? "hover:text-amber-300" : "hover:text-amber-600"}`}>Journal</p>
              <p className={`hover:text-amber-500 cursor-pointer transition ${isDark ? "hover:text-amber-300" : "hover:text-amber-600"}`}>Craftsmanship</p>
              <p className={`hover:text-amber-500 cursor-pointer transition ${isDark ? "hover:text-amber-300" : "hover:text-amber-600"}`}>Privacy Policy</p>
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

export default ProductDetailPage
