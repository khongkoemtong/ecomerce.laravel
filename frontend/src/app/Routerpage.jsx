import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Homepage from '../features/Home/pages/Homepage'
import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import ProductDetailPage from '../features/products/pages/ProductDetailPage'
import BagPage from '../features/products/pages/BagPage'
import WishlistPage from '../features/products/pages/WishlistPage'
import ProfilePage from '../features/products/pages/ProfilePage'
import ShopPage from '../features/products/pages/ShopPage'
import MenPage from '../features/products/pages/MenPage'
import WomenPage from '../features/products/pages/WomenPage'
import AccessoriesPage from '../features/products/pages/AccessoriesPage'
import BrandPage from '../features/products/pages/BrandPage'
import VisionPage from '../features/Home/pages/VisionPage'
import AboutPage from '../features/Home/pages/AboutPage'

import Chatbot from '../components/Chatbot'

function AppRoutes() {
  const location = useLocation()
  const hideChatbot = location.pathname === '/login' || location.pathname === '/register'

  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/bag" element={<BagPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/men" element={<MenPage />} />
        <Route path="/women" element={<WomenPage />} />
        <Route path="/accessories" element={<AccessoriesPage />} />
        <Route path="/brand/:brandName" element={<BrandPage />} />
        <Route path="/vision" element={<VisionPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
      {!hideChatbot && <Chatbot />}
    </>
  )
}

function Routerpage() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default Routerpage
