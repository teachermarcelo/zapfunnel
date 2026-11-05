import React from 'react';
import { Smartphone, CheckCheck, MessageSquare, ExternalLink, X, Send } from 'lucide-react';
import { WhatsAppLog } from '../../lib/storage';

interface WhatsAppInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: WhatsAppLog[];
}

export const WhatsAppInboxModal: React.FC<WhatsAppInboxModalProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col h-[650px] relative">
        {/* Smartphone Header / WhatsApp style */}
        <div className="bg-emerald-700 text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
              ZAP
            </div>
            <div>
              <div className="font-bold text-sm leading-tight flex items-center space-x-1.5">
                <span>ZapFunnel Cloud Bot</span>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              </div>
              <div className="text-[11px] text-emerald-100">Disparador Oficial de Checkout</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-600 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp Subtitle Bar */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-2 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{logs.length} disparos registrados no simulador</span>
          <span className="text-emerald-400 font-semibold">Status: Conectado</span>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0c1317] bg-[radial-gradient(#182229_1px,transparent_1px)] [background-size:16px_16px]">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-6">
              <MessageSquare className="w-12 h-12 mb-2 text-slate-600" />
              <p className="text-sm font-semibold">Nenhuma mensagem disparada ainda.</p>
              <p className="text-xs mt-1">
                Faça um pedido de teste no checkout para ver a notificação automática no WhatsApp!
              </p>
            </div>
          ) : (
            logs.map((log) => {
              const cleanPhone = log.phone.replace(/\D/g, '');
              const directWaUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(log.message)}`;

              return (
                <div key={log.id} className="flex flex-col items-end">
                  <div className="max-w-[90%] bg-[#005c4b] text-white rounded-2xl rounded-tr-none p-3 shadow-md text-xs space-y-2 border border-emerald-600/30">
                    <div className="flex items-center justify-between text-[10px] text-emerald-200 border-b border-emerald-600/40 pb-1 mb-1">
                      <span className="font-bold">Para: {log.customerName}</span>
                      <span className="font-mono">{log.phone}</span>
                    </div>

                    <div className="whitespace-pre-line text-slate-100 leading-relaxed font-sans text-[11px]">
                      {log.message}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-emerald-200">
                      <a
                        href={directWaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-white flex items-center space-x-1"
                      >
                        <span>Abrir no App</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <div className="flex items-center space-x-1">
                        <span>{new Date(log.sentAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 mt-0.5 mr-1 capitalize">
                    {log.type.replace(/_/g, ' ')}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* WhatsApp Bottom Simulation Input Bar */}
        <div className="bg-[#202c33] p-3 flex items-center space-x-2 border-t border-slate-800">
          <input
            type="text"
            readOnly
            value="Simulador automático de webhook ativo..."
            className="flex-1 bg-[#2a3942] rounded-xl px-3 py-2 text-xs text-slate-400 focus:outline-none"
          />
          <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
            <Send className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
