import { useEffect, useRef, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import atelierLogo from '../assets/brands/atelier.svg'
import bottegaLogo from '../assets/brands/bottega.svg'
import burberryLogo from '../assets/brands/burberry.svg'
import celineLogo from '../assets/brands/celine.svg'
import jilSanderLogo from '../assets/brands/jilsander.svg'
import loeweLogo from '../assets/brands/loewe.svg'
import pradaLogo from '../assets/brands/prada.svg'
import totemeLogo from '../assets/brands/toteme.svg'
import Header from './Header'
import { useTheme } from '../context/ThemeContext'
import { useProducts } from '../context/ProductContext'
import { useCartWishlist } from '../context/CartWishlistContext'
import { FaRegHeart, FaHeart } from 'react-icons/fa'
import { IoBagHandleOutline } from 'react-icons/io5'
import DiscountBadge from './DiscountBadge'

const heroSlides = [
  {
    eyebrow: 'Autumn Winter 2026 Collection',
    title: 'The Architecture of Silhouette.',
    description:
      'Sculpted tailoring, fluid movement, and a restrained palette designed for a sharper daily uniform.',
    image:
      'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=1600&q=80',
  },
  {
    eyebrow: 'Editors Choice',
    title: 'Quiet Luxury In Motion.',
    description:
      'A softer way to dress with long lines, tonal layering, and elevated essentials for everyday presence.',
    image:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80',
  },
  {
    eyebrow: 'New House Codes',
    title: 'Refined Forms. Bold Presence.',
    description:
      'Modern wardrobe pieces shaped by precision, texture, and understated confidence from day to evening.',
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80',
  },
]

// Arrivals will be dynamically fetched from the context

const brandLogos = [
  {
    name: 'Atelier',
    image: atelierLogo,
  },
  {
    name: 'Prada',
    image: pradaLogo,
  },
  {
    name: 'Celine',
    image: celineLogo,
  },
  {
    name: 'Loewe',
    image: loeweLogo,
  },
  {
    name: 'Bottega',
    image: bottegaLogo,
  },
  {
    name: 'Burberry',
    image: burberryLogo,
  },
  {
    name: 'Toteme',
    image: totemeLogo,
  },
  {
    name: 'Jil Sander',
    image: jilSanderLogo,
  },
]

const visionTiles = [
  {
    title: 'Motion Tailoring',
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    className: 'md:row-span-2',
  },
  {
    title: 'Quiet Layers',
    image:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'House Icons',
    image:
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Evening Form',
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Editorial Glow',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
  },
]

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M6 8h12l-1 11H7L6 8Z" />
      <path d="M9 9V7a3 3 0 0 1 6 0v2" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-7Z" />
      <path d="M8 9h8" />
      <path d="M8 12h5" />
    </svg>
  )
}

function HomepageShowcase() {
  const { isDark } = useTheme()
  const { products, isLoading, brands, categories } = useProducts()
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCartWishlist()

  const arrivalsList = useMemo(() => {
    return products.slice(0, 8)
  }, [products])

  const displayBrands = useMemo(() => {
    return brands.length > 0 ? brands : brandLogos
  }, [brands])

  const displayCategories = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map(cat => ({
        name: cat.name,
        img: cat.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
        link: `/shop?category=${encodeURIComponent(cat.name)}`
      }))
    }
    return [
      { name: 'New Season', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80', link: '/shop?category=New%20Season' },
      { name: 'Outerwear', img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80', link: '/shop?category=Outerwear' },
      { name: 'Footwear', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80', link: '/shop?category=Footwear' },
      { name: 'Accessories', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80', link: '/shop?category=Accessories' }
    ]
  }, [categories])
  const [activeSlide, setActiveSlide] = useState(0)
  const [isTickerPaused, setIsTickerPaused] = useState(false)
  const tickerContentRef = useRef(null)
  const tickerTrackRef = useRef(null)
  const tickerOffsetRef = useRef(0)
  const tickerPausedRef = useRef(false)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length)
    }, 3000)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    tickerPausedRef.current = isTickerPaused
  }, [isTickerPaused])

  useEffect(() => {
    const ticker = tickerContentRef.current
    const track = tickerTrackRef.current

    if (!ticker || !track) {
      return undefined
    }

    let frameId = 0
    const trackWidth = track.offsetWidth

    const animate = () => {
      if (!tickerPausedRef.current) {
        tickerOffsetRef.current -= 0.65

        if (Math.abs(tickerOffsetRef.current) >= trackWidth) {
          tickerOffsetRef.current += trackWidth
        }
      }

      ticker.style.transform = `translate3d(${tickerOffsetRef.current}px, 0, 0)`

      frameId = window.requestAnimationFrame(animate)
    }

    frameId = window.requestAnimationFrame(animate)

    return () => window.cancelAnimationFrame(frameId)
  }, [isLoading])

  const currentSlide = heroSlides[activeSlide]

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-sans ${isDark ? 'bg-stone-950 text-stone-200' : 'bg-stone-50 text-stone-850'}`}>
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-500 font-bold animate-pulse">Loading Atelier</p>
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
      <div className="w-full">
       
        <Header/>
        <main className="space-y-0">
          <section className="relative h-[calc(100vh-73px)] min-h-[760px] overflow-hidden">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.title}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  index === activeSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-cover object-center"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.4)_50%,rgba(0,0,0,0.15)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,_rgba(212,175,55,0.18),_transparent_35%)]" />

            <div className="absolute inset-x-0 bottom-0 top-0 flex items-center">
              <div className="px-6 sm:px-10 lg:px-14">
                <div className="max-w-xl text-white">
                  <p className="text-[0.68rem] uppercase tracking-[0.42em] text-amber-200/70">
                    {currentSlide.eyebrow}
                  </p>
                  <h1 className="mt-4 max-w-lg font-serif text-4xl leading-none sm:text-5xl lg:text-6xl">
                    {currentSlide.title}
                  </h1>
                  <p className="mt-5 max-w-md text-sm leading-7 text-stone-300 sm:text-base">
                    {currentSlide.description}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <a
                      href="#new-arrivals"
                      className="bg-amber-500 px-6 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-black transition hover:bg-amber-400"
                    >
                      Shop New Arrivals
                    </a>
                    <Link
                      to="/login"
                      className="border border-white/10 bg-white/5 px-6 py-3 text-xs uppercase tracking-[0.32em] text-white transition hover:border-amber-400 hover:text-amber-300 hover:bg-white/10"
                    >
                      Sign In
                    </Link>
                  </div>
                  <div className="mt-8 flex items-center gap-3">
                    {heroSlides.map((slide, index) => (
                      <button
                        key={slide.title}
                        type="button"
                        onClick={() => setActiveSlide(index)}
                        className={`h-2.5 rounded-full transition-all ${
                          index === activeSlide ? 'w-10 bg-amber-500' : 'w-2.5 bg-white/25'
                        }`}
                        aria-label={`Show slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="transition-all duration-300 mt-3">
            <div
              className="overflow-hidden px-5 py-5 sm:px-6 lg:px-8"
              onMouseEnter={() => setIsTickerPaused(true)}
              onMouseLeave={() => setIsTickerPaused(false)}
            >
              <div ref={tickerContentRef} className="flex w-max gap-4 will-change-transform">
                {[0, 1, 2].map((trackIndex) => (
                  <div
                    key={trackIndex}
                    ref={trackIndex === 0 ? tickerTrackRef : null}
                    className="flex flex-none items-center gap-4"
                  >
                     {displayBrands.map((brand) => (
                      <div
                        key={`${trackIndex}-${brand.name}`}
                        className="flex items-center"
                      >
                        <Link
                          to={`/brand/${brand.name}`}
                          className="flex h-20 w-20 flex-none overflow-hidden items-center justify-center transition duration-300"
                          aria-label={brand.name}
                          title={brand.name}
                        >
                          <img 
                            src={brand.image} 
                            alt={brand.name} 
                            className="h-full w-full object-cover transition duration-300 hover:scale-110" 
                          />
                        </Link>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="new-arrivals" className="px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className={`text-sm uppercase tracking-[0.32em] ${isDark ? "text-amber-200/70" : "text-amber-600"}`}>
                  Current season
                </p>
                <h2 className={`mt-2 font-serif text-3xl ${isDark ? "text-white" : "text-stone-900"}`}>New Arrivals</h2>
              </div>
              <div className="text-right">
                <a href="#women" className={`text-sm transition ${isDark ? "text-stone-300 hover:text-amber-300" : "text-stone-700 hover:text-amber-600"}`}>
                  View all
                </a>
                <p className={`mt-2 text-[0.68rem] uppercase tracking-[0.26em] ${isDark ? "text-stone-500" : "text-stone-400"}`}>
                  Scroll horizontally
                </p>
              </div>
            </div>

            <div className="-mr-5 overflow-x-auto scrollbar-hide pb-4 pr-5 sm:-mr-6 sm:pr-6 lg:-mr-8 lg:pr-8 [scrollbar-width:thin]">
              <div className="flex min-w-max gap-4">
              {arrivalsList.map((item, index) => {
                const wishlisted = isInWishlist(item.id);
                const isOutOfStock = (item.stock ?? 0) <= 0;
                const originalVal = item.originalPrice ? parseFloat(item.originalPrice.replace('$', '')) : 0;
                const currentVal = item.price ? parseFloat(item.price.replace('$', '')) : 0;
                const discountPercent = originalVal && currentVal && originalVal > currentVal
                  ? Math.round(((originalVal - currentVal) / originalVal) * 100)
                  : 0;

                return (
                  <Link
                    key={`${item.name}-${index}`}
                    to={`/product/${item.id}`}
                    className={`group w-[260px] flex-none sm:w-[300px] lg:w-[340px] border transition-all duration-300 ${
                      isDark 
                        ? "border-white/10 bg-stone-900/90 shadow-[0_12px_40px_rgba(0,0,0,0.3)] hover:border-amber-500/30" 
                        : "border-black/10 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.05)] hover:border-amber-600/30"
                    }`}
                  >
                    <div className={`relative overflow-hidden border-b ${isDark ? "bg-stone-900 border-white/10" : "bg-[#ece7df] border-black/10"}`}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-72 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-80 lg:h-[25rem]"
                        className={`h-72 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-80 lg:h-[25rem] ${
                          isOutOfStock ? 'grayscale-[0.3] opacity-85' : ''
                        }`}
                      />

                      {/* Top-Left: Discount Percentage Badge */}
                      <DiscountBadge
                        discount={discountPercent}
                        className="absolute top-2 left-2"
                      />
                      {discountPercent > 0 && !isOutOfStock && (
                        <DiscountBadge
                          discount={discountPercent}
                          className="absolute top-2 left-2"
                        />
                      )}

                      {/* Sold Out Badge */}
                      {isOutOfStock && (
                        <span className="absolute top-2.5 right-2.5 bg-stone-950/90 text-rose-400 border border-rose-500/40 text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 z-10 shadow-sm backdrop-blur-xs">
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
                          addToCart(item, 'S', item.colors[0], 1)
                          if (!isOutOfStock) {
                            addToCart(item, 'S', item.colors[0], 1)
                          }
                        }}
                        className={`absolute left-3 bottom-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border transition shadow-md hover:scale-110 cursor-pointer ${
                          isDark
                            ? "border-white/10 bg-black/80 text-stone-300 hover:bg-black hover:text-white"
                            : "border-black/10 bg-white/90 text-stone-700 hover:bg-white hover:text-black"
                        className={`absolute left-3 bottom-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border transition shadow-md cursor-pointer ${
                          isOutOfStock
                            ? "border-white/5 bg-black/40 text-stone-600 cursor-not-allowed opacity-40"
                            : isDark
                              ? "border-white/10 bg-black/80 text-stone-300 hover:bg-black hover:text-white hover:scale-110"
                              : "border-black/10 bg-white/90 text-stone-700 hover:bg-white hover:text-black hover:scale-110"
                        }`}
                        aria-label="Add to Bag"
                        aria-label={isOutOfStock ? "Sold Out" : "Add to Bag"}
                      >
                        <IoBagHandleOutline className="h-4 w-4" />
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
                        className={`absolute right-3 bottom-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border transition shadow-md hover:scale-110 cursor-pointer ${
                          isDark
                            ? "border-white/10 bg-black/80 text-stone-300 hover:bg-black hover:text-white"
                            : "border-black/10 bg-white/90 text-stone-700 hover:bg-white hover:text-black"
                        }`}
                        aria-label="Toggle Wishlist"
                      >
                        {wishlisted ? (
                          <FaHeart className="h-4 w-4 text-amber-500" />
                        ) : (
                          <FaRegHeart className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-start justify-between gap-4 px-4 py-4">
                      <div>
                        <p className={`text-[0.68rem] uppercase tracking-[0.25em] ${isDark ? "text-amber-200/70" : "text-amber-600"}`}>
                          {item.category}
                        </p>
                        <h3 className={`mt-2 font-medium transition duration-300 ${
                          isDark ? "text-white group-hover:text-amber-300" : "text-stone-900 group-hover:text-amber-600"
                        }`}>{item.name}</h3>
                      </div>
                      {discountPercent > 0 ? (
                      {isOutOfStock ? (
                        <div className="text-right">
                          <span className={`text-xs font-semibold block text-rose-500`}>
                            Sold Out
                          </span>
                          <span className={`text-xs opacity-50 block ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                            {item.price}
                          </span>
                        </div>
                      ) : discountPercent > 0 ? (
                        <div className="text-right">
                          <span className={`text-xs line-through opacity-60 block ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                            {item.originalPrice}
                          </span>
                          <span className={`text-sm font-semibold block ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                            {item.price}
                          </span>
                        </div>
                      ) : (
                        <p className={`text-sm font-semibold ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                          {item.price}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
              </div>
            </div>
          </section>

          <section id="women" className={`px-5 py-12 sm:px-6 lg:px-8 lg:py-16 border-t ${isDark ? "border-white/10" : "border-black/10"}`}>
            <div className="mb-8 text-center">
              <p className={`text-sm uppercase tracking-[0.34em] ${isDark ? "text-amber-200/70" : "text-amber-600"}`}>
                Styling direction
              </p>
              <h2 className={`mt-2 font-serif text-3xl sm:text-4xl ${isDark ? "text-white" : "text-stone-900"}`}>
                Wear the Vision
              </h2>
            </div>

            <div className="grid auto-rows-[180px] gap-4 md:grid-cols-3">
              {visionTiles.map((tile) => (
                <Link to="/vision" key={tile.title}>
                  <article className={`group relative h-full overflow-hidden ${tile.className ?? ''}`}>
                    <img
                      src={tile.image}
                      alt={tile.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Editorial</p>
                      <h3 className="mt-1 font-serif text-2xl group-hover:text-amber-300 transition duration-300">{tile.title}</h3>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>

          {/* NEW SECTION 1: CATEGORIES */}
          <section className={`px-5 py-12 sm:px-6 lg:px-8 lg:py-16 border-t ${isDark ? "border-white/10" : "border-black/10"}`}>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className={`text-sm uppercase tracking-[0.32em] ${isDark ? "text-amber-200/70" : "text-amber-600"}`}>
                  Curated Selections
                </p>
                <h2 className={`mt-2 font-serif text-3xl ${isDark ? "text-white" : "text-stone-900"}`}>Shop by Category</h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {displayCategories.map((cat, i) => (
                <Link to={cat.link} key={i} className={`group relative h-96 overflow-hidden border transition-all duration-300 ${isDark ? 'border-white/10 hover:border-amber-500/50' : 'border-black/10 hover:border-amber-600/50'}`}>
                  <img src={cat.img} alt={cat.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="font-serif text-2xl text-white group-hover:text-amber-300 transition">{cat.name}</h3>
                    <p className="mt-2 text-[10px] uppercase tracking-widest text-stone-300 group-hover:text-amber-400 transition">Explore &rarr;</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* NEW SECTION 2: CRAFTSMANSHIP */}
          <section className={`px-5 py-12 sm:px-6 lg:px-8 lg:py-24 border-t ${isDark ? "border-white/10" : "border-black/10"}`}>
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                <div className={`relative h-[500px] sm:h-[600px] overflow-hidden ${isDark ? 'shadow-2xl shadow-black/50' : 'shadow-2xl shadow-stone-300/50'}`}>
                  <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80" alt="Craftsmanship" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 border-[12px] border-white/10 pointer-events-none mix-blend-overlay"></div>
                </div>
                <div className="max-w-xl">
                  <p className={`text-sm uppercase tracking-[0.32em] ${isDark ? "text-amber-200/70" : "text-amber-600"}`}>
                    Our Heritage
                  </p>
                  <h2 className={`mt-4 font-serif text-4xl sm:text-5xl leading-[1.1] ${isDark ? "text-white" : "text-stone-900"}`}>
                    The Art of <br/><span className={isDark ? "text-amber-500" : "text-amber-700"}>Craftsmanship</span>
                  </h2>
                  <p className={`mt-6 text-sm leading-7 ${isDark ? "text-stone-300" : "text-stone-600"}`}>
                    Every piece in our collection is born from a commitment to uncompromising quality. We partner with heritage mills and generational artisans to ensure that our garments don't just look exquisite—they feel extraordinary and endure the test of time.
                  </p>
                  <p className={`mt-4 text-sm leading-7 ${isDark ? "text-stone-300" : "text-stone-600"}`}>
                    From the first sketch to the final stitch, we believe in fashion as a deliberate, slow, and masterful process.
                  </p>
                  <Link
                    to="/about"
                    className={`mt-10 inline-flex items-center gap-2 border-b-2 pb-1 text-xs uppercase tracking-widest font-bold transition-all ${
                      isDark ? "border-amber-500 text-amber-500 hover:text-white hover:border-white" : "border-amber-600 text-amber-600 hover:text-black hover:border-black"
                    }`}
                  >
                    Discover Our Story
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section id="journal" className={`grid overflow-hidden border-t lg:grid-cols-[0.9fr_1.1fr] ${
            isDark ? "border-white/10 bg-stone-900/40" : "border-black/10 bg-stone-100/50"
          }`}>
            <div className={`px-8 py-10 sm:px-10 lg:px-12 lg:py-14 ${isDark ? "bg-black/45 text-white" : "bg-white/60 text-stone-900"}`}>
              <p className={`text-[0.68rem] uppercase tracking-[0.4em] ${isDark ? "text-amber-200/70" : "text-amber-600"}`}>
                Atelier Advisory
              </p>
              <h2 className="mt-4 max-w-sm font-serif text-4xl leading-tight">
                Define Your Sartorial DNA.
              </h2>
              <p className={`mt-5 max-w-md text-sm leading-7 ${isDark ? "text-stone-300" : "text-stone-700"}`}>
                Our stylists curate proportion, texture, and signature essentials so
                every look feels intentional from morning to evening.
              </p>
              <Link
                to="/register"
                className="mt-8 inline-flex bg-amber-500 px-6 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-black transition hover:bg-amber-400"
              >
                Start A Style Profile
              </Link>
            </div>

            <div className={`min-h-[280px] ${
              isDark 
                ? "bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.15),transparent_20%),repeating-linear-gradient(180deg,#090909_0px,#161616_6px,#050505_18px)]" 
                : "bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.1),transparent_20%),repeating-linear-gradient(180deg,#e5e1d8_0px,#ece7df_6px,#ded9cf_18px)]"
            }`} />
          </section>
        </main>
        
        
        <footer className={`border-t transition-all duration-300 px-5 py-12 sm:px-6 lg:px-8 ${
          isDark ? "border-white/10 bg-[#070707]" : "border-black/10 bg-[#f4f1eb]"
        }`}>
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <p className={`font-serif text-2xl tracking-[0.22em] ${isDark ? "text-white" : "text-stone-900"}`}>ATELIER</p>
              <p className={`mt-3 max-w-xs text-sm leading-6 ${isDark ? "text-stone-400" : "text-stone-600"}`}>
                Refining the everyday through tailored silhouettes and purposeful
                texture.
              </p>
            </div>

            <div>
              <p className={`text-xs uppercase tracking-[0.28em] ${isDark ? "text-amber-200/70" : "text-amber-600"}`}>Customer Care</p>
              <div className={`mt-3 space-y-2 text-sm ${isDark ? "text-stone-400" : "text-stone-600"}`}>
                <p className={`hover:text-amber-500 cursor-pointer transition ${isDark ? "hover:text-amber-300" : "hover:text-amber-600"}`}>Store locator</p>
                <p className={`hover:text-amber-500 cursor-pointer transition ${isDark ? "hover:text-amber-300" : "hover:text-amber-600"}`}>Shipping & Returns</p>
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

          <div className={`mt-12 flex flex-col gap-3 border-t pt-5 text-xs uppercase tracking-[0.22em] sm:flex-row sm:items-center sm:justify-between ${
            isDark ? "border-white/10 text-stone-500" : "border-black/10 text-stone-400"
          }`}>
            <p>2026 Atelier. All rights reserved.</p>
            <p>Crafted for modern wardrobe rituals.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default HomepageShowcase
