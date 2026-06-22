import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Image as ImageIcon, Loader2, RefreshCw } from 'lucide-react';
import { Product } from '../types';

interface ProductFormProps {
  product: Product | null; // null means Create mode, otherwise Update mode
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Product>) => Promise<boolean>;
}

// Preset assets for Coca-Cola products to make testing gorgeous and easy
const PRODUCT_PRESETS = [
  {
    name: 'Coca-Cola Original Taste Can',
    category: 'Original Carbonated',
    price: 6500,
    stock: 500,
    description: 'The original refreshing cola taste, served ice-cold for ultimate satisfaction.',
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=200',
  },
  {
    name: 'Coca-Cola Zero Sugar Bottle',
    category: 'Zero Sugar',
    price: 8500,
    stock: 350,
    description: 'An awesome sugar-free option that tastes exceptionally close to the original formulation.',
    image_url: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&q=80&w=200',
  },
  {
    name: 'Fanta Orange Sparkling',
    category: 'Fruity Sodas',
    price: 6000,
    stock: 200,
    description: 'Bursting with delicious orange flavour! Bright, bubbly, and instantly refreshing.',
    image_url: 'https://images.unsplash.com/photo-1624552184280-9e9631600677?auto=format&fit=crop&q=80&w=200',
  },
  {
    name: 'Sprite Lemon-Lime Spark',
    category: 'Lemon Lime Sodas',
    price: 6000,
    stock: 280,
    description: 'Crisp, clean, sugar-sweetened beverage infused with lemon and lime flavours.',
    image_url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=200',
  }
];

export default function ProductForm({ product, isOpen, onClose, onSubmit }: ProductFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setCategory(product.category || '');
      setPrice(product.price ?? '');
      setStock(product.stock ?? '');
      setDescription(product.description || '');
      setImageUrl(product.image_url || '');
    } else {
      // Clear form for Create mode
      setName('');
      setCategory('');
      setPrice('');
      setStock('');
      setDescription('');
      setImageUrl('');
    }
  }, [product, isOpen]);

  const handleApplyPreset = (preset: typeof PRODUCT_PRESETS[0]) => {
    setName(preset.name);
    setCategory(preset.category);
    setPrice(preset.price);
    setStock(preset.stock);
    setDescription(preset.description);
    setImageUrl(preset.image_url);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || price === '' || stock === '') {
      return;
    }

    setIsSubmitting(true);
    const success = await onSubmit({
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      description,
      image_url: imageUrl,
    });
    
    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="product-form-modal-overlay" className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Background blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            id="modal-backdrop"
          />

          {/* Slide over container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-50 border-l border-gray-100"
            id="product-form-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-950 font-sans" id="form-panel-title">
                  {product ? 'Edit Coca-Cola Product' : 'Add New Coca-Cola Product'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Declare inventories, pricing metrics, and brand imagery
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 px-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close panel"
                id="form-close-button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form & Body wrapper */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Presets Helper (Only shown when creating a new product) */}
              {!product && (
                <div className="p-4 bg-red-50/20 border border-red-50 rounded-xl space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#E60028] uppercase tracking-wider block">
                      🚀 Coca-Cola Template Presets
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">Click to auto-fill</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {PRODUCT_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="text-left text-xs p-2 rounded-lg bg-white hover:bg-red-50/80 border border-gray-100 hover:border-[#E60028]/20 transition-all font-medium text-gray-700 block truncate cursor-pointer shadow-2xs"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-5" id="actual-product-form">
                <div>
                  <label htmlFor="prod-name" className="block text-xs font-bold text-gray-650 uppercase tracking-wider mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    id="prod-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Coca-Cola Vanilla Can 330ml"
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E60028]/20 focus:border-[#E60028] text-sm text-gray-900 transition-all placeholder-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prod-category" className="block text-xs font-bold text-gray-650 uppercase tracking-wider mb-2">
                      Category *
                    </label>
                    <input
                      type="text"
                      id="prod-category"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g., Slim Cans"
                      className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E60028]/20 focus:border-[#E60028] text-sm text-gray-900 transition-all placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="prod-stock" className="block text-xs font-bold text-gray-650 uppercase tracking-wider mb-2">
                      Warehouse Stock *
                    </label>
                    <input
                      type="number"
                      id="prod-stock"
                      required
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g., 250"
                      className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E60028]/20 focus:border-[#E60028] text-sm text-gray-900 transition-all placeholder-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="prod-price" className="block text-xs font-bold text-gray-650 uppercase tracking-wider mb-2">
                    Unit Price (IDR Rupiah) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 font-sans text-sm font-semibold">
                      Rp
                    </span>
                    <input
                      type="number"
                      id="prod-price"
                      required
                      min="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g., 6500"
                      className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E60028]/20 focus:border-[#E60028] text-sm text-gray-900 transition-all placeholder-gray-400"
                    />
                  </div>
                  {price !== '' && (
                    <p className="text-[11px] text-gray-400 font-medium font-mono mt-1.5 pl-1">
                      Visual Format: Rp {(Number(price) || 0).toLocaleString('id-ID')}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="prod-image" className="block text-xs font-bold text-gray-650 uppercase tracking-wider mb-2">
                    Image Catalog URL
                  </label>
                  <input
                    type="url"
                    id="prod-image"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E60028]/20 focus:border-[#E60028] text-sm text-gray-900 transition-all placeholder-gray-400"
                  />
                </div>

                {/* Live image preview block with fallbacks */}
                <div id="image-live-preview-box" className="p-4 border border-dashed border-gray-100 rounded-xl bg-gray-50 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Image Status / Live Preview
                  </span>
                  {imageUrl ? (
                    <div className="relative group w-28 h-28 bg-white border border-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt="Product visual representation"
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&q=80&w=200';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-300 py-3">
                      <ImageIcon className="w-10 h-10 stroke-1" />
                      <span className="text-xs text-gray-400 mt-1">No custom preview available</span>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="prod-desc" className="block text-xs font-bold text-gray-650 uppercase tracking-wider mb-2">
                    Product Description
                  </label>
                  <textarea
                    id="prod-desc"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Full product catalog copy, benefits, ingredients, or bundle particulars..."
                    className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E60028]/20 focus:border-[#E60028] text-sm text-gray-900 transition-all placeholder-gray-400"
                  />
                </div>
              </form>
            </div>

            {/* Footer buttons */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 active:scale-95 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                id="form-cancel-button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFormSubmit}
                disabled={isSubmitting || !name || !category || price === '' || stock === ''}
                className="px-5 py-2.5 bg-[#E60028] hover:bg-[#c50022] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-red-950/10 flex items-center gap-2 cursor-pointer"
                id="form-save-button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    Saving changes...
                  </>
                ) : (
                  product ? 'Save Alterations' : 'Register Product'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
