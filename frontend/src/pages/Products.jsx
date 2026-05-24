import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import { useProductStore } from '../store/productStore.js';
import { Search, Plus, Trash2, Tag, Gem, CircleAlert, Sparkles } from 'lucide-react';

const Products = () => {
  const { products, categories, fetchProducts, createProduct, deleteProduct, loading } = useProductStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [metalTypeFilter, setMetalTypeFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Rings');
  const [metalType, setMetalType] = useState('gold');
  const [purity, setPurity] = useState('22K');
  const [weight, setWeight] = useState('');
  const [stonePrice, setStonePrice] = useState('');
  const [makingCharge, setMakingCharge] = useState('');
  const [makingChargeType, setMakingChargeType] = useState('fixed');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [barcodeId, setBarcodeId] = useState('');

  useEffect(() => {
    fetchProducts({ search, category: categoryFilter, metalType: metalTypeFilter });
  }, [search, categoryFilter, metalTypeFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const result = await createProduct({
      name,
      category,
      metalType,
      purity,
      weight,
      stonePrice,
      makingCharge,
      makingChargeType,
      description,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80',
      barcodeId,
    });
    if (result.success) {
      setShowAddModal(false);
      // Reset form
      setName('');
      setWeight('');
      setStonePrice('');
      setMakingCharge('');
      setDescription('');
      setImageUrl('');
      setBarcodeId('');
    }
  };

  return (
    <div className="min-h-screen bg-royal-950 pb-12">
      <Navbar title="Jewellery Stock Catalog" />

      <main className="max-w-7xl mx-auto px-8 mt-8 space-y-6">
        {/* Actions + Filters Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-royal-900/30 p-4 border border-royal-800/40 rounded-2xl">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search name, barcode, purity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-royal-950/60 border border-royal-800 text-slate-100 rounded-xl text-xs w-full focus:outline-none focus:ring-1 focus:ring-gold-500 placeholder:text-slate-500"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-royal-950/60 border border-royal-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Metal Type Filter */}
            <select
              value={metalTypeFilter}
              onChange={(e) => setMetalTypeFilter(e.target.value)}
              className="bg-royal-950/60 border border-royal-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
            >
              <option value="">All Metals</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="platinum">Platinum</option>
              <option value="diamond">Diamond</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl font-bold text-xs shadow-md active:scale-[0.99] cursor-pointer w-full md:w-auto justify-center transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Stock New Jewellery
          </button>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="border border-dashed border-royal-800 rounded-3xl p-12 flex flex-col items-center text-slate-500 justify-center">
            <Gem className="w-12 h-12 text-royal-800 mb-3" />
            <span className="text-sm font-semibold">No stock items match your filter criteria</span>
            <span className="text-[10px] mt-1">Try resetting the searches or catalog a new item above</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p._id} className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group">
                <div className="relative h-44 bg-royal-950/80 overflow-hidden">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold border capitalize ${
                      p.stockStatus === 'in_stock' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {p.stockStatus === 'in_stock' ? 'In Stock' : 'Sold'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-royal-950/80 border border-royal-800 text-gold-400">
                      {p.purity}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gold-500">{p.category}</span>
                      <span className="text-[10px] text-slate-500 font-mono">#{p.barcodeId}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm line-clamp-1">{p.name}</h4>
                    {p.description && <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{p.description}</p>}
                  </div>

                  <div className="border-t border-royal-800/60 pt-3">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-royal-950/40 rounded-xl p-2 border border-royal-800/30">
                        <span className="text-[9px] text-slate-500 block uppercase">Weight</span>
                        <span className="font-semibold text-slate-200 text-xs">{p.weight.toFixed(3)}g</span>
                      </div>
                      <div className="bg-royal-950/40 rounded-xl p-2 border border-royal-800/30">
                        <span className="text-[9px] text-slate-500 block uppercase">Stone (₹)</span>
                        <span className="font-semibold text-slate-200 text-xs">₹{p.stonePrice}</span>
                      </div>
                      <div className="bg-royal-950/40 rounded-xl p-2 border border-royal-800/30">
                        <span className="text-[9px] text-slate-500 block uppercase">Making</span>
                        <span className="font-semibold text-slate-200 text-xs truncate">
                          {p.makingChargeType === 'per_gram' ? `₹${p.makingCharge}/g` : p.makingChargeType === 'percentage' ? `${p.makingCharge}%` : `₹${p.makingCharge}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => deleteProduct(p._id)}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-royal-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-royal-900 border border-royal-800 rounded-3xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-400" />
              Stock New Jewellery Item
            </h3>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Product Name */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Jewelry Particulars</label>
                  <input
                    type="text"
                    placeholder="e.g. Classic Gold Wedding Ring"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full py-2 px-4 glass-input text-xs"
                    required
                  />
                </div>

                {/* Barcode ID */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Barcode ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="Auto-generates if empty"
                    value={barcodeId}
                    onChange={(e) => setBarcodeId(e.target.value)}
                    className="w-full py-2 px-4 glass-input text-xs"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Jewellery Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full py-2.5 px-4 glass-input text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Metal Type */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Metal Type</label>
                  <select
                    value={metalType}
                    onChange={(e) => setMetalType(e.target.value)}
                    className="w-full py-2.5 px-4 glass-input text-xs capitalize"
                  >
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="platinum">Platinum</option>
                    <option value="diamond">Diamond</option>
                  </select>
                </div>

                {/* Purity */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Metal Purity</label>
                  <input
                    type="text"
                    placeholder="e.g. 22K, 18K, 950, Sterling"
                    value={purity}
                    onChange={(e) => setPurity(e.target.value)}
                    className="w-full py-2 px-4 glass-input text-xs"
                    required
                  />
                </div>

                {/* Net Weight */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Net Weight (grams)</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="e.g. 8.450"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full py-2 px-4 glass-input text-xs"
                    required
                  />
                </div>

                {/* Stone Price */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Stone Price Valuation (₹)</label>
                  <input
                    type="number"
                    placeholder="₹ 0.00"
                    value={stonePrice}
                    onChange={(e) => setStonePrice(e.target.value)}
                    className="w-full py-2 px-4 glass-input text-xs"
                  />
                </div>

                {/* Making Charge type */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Making Charge Type</label>
                  <select
                    value={makingChargeType}
                    onChange={(e) => setMakingChargeType(e.target.value)}
                    className="w-full py-2.5 px-4 glass-input text-xs"
                  >
                    <option value="fixed">Fixed Charge per item</option>
                    <option value="per_gram">Charged per Gram</option>
                    <option value="percentage">Percentage (%) of metal value</option>
                  </select>
                </div>

                {/* Making Charge Value */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Making Charge Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 350"
                    value={makingCharge}
                    onChange={(e) => setMakingCharge(e.target.value)}
                    className="w-full py-2 px-4 glass-input text-xs"
                    required
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Product Image Link</label>
                  <input
                    type="text"
                    placeholder="e.g. https://domain.com/photo.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full py-2 px-4 glass-input text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Item Description</label>
                <textarea
                  placeholder="Additional stock records..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full py-2 px-4 glass-input text-xs h-20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-royal-800/80 pt-5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-700 hover:bg-royal-800/35 text-slate-300 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl font-bold text-xs shadow-md active:scale-[0.99] cursor-pointer transition-all duration-200"
                >
                  Confirm Stock Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
