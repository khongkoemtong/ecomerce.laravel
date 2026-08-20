import { useState } from 'react';
import { Star, Search, CheckCircle, XCircle, Trash2, Filter } from 'lucide-react';

const initialReviews = [
  { id: 'REV-101', product: 'Iced Caramel Macchiato', customer: 'Sokha Meng', rating: 5, comment: 'Best iced coffee in town! Perfectly balanced sweetness and rich espresso flavor.', date: '2026-08-14', status: 'Approved' },
  { id: 'REV-102', product: 'Double Beef Cheeseburger', customer: 'Vibol Sovann', rating: 5, comment: 'Juicy patty, soft bun, and generous cheese. Highly recommended!', date: '2026-08-13', status: 'Approved' },
  { id: 'REV-103', product: 'Matcha Latte Ice', customer: 'Khemra Rin', rating: 4, comment: 'Great quality green tea, slightly sweet for my taste but overall solid.', date: '2026-08-12', status: 'Approved' },
  { id: 'REV-104', product: 'Truffle Fries Special', customer: 'Anonymous User', rating: 2, comment: 'Fries arrived lukewarm and missed the extra dip sauce.', date: '2026-08-11', status: 'Pending' },
  { id: 'REV-105', product: 'Pepperoni Pizza XL', customer: 'Narith Touch', rating: 5, comment: 'Crust was crispy and toppings were super generous!', date: '2026-08-10', status: 'Approved' },
];

export default function ProductReviewsPage() {
  const [reviews, setReviews] = useState(initialReviews);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All');

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = r.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'All' || r.rating === Number(ratingFilter);
    return matchesSearch && matchesRating;
  });

  const toggleApproval = (id) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: r.status === 'Approved' ? 'Pending' : 'Approved' } : r));
  };

  const deleteReview = (id) => {
    setReviews(reviews.filter(r => r.id !== id));
  };

  return (
    <div className="p-8 pb-12 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
            Product Reviews & Ratings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor customer feedback, approve testimonials, and manage product ratings.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
          <span className="text-3xl font-extrabold text-amber-500">4.8</span>
          <div className="flex justify-center gap-1 my-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-xs text-gray-400">Average Customer Rating</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{reviews.length}</span>
          <p className="text-xs text-gray-400 mt-2">Total Customer Reviews</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
          <span className="text-3xl font-extrabold text-emerald-500">
            {reviews.filter(r => r.status === 'Approved').length}
          </span>
          <p className="text-xs text-gray-400 mt-2">Published Reviews</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
          <span className="text-3xl font-extrabold text-amber-500">
            {reviews.filter(r => r.status === 'Pending').length}
          </span>
          <p className="text-xs text-gray-400 mt-2">Pending Moderation</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400 mr-1">Rating:</span>
          {['All', '5', '4', '3', '2', '1'].map(stars => (
            <button
              key={stars}
              onClick={() => setRatingFilter(stars)}
              className={`px-3 py-1.5 text-xs font-medium cursor-pointer ${
                ratingFilter === stars
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {stars === 'All' ? 'All' : `${stars} ★`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex flex-col md:flex-row justify-between gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-bold text-gray-900 dark:text-white text-base">{rev.customer}</span>
                <span className="text-xs text-gray-400 font-mono">on {rev.product}</span>
                <span className="text-xs text-gray-400">({rev.date})</span>
              </div>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-900/60 p-3 border border-gray-100 dark:border-gray-700/50">
                "{rev.comment}"
              </p>
            </div>

            <div className="flex items-center gap-3 self-end md:self-center">
              <button
                onClick={() => toggleApproval(rev.id)}
                className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 border cursor-pointer ${
                  rev.status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                }`}
              >
                {rev.status === 'Approved' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {rev.status}
              </button>
              <button
                onClick={() => deleteReview(rev.id)}
                className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                title="Delete review"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
