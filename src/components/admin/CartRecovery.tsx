import React, { useState } from 'react';
import { 
  RefreshCw, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Send, 
  AlertTriangle, 
  Sparkles, 
  Settings, 
  ExternalLink,
  Percent,
  Play
} from 'lucide-react';
import { AbandonedCart, RecoveryRule } from '../../types';
import { StorageService } from '../../lib/storage';

interface CartRecoveryProps {
  abandonedCarts: AbandonedCart[];
  recoveryRules: RecoveryRule[];
  onRefreshData: () => void;
}

export const CartRecovery: React.FC<CartRecoveryProps> = ({
  abandonedCarts,
  recoveryRules,
  onRefreshData,
}) => {
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [rules, setRules] = useState<RecoveryRule[]>(recoveryRules);
  const [isBulkSending, setIsBulkSending] = useState(false);

  const totalAtRisk = abandonedCarts.reduce((sum, c) => sum + c.amount, 0);
  const recoveredList = abandonedCarts.filter((c) => c.recoveryStage === 'recovered');
  const recoveredAmount = recoveredList.reduce((sum, c) => sum + c.amount, 0);
  const recoveryRate = abandonedCarts.length > 0 ? ((recoveredList.length / abandonedCarts.length) * 100).toFixed(1) : '0.0';

  const handleTriggerRecovery = (cartId: string, stage: 'stage_15m' | 'stage_1h' | 'stage_24h') => {
    const res = StorageService.triggerRecoveryMessage(cartId, stage);
    onRefreshData();
    setToastMessage(`Mensagem de recuperação (${stage === 'stage_1h' ? '1 hora' : stage === 'stage_15m' ? '15 min' : '24h'}) enviada!`);
    setTimeout(() => setToastMessage(null), 3500);

    // Open WhatsApp directly if user wants
    if (res.directUrl) {
      window.open(res.directUrl, '_blank');
    }
  };

  const handleBulkTrigger1h = () => {
    setIsBulkSending(true);
    setTimeout(() => {
      const pending = abandonedCarts.filter((c) => c.recoveryStage !== 'recovered');
      pending.forEach((c) => {
        StorageService.triggerRecoveryMessage(c.id, 'stage_1h');
      });
      onRefreshData();
      setIsBulkSending(false);
      setToastMessage(`Disparo em massa de 1 hora executado para ${pending.length} carrinhos!`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 1000);
  };

  const handleToggleRule = (ruleId: string) => {
    const updated = rules.map((r) => (r.id === ruleId ? { ...r, active: !r.active } : r));
    setRules(updated);
    StorageService.saveRecoveryRules(updated);
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

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 text-emerald-400" />
            <span>Recuperação Automática de Carrinho (WhatsApp)</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Dispare sequências persuasivas para leads que inseriram WhatsApp mas não concluíram o Pix ou cartão dentro de 1 hora.
          </p>
        </div>

        <button
          onClick={handleBulkTrigger1h}
          disabled={isBulkSending}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>{isBulkSending ? 'Processando disparos...' : 'Disparar Recuperação de 1h em Massa'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 uppercase">
            <span>Carrinhos Abandonados</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-3">
            {abandonedCarts.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">Iniciaram mas não pagaram</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 uppercase">
            <span>Valor em Risco</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 mt-3">
            R$ {totalAtRisk.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-1">Oportunidades em aberto</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 uppercase">
            <span>Faturamento Resgatado</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-3">
            R$ {recoveredAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-1">{recoveredList.length} pedidos salvos</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 uppercase">
            <span>Taxa de Recuperação</span>
            <Percent className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 mt-3">
            {recoveryRate}%
          </div>
          <p className="text-xs text-slate-400 mt-1">Média de mercado: 18%</p>
        </div>
      </div>

      {/* Automated Recovery Rules Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <span>Regras do Funil de Recuperação Automática</span>
          </h2>
          <p className="text-xs text-slate-400">
            Cada regra define o momento exato e a mensagem personalizada enviada no WhatsApp e E-mail.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                rule.active
                  ? 'bg-slate-950/80 border-emerald-500/40 shadow-emerald-500/5'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{rule.name}</span>
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.active}
                      onChange={() => handleToggleRule(rule.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                </div>

                <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-3 text-[11px] text-slate-300 font-mono line-clamp-4">
                  {rule.messageTemplate}
                </div>

                {rule.discountCode && (
                  <div className="mt-2 flex items-center space-x-1.5 text-[10px] text-amber-400">
                    <Sparkles className="w-3 h-3" />
                    <span>Aplica cupom: <b>{rule.discountCode}</b> (-{rule.discountPercent}%)</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Canal: WhatsApp + E-mail</span>
                <span className="text-emerald-400 font-semibold">{rule.active ? 'Ativo' : 'Pausado'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Abandoned Carts Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span>Fila de Clientes em Recuperação</span>
            </h2>
            <p className="text-xs text-slate-400">
              Clique para enviar a mensagem diretamente no WhatsApp do cliente com o link de pagamento.
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
                <th className="py-3 px-4">Tempo Decorrido</th>
                <th className="py-3 px-4">Estágio de Recuperação</th>
                <th className="py-3 px-4 text-right">Disparar no Zap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {abandonedCarts.map((cart) => {
                const cleanPhone = cart.customerPhone.replace(/\D/g, '');

                return (
                  <tr key={cart.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{cart.customerName}</div>
                      <div className="text-[11px] text-emerald-400 font-mono">{cart.customerPhone}</div>
                      <div className="text-[10px] text-slate-400">{cart.customerEmail}</div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      {cart.productName}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white">
                      R$ {cart.amount.toFixed(2).replace('.', ',')}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(cart.abandonedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3.5 px-4">
                      {cart.recoveryStage === 'recovered' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Recuperado & Pago
                        </span>
                      ) : cart.recoveryStage === 'stage_1h' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Notificado (1 hora)
                        </span>
                      ) : cart.recoveryStage === 'stage_15m' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Notificado (15 min)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          Pendente Envio
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleTriggerRecovery(cart.id, 'stage_1h')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-1 transition-all cursor-pointer shadow-md"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar Zap (1h)</span>
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
    </div>
  );
};
