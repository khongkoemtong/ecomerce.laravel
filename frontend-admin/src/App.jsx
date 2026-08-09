import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import OrderLinePage from './pages/OrderLinePage';
import CustomerOrderPage from './pages/CustomerOrderPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="order-line" element={<OrderLinePage />} />
          <Route path="customer-order/:customerName" element={<CustomerOrderPage />} />
          <Route path="manage-inventory" element={<div className="p-8">Manage Inventory (WIP)</div>} />
          <Route path="manage-products" element={<div className="p-8">Manage Products (WIP)</div>} />
          <Route path="customers" element={<div className="p-8">Customers (WIP)</div>} />
          {/* Settings, etc. */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
