export const productCategories = [
  { id: 'all', name: 'All Products', count: 154, icon: '📦', active: false },
  { id: 'electronics', name: 'Electronics', count: 19, icon: '💻', active: true },
  { id: 'clothing', name: 'Clothing', count: 45, icon: '👕', active: false },
  { id: 'home', name: 'Home & Garden', count: 19, icon: '🏠', active: false },
  { id: 'sports', name: 'Sports', count: 10, icon: '⚽', active: false },
];

export const productItems = [
  {
    id: 1,
    category: 'electronics',
    name: 'Wireless Noise-Canceling Headphones',
    price: 299.0,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
    quantity: 0,
  },
  {
    id: 2,
    category: 'electronics',
    name: 'Smartphone 5G Pro',
    price: 899.0,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60',
    quantity: 2,
  },
  {
    id: 3,
    category: 'clothing',
    name: 'Classic Cotton T-Shirt',
    price: 25.0,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60',
    quantity: 0,
  },
  {
    id: 4,
    category: 'clothing',
    name: 'Denim Jacket',
    price: 75.0,
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=60',
    quantity: 0,
  },
  {
    id: 5,
    category: 'home',
    name: 'Ceramic Coffee Mug',
    price: 15.0,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&auto=format&fit=crop&q=60',
    quantity: 1,
  },
  {
    id: 6,
    category: 'home',
    name: 'Indoor Potted Plant',
    price: 35.0,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop&q=60',
    quantity: 0,
  },
  {
    id: 7,
    category: 'electronics',
    name: 'Mechanical Keyboard',
    price: 120.0,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&auto=format&fit=crop&q=60',
    quantity: 0,
  },
  {
    id: 8,
    category: 'sports',
    name: 'Yoga Mat',
    price: 45.0,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&auto=format&fit=crop&q=60',
    quantity: 0,
  },
  {
    id: 9,
    category: 'sports',
    name: 'Dumbbell Set',
    price: 85.0,
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=60',
    quantity: 0,
  },
  {
    id: 10,
    category: 'clothing',
    name: 'Running Sneakers',
    price: 130.0,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
    quantity: 0,
  },
  {
    id: 11,
    category: 'home',
    name: 'Minimalist Desk Lamp',
    price: 55.0,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60',
    quantity: 0,
  },
];

export const activeOrders = [
  {
    id: '#F0027',
    shippingMethod: 'Express Delivery',
    status: 'Processing',
    statusColor: 'bg-amber-500',
    peopleCount: 4,
    itemsCount: 8,
    timeAgo: '2 mins ago'
  },
  {
    id: '#F0028',
    shippingMethod: 'Standard Delivery',
    status: 'Pending',
    statusColor: 'bg-orange-500',
    peopleCount: 2,
    itemsCount: 3,
    timeAgo: 'Just Now'
  },
  {
    id: '#F0019',
    shippingMethod: 'Express Delivery',
    status: 'Shipped',
    statusColor: 'bg-purple-500',
    peopleCount: 5,
    itemsCount: 2,
    timeAgo: '25 mins ago'
  },
  {
    id: '#F0020',
    shippingMethod: 'Standard Delivery',
    status: 'Processing',
    statusColor: 'bg-amber-500',
    peopleCount: 1,
    itemsCount: 1,
    timeAgo: '1 hour ago'
  }
];

export const currentOrderDetails = {
  shippingMethod: 'Express Delivery',
  orderId: '#F0030',
  date: 'Aug 02, 2026, 03:45 PM',
  peopleCount: 2,
  items: [
    { name: 'John Doe', qty: 2, price: 40.0, status: 'Processing' },
    { name: 'Jane Smith', qty: 2, price: 24.0, status: 'Pending' },
    { name: 'Alice Johnson', qty: 1, price: 35.0, status: 'Pending' },
    { name: 'Bob Brown', qty: 1, price: 10.0, status: 'Shipped' },
  ],
  subtotal: 67.0,
  tax: 4.0,
  donation: 1.0,
  total: 72.0,
};

export const customerProducts = {
  'John Doe': [
    { name: 'Wireless Noise-Canceling Headphones', qty: 1, price: 299.0, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
    { name: 'Smartphone 5G Pro', qty: 1, price: 899.0, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  ],
  'Jane Smith': [
    { name: 'Classic Cotton T-Shirt', qty: 2, price: 25.0, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  ],
  'Alice Johnson': [
    { name: 'Mechanical Keyboard', qty: 1, price: 120.0, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  ],
  'Bob Brown': [
    { name: 'Minimalist Desk Lamp', qty: 1, price: 55.0, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  ],
};
