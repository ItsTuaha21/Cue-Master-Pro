import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Product } from '../../types';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  CreditCard,
  Printer,
  Receipt
} from 'lucide-react';

export const EmployeeSalesPage: React.FC = () => {
  const { products, categories, createWalkInSale, settings } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [customerName, setCustomerName] = useState<string>('Walk-in Customer');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [completedInvoiceId, setCompletedInvoiceId] = useState<string | null>(null);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category_id === selectedCategory);

  const addToCart = (product: Product) => {
    if (product.current_stock <= 0) {
      alert(`${product.name} is currently out of stock!`);
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.current_stock) {
          alert(`Cannot add more than available stock (${product.current_stock})`);
          return prev;
        }
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id !== productId) return item;
      const newQty = item.quantity + delta;
      if (newQty <= 0) return null;
      if (newQty > item.product.current_stock) return item;
      return { ...item, quantity: newQty };
    }).filter(Boolean) as { product: Product; quantity: number }[]);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.selling_price * item.quantity, 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const items = cart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    const invoiceId = createWalkInSale(items, paymentMethod, customerName);
    setCompletedInvoiceId(invoiceId);
  };

  const resetSale = () => {
    setCart([]);
    setCustomerName('Walk-in Customer');
    setCompletedInvoiceId(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <ShoppingBag className="w-6 h-6 text-blue-400" />
          <span>Walk-In Snacks & Drinks POS</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Fast-path retail checkout for takeout snacks & beverages. No table session or membership profile required.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: PRODUCTS CATALOG (2 COLS) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                type="button"
                onClick={() => addToCart(product)}
                disabled={product.current_stock <= 0}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between h-28 touch-manipulation active:scale-[0.98] ${
                  product.current_stock <= 0
                    ? 'opacity-40 bg-slate-900/40 border-slate-800 cursor-not-allowed'
                    : 'bg-slate-900 border-slate-800 hover:border-blue-500/60 hover:bg-slate-850'
                }`}
              >
                <div>
                  <div className="font-bold text-xs sm:text-sm text-white line-clamp-1">{product.name}</div>
                  <div className="text-[11px] text-slate-400">{product.category_name}</div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
                  <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm">
                    {settings.currency_symbol} {product.selling_price}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    product.current_stock <= product.low_stock_threshold
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {product.current_stock} left
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: CART & CHECKOUT (1 COL) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-full justify-between">
          {!completedInvoiceId ? (
            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white tracking-tight">Active Retail Cart</h3>
                <span className="text-xs text-slate-400 font-semibold">{cart.length} unique item(s)</span>
              </div>

              {/* Customer Tag */}
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                  Customer / Identifier
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Walk-in Customer, Table 2 Friend"
                />
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-xs text-slate-400">
                    Cart is empty. Tap products to add.
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.product.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex-1 pr-2">
                        <div className="font-semibold text-white truncate">{item.product.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {settings.currency_symbol} {item.product.selling_price} each
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-mono font-bold text-white text-xs">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
                  Payment Tender
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['cash', 'card', 'bank_transfer'] as PaymentMethod[]).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 rounded-lg text-xs font-semibold capitalize border transition ${
                        paymentMethod === method
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {method.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtotal & Checkout Button */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400">Total Payable:</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    {settings.currency_symbol} {cartSubtotal.toLocaleString()}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={cart.length === 0}
                  className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] ${
                    cart.length > 0
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                      : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Charge {settings.currency_symbol} {cartSubtotal.toLocaleString()}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Sale Complete Screen */
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Walk-In Sale Completed</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Inventory automatically deducted. Revenue credited to active shift drawer.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left text-xs font-mono text-slate-300 space-y-1 max-w-xs mx-auto">
                <div className="font-bold text-white text-center pb-1 border-b border-slate-800">
                  RECEIPT #{completedInvoiceId}
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{cart.length} item(s)</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-400 border-t border-slate-800 pt-1">
                  <span>Amount Paid:</span>
                  <span>{settings.currency_symbol} {cartSubtotal} ({paymentMethod.toUpperCase()})</span>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Receipt
                </button>
                <button
                  onClick={resetSale}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                >
                  New Sale
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
