import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '../features/auth/auth.hooks'

const CartWishlistContext = createContext()

export function CartWishlistProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  
  // Use a user-specific storage key when logged in, or 'guest'
  const userKey = isAuthenticated && user ? `user_${user.id || user.email}` : 'guest'
  const cartKey = `atelier_cart_${userKey}`
  const wishlistKey = `atelier_wishlist_${userKey}`

  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart and wishlist whenever userKey changes (login, logout, new account)
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(cartKey)
      const storedWishlist = localStorage.getItem(wishlistKey)
      setCart(storedCart ? JSON.parse(storedCart) : [])
      setWishlist(storedWishlist ? JSON.parse(storedWishlist) : [])
    } catch (e) {
      setCart([])
      setWishlist([])
    }
    setIsLoaded(true)
  }, [userKey, cartKey, wishlistKey])

  // Save cart and wishlist to the active account's storage key
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(cartKey, JSON.stringify(cart))
    }
  }, [cart, cartKey, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(wishlistKey, JSON.stringify(wishlist))
    }
  }, [wishlist, wishlistKey, isLoaded])

  // Cart operations
  const addToCart = (product, size, color, quantity = 1) => {
    if (!product) return { success: false, message: 'Invalid product.' }

    const availableStock = typeof product.stock === 'number' 
      ? product.stock 
      : (product.stock_qty !== undefined ? Number(product.stock_qty) : 0)

    if (availableStock <= 0) {
      return { 
        success: false, 
        outOfStock: true,
        message: `"${product.name}" is currently out of stock.` 
      }
    }

    let result = { success: true }

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => (item.product.id === product.id || item.product.dbId === product.dbId) && item.size === size && item.color === color
      )

      if (existingItemIndex > -1) {
        const currentQty = prevCart[existingItemIndex].quantity
        const newQty = currentQty + quantity

        if (newQty > availableStock) {
          result = {
            success: false,
            message: `Only ${availableStock} unit(s) available for "${product.name}".`,
            availableStock
          }
          // Cap at available stock if possible
          if (currentQty < availableStock) {
            const newCart = [...prevCart]
            newCart[existingItemIndex].quantity = availableStock
            return newCart
          }
          return prevCart
        }

        const newCart = [...prevCart]
        newCart[existingItemIndex].quantity = newQty
        return newCart
      }

      if (quantity > availableStock) {
        result = {
          success: false,
          message: `Only ${availableStock} unit(s) available for "${product.name}".`,
          availableStock
        }
        return [...prevCart, { product, size, color, quantity: availableStock }]
      }

      return [...prevCart, { product, size, color, quantity }]
    })

    return result
  };

  const removeFromCart = (productId, size, color) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !( (item.product.id === productId || item.product.dbId === productId) && item.size === size && item.color === color)
      )
    )
  };

  const updateCartQuantity = (productId, size, color, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color)
      return { success: true }
    }

    let result = { success: true }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if ((item.product.id === productId || item.product.dbId === productId) && item.size === size && item.color === color) {
          const availableStock = typeof item.product.stock === 'number' 
            ? item.product.stock 
            : (item.product.stock_qty !== undefined ? Number(item.product.stock_qty) : 0)

          if (availableStock > 0 && quantity > availableStock) {
            result = {
              success: false,
              message: `Maximum stock available for "${item.product.name}" is ${availableStock}.`,
              availableStock
            }
            return { ...item, quantity: availableStock }
          }
          return { ...item, quantity }
        }
        return item
      })
    )

    return result
  };

  const clearCart = () => {
    setCart([])
  }

  // Wishlist operations
  const addToWishlist = (product) => {
    setWishlist((prevWishlist) => {
      if (prevWishlist.some((p) => p.id === product.id)) {
        return prevWishlist
      }
      return [...prevWishlist, product]
    })
  }

  const removeFromWishlist = (productId) => {
    setWishlist((prevWishlist) => prevWishlist.filter((p) => p.id !== productId))
  }

  const isInWishlist = (productId) => {
    return wishlist.some((p) => p.id === productId)
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartWishlistContext.Provider
      value={{
        cart,
        wishlist,
        cartCount,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartWishlistContext.Provider>
  )
}

export function useCartWishlist() {
  const context = useContext(CartWishlistContext)
  if (!context) {
    throw new Error('useCartWishlist must be used within a CartWishlistProvider')
  }
  return context
}
