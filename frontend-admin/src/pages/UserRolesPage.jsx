import { useState } from 'react';
import { ShieldCheck, Plus, Search, UserCheck, CheckCircle2, Trash2 } from 'lucide-react';

const initialRoles = [
  { id: 'ROL-1', name: 'Super Admin', usersCount: 2, accessLevel: 'Full Access', permissions: ['All Modules', 'User Roles', 'Billing & Settings', 'Inventory Edit'] },
  { id: 'ROL-2', name: 'Store Manager', usersCount: 5, accessLevel: 'High Access', permissions: ['Orders Management', 'Inventory Edit', 'Customer Data', 'Promotions'] },
  { id: 'ROL-3', name: 'Cashier / POS', usersCount: 12, accessLevel: 'Operational', permissions: ['Order Line (POS)', 'View Inventory', 'Customer Lookup'] },
  { id: 'ROL-4', name: 'Inventory Specialist', usersCount: 3, accessLevel: 'Restricted', permissions: ['Manage Inventory', 'All Products', 'Categories', 'Brands'] },
];

export default function UserRolesPage() {
  const [roles, setRoles] = useState(initialRoles);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', accessLevel: 'Operational' });

  const filtered = roles.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.accessLevel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRole = (e) => {
    e.preventDefault();
    if (!newRole.name) return;
    const roleToAdd = {
      id: `ROL-${Date.now()}`,
      name: newRole.name,
      usersCount: 0,
      accessLevel: newRole.accessLevel,
      permissions: ['Order Line (POS)', 'View Inventory'],
    };
    setRoles([...roles, roleToAdd]);
    setNewRole({ name: '', accessLevel: 'Operational' });
    setShowAddModal(false);
  };

  const deleteRole = (id) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  return (
    <div className="p-8 pb-12 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-amber-500" />
            User Roles & Permissions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure system access control, staff roles, and administrative security privileges.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-5 py-2.5 transition-all shadow-sm self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Create User Role
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search role name or access..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500 dark:text-white"
          />
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((role) => (
          <div
            key={role.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-500">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{role.name}</h3>
                    <span className="text-xs text-gray-400 font-mono">{role.usersCount} Assigned Staff Users</span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold border border-gray-200 dark:border-gray-600">
                  {role.accessLevel}
                </span>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Granted Permissions:</h4>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((perm, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <span className="text-xs text-gray-400 font-mono">{role.id}</span>
              {role.name !== 'Super Admin' && (
                <button
                  onClick={() => deleteRole(role.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete role"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 max-w-md w-full p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create User Role</h2>
            <form onSubmit={handleAddRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="e.g. Accountant"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-sm dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Access Tier</label>
                <select
                  value={newRole.accessLevel}
                  onChange={(e) => setNewRole({ ...newRole, accessLevel: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-sm dark:text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Operational">Operational</option>
                  <option value="Restricted">Restricted</option>
                  <option value="High Access">High Access</option>
                </select>
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
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
