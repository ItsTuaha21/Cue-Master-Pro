import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  Coffee,
  Plus,
  Edit2,
  AlertTriangle,
  Search,
  Tag,
  Boxes,
  Check
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { products, categories, settings, currentUser, updateProductStock } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Coffee className="w-6 h-6 text-amber-400" />
            <span>Snacks & Beverages Catalog</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Club cafeteria and bar menu pricing, cost margins, and real-time stock levels.
          </p>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search products by title or brand..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map(prod => {
          const margin = prod.selling_price - prod.cost_price;
          const marginPct = Math.round((margin / prod.selling_price) * 100);
          const isLowStock = prod.current_stock <= prod.low_stock_threshold;

          return (
            <div
              key={prod.id}
              className={`p-5 rounded-2xl bg-slate-900 border transition flex flex-col justify-between ${
                isLowStock ? 'border-rose-500/40 shadow-lg shadow-rose-950/20' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {prod.category_name}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">{prod.name}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    isLowStock
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-300'
                  }`}>
                    {prod.current_stock} {prod.unit}s
                  </span>
                </div>

                {/* Pricing & Margins */}
                <div className="grid grid-cols-2 gap-2 my-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">Selling Price</div>
                    <div className="font-mono font-bold text-emerald-400 text-sm">
                      {settings.currency_symbol} {prod.selling_price}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Cost (Wholesale)</div>
                    <div className="font-mono text-slate-300">
                      {settings.currency_symbol} {prod.cost_price}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Gross Margin:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    +{settings.currency_symbol} {margin} ({marginPct}%)
                  </span>
                </div>
              </div>

              {isLowStock && (
                <div className="mt-3 pt-3 border-t border-rose-500/20 flex items-center gap-1.5 text-xs text-rose-300 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Reorder threshold breached (Min {prod.low_stock_threshold})</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
