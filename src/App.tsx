import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Product, ToastMessage, ToastType } from './types';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Stats from './components/Stats';
import ProductForm from './components/ProductForm';
import DeleteConfirmation from './components/DeleteConfirmation';
import ToastContainer from './components/ToastContainer';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Database,
  CloudLightning,
  X,
  AlertCircle,
  Copy,
  Check,
  TrendingUp,
  Package,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// Default static mockup items in case Supabase table doesn't exist yet (Self-healing mode)
const LOCAL_STORAGE_PRODUCTS_KEY = 'coca_cola_fallback_products';
const INITIAL_DEMO_PRODUCTS: Product[] = [
  {
    id: 'demo-1',
    created_at: new Date().toISOString(),
    name: 'Coca-Cola Original Taste Can 330ml',
    category: 'Original Carbonated',
    price: 6500,
    stock: 450,
    description: 'The standard classic Coca-Cola refreshing taste enjoyed for generations.',
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'demo-2',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    name: 'Coca-Cola Zero Sugar Bottle 500ml',
    category: 'Zero Sugar',
    price: 8500,
    stock: 320,
    description: 'Great Coca-Cola taste without any sugar. Perfect low calorie drink.',
    image_url: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'demo-3',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    name: 'Sprite Lemon-Lime Bottle 1L',
    category: 'Lemon Lime Sodas',
    price: 11000,
    stock: 15, // Low stock demo
    description: 'Crisp, clean, sparkling lemon-lime juice sodas to boost your energy.',
    image_url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'demo-4',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    name: 'Fanta Orange Sparkling Can 330ml',
    category: 'Fruity Sodas',
    price: 6000,
    stock: 180,
    description: 'Bubbly, fruity orange sodas that bring ultimate fun to every gathering.',
    image_url: 'https://images.unsplash.com/photo-1624552184280-9e9631600677?auto=format&fit=crop&q=80&w=200',
  }
];

export default function App() {
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // App layouts
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Database Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [useLocalFallback, setUseLocalFallback] = useState(false);
  const [showSqlSchemaPrompt, setShowSqlSchemaPrompt] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // CRUD UI variables
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Custom Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Listen to Supabase authorization status shifts
  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (err) {
        console.error('Session check failed', err);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch product items based on live database status
  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user, useLocalFallback]);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    
    if (useLocalFallback) {
      // Local storage sandbox query path
      const localData = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
      if (localData) {
        setProducts(JSON.parse(localData));
      } else {
        localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(INITIAL_DEMO_PRODUCTS));
        setProducts(INITIAL_DEMO_PRODUCTS);
      }
      setIsLoadingProducts(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, relation error triggers fallback mode automatically
        if (error.code === '42P01') {
          console.warn('The products table does not exist yet. Launching Sandbox Fallback mode.');
          setUseLocalFallback(true);
          setShowSqlSchemaPrompt(true);
          addToast("Supabase is live! Fallback local sandbox active until table schema is provisioned.", "info");
        } else {
          throw error;
        }
      } else if (data) {
        setProducts(data as Product[]);
      }
    } catch (err: any) {
      console.error('Error querying products:', err);
      setUseLocalFallback(true);
      addToast(err.message || 'database fetch failed. Switching to Local Storage Sandbox.', 'error');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const syncLocalToStorage = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(updatedProducts));
  };

  // CREATE or UPDATE action handler
  const handleFormSubmit = async (formData: Partial<Product>): Promise<boolean> => {
    try {
      if (editingProduct) {
        // UPDATE code path
        if (useLocalFallback) {
          const updated = products.map((p) =>
            p.id === editingProduct.id
              ? { ...p, ...formData } as Product
              : p
          );
          syncLocalToStorage(updated);
          addToast('Product details updated in sandboxed environment.', 'success');
          return true;
        }

        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            category: formData.category,
            price: formData.price,
            stock: formData.stock,
            description: formData.description,
            image_url: formData.image_url,
          })
          .eq('id', editingProduct.id);

        if (error) throw error;
        
        addToast('Product successfully updated in cloud database!', 'success');
        fetchProducts();
        return true;
      } else {
        // CREATE / INSERT code path
        const newProductData = {
          name: formData.name,
          category: formData.category,
          price: Number(formData.price),
          stock: Number(formData.stock),
          description: formData.description,
          image_url: formData.image_url || '',
        };

        if (useLocalFallback) {
          const newItem: Product = {
            id: `local-${Math.random().toString(36).substring(2, 9)}`,
            created_at: new Date().toISOString(),
            ...newProductData,
          } as Product;
          const updated = [newItem, ...products];
          syncLocalToStorage(updated);
          addToast('Product added to local storage sandbox successfully.', 'success');
          return true;
        }

        const { error } = await supabase
          .from('products')
          .insert([newProductData]);

        if (error) throw error;

        addToast('Product successfully registered in cloud database!', 'success');
        fetchProducts();
        return true;
      }
    } catch (err: any) {
      console.error('CRUD Submission error:', err);
      addToast(err.message || 'Failed to submit operation.', 'error');
      return false;
    }
  };

  // DELETE action confirmed handler
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);

    try {
      if (useLocalFallback) {
        const filtered = products.filter((p) => p.id !== deletingProduct.id);
        syncLocalToStorage(filtered);
        addToast(`"${deletingProduct.name}" removed from local sandbox.`, 'success');
        setDeletingProduct(null);
        return;
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deletingProduct.id);

      if (error) throw error;

      addToast(`"${deletingProduct.name}" successfully deleted!`, 'success');
      fetchProducts();
      setDeletingProduct(null);
    } catch (err: any) {
      console.error('Deletion error:', err);
      addToast(err.message || 'Failed to delete product.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Formatter helper for Rupiah currency values
  const formatRupiah = (val: number) => {
    return 'Rp ' + Number(val).toLocaleString('id-ID');
  };

  // Prepare chart data: Stock levels by product
  const getProductStockChartData = () => {
    return products.slice(0, 8).map((p) => ({
      name: p.name.length > 20 ? p.name.substring(0, 18) + '...' : p.name,
      Stock: Number(p.stock) || 0,
    }));
  };

  // Prepare chart data: Aggregate Category counts
  const getCategoryPieData = () => {
    const rawCounts: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.category || 'Uncategorized';
      rawCounts[cat] = (rawCounts[cat] || 0) + 1;
    });

    return Object.entries(rawCounts).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const pieColors = ['#E60028', '#1E293B', '#64748B', '#94A3B8', '#CBD5E1', '#F1F5F9'];

  // User trigger logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      addToast('Signed out of administrative workspace.', 'info');
    } catch (err: any) {
      addToast(err.message || 'Logout failed.', 'error');
    }
  };

  // Filter products list based on search and category metrics
  const categoriesList = ['All', ...Array.from(new Set(products.map((p) => p.category))).filter(Boolean)];
  
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sqlSchemaText = `-- Connect to your Supabase project (https://supabase.com)
-- Go to SQL Editor, paste the following script, and click "Run" to establish your table:

create table products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  category text not null,
  price numeric not null,
  stock integer not null,
  description text,
  image_url text
);

-- Enable standard security access policies
alter table products enable row level security;
create policy "Allow read-only public access" on products for select using (true);
create policy "Allow all actions for authenticated administrators" on products for all using (true) with check (true);
`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchemaText);
    setCopiedSql(true);
    addToast('SQL schema copied to clipboard!', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Loading Screen for Authentication Checking
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center font-sans">
          <div className="w-10 h-10 border-4 border-t-[#E60028] border-gray-100 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm font-semibold text-gray-500">Checking credentials session...</p>
        </div>
      </div>
    );
  }

  // Auth Guard
  if (!user) {
    return (
      <>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <Login onLoginSuccess={() => fetchProducts()} addToast={addToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F9FAFB] text-slate-800" id="main-app-shell">
      {/* Absolute Toast Panel */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        userEmail={user.email}
      />

      {/* Main administrative layout viewport */}
      <div className="flex-1 flex flex-col overflow-x-hidden min-h-screen" id="viewport-pane">
        {/* Banner notifying active Local Sandbox Fallback */}
        {useLocalFallback && (
          <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-amber-900 text-xs font-medium font-sans">
            <div className="flex items-center gap-2">
              <CloudLightning className="w-4.5 h-4.5 text-amber-500 animate-pulse shrink-0" />
              <span>
                <strong>Sandbox Mode Connected:</strong> The Supabase app is functioning offline using localStorage because the <code>products</code> table doesn't exist on this cloud instance yet.
              </span>
            </div>
            <button
              onClick={() => setShowSqlSchemaPrompt(true)}
              className="px-3 py-1 bg-amber-200/60 hover:bg-amber-200 text-amber-950 rounded-lg font-bold transition-all cursor-pointer"
              id="btn-show-schema-help"
            >
              How to create table?
            </button>
          </div>
        )}

        {/* Global Toolbar and Metadata info */}
        <header className="bg-white border-b border-gray-150 px-6 py-5 flex items-center justify-between sticky top-0 z-30" id="top-toolbar">
          <div className="font-sans">
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900 capitalize">
              {activeTab === 'dashboard' ? 'Overview Analytics by: Adam Bayu Saputra - 2403040123' : 'Catalog Registry'}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {activeTab === 'dashboard'
                ? 'Warehouse capacities, category metrics, and live charts'
                : 'Manage real-time digital stock entries'}
            </p>
          </div>

          <div className="flex items-center gap-3 font-sans">
            {/* Database status banner indicators */}
            <div
              id="db-badge"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                useLocalFallback
                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{useLocalFallback ? 'Database Sandbox' : 'Supabase Cloud'}</span>
            </div>

            {/* Quick action button */}
            {activeTab === 'products' && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setFormOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#E60028] hover:bg-[#c50022] active:scale-95 text-center cursor-pointer rounded-xl transition-all shadow-md shadow-red-900/10"
                id="header-cta-add-product"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            )}
          </div>
        </header>

        {/* Main nested viewport panel content */}
        <main className="flex-1 p-6 space-y-8 max-w-7xl w-full mx-auto" id="app-main-content">
          {/* Summary stats row */}
          <section id="metrics-summary-view">
            <Stats products={products} isLoading={isLoadingProducts} />
          </section>

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8" id="dashboard-tab-view">
              {/* Skeletons or Empty state for charts */}
              {isLoadingProducts ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 h-80 animate-pulse" />
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 h-80 animate-pulse" />
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl text-center border border-gray-100 max-w-xl mx-auto font-sans">
                  <Package className="w-12 h-12 text-gray-300 mx-auto stroke-1" />
                  <h3 className="text-lg font-bold text-gray-900 mt-4">No Products Available yet</h3>
                  <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                    To construct interactive dashboard telemetry charts, jump over to the Products tab and click Add Product to input some entries!
                  </p>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#E60028] text-sm font-semibold rounded-xl text-white cursor-pointer hover:bg-[#c50022] transition-colors"
                  >
                    Go to Products Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-charts-grid">
                  {/* Stock Levels Bar Chart */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 h-96 flex flex-col justify-between shadow-2xs">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 font-sans">Warehouse Inventory Capacity</h4>
                      <p className="text-xs text-gray-400 font-sans mt-0.5">Top-stocked products currently on site (units)</p>
                    </div>
                    <div className="flex-1 mt-4 w-full h-[260px] min-h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getProductStockChartData()}
                          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} stroke="#CBD5E1" />
                          <YAxis tick={{ fontSize: 10, fill: '#64748B' }} stroke="#CBD5E1" />
                          <Tooltip
                            contentStyle={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontFamily: 'sans-serif', fontSize: '12px' }}
                            cursor={{ fill: '#F8F9FA' }}
                          />
                          <Bar dataKey="Stock" fill="#E60028" radius={[4, 4, 0, 0]} barSize={25} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Category Breakdown Pie Chart */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 h-96 flex flex-col justify-between shadow-2xs">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 font-sans">Brand Divisions Catalog</h4>
                      <p className="text-xs text-gray-400 font-sans mt-0.5">Product quantity distribution across categories</p>
                    </div>
                    <div className="flex-1 mt-4 w-full h-[260px] min-h-[220px] flex flex-col sm:flex-row items-center justify-center gap-4">
                      <div className="w-1/2 h-full min-h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getCategoryPieData()}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={85}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {getCategoryPieData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontFamily: 'sans-serif', fontSize: '12px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Customized custom Legend for premium aesthetic */}
                      <div className="w-full sm:w-1/2 flex flex-col justify-center gap-2 overflow-y-auto max-h-48 font-sans px-2">
                        {getCategoryPieData().map((entry, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                            <div className="flex items-center gap-2 truncate pr-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: pieColors[idx % pieColors.length] }}
                              />
                              <span className="text-gray-600 truncate">{entry.name}</span>
                            </div>
                            <span className="text-gray-500 font-mono">({entry.value} sku)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Recent additions guide */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs font-sans" id="recent-additions-panel">
                <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Recently Registered SKUs</h4>
                    <p className="text-xs text-gray-400">Newly inserted catalogs details</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-[#E60028] text-xs font-bold hover:underline cursor-pointer"
                  >
                    View All Products
                  </button>
                </div>

                {products.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No products registered</p>
                ) : (
                  <div className="space-y-3">
                    {products.slice(0, 3).map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-55 border border-transparent hover:border-gray-100 transition-all font-sans text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center p-0.5 border border-gray-100 overflow-hidden shrink-0">
                            <img
                              src={prod.image_url || 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&q=80&w=200'}
                              alt=""
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&q=80&w=200';
                              }}
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800 block">{prod.name}</span>
                            <span className="text-gray-400 block -mt-0.5">{prod.category}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-extrabold text-[#E60028] block">{formatRupiah(prod.price)}</span>
                          <span className={`text-[10px] font-semibold uppercase ${prod.stock < 20 ? 'text-amber-500' : 'text-gray-400'} block`}>
                            {prod.stock < 20 ? `LOW STOCK: ${prod.stock} left` : `${prod.stock} in warehouse`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT CATALOG */}
          {activeTab === 'products' && (
            <div className="space-y-6" id="products-tab-view">
              {/* Search, Filter dynamic toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans shadow-2xs" id="catalog-control-toolbar">
                <div className="flex-1 relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by catalog title, attributes, or brand particulars..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-150 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E60028]/2% focus:border-[#E60028] placeholder-gray-400 transition-all text-gray-900"
                    id="search-input-field"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      id="search-clear-btn"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-400">
                      <Filter className="w-4 h-4" />
                    </span>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="pl-9 pr-8 py-2.5 bg-white border border-gray-150 rounded-xl text-sm font-semibold text-gray-700 capitalize focus:outline-none focus:ring-2 focus:ring-[#E60028]/2% focus:border-[#E60028] transition-all cursor-pointer appearance-none"
                      id="category-dropdown-selector"
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat === 'All' ? 'All Categories' : cat}
                        </option>
                      ))}
                    </select>
                    {/* Visual caret */}
                    <span className="absolute right-3.5 pointer-events-none text-gray-400 text-xs">▼</span>
                  </div>

                  {/* Reset action helper */}
                  {(searchQuery || selectedCategory !== 'All') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="text-xs text-gray-400 hover:text-[#E60028] font-semibold underline cursor-pointer"
                      id="btn-clear-all-filters"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Data Table block */}
              {isLoadingProducts ? (
                <div className="bg-white p-12 rounded-2xl border border-gray-100 flex flex-col items-center justify-center space-y-4 font-sans">
                  <div className="w-10 h-10 border-4 border-t-[#E60028] border-gray-100 rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-gray-400">Loading catalog items...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white p-14 rounded-2xl text-center border border-gray-100 font-sans" id="empty-filtered-state">
                  <Package className="w-12 h-12 text-gray-300 mx-auto stroke-1" />
                  <h3 className="text-lg font-bold text-gray-900 mt-4">Unmatched Search Request</h3>
                  <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                    We couldn't spot any Coca-Cola inventory items matched with your filter matrices. Try resetting search criteria.
                  </p>
                  {(searchQuery || selectedCategory !== 'All') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-sm font-semibold rounded-xl text-gray-700 cursor-pointer transition-colors"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-xs text-gray-400 font-semibold pl-1 font-sans">
                    Showing {filteredProducts.length} entries of {products.length} registered products
                  </div>

                  {/* Responsive Table for Tablet & Desktop */}
                  <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-2xs" id="desktop-table-container">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[700px] border-collapse text-left font-sans text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px] w-1/12">Image</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px] w-4/12">Product Title</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px] w-2/12">Category</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px] w-2/12 text-right">Price</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px] w-1/12 text-center">Stock</th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px] w-2/12 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredProducts.map((prod) => {
                            const isLowStock = prod.stock < 20;

                            return (
                              <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors" id={`row-prod-${prod.id}`}>
                                <td className="px-6 py-4">
                                  <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1.5 overflow-hidden shadow-2xs">
                                    <img
                                      src={prod.image_url || 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&q=80&w=200'}
                                      alt={prod.name}
                                      referrerPolicy="no-referrer"
                                      className="max-h-full max-w-full object-contain transition-transform hover:scale-110"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&q=80&w=200';
                                      }}
                                    />
                                  </div>
                                </td>
                                <td className="px-6 py-4 align-middle">
                                  <div>
                                    <span className="font-semibold text-gray-950 block">{prod.name}</span>
                                    {prod.description && (
                                      <span className="text-xs text-gray-400 block line-clamp-1 mt-0.5 font-light">
                                        {prod.description}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 align-middle">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-650 border border-gray-200/50 capitalize">
                                    {prod.category}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right align-middle font-mono font-extrabold text-blue-950">
                                  {formatRupiah(prod.price)}
                                </td>
                                <td className="px-6 py-4 text-center align-middle">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                                      isLowStock
                                        ? 'bg-red-50 text-[#E60028] border border-red-100 animate-pulse'
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    }`}
                                  >
                                    {prod.stock} units
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center align-middle">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingProduct(prod);
                                        setFormOpen(true);
                                      }}
                                      className="p-1 px-1.5 bg-gray-55 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-100 transition-colors cursor-pointer"
                                      title="Edit Product"
                                      id={`btn-edit-desktop-${prod.id}`}
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setDeletingProduct(prod)}
                                      className="p-1 px-1.5 bg-red-50 hover:bg-[#E60028] text-red-500 hover:text-white rounded-lg border border-red-100 hover:border-[#E60028] transition-colors cursor-pointer"
                                      title="Delete Product"
                                      id={`btn-delete-desktop-${prod.id}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Responsive List of Cards for Mobile viewports */}
                  <div className="md:hidden space-y-4" id="mobile-card-list-container">
                    {filteredProducts.map((prod) => {
                      const isLowStock = prod.stock < 20;

                      return (
                        <div
                          key={prod.id}
                          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-4 font-sans"
                          id={`card-prod-${prod.id}`}
                        >
                          <div className="flex gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                              <img
                                src={prod.image_url || 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&q=80&w=200'}
                                alt=""
                                className="max-h-full max-w-full object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&q=80&w=200';
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                                {prod.category}
                              </span>
                              <h4 className="font-bold text-gray-900 truncate">
                                {prod.name}
                              </h4>
                              <p className="text-xs text-gray-400 line-clamp-1 mt-0.5 font-light">
                                {prod.description || 'No description listed'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-sm">
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Unit Price</p>
                              <p className="font-extrabold text-[#E60028] mt-0.5">{formatRupiah(prod.price)}</p>
                            </div>

                            <div className="text-right">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Storage Stock</p>
                              <span
                                className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-xs font-extrabold font-mono ${
                                  isLowStock
                                    ? 'bg-red-50 text-[#E60028] border border-red-100'
                                    : 'bg-emerald-50 text-emerald-700'
                                }`}
                              >
                                {prod.stock} units
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <button
                              onClick={() => {
                                setEditingProduct(prod);
                                setFormOpen(true);
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold border border-gray-200/60 cursor-pointer"
                              id={`btn-edit-mobile-${prod.id}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit Entry
                            </button>
                            <button
                              onClick={() => setDeletingProduct(prod)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold border border-red-100 cursor-pointer"
                              id={`btn-delete-mobile-${prod.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* CREATE / EDIT SLIDE-OVER DRAWER MODAL */}
      <ProductForm
        product={editingProduct}
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* CONFIRMED DELETE WORKFLOW DIALOG BOX */}
      <DeleteConfirmation
        product={deletingProduct}
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {/* SELF-HEALING HELP POPUP (SQL SCHEMA INSTRUCTION GUIDE) */}
      <AnimatePresence>
        {showSqlSchemaPrompt && (
          <div id="sql-schema-help-modal" className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSqlSchemaPrompt(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
              id="sql-schema-modal-backdrop"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-3xl overflow-hidden border border-gray-100 z-50 flex flex-col max-h-[85vh]"
              id="sql-schema-panel"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center font-sans">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="font-extrabold text-gray-900 text-sm md:text-base">
                    Active Supabase Table Provisioning Guide
                  </span>
                </div>
                <button
                  onClick={() => setShowSqlSchemaPrompt(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Code scroll view body */}
              <div className="p-6 overflow-y-auto space-y-4 font-sans text-xs md:text-sm">
                <p className="text-gray-600 leading-relaxed font-sans text-xs">
                  We successfully linked the Supabase authorization cluster to your app, but we couldn't query tables named <code>products</code>. That's perfectly regular!
                  Simply follow the quick guide below to publish the database table in your cloud project:
                </p>

                <ol className="list-decimal list-inside text-gray-650 space-y-1.5 pl-1 block text-xs">
                  <li>
                    Log in to your <strong className="text-gray-900">Supabase Console</strong> (https://supabase.com).
                  </li>
                  <li>
                    Open your project dashboard and select <strong className="text-gray-900">"SQL Editor"</strong> in the left pane.
                  </li>
                  <li>
                    Click <strong className="text-gray-900">"New Query"</strong>, paste the exact SQL block below, and hit <strong className="text-gray-900">"Run"</strong>:
                  </li>
                </ol>

                {/* Code viewport container */}
                <div className="relative rounded-xl border border-gray-150 bg-slate-900 p-4 text-slate-100 font-mono text-[11px] leading-relaxed select-text mt-3">
                  <button
                    onClick={copySqlToClipboard}
                    className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-200 hover:text-white rounded-lg text-xs flex items-center gap-1.5 font-sans cursor-pointer transition-colors"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSql ? 'Copied' : 'Copy Query'}
                  </button>
                  <pre className="overflow-x-auto whitespace-pre-wrap pt-4 max-h-[220px]">
                    {sqlSchemaText}
                  </pre>
                </div>

                <div className="p-3 bg-red-50/40 rounded-xl border border-red-50 text-xs text-[#E60028] leading-relaxed flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Sandbox notice:</strong> In the meantime, feel free to close this guide. The app has activated local sandbox storage, letting you test the entire catalog creation/editing dashboard immediately!
                  </span>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end font-sans">
                <button
                  type="button"
                  onClick={() => setShowSqlSchemaPrompt(false)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Continue Testing in Sandbox
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
