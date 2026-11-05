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
  Smartphone,
  Cloud
} from 'lucide-react';
import { Product } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  products: Product[];
  onOpenNewPageModal: () => void;
  onOpenWhatsAppModal: () => void;
  onOpenPagesDrawer: () => void;
  onOpenSyncModal: () => void;
  onSelectPublicPage: (slug: string) => void;
  unreadWhatsAppCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  products,
  onOpenNewPageModal,
  onOpenWhatsAppModal,
  onOpenPagesDrawer,
  onOpenSyncModal,
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
            {/* Cloud & Supabase Sync Button */}
            <button
              onClick={onOpenSyncModal}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all flex items-center space-x-1.5 text-xs font-semibold cursor-pointer shadow-sm"
              title="Sincronizar dados entre Vercel, Supabase e este computador"
            >
              <Cloud className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Nuvem / Sync</span>
            </button>

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

            {/* Quick Public Page & Management Panel */}
            <div className="relative group">
              <button
                onClick={onOpenPagesDrawer}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700/80 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                title="Abrir Painel de Páginas (Editar, Remover, Ver)"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ver Páginas</span>
                <span className="text-[10px] bg-slate-900 px-1.5 py-0.2 rounded font-mono text-emerald-400">
                  {products.length}
                </span>
              </button>

              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 hidden group-hover:block transition-all z-50">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-800/80 mb-1">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Suas Subpáginas
                  </span>
                  <button
                    onClick={onOpenPagesDrawer}
                    className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer"
                  >
                    Painel Completo &rarr;
                  </button>
                </div>
                <div className="divide-y divide-slate-800/60 max-h-60 overflow-y-auto">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="px-2.5 py-2 hover:bg-slate-800 rounded-xl flex items-center justify-between group/item transition-colors"
                    >
                      <button
                        onClick={() => onSelectPublicPage(p.slug)}
                        className="text-left truncate pr-2 text-xs text-slate-200 hover:text-emerald-400 font-medium cursor-pointer"
                      >
                        <div className="truncate font-semibold">{p.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">/p/{p.slug}</div>
                      </button>
                      <button
                        onClick={onOpenPagesDrawer}
                        className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 shrink-0 cursor-pointer"
                        title="Abrir painel para editar ou excluir"
                      >
                        Gerenciar
                      </button>
                    </div>
                  ))}
                </div>
                <div className="pt-2 mt-1 border-t border-slate-800/80">
                  <button
                    onClick={onOpenPagesDrawer}
                    className="w-full py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold text-center transition-colors cursor-pointer"
                  >
                    Abrir Painel (Editar / Remover)
                  </button>
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
