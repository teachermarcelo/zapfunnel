import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  RefreshCcw, 
  CheckCircle2, 
  ArrowUpRight, 
  Clock, 
  Copy, 
  ExternalLink, 
  MessageCircle, 
  Sparkles,
  ShoppingBag,
  Send,
  Zap
} from 'lucide-react';
import { Product, Order, Lead, AbandonedCart } from '../../types';
import { StorageService } from '../../lib/storage';

interface DashboardOverviewProps {
  products: Product[];
  orders: Order[];
  leads: Lead[];
  abandonedCarts: AbandonedCart[];
  onSelectProductPage: (slug: string) => void;
  onOpenCheckoutModal: (product: Product) => void;
  onOpenRecoveryTab: () => void;
  onRefreshData: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  products,
  orders,
  leads,
  abandonedCarts,
  onSelectProductPage,
  onOpenCheckoutModal,
  onOpenRecoveryTab,
  onRefreshData,
}) => {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [simulatingRecovery, setSimulatingRecovery] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Computed metrics
  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.amount, 0);

  const paidOrdersCount = orders.filter((o) => o.status === 'paid').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  const totalVisits = 1450 + leads.length * 12;
  const checkoutClicks = 490 + leads.length * 4;
  const capturedLeadsCount = leads.length;
  const conversionRate = totalVisits > 0 ? ((paidOrdersCount / totalVisits) * 100).toFixed(1) : '0.0';

  const recoveredCartsCount = abandonedCarts.filter((a) => a.recoveryStage === 'recovered').length;
  const recoveredAmount = abandonedCarts
    .filter((a) => a.recoveryStage === 'recovered')
    .reduce((sum, a) => sum + a.amount, 0);

  const copyToClipboard = (slug: string) => {
    const fullUrl = `${window.location.origin}/?slug=${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setToastMessage(`Link da campanha copiado: /p/${slug}`);
    setTimeout(() => {
      setCopiedSlug(null);
      setToastMessage(null);
    }, 3000);
  };

  const handleSimulateAutoRecovery = () => {
    setSimulatingRecovery(true);
    setTimeout(() => {
      // Trigger recovery on first pending cart
      const target = abandonedCarts.find((c) => c.recoveryStage !== 'recovered');
      if (target) {
        StorageService.triggerRecoveryMessage(target.id, 'stage_1h');
        onRefreshData();
      }
      setSimulatingRecovery(false);
      setToastMessage('Recuperação automática de WhatsApp disparada com sucesso!');
      setTimeout(() => setToastMessage(null), 3500);
    }, 800);
  };

  const handleMarkAsPaid = (orderId: string) => {
    StorageService.markOrderAsPaid(orderId);
    onRefreshData();
    setToastMessage('Pedido marcado como PAGO! Notificação WhatsApp disparada.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1.5" />
                Checkout WhatsApp & Pix Ativo
              </span>
              <span className="text-xs text-slate-400">Tempo real</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Painel de Vendas & Conversões
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Gerencie suas subpáginas exclusivas por produto, checkout transparente com aviso no WhatsApp do cliente e recuperação automática de carrinhos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSimulateAutoRecovery}
              disabled={simulatingRecovery}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Send className={`w-4 h-4 text-emerald-400 ${simulatingRecovery ? 'animate-spin' : ''}`} />
              <span>{simulatingRecovery ? 'Disparando...' : 'Testar Recuperação WhatsApp (1h)'}</span>
            </button>

            <button
              onClick={() => {
                const firstProduct = products[0];
                if (firstProduct) onOpenCheckoutModal(firstProduct);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Simular Checkout Próprio</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Faturamento Confirmado</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="inline-flex items-center text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +32.4%
              </span>
              <span className="text-xs text-slate-400">{paidOrdersCount} pedidos pagos</span>
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Taxa de Conversão</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {conversionRate}%
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs text-slate-400">{totalVisits.toLocaleString('pt-BR')} acessos únicos</span>
              <span className="text-[11px] text-cyan-400 font-medium">({checkoutClicks} iniciaram)</span>
            </div>
          </div>
        </div>

        {/* Captured Leads */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Leads WhatsApp</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {capturedLeadsCount}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs text-emerald-400 font-medium">{pendingOrdersCount} aguardando Pix</span>
              <span className="text-xs text-slate-500">• 100% com WhatsApp</span>
            </div>
          </div>
        </div>

        {/* Cart Recovery */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Recuperados no Zap</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <RefreshCcw className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              R$ {recoveredAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs text-amber-400 font-medium">{recoveredCartsCount} carrinhos resgatados</span>
              <button 
                onClick={onOpenRecoveryTab}
                className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Ver automações
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Funnel Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Funil de Conversão em Tempo Real</span>
            </h2>
            <p className="text-xs text-slate-400">
              Acompanhe a jornada do cliente da landing page até a aprovação do Pix/Cartão
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
            Taxa de Fechamento: {conversionRate}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Step 1 */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase">1. Visitas na LP</span>
              <div className="text-xl font-bold text-white mt-1">{totalVisits.toLocaleString('pt-BR')}</div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-full" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">100% Tráfego</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase">2. Clicou Comprar</span>
              <div className="text-xl font-bold text-white mt-1">{checkoutClicks}</div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500" style={{ width: `${((checkoutClicks / totalVisits) * 100).toFixed(0)}%` }} />
              </div>
              <span className="text-[10px] text-cyan-400 mt-1 block">
                {((checkoutClicks / totalVisits) * 100).toFixed(1)}% de cliques
              </span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase">3. Inseriu WhatsApp</span>
              <div className="text-xl font-bold text-white mt-1">{capturedLeadsCount}</div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${((capturedLeadsCount / totalVisits) * 100).toFixed(0)}%` }} />
              </div>
              <span className="text-[10px] text-indigo-400 mt-1 block">
                {((capturedLeadsCount / totalVisits) * 100).toFixed(1)}% leads
              </span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase">4. Link Gerado Zap</span>
              <div className="text-xl font-bold text-white mt-1">{orders.length}</div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${((orders.length / totalVisits) * 100).toFixed(0)}%` }} />
              </div>
              <span className="text-[10px] text-amber-400 mt-1 block">
                100% enviados no WhatsApp
              </span>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between border-emerald-500/30">
            <div>
              <span className="text-[11px] font-semibold text-emerald-400 uppercase">5. Pagamento Pago</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">{paidOrdersCount}</div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${((paidOrdersCount / totalVisits) * 100).toFixed(0)}%` }} />
              </div>
              <span className="text-[10px] text-emerald-400 mt-1 block font-bold">
                R$ {totalRevenue.toFixed(0)} faturados
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Landing Pages Table (Direct Campaign Links) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <span>Subpáginas de Vendas Ativas por Produto</span>
            </h2>
            <p className="text-xs text-slate-400">
              Cada produto tem sua própria URL exclusiva pronta para veicular anúncios no Facebook, Instagram e Google.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Produto & Categoria</th>
                <th className="py-3 px-4">Preço Oferta</th>
                <th className="py-3 px-4">URL da Subpágina</th>
                <th className="py-3 px-4">Vendas</th>
                <th className="py-3 px-4">Faturamento</th>
                <th className="py-3 px-4 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {products.map((product) => {
                const prodOrders = orders.filter((o) => o.productId === product.id && o.status === 'paid');
                const prodRevenue = prodOrders.reduce((sum, o) => sum + o.amount, 0);

                return (
                  <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white">{product.name}</div>
                          <div className="text-[11px] text-slate-400">{product.category}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-emerald-400">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </div>
                      <div className="text-[10px] text-slate-500 line-through">
                        R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[11px] text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          /p/{product.slug}
                        </span>
                        <button
                          onClick={() => copyToClipboard(product.slug)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                          title="Copiar URL para Anúncios"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {copiedSlug === product.slug && (
                        <span className="text-[10px] text-emerald-400 font-medium">Link copiado!</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-white">{product.salesCount + prodOrders.length}</span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white">
                      R$ {(product.revenue + prodRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onSelectProductPage(product.slug)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1 transition-all cursor-pointer"
                        >
                          <span>Ver Página</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </button>

                        <button
                          onClick={() => onOpenCheckoutModal(product)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                        >
                          Testar Checkout
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

      {/* Recent Orders & Instant WhatsApp Trigger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>Últimos Pedidos & Disparos de WhatsApp</span>
            </h2>
            <p className="text-xs text-slate-400">
              Pedidos gerados no checkout com confirmação e status em tempo real
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Cliente & WhatsApp</th>
                <th className="py-3 px-4">Produto</th>
                <th className="py-3 px-4">Valor</th>
                <th className="py-3 px-4">Método</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Avisos</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {orders.slice(0, 6).map((order) => {
                const cleanPhone = order.customerPhone.replace(/\D/g, '');
                const waUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                  `Olá ${order.customerName}! Aqui é do suporte do pedido ${order.id}. Como podemos te ajudar?`
                )}`;

                return (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{order.customerName}</div>
                      <div className="text-[11px] text-emerald-400 font-mono">{order.customerPhone}</div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-300 max-w-[180px] truncate">
                      {order.productTitle}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white">
                      R$ {order.amount.toFixed(2).replace('.', ',')}
                    </td>

                    <td className="py-3.5 px-4 uppercase text-[11px] font-semibold text-slate-400">
                      {order.paymentMethod === 'pix' ? '⚡ Pix Dinâmico' : order.paymentMethod === 'credit_card' ? '💳 Cartão de Crédito' : '📄 Boleto'}
                    </td>

                    <td className="py-3.5 px-4">
                      {order.status === 'paid' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Aprovado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Aguardando Pagamento
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                          Zap Enviado
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                          Email Enviado
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleMarkAsPaid(order.id)}
                            className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-all cursor-pointer"
                            title="Simular confirmação bancária"
                          >
                            Aprovar Pix
                          </button>
                        )}

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-all"
                          title="Abrir Conversa no WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
