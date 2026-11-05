import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  ExternalLink, 
  Eye, 
  Plus, 
  Trash2, 
  Check, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  Layers, 
  HelpCircle,
  Loader2
} from 'lucide-react';
import { LandingPageConfig, Product } from '../../types';
import { StorageService } from '../../lib/storage';

interface PageEditorProps {
  page: LandingPageConfig;
  product?: Product;
  onBack: () => void;
  onPreview: (slug: string) => void;
  onSaveSuccess: () => void;
}

export const PageEditor: React.FC<PageEditorProps> = ({
  page: initialPage,
  product,
  onBack,
  onPreview,
  onSaveSuccess,
}) => {
  const [formData, setFormData] = useState<LandingPageConfig>({ ...initialPage });
  const [activeTab, setActiveTab] = useState<'hero' | 'benefits' | 'whatsapp' | 'testimonials' | 'faq' | 'ai'>('hero');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const handleHeroChange = (field: keyof typeof formData.hero, val: any) => {
    setFormData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: val,
      },
    }));
  };

  const handleAddBenefit = () => {
    setFormData((prev) => ({
      ...prev,
      benefits: [
        ...prev.benefits,
        {
          id: `b_${Date.now()}`,
          title: 'Novo Benefício Transformador',
          description: 'Explique claramente como isso resolve o problema do seu cliente de forma rápida.',
        },
      ],
    }));
  };

  const handleRemoveBenefit = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((b) => b.id !== id),
    }));
  };

  const handleUpdateBenefit = (id: string, field: 'title' | 'description', val: string) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.map((b) => (b.id === id ? { ...b, [field]: val } : b)),
    }));
  };

  const handleAddFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        {
          id: `f_${Date.now()}`,
          question: 'Pergunta frequente do cliente?',
          answer: 'Resposta objetiva e clara explicando o processo e tranquilizando o comprador.',
        },
      ],
    }));
  };

  const handleRemoveFaq = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((f) => f.id !== id),
    }));
  };

  const handleUpdateFaq = (id: string, field: 'question' | 'answer', val: string) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.map((f) => (f.id === id ? { ...f, [field]: val } : f)),
    }));
  };

  const handleGenerateAiCopy = async () => {
    setIsGeneratingAi(true);
    try {
      const response = await fetch('/api/ai/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product?.name || formData.title,
          niche: product?.category || 'Infoproduto',
          audience: 'Compradores de alta intenção',
          offerDetails: `Oferta com entrega instantânea e avisos no WhatsApp`,
          tone: 'Altamente persuasivo, direto ao ponto e focado em checkout rápido',
        }),
      });

      const res = await response.json();
      if (res.success && res.data) {
        setFormData((prev) => ({
          ...prev,
          hero: {
            ...prev.hero,
            headline: res.data.headline || prev.hero.headline,
            subheadline: res.data.subheadline || prev.hero.subheadline,
          },
          painPoints: res.data.painPoints || prev.painPoints,
          whatsappMessageCustom: res.data.whatsappNotificationText || prev.whatsappMessageCustom,
          whatsappRecovery1h: res.data.whatsappRecoveryText1h || prev.whatsappRecovery1h,
          benefits: res.data.bulletPoints
            ? res.data.bulletPoints.map((bp: string, i: number) => ({
                id: `ai_b_${i}`,
                title: bp.split(':')[0] || `Benefício ${i + 1}`,
                description: bp.split(':')[1] || bp,
              }))
            : prev.benefits,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSave = () => {
    StorageService.saveLandingPage(formData);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
    onSaveSuccess();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border border-emerald-400 animate-bounce">
          <Check className="w-5 h-5" />
          <span>Página de vendas salva com sucesso!</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-extrabold text-white">{formData.title}</h1>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                /p/{formData.slug}
              </span>
            </div>
            <p className="text-xs text-slate-400">Editor Visual & Automações de Conversão</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPreview(formData.slug)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-400" />
            <span>Ver Pública</span>
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'hero' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Apresentação & Hero</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'ai' ? 'bg-purple-600 text-white font-bold' : 'bg-slate-900 text-purple-400 hover:text-purple-300'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Copilot com IA</span>
        </button>

        <button
          onClick={() => setActiveTab('benefits')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'benefits' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>Benefícios ({formData.benefits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'whatsapp' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Mensagens no WhatsApp</span>
        </button>

        <button
          onClick={() => setActiveTab('testimonials')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'testimonials' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Depoimentos & Prova</span>
        </button>

        <button
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'faq' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>FAQ ({formData.faqs.length})</span>
        </button>
      </div>

      {/* Tab: Hero & Visual */}
      {activeTab === 'hero' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white">Hero & Apresentação Principal</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Badge Superior de Urgência
              </label>
              <input
                type="text"
                value={formData.hero.badge}
                onChange={(e) => handleHeroChange('badge', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Texto do Botão de Compra (CTA)
              </label>
              <input
                type="text"
                value={formData.hero.ctaText}
                onChange={(e) => handleHeroChange('ctaText', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Headline Principal (Título de Alta Conversão)
            </label>
            <textarea
              rows={3}
              value={formData.hero.headline}
              onChange={(e) => handleHeroChange('headline', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Subheadline (Subtítulo Explicativo)
            </label>
            <textarea
              rows={2}
              value={formData.hero.subheadline}
              onChange={(e) => handleHeroChange('subheadline', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Media Type & YouTube URL */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider">
                  Mídia Principal da Página (Imagem ou Vídeo do YouTube)
                </label>
                <p className="text-[11px] text-slate-400">
                  Escolha se deseja exibir uma foto/mockup do produto ou incorporar um vídeo de vendas (VSL) do YouTube.
                </p>
              </div>

              <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleHeroChange('mediaType', 'image')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    formData.hero.mediaType === 'image'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Imagem / Mockup
                </button>
                <button
                  type="button"
                  onClick={() => handleHeroChange('mediaType', 'video')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    formData.hero.mediaType === 'video'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Vídeo do YouTube (VSL)
                </button>
              </div>
            </div>

            {formData.hero.mediaType === 'video' ? (
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label className="block text-xs font-semibold text-rose-400 uppercase flex items-center justify-between">
                  <span>Link do Vídeo no YouTube (Opcional) *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Suporta links normais, shorts ou youtu.be</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ ou https://youtu.be/..."
                  value={formData.hero.youtubeUrl || ''}
                  onChange={(e) => handleHeroChange('youtubeUrl', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
                <p className="text-[11px] text-slate-400">
                  O vídeo será incorporado responsivamente no topo da página de vendas com controles de alta conversão.
                </p>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-300 uppercase">
                  URL da Imagem ou Mockup do Produto
                </label>
                <input
                  type="text"
                  value={formData.hero.mediaUrl}
                  onChange={(e) => handleHeroChange('mediaUrl', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Product Delivery / Access URL */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-5 space-y-2">
            <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
              <span>Link de Acesso / Entrega Pós-Venda (Enviado no WhatsApp e E-mail)</span>
              <span className="text-[10px] text-slate-400 font-normal">Google Drive, Notion, Hotmart, Área de Membros, etc.</span>
            </label>
            <input
              type="text"
              placeholder="Ex: https://drive.google.com/file/d/seulivro/view ou https://membros.seusite.com"
              value={formData.deliveryUrl || ''}
              onChange={(e) => setFormData((p) => ({ ...p, deliveryUrl: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-400">
              Assim que o comprador pagar o Pix ou cartão de crédito, este link é <b>enviado automaticamente no WhatsApp dele</b> e exibido na tela de recibo!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Contador de Clientes (Prova Social)
              </label>
              <input
                type="text"
                value={formData.hero.socialProofCount}
                onChange={(e) => handleHeroChange('socialProofCount', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Minutos do Timer de Urgência
              </label>
              <input
                type="number"
                value={formData.countdownMinutes}
                onChange={(e) => setFormData((p) => ({ ...p, countdownMinutes: parseInt(e.target.value) || 15 }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Dias de Garantia
              </label>
              <input
                type="number"
                value={formData.guaranteeDays}
                onChange={(e) => setFormData((p) => ({ ...p, guaranteeDays: parseInt(e.target.value) || 7 }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Tema de Cor
              </label>
              <select
                value={formData.theme}
                onChange={(e) => setFormData((p) => ({ ...p, theme: e.target.value as any }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="emerald">Verde Esmeralda (Alta Conversão)</option>
                <option value="indigo">Índigo / Roxo Tecnológico</option>
                <option value="dark">Dark Minimalista</option>
                <option value="amber">Âmbar & Ouro Luxury</option>
                <option value="rose">Rosa / Saúde & Beleza</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab: AI Copilot */}
      {activeTab === 'ai' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Gerador de Copy com IA (Gemini 3.8 Flash)</span>
              </h2>
              <p className="text-xs text-slate-400">
                A IA analisa o nicho do produto e reescreve a headline, benefícios, dores do cliente e mensagens de WhatsApp para máxima conversão.
              </p>
            </div>

            <button
              onClick={handleGenerateAiCopy}
              disabled={isGeneratingAi}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isGeneratingAi ? 'Escrevendo com IA...' : 'Gerar Toda a Copy Agora'}</span>
            </button>
          </div>

          <div className="bg-slate-950 border border-purple-500/20 rounded-xl p-4 text-xs text-slate-300 space-y-2">
            <div className="font-semibold text-purple-300 flex items-center space-x-1.5">
              <span>🚀 O que a IA fará:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Criará uma Headline com gatilhos de benefício imediato e curiosidade</li>
              <li>Estruturará 3 a 4 benefícios transformadores prontos para a landing page</li>
              <li>Gerará a mensagem automática de aviso de pedido para enviar ao WhatsApp do cliente</li>
              <li>Criará a mensagem de recuperação de carrinho abandonado após 1 hora</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab: Benefits */}
      {activeTab === 'benefits' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Benefícios & O que Está Incluso</h2>
              <p className="text-xs text-slate-400">Destaque os principais diferenciais da sua oferta</p>
            </div>
            <button
              onClick={handleAddBenefit}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Benefício</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.benefits.map((benefit, idx) => (
              <div key={benefit.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">Benefício #{idx + 1}</span>
                  <button
                    onClick={() => handleRemoveBenefit(benefit.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={benefit.title}
                  onChange={(e) => handleUpdateBenefit(benefit.id, 'title', e.target.value)}
                  placeholder="Título do Benefício"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-white"
                />
                <textarea
                  rows={2}
                  value={benefit.description}
                  onChange={(e) => handleUpdateBenefit(benefit.id, 'description', e.target.value)}
                  placeholder="Descrição explicativa do benefício"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: WhatsApp Messages */}
      {activeTab === 'whatsapp' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span>Modelos de Mensagens no WhatsApp do Cliente</span>
            </h2>
            <p className="text-xs text-slate-400">
              Configure as mensagens automáticas enviadas para o número de WhatsApp informado no checkout.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Mensagem Instantânea (Ao Inserir WhatsApp no Checkout)
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Tags disponíveis: <code className="text-emerald-400 font-mono">&#123;nome&#125;</code>, <code className="text-emerald-400 font-mono">&#123;link&#125;</code>
            </p>
            <textarea
              rows={4}
              value={formData.whatsappMessageCustom}
              onChange={(e) => setFormData((p) => ({ ...p, whatsappMessageCustom: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Mensagem de Recuperação Automática de 1 Hora (Carrinho Abandonado)
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Disparada automaticamente se o cliente não pagar o Pix ou cartão dentro de 60 minutos.
            </p>
            <textarea
              rows={4}
              value={formData.whatsappRecovery1h}
              onChange={(e) => setFormData((p) => ({ ...p, whatsappRecovery1h: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-amber-400 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Tab: FAQs */}
      {activeTab === 'faq' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Perguntas Frequentes (FAQ)</h2>
              <p className="text-xs text-slate-400">Tire as dúvidas mais comuns para eliminar objeções de compra</p>
            </div>
            <button
              onClick={handleAddFaq}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Pergunta</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.faqs.map((faq, idx) => (
              <div key={faq.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400">Dúvida #{idx + 1}</span>
                  <button
                    onClick={() => handleRemoveFaq(faq.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => handleUpdateFaq(faq.id, 'question', e.target.value)}
                  placeholder="Ex: Como recebo o link de pagamento?"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-white"
                />
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => handleUpdateFaq(faq.id, 'answer', e.target.value)}
                  placeholder="Resposta explicativa para acalmar o comprador"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Testimonials */}
      {activeTab === 'testimonials' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white">Depoimentos & Prova Social</h2>
          <p className="text-xs text-slate-400">Reviews reais que aumentam a confiança do checkout</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.testimonials.map((test) => (
              <div key={test.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={test.avatar}
                    alt={test.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <div className="font-bold text-white text-xs">{test.name}</div>
                    <div className="text-[10px] text-slate-400">{test.role}</div>
                  </div>
                </div>
                <p className="text-xs text-slate-300 italic">"{test.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
