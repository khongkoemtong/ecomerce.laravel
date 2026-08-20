import { useState } from 'react';
import { CreditCard, Search, DollarSign, CheckCircle2, Clock, XCircle, Filter } from 'lucide-react';

const initialTransactions = [
  { id: 'TXN-9021', customer: 'Sophea Chan', method: 'ABA PAY', amount: 48.50, status: 'Completed', date: '2026-08-14 10:24 AM', ref: 'ABA-892183' },
  { id: 'TXN-9020', customer: 'Dara Heng', method: 'Wing Bank', amount: 12.00, status: 'Completed', date: '2026-08-14 09:45 AM', ref: 'WING-449102' },
  { id: 'TXN-9019', customer: 'Borey Visal', method: 'Cash', amount: 25.75, status: 'Completed', date: '2026-08-14 09:12 AM', ref: 'CASH-POS-01' },
  { id: 'TXN-9018', customer: 'Linda Kim', method: 'Visa / Mastercard', amount: 110.00, status: 'Pending', date: '2026-08-14 08:30 AM', ref: 'VISA-339102' },
  { id: 'TXN-9017', customer: 'Vannak Reth', method: 'ABA PAY', amount: 34.20, status: 'Failed', date: '2026-08-13 06:15 PM', ref: 'ABA-119283' },
  { id: 'TXN-9016', customer: 'Chenda Meng', method: 'ACLEDA ToanChet', amount: 67.80, status: 'Completed', date: '2026-08-13 05:40 PM', ref: 'ACL-772910' },
];

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = transactions.filter(t => {
    const matchesSearch = t.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.method.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = transactions.reduce((acc, curr) => curr.status === 'Completed' ? acc + curr.amount : acc, 0);

  return (
    <div className="p-8 pb-12 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-amber-500" />
            Payments & Transactions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track real-time customer payments, ABA QR transactions, card payments, and receipts.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Received</span>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">${totalRevenue.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Successful TXNs</span>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              {transactions.filter(t => t.status === 'Completed').length}
            </h3>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Verification</span>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              {transactions.filter(t => t.status === 'Pending').length}
            </h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-500">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transaction ID, customer, method..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            {['All', 'Completed', 'Pending', 'Failed'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === status
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4">TXN ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4">Reference No.</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">{txn.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{txn.customer}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      {txn.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">{txn.ref}</td>
                  <td className="px-6 py-4 font-extrabold text-gray-900 dark:text-white">${txn.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold ${
                      txn.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : txn.status === 'Pending'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                        : 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                    }`}>
                      {txn.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                      {txn.status === 'Pending' && <Clock className="w-3 h-3" />}
                      {txn.status === 'Failed' && <XCircle className="w-3 h-3" />}
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">{txn.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
