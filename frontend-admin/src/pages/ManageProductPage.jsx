import { useState, useMemo, useEffect, useRef } from 'react';
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
  ChevronDown,
  Percent,
  Layers,
  ShoppingBag,
  Info,
  Download,
  Upload,
  RefreshCw,
  Star,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Gift
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000/api';

const PRESET_IMAGES = {
  electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  clothing: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80',
  home: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&auto=format&fit=crop&q=80',
  sports: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop&q=80',
  accessories: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
};

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';

export default function ManageProductPage() {
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [promotionsList, setPromotionsList] = useState([]);
  const [selectedPromoCode, setSelectedPromoCode] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  
  // Loading & Pagination
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProductsCount, setTotalProductsCount] = useState(0);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price_low' | 'price_high' | 'stock_low' | 'name'

  // Selection & Bulk Actions
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  // Searchable Promotion Dropdown States
  const [isBulkPromoOpen, setIsBulkPromoOpen] = useState(false);
  const [bulkPromoSearch, setBulkPromoSearch] = useState('');
  const bulkPromoRef = useRef(null);

  const [isModalPromoOpen, setIsModalPromoOpen] = useState(false);
  const [modalPromoSearch, setModalPromoSearch] = useState('');
  const modalPromoRef = useRef(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = Add, Object = Edit
  const [activeFormTab, setActiveFormTab] = useState('basic'); // 'basic' | 'pricing' | 'inventory' | 'media'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [previewProduct, setPreviewProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bulkPromoRef.current && !bulkPromoRef.current.contains(e.target)) {
        setIsBulkPromoOpen(false);
      }
      if (modalPromoRef.current && !modalPromoRef.current.contains(e.target)) {
        setIsModalPromoOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBulkPromos = useMemo(() => {
    if (!bulkPromoSearch.trim()) return promotionsList;
    const q = bulkPromoSearch.toLowerCase();
    return promotionsList.filter(p => 
      p.code.toLowerCase().includes(q) || 
      p.title.toLowerCase().includes(q) ||
      (p.discount && p.discount.toLowerCase().includes(q))
    );
  }, [promotionsList, bulkPromoSearch]);

  const filteredModalPromos = useMemo(() => {
    if (!modalPromoSearch.trim()) return promotionsList;
    const q = modalPromoSearch.toLowerCase();
    return promotionsList.filter(p => 
      p.code.toLowerCase().includes(q) || 
      p.title.toLowerCase().includes(q) ||
      (p.discount && p.discount.toLowerCase().includes(q))
    );
  }, [promotionsList, modalPromoSearch]);

  // Notifications Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Form Data State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: '',
    brand_id: '',
    category: 'electronics',
    brand: 'Tasty Station',
    price: '',
    salePrice: '',
    cost: '',
    stock: 10,
    minStock: 5,
    description: '',
    tags: '',
    image: '',
    imageFile: null,
    status: 'active',
    featured: false,
  });
  const [imagePreview, setImagePreview] = useState('');

  // Fetch Categories, Brands & Active Promotions
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [catRes, brandRes, promoRes] = await Promise.all([
          fetch(`${API_BASE_URL}/categories`),
          fetch(`${API_BASE_URL}/brands`),
          fetch(`${API_BASE_URL}/promotions?per_page=100`),
        ]);
        if (catRes.ok) {
          const catData = await catRes.json();
          const list = catData.categories?.data || (Array.isArray(catData.categories) ? catData.categories : []);
          setCategoriesList(list);
        }
        if (brandRes.ok) {
          const brandData = await brandRes.json();
          const list = brandData.brands?.data || (Array.isArray(brandData.brands) ? brandData.brands : []);
          setBrandsList(list);
        }
        if (promoRes.ok) {
          const promoData = await promoRes.json();
          const list = promoData.promotions || [];
          setPromotionsList(list);
        }
      } catch (e) {
        console.warn('Could not load categories, brands, or promotions metadata:', e);
      }
    };
    loadMetadata();
  }, []);

  // Fetch Products API (8 per page)
  const fetchProducts = async (pageNum = 1, append = false) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      const queryParams = new URLSearchParams({
        per_page: '8',
        page: pageNum.toString(),
      });

      if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());
      if (selectedCategory !== 'all') queryParams.append('category_id', selectedCategory);
      if (selectedStatus !== 'all') queryParams.append('status', selectedStatus);
      if (sortBy) queryParams.append('sort', sortBy);

      const res = await fetch(`${API_BASE_URL}/products?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();

      let items = [];
      let more = false;
      let total = 0;

      if (data.products?.data) {
        items = data.products.data;
        more = !!data.products.next_page_url;
        total = data.products.total || 0;
      } else if (Array.isArray(data.products)) {
        items = data.products;
        more = false;
        total = items.length;
      }

      // Map products to ensure all standard properties exist
      const mapped = items.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku || `SKU-${p.id}`,
        category_id: p.category_id,
        brand_id: p.brand_id,
        category: p.category?.name || (categoriesList.find(c => c.id === p.category_id)?.name) || 'General',
        brand: p.brand?.name || (brandsList.find(b => b.id === p.brand_id)?.name) || 'Standard',
        price: parseFloat(p.price) || 0,
        salePrice: p.discount_price ? parseFloat(p.discount_price) : null,
        cost: Math.round((parseFloat(p.price) || 0) * 0.45),
        stock: parseInt(p.stock_qty ?? p.stock, 10) || 0,
        minStock: 5,
        rating: 4.8,
        salesCount: Math.floor(Math.random() * 80) + 12,
        status: p.status || 'active',
        featured: !!p.featured,
        image: p.image || DEFAULT_FALLBACK_IMAGE,
        description: p.description || '',
        tags: ['catalog', 'in-store'],
        variants: [{ name: 'Default', options: ['Standard'] }],
        lastUpdated: p.updated_at ? p.updated_at.split('T')[0] : '2026-08-20',
      }));

      if (append) {
        setProducts((prev) => [...prev, ...mapped]);
      } else {
        setProducts(mapped);
      }
      setHasMore(more);
      setPage(pageNum);
      setTotalProductsCount(total || mapped.length);
    } catch (err) {
      console.error('Error fetching products:', err);
      showToast('Error loading products from server', 'error');
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Filtered & Sorted Products for Client View
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && p.status === 'active') ||
        (selectedStatus === 'draft' && p.status === 'draft') ||
        (selectedStatus === 'out_of_stock' && p.stock === 0) ||
        (selectedStatus === 'low_stock' && p.stock > 0 && p.stock <= p.minStock);

      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, selectedStatus]);

  // Analytics Metrics
  const stats = useMemo(() => {
    const total = totalProductsCount || products.length;
    const activeCount = products.filter(p => p.status === 'active').length;
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

    return { total, activeCount, lowStockCount, outOfStockCount, totalValue };
  }, [products, totalProductsCount]);

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

  // Status Toggle
  const handleToggleProductStatus = async (id) => {
    const target = products.find(p => p.id === id);
    if (!target) return;
    const nextStatus = target.status === 'active' ? 'draft' : 'active';

    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _method: 'PUT',
          name: target.name,
          price: target.price,
          stock_qty: target.stock,
          category_id: target.category_id || categoriesList[0]?.id || 1,
          brand_id: target.brand_id || brandsList[0]?.id || 1,
          status: nextStatus,
        }),
      });
      if (!res.ok) throw new Error('Status update failed');
      
      setProducts(products.map(p => p.id === id ? { ...p, status: nextStatus } : p));
      showToast(`Product "${target.name}" status updated to ${nextStatus}`, 'info');
    } catch (e) {
      showToast('Failed to update product status on server', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');

      setProducts(products.filter(p => p.id !== id));
      setDeletingProductId(null);
      setSelectedProductIds(selectedProductIds.filter(i => i !== id));
      showToast('Product and associated media deleted successfully!', 'warning');
    } catch (e) {
      showToast('Failed to delete product from server', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedProductIds.length} selected products?`)) return;
    try {
      await Promise.all(selectedProductIds.map(id => fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' })));
      setProducts(products.filter(p => !selectedProductIds.includes(p.id)));
      showToast(`Deleted ${selectedProductIds.length} selected products`, 'warning');
      setSelectedProductIds([]);
    } catch (e) {
      showToast('Error during bulk deletion', 'error');
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
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

  const handleBulkApplyPromo = (promoCode) => {
    if (!promoCode) return;
    const promo = promotionsList.find(p => p.code === promoCode);
    if (!promo) return;

    setProducts(products.map(p => {
      if (selectedProductIds.includes(p.id)) {
        let newSalePrice = p.price;
        if (promo.discount_type === 'percentage' || (promo.discount && promo.discount.includes('%'))) {
          const pct = promo.discount_value || parseFloat(promo.discount.replace(/[^0-9.]/g, '')) || 0;
          newSalePrice = Math.max(0, parseFloat((p.price * (1 - pct / 100)).toFixed(2)));
        } else if (promo.discount_type === 'fixed' || (promo.discount && promo.discount.includes('$'))) {
          const fixedAmt = promo.discount_value || parseFloat(promo.discount.replace(/[^0-9.]/g, '')) || 0;
          newSalePrice = Math.max(0, parseFloat((p.price - fixedAmt).toFixed(2)));
        }
        return { ...p, salePrice: newSalePrice < p.price ? newSalePrice : null };
      }
      return p;
    }));
    showToast(`Applied promo ${promo.code} (${promo.discount}) to ${selectedProductIds.length} products!`, 'success');
    setSelectedProductIds([]);
  };

  const handleSelectPromo = (promoCode) => {
    setSelectedPromoCode(promoCode);
    if (!promoCode) {
      setFormData(prev => ({ ...prev, salePrice: '' }));
      return;
    }

    const promo = promotionsList.find(p => p.code === promoCode || String(p.db_id) === promoCode || p.id === promoCode);
    if (!promo) return;

    const regularPrice = parseFloat(formData.price) || 0;
    if (regularPrice <= 0) {
      showToast('Please enter a regular price first to calculate discount', 'info');
      return;
    }

    let calculatedSalePrice = regularPrice;
    if (promo.discount_type === 'percentage' || (promo.discount && promo.discount.includes('%'))) {
      const pct = promo.discount_value || parseFloat(promo.discount.replace(/[^0-9.]/g, '')) || 0;
      calculatedSalePrice = Math.max(0, parseFloat((regularPrice * (1 - pct / 100)).toFixed(2)));
    } else if (promo.discount_type === 'fixed' || (promo.discount && promo.discount.includes('$'))) {
      const fixedAmt = promo.discount_value || parseFloat(promo.discount.replace(/[^0-9.]/g, '')) || 0;
      calculatedSalePrice = Math.max(0, parseFloat((regularPrice - fixedAmt).toFixed(2)));
    } else if (promo.discount_type === 'shipping') {
      calculatedSalePrice = regularPrice;
    }

    if (calculatedSalePrice > 0 && calculatedSalePrice < regularPrice) {
      setFormData(prev => ({ ...prev, salePrice: calculatedSalePrice }));
      showToast(`Applied ${promo.code} (${promo.discount}) discount!`, 'success');
    } else {
      showToast(`Applied promo ${promo.code}`, 'info');
    }
  };

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

  const openFormModal = (productToEdit = null) => {
    setEditingProduct(productToEdit);
    setActiveFormTab('basic');
    setSelectedPromoCode('');
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        sku: productToEdit.sku,
        category_id: productToEdit.category_id || categoriesList[0]?.id || '',
        brand_id: productToEdit.brand_id || brandsList[0]?.id || '',
        category: productToEdit.category,
        brand: productToEdit.brand,
        price: productToEdit.price,
        salePrice: productToEdit.salePrice || '',
        cost: productToEdit.cost || '',
        stock: productToEdit.stock,
        minStock: productToEdit.minStock || 5,
        description: productToEdit.description || '',
        tags: productToEdit.tags ? productToEdit.tags.join(', ') : '',
        image: productToEdit.image || '',
        imageFile: null,
        status: productToEdit.status,
        featured: productToEdit.featured || false,
      });
      setImagePreview(productToEdit.image || '');
    } else {
      setFormData({
        name: '',
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category_id: categoriesList[0]?.id || 1,
        brand_id: brandsList[0]?.id || 1,
        category: categoriesList[0]?.name || 'Electronics',
        brand: brandsList[0]?.name || 'Standard Brand',
        price: 49.99,
        salePrice: '',
        cost: 20.00,
        stock: 15,
        minStock: 5,
        description: '',
        tags: 'popular, new',
        image: PRESET_IMAGES.electronics,
        imageFile: null,
        status: 'active',
        featured: false,
      });
      setImagePreview(PRESET_IMAGES.electronics);
    }
    setIsFormModalOpen(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file, image: '' }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, image: url, imageFile: null }));
    setImagePreview(url);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      showToast('Please fill in required fields (Name & Price)', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const dataPayload = new FormData();
      dataPayload.append('name', formData.name.trim());
      if (formData.sku) dataPayload.append('sku', formData.sku.trim());
      dataPayload.append('price', formData.price.toString());
      if (formData.salePrice) dataPayload.append('discount_price', formData.salePrice.toString());
      dataPayload.append('stock_qty', (formData.stock || 0).toString());
      dataPayload.append('category_id', (formData.category_id || categoriesList[0]?.id || 1).toString());
      dataPayload.append('brand_id', (formData.brand_id || brandsList[0]?.id || 1).toString());
      if (formData.description) dataPayload.append('description', formData.description.trim());
      dataPayload.append('status', formData.status || 'active');

      if (formData.imageFile) {
        dataPayload.append('image', formData.imageFile);
      } else if (formData.image) {
        dataPayload.append('image', formData.image.trim());
      }

      let res;
      if (editingProduct) {
        dataPayload.append('_method', 'PUT');
        res = await fetch(`${API_BASE_URL}/products/${editingProduct.id}`, {
          method: 'POST',
          body: dataPayload,
        });
      } else {
        res = await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          body: dataPayload,
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to save product');
      }

      showToast(editingProduct ? `Product "${formData.name}" updated!` : `Product "${formData.name}" created!`, 'success');
      setIsFormModalOpen(false);
      fetchProducts(1, false);
    } catch (err) {
      console.error('Save product error:', err);
      showToast(err.message || 'Error saving product', 'error');
    } finally {
      setIsSubmitting(false);
    }
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
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-none text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All Categories
          </button>
          {categoriesList.map((cat) => (
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
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-none shadow-sm cursor-pointer"
              >
                Mark Active
              </button>
              <button
                onClick={() => handleBulkStatusChange('draft')}
                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-none shadow-sm cursor-pointer"
              >
                Mark Draft
              </button>
              <button
                onClick={() => handleBulkDiscount(10)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-none shadow-sm cursor-pointer"
              >
                Apply 10% Off
              </button>
              {/* Searchable Bulk Promo Dropdown */}
              {promotionsList.length > 0 && (
                <div className="relative" ref={bulkPromoRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBulkPromoOpen(!isBulkPromoOpen);
                      setBulkPromoSearch('');
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-none shadow-sm cursor-pointer text-xs flex items-center gap-1.5"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Apply Promo Deal...</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {isBulkPromoOpen && (
                    <div className="absolute left-0 mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-none z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                      {/* Search Bar */}
                      <div className="p-2 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-900/60 flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search promo code, discount..."
                          value={bulkPromoSearch}
                          onChange={(e) => setBulkPromoSearch(e.target.value)}
                          className="w-full bg-transparent text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                        />
                        {bulkPromoSearch && (
                          <button
                            type="button"
                            onClick={() => setBulkPromoSearch('')}
                            className="text-gray-400 hover:text-gray-600 text-xs px-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Options List */}
                      <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/40">
                        {filteredBulkPromos.length > 0 ? (
                          filteredBulkPromos.map((promo) => (
                            <button
                              key={promo.id}
                              type="button"
                              onClick={() => {
                                handleBulkApplyPromo(promo.code);
                                setIsBulkPromoOpen(false);
                              }}
                              className="w-full text-left p-2.5 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors flex items-center justify-between gap-2 text-xs group cursor-pointer"
                            >
                              <div className="min-w-0">
                                <div className="font-mono font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300">
                                  {promo.code}
                                </div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                  {promo.title}
                                </div>
                              </div>
                              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold text-[10px] whitespace-nowrap shrink-0">
                                {promo.discount}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs text-gray-400 italic">
                            No promo codes found matching "{bulkPromoSearch}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-none shadow-sm cursor-pointer"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedProductIds([])}
                className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:underline ml-2 cursor-pointer"
              >
                Deselect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Content List (Table or Grid) */}
      {isLoading ? (
        viewMode === 'table' ? (
          <div className="bg-white dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm animate-pulse">
            <div className="h-12 bg-gray-100 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700" />
            <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-1/3">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 w-3/4" />
                      <div className="h-3 bg-gray-100 dark:bg-gray-700/60 w-1/2" />
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 w-24" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 w-20" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 w-20" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 w-16" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm h-72 flex flex-col justify-between">
                <div className="w-full h-36 bg-gray-200 dark:bg-gray-700" />
                <div className="p-4 space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 w-3/4" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-700/60 w-1/2" />
                </div>
                <div className="p-4 pt-0 flex justify-between">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 w-20" />
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 w-16" />
                </div>
              </div>
            ))}
          </div>
        )
      ) : filteredProducts.length === 0 ? (
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
            className="mt-4 px-4 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-semibold text-xs rounded-none border border-amber-200 dark:border-amber-800 hover:bg-amber-100 cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div>
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
                              src={product.image || DEFAULT_FALLBACK_IMAGE}
                              alt={product.name}
                              className="w-12 h-12 rounded-none object-cover border border-gray-200 dark:border-gray-700 shrink-0 shadow-sm"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = DEFAULT_FALLBACK_IMAGE;
                              }}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4
                                  className="font-bold text-gray-900 dark:text-white truncate hover:underline cursor-pointer"
                                  onClick={() => setPreviewProduct(product)}
                                >
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

                        {/* Inventory Stock */}
                        <td className="py-4 px-4">
                          <div>
                            <span className={`font-bold text-sm ${
                              isOutOfStock ? 'text-rose-600 dark:text-rose-400' :
                              isLowStock ? 'text-amber-600 dark:text-amber-400' :
                              'text-gray-900 dark:text-white'
                            }`}>
                              {product.stock} units
                            </span>
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
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-bold transition-all cursor-pointer ${
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
                              className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                              title="Quick Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openFormModal(product)}
                              className="p-1.5 text-gray-500 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400 rounded-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-1.5 text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 rounded-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
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

            {/* Table Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Showing {filteredProducts.length} of {totalProductsCount} products</span>
              {hasMore && (
                <button
                  onClick={() => fetchProducts(page + 1, true)}
                  disabled={isFetchingMore}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-none shadow-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isFetchingMore ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading 8 More...</span>
                    </>
                  ) : (
                    <span>Load 8 More Products ↓</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.stock === 0;
              const isLowStock = product.stock > 0 && product.stock <= product.minStock;

              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group relative"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-900 overflow-hidden">
                    <img
                      src={product.image || DEFAULT_FALLBACK_IMAGE}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_FALLBACK_IMAGE;
                      }}
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-none text-[10px] font-bold bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white uppercase tracking-wider backdrop-blur-md">
                      {product.category}
                    </span>

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
                        className="w-10 h-10 rounded-none bg-white text-gray-900 flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                        title="Quick View"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openFormModal(product)}
                        className="w-10 h-10 rounded-none bg-amber-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="w-10 h-10 rounded-none bg-rose-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-5 h-5" />
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
                      <h3
                        className="font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-amber-500 transition-colors cursor-pointer"
                        onClick={() => setPreviewProduct(product)}
                      >
                        {product.name}
                      </h3>
                    </div>

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

          {/* Grid Load More */}
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={() => fetchProducts(page + 1, true)}
                disabled={isFetchingMore}
                className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isFetchingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    <span>Loading Next 8 Products...</span>
                  </>
                ) : (
                  <span>Load 8 More Products ↓</span>
                )}
              </button>
            </div>
          )}
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
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-none hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Header */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 px-6 bg-white dark:bg-gray-800">
              <button
                onClick={() => setActiveFormTab('basic')}
                className={`py-3 px-4 font-semibold text-xs border-b-2 transition-colors cursor-pointer ${
                  activeFormTab === 'basic'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                1. Basic Info
              </button>
              <button
                onClick={() => setActiveFormTab('pricing')}
                className={`py-3 px-4 font-semibold text-xs border-b-2 transition-colors cursor-pointer ${
                  activeFormTab === 'pricing'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                2. Pricing & Profit
              </button>
              <button
                onClick={() => setActiveFormTab('inventory')}
                className={`py-3 px-4 font-semibold text-xs border-b-2 transition-colors cursor-pointer ${
                  activeFormTab === 'inventory'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                3. Inventory & Stock
              </button>
              <button
                onClick={() => setActiveFormTab('media')}
                className={`py-3 px-4 font-semibold text-xs border-b-2 transition-colors cursor-pointer ${
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
                        Product Name <span className="text-red-500">*</span>
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
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.category_id || ''}
                        onChange={(e) => {
                          const selected = categoriesList.find(c => String(c.id) === e.target.value);
                          setFormData({ ...formData, category_id: e.target.value, category: selected?.name || '' });
                        }}
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        {categoriesList.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                        Brand Name <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.brand_id || ''}
                        onChange={(e) => {
                          const selected = brandsList.find(b => String(b.id) === e.target.value);
                          setFormData({ ...formData, brand_id: e.target.value, brand: selected?.name || '' });
                        }}
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        {brandsList.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
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
                        onChange={(e) => {
                          const newPrice = e.target.value;
                          setFormData(prev => {
                            let nextSalePrice = prev.salePrice;
                            if (selectedPromoCode && newPrice) {
                              const promo = promotionsList.find(p => p.code === selectedPromoCode);
                              if (promo) {
                                const reg = parseFloat(newPrice) || 0;
                                if (promo.discount_type === 'percentage' || (promo.discount && promo.discount.includes('%'))) {
                                  const pct = promo.discount_value || parseFloat(promo.discount.replace(/[^0-9.]/g, '')) || 0;
                                  nextSalePrice = Math.max(0, parseFloat((reg * (1 - pct / 100)).toFixed(2)));
                                } else if (promo.discount_type === 'fixed' || (promo.discount && promo.discount.includes('$'))) {
                                  const fixedAmt = promo.discount_value || parseFloat(promo.discount.replace(/[^0-9.]/g, '')) || 0;
                                  nextSalePrice = Math.max(0, parseFloat((reg - fixedAmt).toFixed(2)));
                                }
                              }
                            }
                            return { ...prev, price: newPrice, salePrice: nextSalePrice };
                          });
                        }}
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                        Discount Price ($) (Optional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="249.00"
                        value={formData.salePrice}
                        onChange={(e) => {
                          setFormData({ ...formData, salePrice: e.target.value });
                          setSelectedPromoCode('');
                        }}
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

                  {/* PROMOTION / DISCOUNT SELECTOR */}
                  <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-none space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase flex items-center gap-2">
                        <Gift className="w-4 h-4 text-amber-500" />
                        Apply Promotion / Coupon Discount
                      </label>
                      {(selectedPromoCode || formData.salePrice) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPromoCode('');
                            setFormData(prev => ({ ...prev, salePrice: '' }));
                          }}
                          className="text-[11px] font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                        >
                          Clear Discount
                        </button>
                      )}
                    </div>

                    {/* Searchable Modal Promo Selector */}
                    <div className="relative" ref={modalPromoRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalPromoOpen(!isModalPromoOpen);
                          setModalPromoSearch('');
                        }}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-amber-300 dark:border-amber-700/80 rounded-none text-xs font-semibold text-gray-800 dark:text-gray-100 flex items-center justify-between hover:border-amber-500 focus:outline-none cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2 truncate">
                          {selectedPromoCode ? (
                            <>
                              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                {selectedPromoCode}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 truncate">
                                — {promotionsList.find(p => p.code === selectedPromoCode)?.discount} ({promotionsList.find(p => p.code === selectedPromoCode)?.title})
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400">-- Select or Search Active Promotion Deal --</span>
                          )}
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                      </button>

                      {isModalPromoOpen && (
                        <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-none z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                          {/* Search Input */}
                          <div className="p-2.5 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-900/60 flex items-center gap-2">
                            <Search className="w-4 h-4 text-gray-400 shrink-0" />
                            <input
                              type="text"
                              autoFocus
                              placeholder="Search promo by code (e.g. WELCOME20), title, or discount..."
                              value={modalPromoSearch}
                              onChange={(e) => setModalPromoSearch(e.target.value)}
                              className="w-full bg-transparent text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none font-medium"
                            />
                            {modalPromoSearch && (
                              <button
                                type="button"
                                onClick={() => setModalPromoSearch('')}
                                className="text-gray-400 hover:text-gray-600 text-xs px-1"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {/* Options List */}
                          <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/40 custom-scrollbar">
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectPromo('');
                                setIsModalPromoOpen(false);
                              }}
                              className="w-full text-left p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 font-medium cursor-pointer"
                            >
                              -- No Discount / Custom Price --
                            </button>

                            {filteredModalPromos.length > 0 ? (
                              filteredModalPromos.map((promo) => {
                                const isSelected = selectedPromoCode === promo.code;
                                return (
                                  <button
                                    key={promo.id}
                                    type="button"
                                    onClick={() => {
                                      handleSelectPromo(promo.code);
                                      setIsModalPromoOpen(false);
                                    }}
                                    className={`w-full text-left p-2.5 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors flex items-center justify-between gap-3 text-xs cursor-pointer ${
                                      isSelected ? 'bg-amber-50/80 dark:bg-amber-950/60 border-l-2 border-amber-500' : ''
                                    }`}
                                  >
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                          {promo.code}
                                        </span>
                                        <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                                          {promo.discount}
                                        </span>
                                      </div>
                                      <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                        {promo.title}
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                    )}
                                  </button>
                                );
                              })
                            ) : (
                              <div className="p-4 text-center text-xs text-gray-400 italic">
                                No promo deals matching "{modalPromoSearch}"
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Real-time Discount Breakdown Preview */}
                    {formData.price && formData.salePrice && parseFloat(formData.salePrice) < parseFloat(formData.price) && (
                      <div className="p-3 bg-white dark:bg-gray-900 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold">
                            {selectedPromoCode || 'CUSTOM DISCOUNT'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Regular: <span className="line-through">${parseFloat(formData.price).toFixed(2)}</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                            Sale Price: ${parseFloat(formData.salePrice).toFixed(2)}
                          </span>
                          <div className="text-[10px] text-gray-400 font-medium">
                            Saves ${(parseFloat(formData.price) - parseFloat(formData.salePrice)).toFixed(2)} (
                            {Math.round(((parseFloat(formData.price) - parseFloat(formData.salePrice)) / parseFloat(formData.price)) * 100)}% OFF)
                          </div>
                        </div>
                      </div>
                    )}
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
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 4: MEDIA & IMAGE */}
              {activeFormTab === 'media' && (
                <div className="space-y-4">
                  {/* File Upload Section */}
                  <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 flex flex-col md:flex-row items-center gap-4">
                    <div className="w-24 h-24 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer shadow-sm">
                        <Upload className="w-4 h-4" />
                        <span>Upload Image File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-gray-400">
                        Supports PNG, JPG, JPEG, WEBP up to 5MB. Will automatically store to local storage / Cloudinary.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                      Or Product Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.image}
                      onChange={handleImageUrlChange}
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
                          onClick={() => {
                            setFormData({ ...formData, image: imgUrl, imageFile: null });
                            setImagePreview(imgUrl);
                          }}
                          className={`relative aspect-square rounded-none overflow-hidden border-2 transition-all cursor-pointer ${
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
                </div>
              )}

              {/* Form Action Controls */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-none font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
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
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-none font-bold text-xs shadow-md transition-colors cursor-pointer"
                    >
                      Next Step →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-none font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{editingProduct ? 'Save Product Changes' : 'Create & Publish Product'}</span>
                        </>
                      )}
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
              <img
                src={previewProduct.image || DEFAULT_FALLBACK_IMAGE}
                alt={previewProduct.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_FALLBACK_IMAGE;
                }}
              />
              <button
                onClick={() => setPreviewProduct(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-none hover:bg-black/80 transition-colors cursor-pointer"
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
                {previewProduct.description || 'No description provided.'}
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
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-none text-xs font-bold shadow transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-4 h-4" /> Edit Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
