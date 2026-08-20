import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import OrderLinePage from './pages/OrderLinePage';
import CustomerOrderPage from './pages/CustomerOrderPage';
import ManageInventoryPage from './pages/ManageInventoryPage';
import ManageProductPage from './pages/ManageProductPage';
import CategoriesPage from './pages/CategoriesPage';
import BrandsPage from './pages/BrandsPage';
import CustomersPage from './pages/CustomersPage';
import PaymentsPage from './pages/PaymentsPage';
import ProductReviewsPage from './pages/ProductReviewsPage';
import PromotionsPage from './pages/PromotionsPage';
import UserRolesPage from './pages/UserRolesPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="order-line" element={<OrderLinePage />} />
          <Route path="customer-order/:customerName" element={<CustomerOrderPage />} />
          <Route path="manage-inventory" element={<ManageInventoryPage />} />
          <Route path="manage-products" element={<ManageProductPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="reviews" element={<ProductReviewsPage />} />
          <Route path="promotions" element={<PromotionsPage />} />
          <Route path="settings" element={<Navigate to="/settings/roles" replace />} />
          <Route path="settings/roles" element={<UserRolesPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
