import { useState } from 'react';
import { Award, Plus, Search, Trash2, ExternalLink, Globe } from 'lucide-react';

const initialBrands = [
  { id: '1', name: 'Starbucks Coffee', logo: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=150', origin: 'USA', productCount: 38, status: 'Active', website: 'starbucks.com' },
  { id: '2', name: 'Nespresso Original', logo: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150', origin: 'Switzerland', productCount: 25, status: 'Active', website: 'nespresso.com' },
  { id: '3', name: 'Monin Syrups', logo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=150', origin: 'France', productCount: 40, status: 'Active', website: 'monin.com' },
  { id: '4', name: 'Lavazza Premium', logo: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=150', origin: 'Italy', productCount: 19, status: 'Active', website: 'lavazza.com' },
  { id: '5', name: 'Twining Tea', logo: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=150', origin: 'UK', productCount: 14, status: 'Inactive', website: 'twinings.com' },
  { id: '6', name: 'Oatly Dairy-Free', logo: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=150', origin: 'Sweden', productCount: 12, status: 'Active', website: 'oatly.com' },
];

export default function BrandsPage() {
  const [brands, setBrands] = useState(initialBrands);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: '', origin: '', website: '' });

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.origin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddBrand = (e) => {
    e.preventDefault();
    if (!newBrand.name) return;
    const brandToAdd = {
      id: String(Date.now()),
      name: newBrand.name,
      logo: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=150',
      origin: newBrand.origin || 'International',
      productCount: 0,
      status: 'Active',
      website: newBrand.website || 'example.com',
    };
    setBrands([brandToAdd, ...brands]);
    setNewBrand({ name: '', origin: '', website: '' });
    setShowAddModal(false);
  };

  const deleteBrand = (id) => {
    setBrands(brands.filter(b => b.id !== id));
  };

  return (
    <div className="p-8 pb-12 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Award className="w-7 h-7 text-amber-500" />
            Brands & Suppliers
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage product manufacturers, brand partners, and supplier networks.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-5 py-2.5 transition-all shadow-sm self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Add Brand
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500 dark:text-white"
          />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          Showing <span className="text-gray-900 dark:text-white font-bold">{filteredBrands.length}</span> brands
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-14 h-14 object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{brand.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      <Globe className="w-3.5 h-3.5 text-amber-500" />
                      <span>{brand.origin}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-gray-900 p-2.5 border border-gray-100 dark:border-gray-700">
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                <a href={`https://${brand.website}`} target="_blank" rel="noreferrer" className="hover:underline text-amber-600 dark:text-amber-400 truncate">
                  {brand.website}
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {brand.productCount} <span className="font-normal text-gray-400">Products linked</span>
              </span>
              <button
                onClick={() => deleteBrand(brand.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                title="Delete brand"
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Brand</h2>
            <form onSubmit={handleAddBrand} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Brand Name</label>
                <input
                  type="text"
                  required
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                  placeholder="e.g. Torani Syrups"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-sm dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Country / Origin</label>
                <input
                  type="text"
                  value={newBrand.origin}
                  onChange={(e) => setNewBrand({ ...newBrand, origin: e.target.value })}
                  placeholder="e.g. USA"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-sm dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Official Website</label>
                <input
                  type="text"
                  value={newBrand.website}
                  onChange={(e) => setNewBrand({ ...newBrand, website: e.target.value })}
                  placeholder="torani.com"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-sm dark:text-white focus:outline-none focus:border-amber-500"
                />
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
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
