import { Link } from 'react-router-dom'
import { useTheme } from '../../../context/ThemeContext'
import Header from '../../../components/Header'
import { useCartWishlist } from '../../../context/CartWishlistContext'
import { IoCloseOutline } from 'react-icons/io5'

function BagPage() {
  const { isDark } = useTheme()
  const { cart, removeFromCart, updateCartQuantity } = useCartWishlist()

  // Calculate Subtotal
  const subtotal = cart.reduce((sum, item) => {
    const priceNum = parseFloat(item.product.price.replace('$', ''))
    return sum + priceNum * item.quantity
  }, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return

    let message = `🛒 *New Checkout Alert!*\n\n`
    cart.forEach((item, index) => {
      const itemPriceNum = parseFloat(item.product.price.replace('$', ''))
      const itemTotal = (itemPriceNum * item.quantity).toFixed(2)
      message += `${index + 1}. *${item.product.name}*\n`
      message += `   Size: ${item.size}\n`
      message += `   Color: ${item.color}\n`
      message += `   Qty: ${item.quantity} x ${item.product.price}\n`
      message += `   Item Total: $${itemTotal}\n\n`
    })
    
    message += `💰 *Total: $${subtotal.toFixed(2)}*`

    try {
      await fetch('https://api.telegram.org/bot8579876757:AAGReZd33ozFRHhrKjTh8XUvwJ4UCcOAmqw/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: '7125153160',
          text: message,
          parse_mode: 'Markdown',
        }),
      })
      alert('Checkout details sent to Telegram successfully!')
    } catch (error) {
      console.error('Error sending message to Telegram:', error)
      alert('Failed to send checkout details.')
    }
  }

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
            Your Selections
          </p>
          <h1 className={`mt-2 font-serif text-4xl sm:text-5xl ${isDark ? 'text-white' : 'text-stone-900'}`}>
            Shopping Bag
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className={`text-sm uppercase tracking-[0.3em] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Your shopping bag is currently empty
            </p>
            <Link
              to="/"
              className={`mt-8 px-8 py-4 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                isDark 
                  ? 'bg-amber-500 text-black hover:bg-amber-400' 
                  : 'bg-stone-900 text-white hover:bg-stone-800'
              }`}
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1fr_0.45fr]">
            
            {/* Left side: Cart Items */}
            <div className={`space-y-6 divide-y ${isDark ? 'divide-white/10' : 'divide-black/10'}`}>
              {cart.map((item, idx) => {
                const itemPriceNum = parseFloat(item.product.price.replace('$', ''))
                const itemTotal = (itemPriceNum * item.quantity).toFixed(2)

                return (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color}-${idx}`}
                    className={`flex flex-col gap-6 py-6 sm:flex-row sm:items-center justify-between ${
                      idx === 0 ? '' : 'pt-6'
                    }`}
                  >
                    {/* Product Image & Info */}
                    <div className="flex items-center gap-6">
                      <Link to={`/product/${item.product.id}`} className="block h-24 w-20 flex-shrink-0 overflow-hidden border border-black/10">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </Link>
                      
                      <div className="space-y-1">
                        <h2 className={`font-serif text-lg leading-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>
                          <Link to={`/product/${item.product.id}`} className="hover:underline">
                            {item.product.name}
                          </Link>
                        </h2>
                        
                        <p className={`text-xs uppercase tracking-wider ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                          {item.product.category}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                          <span className="flex items-center gap-2">
                            <span className={isDark ? 'text-stone-400' : 'text-stone-500'}>Size:</span>
                            <span className="font-semibold uppercase">{item.size}</span>
                          </span>
                          
                          <span className="flex items-center gap-2">
                            <span className={isDark ? 'text-stone-400' : 'text-stone-500'}>Color:</span>
                            <span
                              style={{ backgroundColor: item.color }}
                              className={`inline-block h-3.5 w-3.5 rounded-full border ${isDark ? 'border-white/20' : 'border-black/20'}`}
                            />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Selector, Price, and Remove Button */}
                    <div className="flex items-center justify-between gap-8 sm:justify-end">
                      
                      {/* Quantity Controls */}
                      <div className={`flex items-center border ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                          className="px-3 py-1.5 hover:bg-stone-500/10 cursor-pointer text-xs"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                          className="px-3 py-1.5 hover:bg-stone-500/10 cursor-pointer text-xs"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Total Item Price */}
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                          ${itemTotal}
                        </p>
                        <p className={`text-[0.68rem] opacity-75 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                          {item.product.price} each
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                        className={`text-xl transition cursor-pointer hover:scale-110 ${
                          isDark ? 'text-stone-400 hover:text-white' : 'text-stone-500 hover:text-stone-900'
                        }`}
                        aria-label="Remove item"
                      >
                        <IoCloseOutline />
                      </button>
                    </div>

                  </div>
                )
              })}
            </div>

            {/* Right side: Summary Section */}
            <div className="space-y-6">
              <div className={`border p-6 sm:p-8 ${
                isDark 
                  ? 'border-white/10 bg-stone-900/90 shadow-[0_24px_80px_rgba(0,0,0,0.45)]' 
                  : 'border-black/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.05)]'
              }`}>
                <h2 className={`font-serif text-2xl ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  Order Summary
                </h2>

                <div className={`mt-6 space-y-4 text-sm border-b pb-6 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-stone-400' : 'text-stone-600'}>Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-stone-400' : 'text-stone-600'}>Shipping</span>
                    <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600">
                      Complimentary
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-stone-400' : 'text-stone-600'}>Tax</span>
                    <span className={isDark ? 'text-stone-400' : 'text-stone-500'}>Calculated at checkout</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-baseline justify-between py-6">
                  <span className={`text-base font-serif ${isDark ? 'text-white' : 'text-stone-900'}`}>Total</span>
                  <span className={`text-2xl font-serif ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Promo Code Input */}
                <div className="space-y-2 pb-6">
                  <label className={`block text-xs uppercase tracking-wider ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                    Promo Code
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Enter code"
                      className={`w-full border px-4 py-3 text-sm outline-none transition placeholder:text-stone-500 focus:bg-transparent ${
                        isDark 
                          ? 'border-white/10 bg-black/30 text-white focus:border-amber-400/70' 
                          : 'border-black/10 bg-white text-stone-900 focus:border-amber-600/70'
                      }`}
                    />
                    <button
                      type="button"
                      className={`px-4 text-xs font-semibold uppercase tracking-wider transition ${
                        isDark 
                          ? 'bg-amber-500 text-black hover:bg-amber-400' 
                          : 'bg-stone-900 text-white hover:bg-stone-800'
                      }`}
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  className={`w-full py-4 text-xs font-semibold uppercase tracking-[0.35em] transition shadow-[0_8px_30px_rgba(0,0,0,0.1)] cursor-pointer ${
                    isDark
                      ? 'bg-amber-500 text-black hover:bg-amber-400'
                      : 'bg-stone-900 text-white hover:bg-stone-800'
                  }`}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>

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

export default BagPage
