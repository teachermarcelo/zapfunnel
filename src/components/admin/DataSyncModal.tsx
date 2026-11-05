import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  RefreshCw, 
  Database, 
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SupabaseSyncService } from '../../lib/supabaseSync';
import { StorageService } from '../../lib/storage';

interface DataSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const DataSyncModal: React.FC<DataSyncModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const [copied, setCopied] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleCopyJson = () => {
    const jsonStr = SupabaseSyncService.exportStateJson();
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setStatusMsg({
      type: 'success',
      text: 'Todos os produtos, subpáginas e métricas copiados para a área de transferência!',
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleApplyImport = () => {
    if (!importJson.trim()) {
      setStatusMsg({ type: 'error', text: 'Cole o código JSON copiado do outro navegador!' });
      return;
    }

    const ok = SupabaseSyncService.importStateJson(importJson.trim());
    if (ok) {
      setStatusMsg({
        type: 'success',
        text: 'Dados importados e sincronizados com sucesso neste navegador!',
      });
      setImportJson('');
      onDataChanged();
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setStatusMsg({
        type: 'error',
        text: 'JSON inválido. Certifique-se de colar exatamente o conteúdo copiado.',
      });
    }
  };

  const handlePullSupabase = async () => {
    setIsLoading(true);
    setStatusMsg(null);
    const res = await SupabaseSyncService.pullFromSupabase();
    setIsLoading(false);

    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: `Dados sincronizados com o Supabase com sucesso!`,
      });
      onDataChanged();
    } else {
      setStatusMsg({
        type: 'error',
        text: res.error || 'Configure sua Anon Key do Supabase na aba "Supabase & Webhooks".',
      });
    }
  };

  const handlePushSupabase = async () => {
    setIsLoading(true);
    setStatusMsg(null);
    const res = await SupabaseSyncService.pushAllToSupabase();
    setIsLoading(false);

    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: `${res.pushedProducts} produtos/subpáginas enviados e salvos no seu Supabase!`,
      });
      onDataChanged();
    } else {
      setStatusMsg({
        type: 'error',
        text: res.error || 'Configure sua Anon Key do Supabase na aba "Supabase & Webhooks".',
      });
    }
  };

  const supabaseCfg = StorageService.getSupabaseConfig();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Sincronização & Nuvem (Multi-Dispositivos)</h3>
              <p className="text-xs text-slate-400">
                Garanta que a Vercel, seu celular e o AI Studio tenham as mesmas subpáginas e métricas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert */}
        {statusMsg && (
          <div
            className={`mt-4 p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2 border ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                : statusMsg.type === 'error'
                ? 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                : 'bg-indigo-950/50 border-indigo-500/40 text-indigo-300'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="mt-5 space-y-6">
          {/* Method 1: Supabase Cloud Database */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Opção 1: Banco Supabase (Automático para Todos os Clientes)
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                supabaseCfg.isConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {supabaseCfg.isConnected ? 'Conectado' : 'Chave Anon Pendente'}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Quando você cadastra uma subpágina no Supabase, qualquer pessoa acessando pela Vercel vê a página instantaneamente.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handlePushSupabase}
                disabled={isLoading}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Enviar Todas as Subpáginas para o Supabase</span>
              </button>

              <button
                type="button"
                onClick={handlePullSupabase}
                disabled={isLoading}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Puxar Dados do Supabase</span>
              </button>
            </div>
          </div>

          {/* Method 2: 1-Click Fast Transfer between AI Studio and Vercel */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Opção 2: Transferência Direta Instantânea (1 Clique)
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Copie tudo o que você criou aqui no AI Studio e cole direto na Vercel para atualizar em 1 segundo:
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleCopyJson}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado para Área de Transferência!' : '1. Copiar Todas as 5 Subpáginas & Vendas'}</span>
              </button>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-400">
                  2. Para importar na Vercel: abra este mesmo botão lá e cole o conteúdo abaixo:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    placeholder="Cole aqui o código JSON copiado..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyImport}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shrink-0"
                  >
                    Restaurar / Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
