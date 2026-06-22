import { Package, Folder, Boxes } from 'lucide-react';
import { Product } from '../types';

interface StatsProps {
  products: Product[];
  isLoading: boolean;
}

export default function Stats({ products, isLoading }: StatsProps) {
  // Compute metrics Safely based on actual product data fetched
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
  const uniqueCategories = Array.from(new Set(products.map((p) => p.category?.trim().toLowerCase()))).filter(Boolean).length;

  const cards = [
    {
      id: 'total-products',
      title: 'Total Products',
      value: totalProducts,
      trend: '+4%',
      trendStyle: 'text-emerald-500 font-bold',
      icon: Package,
      iconBg: 'bg-red-50 text-[#E60028]',
    },
    {
      id: 'total-stock',
      title: 'Total Stock',
      value: totalStock.toLocaleString('id-ID'),
      trend: 'Units',
      trendStyle: 'text-gray-400 font-medium',
      icon: Boxes,
      iconBg: 'bg-slate-50 text-slate-800',
    },
    {
      id: 'total-categories',
      title: 'Active Categories',
      value: uniqueCategories,
      trend: 'Lines',
      trendStyle: 'text-slate-400 font-medium',
      icon: Folder,
      iconBg: 'bg-gray-50 text-gray-500',
    },
  ];

  if (isLoading) {
    return (
      <div id="stats-loading-skeleton" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"
          >
            <div className="space-y-3 w-2/3">
              <div className="h-3.5 bg-gray-100 rounded-md w-24 animate-pulse" />
              <div className="h-8 bg-gray-100 rounded-lg w-16 animate-pulse" />
              <div className="h-3 bg-gray-50 rounded-md w-32 animate-pulse" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div id="stats-summary-row" className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={`stat-card-${card.id}`}
            className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs flex items-center justify-between transition-all hover:shadow-md duration-200"
          >
            <div className="font-sans">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                {card.title}
              </p>
              <h3 className="text-3xl font-light text-slate-900 tracking-tight">
                {card.value}{' '}
                <span className={`text-xs ml-2 ${card.trendStyle}`}>
                  {card.trend}
                </span>
              </h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
