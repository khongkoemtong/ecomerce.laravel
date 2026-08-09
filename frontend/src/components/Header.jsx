import { useState } from 'react';
import { Link } from "react-router-dom";
import { FaRegHeart, FaRegUser, FaSun, FaMoon, FaBars, FaTimes } from "react-icons/fa";
import { IoBagHandleOutline } from "react-icons/io5";
import { useTheme } from '../context/ThemeContext';
import { useCartWishlist } from '../context/CartWishlistContext';
import { useAuth } from '../features/auth/auth.hooks';

function Header() {
  const { isDark, toggleTheme } = useTheme();
  const { cartCount, wishlist } = useCartWishlist();
  const { isAuthenticated, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Women', path: '/women' },
    { name: 'Men', path: '/men' },
    { name: 'Accessories', path: '/accessories' },
    { name: 'Shop All', path: '/shop' },
    { name: 'About', path: '/about' },
  ];

  return (
    <>
      <header className={`fixed inset-x-4 md:inset-x-[100px] top-5 z-50 border transition-all duration-300 px-4 py-3 md:px-6 md:py-4 backdrop-blur-md rounded-2xl ${
        isDark 
          ? "border-white/10 bg-black/40 text-stone-300 shadow-[0_8px_32px_rgba(0,0,0,0.37)]" 
          : "border-black/10 bg-white/70 text-stone-700 shadow-[0_8px_32px_rgba(0,0,0,0.05)]"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              type="button"
              className="md:hidden p-1" 
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <FaBars className="h-5 w-5" />
            </button>
            <Link to="/" className={`font-serif text-xl md:text-2xl tracking-[0.22em] transition-colors ${
              isDark ? "text-white hover:text-amber-300" : "text-stone-900 hover:text-amber-600"
            }`}>
              ATELIER
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`transition ${
                  isDark ? "hover:text-amber-300" : "hover:text-amber-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-4 text-sm">
            <div className="flex items-center gap-3 md:gap-4 text-lg">
              <button
                type="button"
                onClick={toggleTheme}
                className={`transition cursor-pointer p-1 rounded-md ${
                  isDark ? "hover:text-amber-300" : "hover:text-amber-600"
                }`}
                aria-label="Toggle theme"
              >
                {isDark ? <FaSun className="h-4 w-4" /> : <FaMoon className="h-4 w-4" />}
              </button>
              
              <Link 
                to="/wishlist" 
                className={`transition p-1 relative flex items-center justify-center ${
                  isDark ? "hover:text-amber-300" : "hover:text-amber-600"
                }`} 
                aria-label="Wishlist"
              >
                <FaRegHeart className="h-4 w-4" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              
              <Link 
                to="/bag" 
                className={`transition p-1 relative flex items-center justify-center ${
                  isDark ? "hover:text-amber-300" : "hover:text-amber-600"
                }`} 
                aria-label="Bag"
              >
                <IoBagHandleOutline className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black">
                    {cartCount}
                  </span>
                )}
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/profile" 
                  className={`hidden md:flex transition p-1 ${
                    isDark ? "hover:text-amber-300" : "hover:text-amber-600"
                  }`} 
                  aria-label="Profile"
                >
                  <FaRegUser className="h-4 w-4" />
                </Link>
              )}
            </div>
            {!isAuthenticated && (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] transition rounded-lg border ${
                    isDark
                      ? "border-white/10 hover:border-amber-300 hover:text-amber-300 text-stone-300"
                      : "border-black/10 hover:border-amber-600 hover:text-amber-600 text-stone-700"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] transition rounded-lg border border-amber-500 bg-amber-500 text-black hover:bg-amber-400 hover:border-amber-400"
                >
                  Join
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Offcanvas Menu Overlay */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Mobile Offcanvas Menu Content */}
      <div 
        className={`fixed top-0 left-0 bottom-0 z-[70] w-[80%] max-w-sm flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          isDark ? "bg-black text-stone-300 border-r border-white/10" : "bg-white text-stone-700 border-r border-black/10"
        } ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-black/10 dark:border-white/10">
          <span className="font-serif text-xl tracking-[0.22em]">ATELIER</span>
          <button 
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 -mr-2"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex flex-col gap-6 p-6 overflow-y-auto flex-1">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              to={link.path}
              className={`text-lg font-medium tracking-wide transition-colors ${
                isDark ? "hover:text-amber-300" : "hover:text-amber-600"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          <hr className={isDark ? "border-white/10" : "border-black/10"} />

          {isAuthenticated ? (
            <Link 
              to="/profile"
              className={`flex items-center gap-3 text-lg font-medium transition-colors ${
                isDark ? "hover:text-amber-300" : "hover:text-amber-600"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaRegUser className="h-5 w-5" />
              My Profile
            </Link>
          ) : (
            <div className="flex flex-col gap-3 mt-4">
              <Link
                to="/login"
                className={`w-full text-center px-4 py-3 text-sm font-semibold uppercase tracking-[0.28em] transition rounded-lg border ${
                  isDark
                    ? "border-white/10 hover:border-amber-300 hover:text-amber-300 text-stone-300"
                    : "border-black/10 hover:border-amber-600 hover:text-amber-600 text-stone-700"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="w-full text-center px-4 py-3 text-sm font-semibold uppercase tracking-[0.28em] transition rounded-lg border border-amber-500 bg-amber-500 text-black hover:bg-amber-400 hover:border-amber-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Join
              </Link>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}

export default Header;
