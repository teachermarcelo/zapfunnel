import React, { useState } from 'react';
import { 
  Users, 
  ShoppingBag, 
  Search, 
  Download, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  Phone,
  Mail,
  Zap,
  CreditCard,
  FileText
} from 'lucide-react';
import { Order, Lead } from '../../types';
import { StorageService } from '../../lib/storage';

interface LeadsAndOrdersProps {
  orders: Order[];
  leads: Lead[];
  onRefreshData: () => void;
}

export const LeadsAndOrders: React.FC<LeadsAndOrdersProps> = ({
  orders,
  leads,
  onRefreshData,
}) => {
  const [activeView, setActiveView] = useState<'orders' | 'leads'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm) ||
      o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.productTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCsv = () => {
    const csvContent = StorageService.exportToCsv(activeView);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `zapfunnel_${activeView}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage(`Relatório de ${activeView} exportado em CSV!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApproveOrder = (orderId: string) => {
    StorageService.markOrderAsPaid(orderId);
    onRefreshData();
    setToastMessage('Pagamento confirmado e notificação WhatsApp disparada!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Gerenciamento de Leads & Pedidos</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Monitore todos os compradores que inseriram WhatsApp no checkout, links enviados e transações concluídas.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center space-x-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Exportar {activeView === 'orders' ? 'Pedidos' : 'Leads'} (CSV)</span>
        </button>
      </div>

      {/* View Switcher & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* View buttons */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveView('orders')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'orders'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pedidos & Vendas ({orders.length})
          </button>
          <button
            onClick={() => setActiveView('leads')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'leads'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Leads Capturados ({leads.length})
          </button>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, WhatsApp ou produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os Status</option>
            <option value="paid">Pagos / Aprovados</option>
            <option value="pending">Aguardando Pagamento</option>
            {activeView === 'leads' && (
              <>
                <option value="abandoned">Carrinho Abandonado</option>
                <option value="recovered">Recuperado no WhatsApp</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {activeView === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Pedido & Data</th>
                  <th className="py-3.5 px-4">Cliente & WhatsApp</th>
                  <th className="py-3.5 px-4">Produto</th>
                  <th className="py-3.5 px-4">Valor</th>
                  <th className="py-3.5 px-4">Método</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Origem Tráfego</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      Nenhum pedido encontrado para esses filtros.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const cleanPhone = order.customerPhone.replace(/\D/g, '');
                    const waUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                      `Olá ${order.customerName}! Recebemos seu pedido ${order.id} de ${order.productTitle}. Segue seu link direto: ${window.location.origin}/?checkout_order=${order.id}`
                    )}`;

                    return (
                      <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-white text-[11px]">{order.id}</div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{order.customerName}</div>
                          <div className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1">
                            <Phone className="w-3 h-3 inline" />
                            <span>{order.customerPhone}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{order.customerEmail}</div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-300 max-w-[160px] truncate">
                          {order.productTitle}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-white">
                          R$ {order.amount.toFixed(2).replace('.', ',')}
                          {order.installments && order.installments > 1 && (
                            <div className="text-[10px] text-slate-400 font-normal">
                              em {order.installments}x
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5 text-slate-300 font-medium">
                            {order.paymentMethod === 'pix' ? (
                              <>
                                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Pix Dinâmico</span>
                              </>
                            ) : order.paymentMethod === 'credit_card' ? (
                              <>
                                <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Cartão (Stripe)</span>
                              </>
                            ) : (
                              <>
                                <FileText className="w-3.5 h-3.5 text-amber-400" />
                                <span>Boleto</span>
                              </>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {order.status === 'paid' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Aprovado
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              <Clock className="w-3 h-3 mr-1" />
                              Pendente
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono">
                            {order.utmSource || 'Orgânico'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleApproveOrder(order.id)}
                                className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-all cursor-pointer"
                                title="Confirmar pagamento bancário"
                              >
                                Aprovar Pix
                              </button>
                            )}

                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-all cursor-pointer"
                              title="Chamar no WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leads Table */}
      {activeView === 'leads' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Nome do Lead</th>
                  <th className="py-3.5 px-4">WhatsApp & Telefone</th>
                  <th className="py-3.5 px-4">E-mail</th>
                  <th className="py-3.5 px-4">Produto de Interesse</th>
                  <th className="py-3.5 px-4">Localidade</th>
                  <th className="py-3.5 px-4">Status no Funil</th>
                  <th className="py-3.5 px-4 text-right">Chamar no Zap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Nenhum lead encontrado para essa busca.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const cleanPhone = lead.phone.replace(/\D/g, '');
                    const waUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                      `Olá ${lead.name}! Vimos seu interesse em ${lead.productTitle}. Posso te ajudar com alguma dúvida sobre o acesso?`
                    )}`;

                    return (
                      <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">{lead.name}</td>

                        <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">
                          {lead.phone}
                        </td>

                        <td className="py-3.5 px-4 text-slate-300">{lead.email}</td>

                        <td className="py-3.5 px-4 font-medium text-slate-300">{lead.productTitle}</td>

                        <td className="py-3.5 px-4 text-slate-400">
                          {lead.city}, {lead.state}
                        </td>

                        <td className="py-3.5 px-4">
                          {lead.status === 'paid' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Comprou
                            </span>
                          ) : lead.status === 'recovered' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              Recuperado
                            </span>
                          ) : lead.status === 'abandoned' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              Abandonou
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Aguardando Pagto
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-all text-xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
