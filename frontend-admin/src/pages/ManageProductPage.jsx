import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Edit,
  Trash2,
  Copy,
  Eye,
  Tag,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  Filter,
  DollarSign,
  Box,
  Image as ImageIcon,
  Sparkles,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Percent,
  Layers,
  ShoppingBag,
  Info,
  Download,
  Upload,
  RefreshCw,
  Star,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

// Initial Mock Product Dataset
const INITIAL_PRODUCTS = [
  {
    id: 'PRD-1001',
    name: 'Wireless Noise-Canceling Headphones Pro',
    sku: 'SKU-AUD-01',
    brand: 'AudioTech',
    category: 'electronics',
    price: 299.00,
    salePrice: 249.00,
    cost: 130.00,
    stock: 24,
    minStock: 10,
    rating: 4.8,
    salesCount: 142,
    status: 'active',
    featured: true,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal clear acoustics.',
    tags: ['wireless', 'audio', 'bluetooth', 'noise-canceling'],
    variants: [
      { name: 'Color', options: ['Matte Black', 'Silver', 'Navy Blue'] }
    ],
    lastUpdated: '2026-08-10'
  },
  {
    id: 'PRD-1002',
    name: 'Smartphone 5G Pro Max 256GB',
    sku: 'SKU-MOB-05',
    brand: 'TechMaster',
    category: 'electronics',
    price: 999.00,
    salePrice: 899.00,
    cost: 580.00,
    stock: 8,
    minStock: 10,
    rating: 4.9,
    salesCount: 310,
    status: 'active',
    featured: true,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    description: 'Flagship smartphone featuring Super Retina XDR OLED display, triple lens 48MP camera system, and ultra-fast 5G network chip.',
    tags: ['5G', 'smartphone', 'camera', 'mobile'],
    variants: [
      { name: 'Color', options: ['Graphite', 'Gold', 'Deep Purple'] },
      { name: 'Storage', options: ['128GB', '256GB', '512GB'] }
    ],
    lastUpdated: '2026-08-11'
  },
  {
    id: 'PRD-1003',
    name: 'Sculptural Wool Overcoat',
    sku: 'SKU-CLO-08',
    brand: 'Atelier Couture',
    category: 'clothing',
    price: 340.00,
    salePrice: 280.00,
    cost: 140.00,
    stock: 15,
    minStock: 5,
    rating: 4.7,
    salesCount: 88,
    status: 'active',
    featured: false,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    description: 'Handcrafted wool overcoat designed with tailored silhouette, notch lapel, and premium silk lining.',
    tags: ['coat', 'outerwear', 'wool', 'fashion'],
    variants: [
      { name: 'Size', options: ['S', 'M', 'L', 'XL'] },
      { name: 'Color', options: ['Camel', 'Charcoal'] }
    ],
    lastUpdated: '2026-08-08'
  },
  {
    id: 'PRD-1004',
    name: 'Classic Organic Cotton T-Shirt',
    sku: 'SKU-CLO-01',
    brand: 'EcoBasics',
    category: 'clothing',
    price: 35.00,
    salePrice: null,
    cost: 10.00,
    stock: 120,
    minStock: 25,
    rating: 4.5,
    salesCount: 530,
    status: 'active',
    featured: false,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80',
    description: '100% GOTS certified organic cotton t-shirt with soft hand-feel and durable reinforced collar stitch.',
    tags: ['t-shirt', 'organic', 'basics', 'cotton'],
    variants: [
      { name: 'Size', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
      { name: 'Color', options: ['White', 'Black', 'Heather Grey', 'Olive'] }
    ],
    lastUpdated: '2026-08-09'
  },
  {
    id: 'PRD-1005',
    name: 'Minimalist Modern Ceramic Coffee Mug',
    sku: 'SKU-HOM-12',
    brand: 'Nordic Craft',
    category: 'home',
    price: 24.00,
    salePrice: 18.00,
    cost: 6.00,
    stock: 45,
    minStock: 15,
    rating: 4.6,
    salesCount: 220,
    status: 'active',
    featured: false,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&auto=format&fit=crop&q=80',
    description: 'Matte ceramic mug handcrafted with ergonomic grip, holding 350ml of your favorite coffee or tea.',
    tags: ['kitchen', 'mug', 'ceramic', 'coffee'],
    variants: [
      { name: 'Color', options: ['Sand', 'Terrazzo', 'Slate'] }
    ],
    lastUpdated: '2026-08-05'
  },
  {
    id: 'PRD-1006',
    name: 'Indoor Architectural Potted Plant',
    sku: 'SKU-HOM-04',
    brand: 'Botanica',
    category: 'home',
    price: 55.00,
    salePrice: null,
    cost: 18.00,
    stock: 0,
    minStock: 8,
    rating: 4.9,
    salesCount: 165,
    status: 'out_of_stock',
    featured: true,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80',
    description: 'Low-maintenance indoor Monstera Deliciosa plant complete with custom ceramic pot and self-watering saucer.',
    tags: ['plants', 'decor', 'greenery', 'indoor'],
    variants: [
      { name: 'Pot Type', options: ['White Ceramic', 'Terracotta', 'Concrete'] }
    ],
    lastUpdated: '2026-08-12'
  },
  {
    id: 'PRD-1007',
    name: 'RGB Mechanical Gaming Keyboard',
    sku: 'SKU-TEC-99',
    brand: 'KeyCrafters',
    category: 'electronics',
    price: 149.00,
    salePrice: 129.00,
    cost: 65.00,
    stock: 18,
    minStock: 5,
    rating: 4.7,
    salesCount: 195,
    status: 'active',
    featured: false,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&auto=format&fit=crop&q=80',
    description: 'Hot-swappable mechanical keyboard with custom lubricant switches, per-key RGB backlighting, and aluminum frame.',
    tags: ['keyboard', 'gaming', 'mechanical', 'rgb'],
    variants: [
      { name: 'Switch', options: ['Red Linear', 'Brown Tactile', 'Blue Clicky'] }
    ],
    lastUpdated: '2026-08-04'
  },
  {
    id: 'PRD-1008',
    name: 'Non-Slip Eco Yoga Mat 6mm',
    sku: 'SKU-SPO-21',
    brand: 'ZenFit',
    category: 'sports',
    price: 65.00,
    salePrice: 49.00,
    cost: 20.00,
    stock: 32,
    minStock: 10,
    rating: 4.8,
    salesCount: 280,
    status: 'active',
    featured: false,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop&q=80',
    description: 'Extra thick 6mm natural rubber yoga mat featuring non-slip texture and alignment guides for perfect practice.',
    tags: ['fitness', 'yoga', 'mat', 'exercise'],
    variants: [
      { name: 'Color', options: ['Sage Green', 'Plum', 'Midnight Blue'] }
    ],
    lastUpdated: '2026-08-07'
  },
  {
    id: 'PRD-1009',
    name: 'Adjustable Rubber Dumbbell Set',
    sku: 'SKU-SPO-09',
    brand: 'PowerLift',
    category: 'sports',
    price: 180.00,
    salePrice: null,
    cost: 90.00,
    stock: 4,
    minStock: 8,
    rating: 4.6,
    salesCount: 110,
    status: 'active',
    featured: false,
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80',
    description: 'Quick-adjust dumbbell weights ranging from 5lbs to 50lbs with high-density rubber casing and anti-slip steel handle.',
    tags: ['gym', 'weights', 'fitness', 'workout'],
    variants: [
      { name: 'Weight Limit', options: ['25 lbs Pair', '50 lbs Pair'] }
    ],
    lastUpdated: '2026-08-11'
  },
  {
    id: 'PRD-1010',
    name: 'Breathable Cushion Running Shoes',
    sku: 'SKU-SHO-33',
    brand: 'Strider',
    category: 'clothing',
    price: 145.00,
    salePrice: 115.00,
    cost: 50.00,
    stock: 22,
    minStock: 10,
    rating: 4.9,
    salesCount: 420,
    status: 'active',
    featured: true,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    description: 'High-performance running sneakers built with responsive nitrogen-infused foam midsole and mesh upper.',
    tags: ['shoes', 'sneakers', 'running', 'footwear'],
    variants: [
      { name: 'Size', options: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'] },
      { name: 'Color', options: ['Neon Red/Black', 'Pure White', 'Electric Blue'] }
    ],
    lastUpdated: '2026-08-06'
  },
  {
    id: 'PRD-1011',
    name: 'Smart Dimmable LED Desk Lamp',
    sku: 'SKU-HOM-88',
    brand: 'Lumina',
    category: 'home',
    price: 79.00,
    salePrice: 59.00,
    cost: 25.00,
    stock: 0,
    minStock: 5,
    rating: 4.4,
    salesCount: 95,
    status: 'draft',
    featured: false,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
    description: 'Touch-controlled LED desk lamp with adjustable color temperature, built-in wireless phone charger, and eye care mode.',
    tags: ['lamp', 'lighting', 'desk', 'smart-home'],
    variants: [
      { name: 'Body Finish', options: ['Anodized Silver', 'Matte Black'] }
    ],
    lastUpdated: '2026-08-01'
  },
  {
    id: 'PRD-1012',
    name: 'Structured Grain Leather Handbag',
    sku: 'SKU-ACC-03',
    brand: 'Loewe Luxe',
    category: 'accessories',
    price: 420.00,
    salePrice: 380.00,
    cost: 190.00,
    stock: 6,
    minStock: 5,
    rating: 4.9,
    salesCount: 74,
    status: 'active',
    featured: true,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
    description: 'Italian full-grain calfskin leather bag with signature gold hardware, removable shoulder strap, and suede interior.',
    tags: ['leather', 'handbag', 'accessories', 'luxury'],
    variants: [
      { name: 'Color', options: ['Cognac Tan', 'Black Noir', 'Ivory Cream'] }
    ],
    lastUpdated: '2026-08-10'
  }
];

const CATEGORIES = [
  { id: 'all', name: 'All Categories', count: 12 },
  { id: 'electronics', name: 'Electronics', count: 4 },
  { id: 'clothing', name: 'Clothing & Fashion', count: 3 },
  { id: 'home', name: 'Home & Living', count: 3 },
  { id: 'sports', name: 'Sports & Outdoors', count: 2 },
  { id: 'accessories', name: 'Accessories', count: 1 }
];

const PRESET_IMAGES = {
  electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  clothing: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80',
  home: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&auto=format&fit=crop&q=80',
  sports: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop&q=80',
  accessories: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
};

export default function ManageProductPage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price_low' | 'price_high' | 'stock_low' | 'name'

  // Selection & Bulk Actions
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = Add, Object = Edit
  const [activeFormTab, setActiveFormTab] = useState('basic'); // 'basic' | 'pricing' | 'inventory' | 'media'

  const [previewProduct, setPreviewProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  // Notifications Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category
      const matchesCategory =
        selectedCategory === 'all' || p.category === selectedCategory;

      // Status
      let matchesStatus = true;
      if (selectedStatus === 'active') matchesStatus = p.status === 'active';
      if (selectedStatus === 'draft') matchesStatus = p.status === 'draft';
      if (selectedStatus === 'out_of_stock') matchesStatus = p.stock === 0;
      if (selectedStatus === 'low_stock') matchesStatus = p.stock > 0 && p.stock <= p.minStock;

      return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return (a.salePrice || a.price) - (b.salePrice || b.price);
      if (sortBy === 'price_high') return (b.salePrice || b.price) - (a.salePrice || a.price);
      if (sortBy === 'stock_low') return a.stock - b.stock;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      // default newest
      return new Date(b.lastUpdated) - new Date(a.lastUpdated);
    });
  }, [products, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Analytics Metrics
  const stats = useMemo(() => {
    const total = products.length;
    const activeCount = products.filter(p => p.status === 'active').length;
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

    return { total, activeCount, lowStockCount, outOfStockCount, totalValue };
  }, [products]);

  // Handle Selection
  const toggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectProduct = (id) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter(item => item !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  // Product Actions
  const handleToggleProductStatus = (id) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'active' ? 'draft' : 'active';
        showToast(`Product "${p.name}" status updated to ${nextStatus}`, 'info');
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  const handleDuplicateProduct = (product) => {
    const newId = `PRD-${Math.floor(1000 + Math.random() * 9000)}`;
    const duplicated = {
      ...product,
      id: newId,
      name: `${product.name} (Copy)`,
      sku: `${product.sku}-COPY`,
      status: 'draft',
      salesCount: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setProducts([duplicated, ...products]);
    showToast(`Product duplicated as "${duplicated.name}"`, 'success');
  };

  const handleDeleteProduct = (id) => {
    const target = products.find(p => p.id === id);
    setProducts(products.filter(p => p.id !== id));
    setDeletingProductId(null);
    setSelectedProductIds(selectedProductIds.filter(i => i !== id));
    showToast(`Product "${target?.name || id}" was deleted`, 'warning');
  };

  const handleBulkDelete = () => {
    setProducts(products.filter(p => !selectedProductIds.includes(p.id)));
    showToast(`Deleted ${selectedProductIds.length} selected products`, 'warning');
    setSelectedProductIds([]);
  };

  const handleBulkStatusChange = (newStatus) => {
    setProducts(products.map(p => {
      if (selectedProductIds.includes(p.id)) {
        return { ...p, status: newStatus };
      }
      return p;
    }));
    showToast(`Updated status to ${newStatus} for ${selectedProductIds.length} products`, 'success');
    setSelectedProductIds([]);
  };

  const handleBulkDiscount = (discountPercent) => {
    setProducts(products.map(p => {
      if (selectedProductIds.includes(p.id)) {
        const discounted = Math.round(p.price * (1 - discountPercent / 100));
        return { ...p, salePrice: discounted };
      }
      return p;
    }));
    showToast(`Applied ${discountPercent}% discount to ${selectedProductIds.length} products`, 'success');
    setSelectedProductIds([]);
  };

  // Export CSV mock
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'SKU', 'Category', 'Price', 'SalePrice', 'Stock', 'Status'];
    const rows = filteredProducts.map(p => [
      p.id, `"${p.name}"`, p.sku, p.category, p.price, p.salePrice || '', p.stock, p.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `products_catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Product catalog CSV exported successfully!', 'success');
  };

  // Open Form Modal (Add / Edit)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    brand: '',
    category: 'electronics',
    price: '',
    salePrice: '',
    cost: '',
    stock: 10,
    minStock: 5,
    description: '',
    tags: '',
    image: '',
    status: 'active',
    featured: false,
  });

  const openFormModal = (productToEdit = null) => {
    setEditingProduct(productToEdit);
    setActiveFormTab('basic');
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        sku: productToEdit.sku,
        brand: productToEdit.brand,
        category: productToEdit.category,
        price: productToEdit.price,
        salePrice: productToEdit.salePrice || '',
        cost: productToEdit.cost || '',
        stock: productToEdit.stock,
        minStock: productToEdit.minStock || 5,
        description: productToEdit.description || '',
        tags: productToEdit.tags ? productToEdit.tags.join(', ') : '',
        image: productToEdit.image || '',
        status: productToEdit.status,
        featured: productToEdit.featured || false,
      });
    } else {
      setFormData({
        name: '',
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        brand: 'Tasty Station',
        category: 'electronics',
        price: 49.99,
        salePrice: '',
        cost: 20.00,
        stock: 15,
        minStock: 5,
        description: '',
        tags: 'popular, new',
        image: PRESET_IMAGES.electronics,
        status: 'active',
        featured: false,
      });
    }
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      showToast('Please fill in required fields (Name & Price)', 'error');
      return;
    }

    const priceNum = parseFloat(formData.price) || 0;
    const saleNum = formData.salePrice ? parseFloat(formData.salePrice) : null;
    const costNum = formData.cost ? parseFloat(formData.cost) : Math.round(priceNum * 0.4);
    const stockNum = parseInt(formData.stock, 10) || 0;
    const minStockNum = parseInt(formData.minStock, 10) || 5;

    const tagsArray = formData.tags
      ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      : ['catalog'];

    const imageToUse = formData.image || PRESET_IMAGES[formData.category] || PRESET_IMAGES.electronics;

    if (editingProduct) {
      // Update
      const updatedList = products.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: formData.name,
            sku: formData.sku,
            brand: formData.brand,
            category: formData.category,
            price: priceNum,
            salePrice: saleNum,
            cost: costNum,
            stock: stockNum,
            minStock: minStockNum,
            description: formData.description,
            tags: tagsArray,
            image: imageToUse,
            status: stockNum === 0 ? 'out_of_stock' : formData.status,
            featured: formData.featured,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return p;
      });
      setProducts(updatedList);
      showToast(`Product "${formData.name}" updated successfully!`, 'success');
    } else {
      // Create
      const newProductObj = {
        id: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
        name: formData.name,
        sku: formData.sku,
        brand: formData.brand,
        category: formData.category,
        price: priceNum,
        salePrice: saleNum,
        cost: costNum,
        stock: stockNum,
        minStock: minStockNum,
        rating: 5.0,
        salesCount: 0,
        status: stockNum === 0 ? 'out_of_stock' : formData.status,
        featured: formData.featured,
        image: imageToUse,
        description: formData.description || 'Newly added product in store catalog.',
        tags: tagsArray,
        variants: [{ name: 'Standard', options: ['Default'] }],
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setProducts([newProductObj, ...products]);
      showToast(`New product "${formData.name}" created!`, 'success');
    }

    setIsFormModalOpen(false);
  };

  // Computed Margin Helper for Form
  const computedFormMargin = useMemo(() => {
    const p = parseFloat(formData.price) || 0;
    const c = parseFloat(formData.cost) || 0;
    if (p <= 0) return { profit: 0, margin: 0 };
    const profit = p - c;
    const margin = (profit / p) * 100;
    return { profit: profit.toFixed(2), margin: margin.toFixed(1) };
  }, [formData.price, formData.cost]);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto text-gray-800 dark:text-gray-100 transition-colors duration-200">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-none shadow-2xl text-white font-medium transition-all animate-bounce ${
          toast.type === 'error' ? 'bg-red-600' :
          toast.type === 'warning' ? 'bg-amber-600' :
          toast.type === 'info' ? 'bg-blue-600' : 'bg-emerald-600'
        }`}>
          {toast.type === 'error' && <XCircle className="w-5 h-5" />}
          {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
          {toast.type === 'info' && <Info className="w-5 h-5" />}
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Manage Products
            </h1>
            <span className="px-3 py-1 text-xs font-semibold rounded-none bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
              {products.length} Total Items
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create, search, filter, update pricing, stock, and organize store products catalog.
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/70 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-none shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span>Export Catalog</span>
          </button>

          <button
            onClick={() => openFormModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-bold rounded-none shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-none border border-gray-200 dark:border-gray-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Products</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>100% active catalog</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-none bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-none border border-gray-200 dark:border-gray-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Online</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeCount}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Visible on storefront</p>
          </div>
          <div className="w-12 h-12 rounded-none bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-none border border-gray-200 dark:border-gray-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inventory Alerts</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.lowStockCount + stats.outOfStockCount}</h3>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">({stats.outOfStockCount} Out of Stock)</span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">{stats.lowStockCount} need replenishment</p>
          </div>
          <div className="w-12 h-12 rounded-none bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-none border border-gray-200 dark:border-gray-700/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Catalog Valuation</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">Estimated inventory retail</p>
          </div>
          <div className="w-12 h-12 rounded-none bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Filter & Action Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700 p-4 space-y-4 shadow-sm">
        
        {/* Search & Select Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search product name, SKU, brand or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters & Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-none text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="draft">Draft / Hidden</option>
                <option value="low_stock">Low Stock Alert</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-none text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="newest">Recently Updated</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="stock_low">Stock: Low to High</option>
                <option value="name">Product Name (A-Z)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-none p-1 bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-none transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-none transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar pt-2 border-t border-gray-100 dark:border-gray-700/60">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-none text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Bulk Operation Action Bar (Visible when products selected) */}
        {selectedProductIds.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/60 rounded-none animate-fadeIn">
            <div className="flex items-center gap-3 text-sm font-semibold text-amber-900 dark:text-amber-300">
              <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{selectedProductIds.length} products selected</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                onClick={() => handleBulkStatusChange('active')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-none shadow-sm"
              >
                Mark Active
              </button>
              <button
                onClick={() => handleBulkStatusChange('draft')}
                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-none shadow-sm"
              >
                Mark Draft
              </button>
              <button
                onClick={() => handleBulkDiscount(10)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-none shadow-sm"
              >
                Apply 10% Off
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-none shadow-sm"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedProductIds([])}
                className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:underline ml-2"
              >
                Deselect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Content List (Table or Grid) */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700 p-12 text-center shadow-sm">
          <Box className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No products found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or category filters to find existing products.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}
            className="mt-4 px-4 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-semibold text-xs rounded-none border border-amber-200 dark:border-amber-800 hover:bg-amber-100"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-4 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded-none border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                  </th>
                  <th className="py-4 px-4">Product</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Price / Discount</th>
                  <th className="py-4 px-4">Cost & Margin</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 font-medium">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  const isLowStock = product.stock > 0 && product.stock <= product.minStock;
                  const isOutOfStock = product.stock === 0;
                  const profit = (product.salePrice || product.price) - product.cost;
                  const marginPercent = Math.round((profit / (product.salePrice || product.price)) * 100);

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors ${
                        isSelected ? 'bg-amber-50/60 dark:bg-amber-900/10' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectProduct(product.id)}
                          className="rounded-none border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                      </td>

                      {/* Product Thumbnail & Details */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-none object-cover border border-gray-200 dark:border-gray-700 shrink-0 shadow-sm"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900 dark:text-white truncate hover:underline cursor-pointer" onClick={() => setPreviewProduct(product)}>
                                {product.name}
                              </h4>
                              {product.featured && (
                                <span className="px-1.5 py-0.5 rounded-none text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                                  ★ Featured
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                              <span className="font-mono">{product.sku}</span>
                              <span>•</span>
                              <span>Brand: {product.brand}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-xs font-semibold capitalize text-gray-600 dark:text-gray-300">
                        <span className="px-2.5 py-1 rounded-none bg-gray-100 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600">
                          {product.category}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="py-4 px-4">
                        <div>
                          {product.salePrice ? (
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                                ${product.salePrice.toFixed(2)}
                              </span>
                              <span className="text-xs line-through text-gray-400">
                                ${product.price.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold text-gray-900 dark:text-white text-base">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            {product.salesCount} sold
                          </div>
                        </div>
                      </td>

                      {/* Cost & Profit Margin */}
                      <td className="py-4 px-4">
                        <div className="text-xs">
                          <div className="text-gray-500 dark:text-gray-400">Cost: ${product.cost.toFixed(2)}</div>
                          <div className={`font-semibold mt-0.5 ${marginPercent > 40 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                            Profit: +${profit.toFixed(2)} ({marginPercent}%)
                          </div>
                        </div>
                      </td>

                      {/* Inventory Stock */}
                      <td className="py-4 px-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${
                              isOutOfStock ? 'text-rose-600 dark:text-rose-400' :
                              isLowStock ? 'text-amber-600 dark:text-amber-400' :
                              'text-gray-900 dark:text-white'
                            }`}>
                              {product.stock} units
                            </span>
                          </div>
                          {/* Stock Progress Mini-bar */}
                          <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-none mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-none transition-all ${
                                isOutOfStock ? 'w-0' :
                                isLowStock ? 'bg-amber-500 w-1/4' : 'bg-emerald-500 w-3/4'
                              }`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleProductStatus(product.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-bold transition-all ${
                            product.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : product.status === 'out_of_stock'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {product.status === 'active' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </>
                          ) : product.status === 'out_of_stock' ? (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Out of Stock</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewProduct(product)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Quick Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openFormModal(product)}
                            className="p-1.5 text-gray-500 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400 rounded-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicateProduct(product)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Duplicate Product"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProductId(product.id)}
                            className="p-1.5 text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 rounded-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Stats */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Showing {filteredProducts.length} of {products.length} products</span>
            <div className="flex items-center gap-2">
              <button disabled className="px-3 py-1 rounded-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 opacity-50 cursor-not-allowed">
                Previous
              </button>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Page 1 of 1</span>
              <button disabled className="px-3 py-1 rounded-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 opacity-50 cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock === 0;
            const isLowStock = product.stock > 0 && product.stock <= product.minStock;

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                {/* Top Image & Badge Header */}
                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-none text-[11px] font-bold bg-black/60 backdrop-blur-md text-white capitalize">
                    {product.category}
                  </span>

                  {/* Status Badge */}
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-none text-[11px] font-bold text-white backdrop-blur-md ${
                    product.status === 'active' ? 'bg-emerald-600/90' :
                    isOutOfStock ? 'bg-rose-600/90' : 'bg-gray-600/90'
                  }`}>
                    {product.status === 'active' ? 'Active' : isOutOfStock ? 'Out of Stock' : 'Draft'}
                  </span>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button
                      onClick={() => setPreviewProduct(product)}
                      className="w-10 h-10 rounded-none bg-white text-gray-900 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      title="Quick View"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openFormModal(product)}
                      className="w-10 h-10 rounded-none bg-amber-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      title="Edit Product"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>{product.sku}</span>
                      <div className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{product.rating}</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-amber-500 transition-colors cursor-pointer" onClick={() => setPreviewProduct(product)}>
                      {product.name}
                    </h3>
                  </div>

                  {/* Stock & Pricing */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-end justify-between">
                    <div>
                      <span className="text-xs text-gray-400 block">Retail Price</span>
                      {product.salePrice ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                            ${product.salePrice.toFixed(2)}
                          </span>
                          <span className="text-xs line-through text-gray-400">
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-bold ${
                        isOutOfStock ? 'text-rose-500' : isLowStock ? 'text-amber-500' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {product.stock} in stock
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700 w-full max-w-3xl overflow-hidden shadow-2xl animate-scaleUp">
            
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingProduct ? 'Edit Store Product' : 'Add New Product to Catalog'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Configure catalog details, pricing, inventory parameters, and image asset.
                </p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-none hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Header */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 px-6 bg-white dark:bg-gray-800">
              <button
                onClick={() => setActiveFormTab('basic')}
                className={`py-3 px-4 font-semibold text-xs border-b-2 transition-colors ${
                  activeFormTab === 'basic'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                1. Basic Info
              </button>
              <button
                onClick={() => setActiveFormTab('pricing')}
                className={`py-3 px-4 font-semibold text-xs border-b-2 transition-colors ${
                  activeFormTab === 'pricing'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                2. Pricing & Profit
              </button>
              <button
                onClick={() => setActiveFormTab('inventory')}
                className={`py-3 px-4 font-semibold text-xs border-b-2 transition-colors ${
                  activeFormTab === 'inventory'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                3. Inventory & Stock
              </button>
              <button
                onClick={() => setActiveFormTab('media')}
                className={`py-3 px-4 font-semibold text-xs border-b-2 transition-colors ${
                  activeFormTab === 'media'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                4. Image & Media
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              {/* TAB 1: BASIC INFO */}
              {activeFormTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Wireless Noise-Canceling Headphones"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                        SKU (Stock Keeping Unit)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SKU-AUD-01"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="electronics">Electronics</option>
                        <option value="clothing">Clothing & Fashion</option>
                        <option value="home">Home & Living</option>
                        <option value="sports">Sports & Fitness</option>
                        <option value="accessories">Accessories</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AudioTech"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                      Product Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Write a clear description highlighting product features, specifications, and benefits..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                      Search Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. wireless, noise-canceling, bluetooth"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="featuredCheck"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded-none border-gray-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <label htmlFor="featuredCheck" className="text-sm font-semibold text-gray-800 dark:text-gray-200 cursor-pointer">
                      Feature this product on homepage catalog hero banner
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING & PROFIT */}
              {activeFormTab === 'pricing' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                        Regular Price ($) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="299.00"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                        Sale Price ($) (Optional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="249.00"
                        value={formData.salePrice}
                        onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none text-emerald-600 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                        Cost per Item ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="130.00"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Calculated Profit Indicator */}
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-none flex items-center justify-between">
                    <div>
                      <h4 className="text-xs uppercase font-bold text-emerald-800 dark:text-emerald-300">Estimated Gross Margin</h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">Calculated based on selling price and item cost.</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                        +${computedFormMargin.profit}
                      </div>
                      <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {computedFormMargin.margin}% Margin
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: INVENTORY */}
              {activeFormTab === 'inventory' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                        Current Stock Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                        Low Stock Alert Threshold
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.minStock}
                        onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                      Catalog Visibility Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="active">Active (Visible on Storefront)</option>
                      <option value="draft">Draft (Hidden from Customers)</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 4: MEDIA & IMAGE */}
              {activeFormTab === 'media' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                      Product Main Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Preset Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                      Or pick from sample high-res image presets:
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {Object.entries(PRESET_IMAGES).map(([catKey, imgUrl]) => (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => setFormData({ ...formData, image: imgUrl, category: catKey })}
                          className={`relative aspect-square rounded-none overflow-hidden border-2 transition-all ${
                            formData.image === imgUrl ? 'border-amber-500 ring-2 ring-amber-500/50' : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'
                          }`}
                        >
                          <img src={imgUrl} alt={catKey} className="w-full h-full object-cover" />
                          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center capitalize py-0.5">
                            {catKey}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Preview Box */}
                  {formData.image && (
                    <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-none bg-gray-50 dark:bg-gray-900/50 flex items-center gap-4">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-20 h-20 rounded-none object-cover border border-gray-300 dark:border-gray-600 shadow-sm"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-900 dark:text-white block">Image Live Preview</span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Valid Image URL loaded
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Form Action Controls */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-none font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  {activeFormTab !== 'media' ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeFormTab === 'basic') setActiveFormTab('pricing');
                        else if (activeFormTab === 'pricing') setActiveFormTab('inventory');
                        else if (activeFormTab === 'inventory') setActiveFormTab('media');
                      }}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-none font-bold text-xs shadow-md transition-colors"
                    >
                      Next Step →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-none font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>{editingProduct ? 'Save Product Changes' : 'Create & Publish Product'}</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK VIEW PREVIEW MODAL */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700 w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleUp">
            <div className="relative aspect-video bg-gray-900 overflow-hidden">
              <img src={previewProduct.image} alt={previewProduct.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setPreviewProduct(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-none hover:bg-black/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-none text-white text-xs font-bold capitalize">
                {previewProduct.category}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-gray-400">{previewProduct.sku}</span>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{previewProduct.name}</h2>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                    ${(previewProduct.salePrice || previewProduct.price).toFixed(2)}
                  </div>
                  {previewProduct.salePrice && (
                    <span className="text-xs text-gray-400 line-through">${previewProduct.price.toFixed(2)}</span>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                {previewProduct.description}
              </p>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-center">
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-none">
                  <span className="text-[11px] text-gray-400 uppercase font-bold block">Current Stock</span>
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">{previewProduct.stock} units</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-none">
                  <span className="text-[11px] text-gray-400 uppercase font-bold block">Total Sold</span>
                  <span className="text-base font-extrabold text-emerald-600">{previewProduct.salesCount} orders</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-none">
                  <span className="text-[11px] text-gray-400 uppercase font-bold block">Customer Rating</span>
                  <span className="text-base font-extrabold text-amber-500">★ {previewProduct.rating}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    const target = previewProduct;
                    setPreviewProduct(null);
                    openFormModal(target);
                  }}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-none text-xs font-bold shadow transition-colors flex items-center gap-1.5"
                >
                  <Edit className="w-4 h-4" /> Edit Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-none bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Product?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Are you sure you want to permanently delete this product from store inventory?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingProductId(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-none text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deletingProductId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-none text-xs font-bold shadow"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
