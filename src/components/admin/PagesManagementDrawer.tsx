import React, { useState } from 'react';
import { 
  X, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  Plus, 
  Layers, 
  Search, 
  Zap, 
  Globe,
  ShoppingBag
} from 'lucide-react';
import { Product, LandingPageConfig } from '../../types';
import { StorageService } from '../../lib/storage';

interface PagesManagementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  landingPages: LandingPageConfig[];
  onSelectPublicPage: (slug: string) => void;
  onEditPage: (page: LandingPageConfig) => void;
  onOpenCheckoutModal: (product: Product) => void;
  onOpenNewPageModal: () => void;
  onRefreshData: () => void;
}

export const PagesManagementDrawer: React.FC<PagesManagementDrawerProps> = ({
  isOpen,
  onClose,
  products,
  landingPages,
  onSelectPublicPage,
  onEditPage,
  onOpenCheckoutModal,
  onOpenNewPageModal,
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyUrl = (targetSlug: string) => {
    const url = `${window.location.origin}/?slug=${targetSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(targetSlug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleDelete = (prodId: string, prodName: string) => {
    if (confirm(`Tem certeza que deseja remover o produto "${prodName}" e sua subpágina de vendas?`)) {
      StorageService.deleteProduct(prodId);
      onRefreshData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-white">Painel Central de Subpáginas</h2>
                <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  {products.length} Ativas
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Edite o conteúdo, remova páginas, copie links para anúncios ou teste o checkout.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={() => {
                onClose();
                onOpenNewPageModal();
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nova Subpágina</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Filter */}
        <div className="py-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por nome do produto, URL ou nicho..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Products List with Action Buttons */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">Nenhuma subpágina encontrada.</p>
              <p className="text-xs mt-1">Clique em "+ Nova Subpágina" para criar uma agora.</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const lp =
                landingPages.find((l) => l.productId === product.id) ||
                landingPages.find((l) => l.slug === product.slug);

              return (
                <div
                  key={product.id}
                  className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  {/* Left Info */}
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0 shadow-md"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-extrabold text-white text-sm truncate">{product.name}</h4>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 mt-1">
                        <span className="font-mono text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 truncate">
                          /p/{product.slug}
                        </span>
                        <span className="text-[10px] text-slate-500">• {product.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit, Remove, View, Copy URL, Test Checkout */}
                  <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                    {/* Copy Link */}
                    <button
                      onClick={() => copyUrl(product.slug)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium flex items-center space-x-1 transition-all cursor-pointer"
                      title="Copiar URL para Anúncios"
                    >
                      {copiedSlug === product.slug ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copiar Link</span>
                        </>
                      )}
                    </button>

                    {/* View Public Page */}
                    <button
                      onClick={() => {
                        onClose();
                        onSelectPublicPage(product.slug);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                      title="Ver Página Pública de Vendas"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ver Pública</span>
                    </button>

                    {/* Edit Page */}
                    {lp && (
                      <button
                        onClick={() => {
                          onClose();
                          onEditPage(lp);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
                        title="Abrir Editor Visual da Página"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    )}

                    {/* Test Checkout */}
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCheckoutModal(product);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                      title="Testar Checkout Próprio"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Checkout</span>
                    </button>

                    {/* Delete Page */}
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Remover Subpágina"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
