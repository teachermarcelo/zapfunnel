import React from 'react';
import { 
  Zap, 
  LayoutDashboard, 
  Layers, 
  Users, 
  RefreshCw, 
  BarChart3, 
  Database, 
  MessageSquare, 
  ExternalLink,
  PlusCircle,
  Smartphone
} from 'lucide-react';
import { Product } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  products: Product[];
  onOpenNewPageModal: () => void;
  onOpenWhatsAppModal: () => void;
  onSelectPublicPage: (slug: string) => void;
  unreadWhatsAppCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  products,
  onOpenNewPageModal,
  onOpenWhatsAppModal,
  onSelectPublicPage,
  unreadWhatsAppCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  ZapFunnel
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Checkout Próprio & WhatsApp Multi-Páginas</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentTab('pages')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'pages'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Subpáginas ({products.length})</span>
            </button>

            <button
              onClick={() => setCurrentTab('leads')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'leads'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Leads & Pedidos</span>
            </button>

            <button
              onClick={() => setCurrentTab('recovery')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'recovery'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recuperação (WhatsApp)</span>
            </button>

            <button
              onClick={() => setCurrentTab('analytics')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'analytics'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Tráfego & Horários</span>
            </button>

            <button
              onClick={() => setCurrentTab('integrations')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'integrations'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Supabase & Webhooks</span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* WhatsApp Simulator Button */}
            <button
              onClick={onOpenWhatsAppModal}
              className="relative p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center space-x-1.5 text-xs font-semibold"
              title="Abrir Simulador de WhatsApp"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">WhatsApp Logs</span>
              {unreadWhatsAppCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center justify-center animate-pulse">
                  {unreadWhatsAppCount}
                </span>
              )}
            </button>

            {/* Quick Public Page Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700/80 text-xs font-medium transition-all">
                <span>Ver Páginas</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 hidden group-hover:block transition-all z-50">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Páginas de Vendas Ativas
                </div>
                <div className="divide-y divide-slate-800/60 max-h-60 overflow-y-auto">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onSelectPublicPage(p.slug)}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between group/item transition-colors"
                    >
                      <span className="truncate pr-2 font-medium">{p.name}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        /p/{p.slug.slice(0, 8)}...
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* New Page CTA */}
            <button
              onClick={onOpenNewPageModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Nova Página</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-800 bg-slate-950/90 px-2 py-2 text-[11px] font-medium overflow-x-auto">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded ${
            currentTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Início</span>
        </button>
        <button
          onClick={() => setCurrentTab('pages')}
          className={`flex flex-col items-center py-1 px-2 rounded ${
            currentTab === 'pages' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Páginas</span>
        </button>
        <button
          onClick={() => setCurrentTab('leads')}
          className={`flex flex-col items-center py-1 px-2 rounded ${
            currentTab === 'leads' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Leads</span>
        </button>
        <button
          onClick={() => setCurrentTab('recovery')}
          className={`flex flex-col items-center py-1 px-2 rounded ${
            currentTab === 'recovery' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Recuperar</span>
        </button>
        <button
          onClick={() => setCurrentTab('analytics')}
          className={`flex flex-col items-center py-1 px-2 rounded ${
            currentTab === 'analytics' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Tráfego</span>
        </button>
        <button
          onClick={() => setCurrentTab('integrations')}
          className={`flex flex-col items-center py-1 px-2 rounded ${
            currentTab === 'integrations' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Supabase</span>
        </button>
      </div>
    </header>
  );
};
