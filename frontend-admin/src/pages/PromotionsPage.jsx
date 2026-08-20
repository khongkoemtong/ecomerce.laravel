import { useState } from 'react';
import { Gift, Plus, Search, Tag, Calendar, Trash2 } from 'lucide-react';

const initialPromos = [
  { id: 'PRM-001', code: 'WELCOME20', discount: '20% OFF', title: 'New Customer Welcome Deal', validTill: '2026-12-31', usageCount: 142, status: 'Active', type: 'Coupon' },
  { id: 'PRM-002', code: 'COFFEETIME', discount: '$1.50 OFF', title: 'Morning Coffee Special', validTill: '2026-09-30', usageCount: 89, status: 'Active', type: 'Discount' },
  { id: 'PRM-003', code: 'FREESHIP', discount: 'Free Delivery', title: 'Free Home Delivery over $15', validTill: '2026-08-31', usageCount: 310, status: 'Active', type: 'Shipping' },
  { id: 'PRM-004', code: 'SUMMER50', discount: '50% OFF', title: 'Mid-Summer Flash Sale', validTill: '2026-08-10', usageCount: 520, status: 'Expired', type: 'Flash Sale' },
];

export default function PromotionsPage() {
  const [promos, setPromos] = useState(initialPromos);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPromo, setNewPromo] = useState({ code: '', title: '', discount: '', validTill: '' });

  const filtered = promos.filter(p =>
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPromo = (e) => {
    e.preventDefault();
    if (!newPromo.code || !newPromo.title) return;
    const promoToAdd = {
      id: `PRM-${Math.floor(100 + Math.random() * 900)}`,
      code: newPromo.code.toUpperCase(),
      discount: newPromo.discount || '10% OFF',
      title: newPromo.title,
      validTill: newPromo.validTill || '2026-12-31',
      usageCount: 0,
      status: 'Active',
      type: 'Coupon',
    };
    setPromos([promoToAdd, ...promos]);
    setNewPromo({ code: '', title: '', discount: '', validTill: '' });
    setShowAddModal(false);
  };

  const deletePromo = (id) => {
    setPromos(promos.filter(p => p.id !== id));
  };

  return (
    <div className="p-8 pb-12 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Gift className="w-7 h-7 text-amber-500" />
            Promotions & Coupons
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create discount vouchers, promo banners, campaign codes, and special deals.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-5 py-2.5 transition-all shadow-sm self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Create Promo Code
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search promo code or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500 dark:text-white"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((promo) => (
          <div
            key={promo.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-mono font-bold text-sm border border-amber-200 dark:border-amber-800">
                  {promo.code}
                </span>
                <span className={`px-2.5 py-0.5 text-xs font-semibold ${
                  promo.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                }`}>
                  {promo.status}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{promo.title}</h3>
              <p className="text-2xl font-extrabold text-amber-500 mb-4">{promo.discount}</p>

              <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>Valid until: <strong className="text-gray-700 dark:text-gray-300">{promo.validTill}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  <span>Used <strong className="text-gray-700 dark:text-gray-300">{promo.usageCount}</strong> times</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => deletePromo(promo.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                title="Delete promo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 max-w-md w-full p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create Promo Code</h2>
            <form onSubmit={handleAddPromo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Promo Code</label>
                <input
                  type="text"
                  required
                  value={newPromo.code}
                  onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value })}
                  placeholder="e.g. SPECIAL15"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-sm dark:text-white uppercase font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={newPromo.title}
                  onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })}
                  placeholder="e.g. Weekend Special 15% OFF"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-sm dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Discount Amount</label>
                  <input
                    type="text"
                    value={newPromo.discount}
                    onChange={(e) => setNewPromo({ ...newPromo, discount: e.target.value })}
                    placeholder="15% OFF or $5 OFF"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-sm dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newPromo.validTill}
                    onChange={(e) => setNewPromo({ ...newPromo, validTill: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-sm dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors cursor-pointer"
                >
                  Save Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
