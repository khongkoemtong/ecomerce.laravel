import { Link } from 'react-router-dom'
import { useTheme } from '../../../context/ThemeContext'
import Header from '../../../components/Header'
import { useCartWishlist } from '../../../context/CartWishlistContext'
import { IoCloseOutline, IoBagHandleOutline } from 'react-icons/io5'
import DiscountBadge from '../../../components/DiscountBadge'

function WishlistPage() {
  const { isDark } = useTheme()
  const { wishlist, removeFromWishlist, addToCart } = useCartWishlist()

  return (
    <div className={`min-h-screen transition-all duration-300 font-sans ${
      isDark 
        ? "bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.18),_transparent_35%),linear-gradient(135deg,_#090909_0%,_#111111_45%,_#050505_100%)] text-stone-100" 
        : "bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.12),_transparent_35%),linear-gradient(135deg,_#fbf9f6_0%,_#f5f2eb_45%,_#ece7df_100%)] text-stone-900"
    }`}>
      <Header />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:text-left">
          <p className={`text-xs uppercase tracking-[0.4em] ${isDark ? 'text-amber-200/70' : 'text-amber-600'}`}>
            Curated Wardrobe
          </p>
          <h1 className={`mt-2 font-serif text-4xl sm:text-5xl ${isDark ? 'text-white' : 'text-stone-900'}`}>
            My Wishlist
          </h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className={`text-sm uppercase tracking-[0.3em] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Your wishlist is currently empty
            </p>
            <Link
              to="/"
              className={`mt-8 px-8 py-4 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                isDark 
                  ? 'bg-amber-500 text-black hover:bg-amber-400' 
                  : 'bg-stone-900 text-white hover:bg-stone-800'
              }`}
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {wishlist.map((item) => {
              const isOutOfStock = (item.stock ?? 0) <= 0;
              const originalVal = item.originalPrice ? parseFloat(item.originalPrice.replace('$', '')) : 0;
              const currentVal = item.price ? parseFloat(item.price.replace('$', '')) : 0;
              const discountPercent = originalVal && currentVal && originalVal > currentVal
                ? Math.round(((originalVal - currentVal) / originalVal) * 100)
                : 0;

              return (
                <div
                  key={item.id}
                  className={`group relative border transition-all duration-300 ${
                    isDark 
                      ? "border-white/10 bg-stone-900/90 hover:border-amber-500/30" 
                      : "border-black/10 bg-white hover:border-amber-600/30"
                  }`}
                >
                  {/* Top-Left: Discount Percentage Badge */}
                  {discountPercent > 0 && !isOutOfStock && (
                    <DiscountBadge
                      discount={discountPercent}
                      className="absolute top-2 left-2"
                    />
                  )}

                  {/* Sold Out Badge */}
                  {isOutOfStock && (
                    <span className="absolute top-2.5 left-2.5 bg-stone-950/90 text-rose-400 border border-rose-500/40 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 z-10 shadow-sm backdrop-blur-xs">
                      Sold Out
                    </span>
                  )}

                  {/* Remove from Wishlist icon */}
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.id)}
                    className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border transition cursor-pointer shadow-sm ${
                      isDark
                        ? 'border-white/10 bg-black/80 text-stone-300 hover:bg-black/60 hover:text-white'
                        : 'border-black/10 bg-white/90 text-stone-700 hover:bg-white hover:text-black'
                    }`}
                    aria-label="Remove from wishlist"
                  >
                    <IoCloseOutline className="h-5 w-5" />
                  </button>

                  {/* Bottom-Left: Quick Add to Bag Button */}
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
                    className={`absolute left-3 bottom-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border transition cursor-pointer shadow-sm ${
                      isOutOfStock
                        ? "border-white/5 bg-black/40 text-stone-600 cursor-not-allowed opacity-40"
                        : isDark
                          ? 'border-white/10 bg-black/80 text-stone-300 hover:bg-black hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300'
                          : 'border-black/10 bg-white/90 text-stone-700 hover:bg-white hover:text-black opacity-0 group-hover:opacity-100 transition-all duration-300'
                    }`}
                    aria-label={isOutOfStock ? "Sold Out" : "Add to Bag"}
                  >
                    <IoBagHandleOutline className="h-4 w-4" />
                  </button>

                  {/* Product Card Click Area */}
                  <Link to={`/product/${item.id}`} className="block">
                    <div className={`overflow-hidden border-b ${isDark ? 'bg-stone-900 border-white/10' : 'bg-[#ece7df] border-black/10'}`}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className={`h-56 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-72 ${
                          isOutOfStock ? 'grayscale-[0.3] opacity-85' : ''
                        }`}
                      />
                    </div>
                    <div className="p-4">
                      <p className={`text-[0.65rem] uppercase tracking-widest ${isDark ? 'text-amber-200/70' : 'text-amber-600'}`}>
                        {item.category}
                      </p>
                      <h3 className={`mt-1.5 text-xs uppercase tracking-[0.2em] font-medium transition ${
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
                </div>
              )
            })}
          </div>
        )}
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

export default WishlistPage
