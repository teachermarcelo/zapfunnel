import React, { useState } from 'react';
import { 
  Plus, 
  Copy, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Check, 
  ShoppingBag, 
  Globe
} from 'lucide-react';
import { Product, LandingPageConfig } from '../../types';
import { StorageService } from '../../lib/storage';

interface ProductListProps {
  products: Product[];
  landingPages: LandingPageConfig[];
  onSelectProductPage: (slug: string) => void;
  onEditPage: (page: LandingPageConfig) => void;
  onOpenCheckoutModal: (product: Product) => void;
  onRefreshData: () => void;
  isNewModalOpen?: boolean;
  setIsNewModalOpen: (open: boolean) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  landingPages,
  onSelectProductPage,
  onEditPage,
  onOpenCheckoutModal,
  onRefreshData,
  setIsNewModalOpen,
}) => {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const copyUrl = (targetSlug: string) => {
    const url = `${window.location.origin}/?slug=${targetSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(targetSlug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleDelete = (id: string, prodName: string) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${prodName}" e sua subpágina de vendas?`)) {
      StorageService.deleteProduct(id);
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-emerald-400" />
            <span>Subpáginas de Vendas ({products.length})</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Crie e personalize páginas de vendas únicas para cada produto (livro, emagrecimento, curso, suplemento) com URLs personalizadas.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Subpágina</span>
        </button>
      </div>

      {/* Grid of Products / Pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {products.map((product) => {
          const lp = landingPages.find((l) => l.productId === product.id) || landingPages.find((l) => l.slug === product.slug);

          return (
            <div
              key={product.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    {product.badge || product.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] text-slate-400 font-medium">Página Ativa</span>
                  </div>
                </div>

                {/* Main Product Info */}
                <div className="flex space-x-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-24 h-24 rounded-xl object-cover border border-slate-700 shrink-0 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-white text-base leading-snug line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center space-x-2 pt-1">
                      <span className="text-lg font-black text-emerald-400">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-xs text-slate-500 line-through">
                        R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {product.salesCount} vendas • R$ {product.revenue.toFixed(2)} faturados
                    </div>
                  </div>
                </div>

                {/* Dedicated URL box */}
                <div className="mt-4 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate mr-2">
                    <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-mono text-xs text-slate-300 truncate">
                      {window.location.host}/?slug={product.slug}
                    </span>
                  </div>
                  <button
                    onClick={() => copyUrl(product.slug)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
                    title="Copiar link para campanhas de anúncios"
                  >
                    {copiedSlug === product.slug ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectProductPage(product.slug)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ver Pública</span>
                  </button>

                  {lp && (
                    <button
                      onClick={() => onEditPage(lp)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar Página</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenCheckoutModal(product)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    Testar Checkout
                  </button>

                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Excluir Subpágina"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
