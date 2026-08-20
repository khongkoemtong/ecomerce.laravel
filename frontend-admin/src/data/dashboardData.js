export const dashboardMetrics = {
  totalOrders: {
    value: '2,580',
    change: '+ 12%',
    isPositive: true,
    period: 'Since Last Month'
  },
  alreadyDelivered: {
    value: '2,380',
    change: '+ 7%',
    isPositive: true,
    period: 'Since Last Month'
  },
  productReturn: {
    value: '10%',
    countText: '120',
    subText: 'Products Return',
    change: '- 1.5%',
    isPositive: false,
    period: 'Since last month',
    percentage: 35
  },
  turnoverRate: {
    value: '2.5 Days',
    subText: '20% Decrease',
    change: '- 20%',
    isPositive: false,
    period: 'Since last month',
    percentage: 65
  }
};

export const timeRangeOptions = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];

export const stockChartDataByPeriod = {
  Daily: [
    { id: 0, category: 'Electronic', price: '$ 800', cx: 50, stockY: 145, consumeY: 170 },
    { id: 1, category: 'Drinks', price: '$ 1,200', cx: 130, stockY: 110, consumeY: 140 },
    { id: 2, category: 'Watch', price: '$ 1,500', cx: 210, stockY: 125, consumeY: 155 },
    { id: 3, category: 'Fashion', price: '$ 2,100', cx: 285, stockY: 90, consumeY: 125 },
    { id: 4, category: 'Toys', price: '$ 3,400', cx: 375, stockY: 65, consumeY: 95 },
    { id: 5, category: 'Beauty', price: '$ 2,800', cx: 450, stockY: 80, consumeY: 110 }
  ],
  Weekly: [
    { id: 0, category: 'Electronic', price: '$ 4,500', cx: 50, stockY: 135, consumeY: 165 },
    { id: 1, category: 'Drinks', price: '$ 6,200', cx: 130, stockY: 90, consumeY: 120 },
    { id: 2, category: 'Watch', price: '$ 7,800', cx: 210, stockY: 110, consumeY: 140 },
    { id: 3, category: 'Fashion', price: '$ 9,100', cx: 285, stockY: 80, consumeY: 115 },
    { id: 4, category: 'Toys', price: '$ 12,000', cx: 375, stockY: 50, consumeY: 80 },
    { id: 5, category: 'Beauty', price: '$ 10,500', cx: 450, stockY: 70, consumeY: 98 }
  ],
  Monthly: [
    { id: 0, category: 'Electronic', price: '$ 18,000', cx: 50, stockY: 130, consumeY: 160 },
    { id: 1, category: 'Drinks', price: '$ 24,000', cx: 130, stockY: 70, consumeY: 105 },
    { id: 2, category: 'Watch', price: '$ 28,000', cx: 210, stockY: 100, consumeY: 135 },
    { id: 3, category: 'Fashion', price: '$ 31,000', cx: 285, stockY: 75, consumeY: 110 },
    { id: 4, category: 'Toys', price: '$ 42,000', cx: 375, stockY: 45, consumeY: 75 },
    { id: 5, category: 'Beauty', price: '$ 36,000', cx: 450, stockY: 60, consumeY: 90 }
  ],
  Quarterly: [
    { id: 0, category: 'Electronic', price: '$ 54,000', cx: 50, stockY: 120, consumeY: 150 },
    { id: 1, category: 'Drinks', price: '$ 72,000', cx: 130, stockY: 60, consumeY: 95 },
    { id: 2, category: 'Watch', price: '$ 84,000', cx: 210, stockY: 85, consumeY: 120 },
    { id: 3, category: 'Fashion', price: '$ 93,000', cx: 285, stockY: 65, consumeY: 100 },
    { id: 4, category: 'Toys', price: '$ 126,000', cx: 375, stockY: 35, consumeY: 65 },
    { id: 5, category: 'Beauty', price: '$ 108,000', cx: 450, stockY: 50, consumeY: 80 }
  ],
  Yearly: [
    { id: 0, category: 'Electronic', price: '$ 210,000', cx: 50, stockY: 110, consumeY: 140 },
    { id: 1, category: 'Drinks', price: '$ 285,000', cx: 130, stockY: 50, consumeY: 85 },
    { id: 2, category: 'Watch', price: '$ 340,000', cx: 210, stockY: 70, consumeY: 105 },
    { id: 3, category: 'Fashion', price: '$ 390,000', cx: 285, stockY: 55, consumeY: 90 },
    { id: 4, category: 'Toys', price: '$ 510,000', cx: 375, stockY: 25, consumeY: 55 },
    { id: 5, category: 'Beauty', price: '$ 450,000', cx: 450, stockY: 40, consumeY: 70 }
  ]
};

export const customTagProducts = [
  // Fast Moving
  {
    id: 'SKU-001',
    name: 'Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80',
    totalQty: 200,
    stockIn: 150,
    price: '$4K',
    tag: 'Fast Moving'
  },
  {
    id: 'SKU-002',
    name: 'Helmets',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=150&auto=format&fit=crop&q=80',
    totalQty: 500,
    stockIn: 350,
    price: '$7K',
    tag: 'Fast Moving'
  },
  {
    id: 'SKU-003',
    name: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&auto=format&fit=crop&q=80',
    totalQty: 2000,
    stockIn: 560,
    price: '$3K',
    tag: 'Fast Moving'
  },
  {
    id: 'SKU-004',
    name: 'Sunglasses',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=150&auto=format&fit=crop&q=80',
    totalQty: 3000,
    stockIn: 1000,
    price: '$5K',
    tag: 'Fast Moving'
  },
  {
    id: 'SKU-005',
    name: 'Water Pot',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=150&auto=format&fit=crop&q=80',
    totalQty: 1500,
    stockIn: 760,
    price: '$2K',
    tag: 'Fast Moving'
  },

  // Discounted
  {
    id: 'SKU-006',
    name: 'Smartphone 5G Pro',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&auto=format&fit=crop&q=80',
    totalQty: 800,
    stockIn: 420,
    price: '$899',
    tag: 'Discounted'
  },
  {
    id: 'SKU-007',
    name: 'Ceramic Coffee Mug',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=150&auto=format&fit=crop&q=80',
    totalQty: 1200,
    stockIn: 600,
    price: '$15',
    tag: 'Discounted'
  },
  {
    id: 'SKU-008',
    name: 'Running Sneakers',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80',
    totalQty: 950,
    stockIn: 310,
    price: '$130',
    tag: 'Discounted'
  },

  // Low Demand
  {
    id: 'SKU-009',
    name: 'Minimalist Desk Lamp',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=150&auto=format&fit=crop&q=80',
    totalQty: 150,
    stockIn: 45,
    price: '$55',
    tag: 'Low Demand'
  },
  {
    id: 'SKU-010',
    name: 'Mechanical Keyboard',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=150&auto=format&fit=crop&q=80',
    totalQty: 300,
    stockIn: 90,
    price: '$120',
    tag: 'Low Demand'
  },

  // Dead Items
  {
    id: 'SKU-011',
    name: 'Vintage Pocket Watch',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&auto=format&fit=crop&q=80',
    totalQty: 50,
    stockIn: 10,
    price: '$180',
    tag: 'Dead Items'
  },
  {
    id: 'SKU-012',
    name: 'Handmade Leather Belt',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&auto=format&fit=crop&q=80',
    totalQty: 80,
    stockIn: 15,
    price: '$45',
    tag: 'Dead Items'
  },

  // New Arrival
  {
    id: 'SKU-013',
    name: 'Smart Fitness Band',
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=150&auto=format&fit=crop&q=80',
    totalQty: 1000,
    stockIn: 850,
    price: '$99',
    tag: 'New Arrival'
  },
  {
    id: 'SKU-014',
    name: 'Wireless Earbuds Pro',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=150&auto=format&fit=crop&q=80',
    totalQty: 1400,
    stockIn: 1100,
    price: '$149',
    tag: 'New Arrival'
  }
];

export const salesOrders = [
  {
    id: 1,
    name: 'Backpack',
    stockText: '25 In Stock',
    price: '$100',
    priority: 'High',
    priorityColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    name: 'Handbag',
    stockText: '15 In Stock',
    price: '$200',
    priority: 'Medium',
    priorityColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    name: 'Headphone',
    stockText: '100 In Stock',
    price: '$79',
    priority: 'High',
    priorityColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 4,
    name: 'Bottle',
    stockText: 'Low Stock (02)',
    price: '$360',
    priority: 'Low',
    priorityColor: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=150&auto=format&fit=crop&q=80'
  }
];

export const delayedProducts = [
  {
    id: 'SKU-505',
    name: 'Backpack',
    delay: '3 Days',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'SKU-502',
    name: 'T-Shirts',
    delay: '3 Days',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'SKU-302',
    name: 'Helmet',
    delay: '3 Days',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'SKU-305',
    name: 'Sunglasses',
    delay: '3 Days',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=150&auto=format&fit=crop&q=80'
  }
];
