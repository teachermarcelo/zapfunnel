import React, { useState } from 'react';
import { 
  Sparkles, 
  Loader2, 
  X, 
  ShoppingBag, 
  Check, 
  Video, 
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { Product, LandingPageConfig } from '../../types';
import { StorageService } from '../../lib/storage';
import { SupabaseSyncService } from '../../lib/supabaseSync';

interface CreateNewPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPageCreated: (product: Product, page: LandingPageConfig) => void;
}

export const CreateNewPageModal: React.FC<CreateNewPageModalProps> = ({
  isOpen,
  onClose,
  onPageCreated,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Livros & Educação');
  const [price, setPrice] = useState('97.00');
  const [originalPrice, setOriginalPrice] = useState('297.00');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80');
  const [badge, setBadge] = useState('🔥 Oferta Especial');
  const [theme, setTheme] = useState<'emerald' | 'indigo' | 'dark' | 'amber' | 'rose'>('emerald');
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [deliveryUrl, setDeliveryUrl] = useState('');

  // AI loading
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  if (!isOpen) return null;

  const imagePresets = [
    { label: 'Ebook / Livro', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80' },
    { label: 'Emagrecimento / Fitness', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80' },
    { label: 'Mentoria / Negócios', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80' },
    { label: 'Cosméticos / Beleza', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80' },
    { label: 'Curso Tech / IA', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80' },
  ];

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(val));
    }
  };

  const handleGenerateWithAi = async () => {
    if (!name.trim()) {
      alert('Digite o nome do produto primeiro para a IA gerar a copy!');
      return;
    }
    setIsGeneratingAi(true);

    try {
      const response = await fetch('/api/ai/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: name,
          niche: category,
          audience: 'Pessoas buscando soluções práticas e comprovadas',
          offerDetails: `De R$ ${originalPrice} por apenas R$ ${price}`,
          tone: 'Altamente persuasivo, focado em conversão e urgência',
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        setHeadline(resData.data.headline || '');
        setSubheadline(resData.data.subheadline || '');
      } else {
        setHeadline(`Descubra Como Dominar ${name} e Multiplicar Seus Resultados em Tempo Recorde`);
        setSubheadline(`A metodologia passo a passo que mais de 3.200 clientes usam para ter sucesso garantido.`);
      }
    } catch {
      setHeadline(`Descubra Como Dominar ${name} e Multiplicar Seus Resultados em Tempo Recorde`);
      setSubheadline(`A metodologia passo a passo que mais de 3.200 clientes usam para ter sucesso garantido.`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const prodId = `prod_${Date.now()}`;
    const cleanSlug = slug.trim() || generateSlug(name);
    const parsedPrice = parseFloat(price) || 97;
    const parsedOriginal = parseFloat(originalPrice) || 297;

    const newProduct: Product = {
      id: prodId,
      name: name.trim(),
      slug: cleanSlug,
      price: parsedPrice,
      originalPrice: parsedOriginal,
      category,
      description: subheadline || `Página de vendas oficial para ${name}.`,
      imageUrl: imageUrl.trim(),
      badge,
      deliveryUrl: deliveryUrl.trim() || undefined,
      status: 'active',
      createdAt: new Date().toISOString(),
      salesCount: 0,
      revenue: 0,
    };

    const newLandingPage: LandingPageConfig = {
      id: `lp_${Date.now()}`,
      productId: prodId,
      slug: cleanSlug,
      title: `${name} - Página Oficial`,
      deliveryUrl: deliveryUrl.trim() || undefined,
      theme,
      hero: {
        badge: badge || '⚡ Oferta Especial por Tempo Limitado',
        headline: headline.trim() || `Conquiste Resultados Extraordinários com ${name}`,
        subheadline: subheadline.trim() || `O método validado que simplifica sua rotina e entrega resultados visíveis na primeira semana.`,
        ctaText: 'Quero Garantir Minha Vaga com Desconto',
        mediaType,
        mediaUrl: imageUrl.trim(),
        youtubeUrl: mediaType === 'video' ? youtubeUrl.trim() : undefined,
        socialProofCount: '+2.840 clientes satisfeitos',
      },
      benefits: [
        {
          id: 'b1',
          title: 'Acesso Instantâneo e Prático',
          description: 'Liberação imediata direto no seu WhatsApp e e-mail assim que confirmado.',
        },
        {
          id: 'b2',
          title: 'Método Passo a Passo Descomplicado',
          description: 'Criado para você executar sem perder tempo com teorias inúteis.',
        },
        {
          id: 'b3',
          title: 'Suporte VIP Direto no WhatsApp',
          description: 'Equipe dedicada para tirar suas dúvidas e garantir sua transformação.',
        },
      ],
      painPoints: [
        'Cansado de perder tempo com soluções que prometem muito e não entregam nada?',
        'Falta de clareza e excesso de informações confusas na internet?',
        'Dificuldade para manter a consistência e alcançar os resultados desejados?',
      ],
      featuresList: [
        'Acesso Completo e Ilimitado ao Conteúdo',
        'Arquivos e Materiais Práticos para Download',
        'Notificações e Avisos de Acesso no seu WhatsApp',
        'Garantia Incondicional de 7 Dias',
      ],
      testimonials: [
        {
          id: 't1',
          name: 'Lucas Ferreira',
          role: 'Cliente Verificado',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          comment: 'O suporte no WhatsApp foi impecável e o conteúdo superou todas as expectativas!',
          rating: 5,
          verified: true,
        },
      ],
      faqs: [
        {
          id: 'f1',
          question: 'Como recebo o acesso?',
          answer: 'Imediatamente após o Pix ou aprovação do cartão, você recebe a mensagem oficial no WhatsApp com o link.',
        },
        {
          id: 'f2',
          question: 'Tenho garantia?',
          answer: 'Sim, você tem garantia total de 7 dias com devolução integral do seu dinheiro se não ficar satisfeito.',
        },
      ],
      guaranteeDays: 7,
      countdownMinutes: 15,
      whatsappMessageCustom: `Olá {nome}! Seu pedido de *${name}* está pronto. Link exclusivo de pagamento: {link}`,
      whatsappRecovery1h: `Oi {nome}! O seu desconto especial para o *${name}* ainda está reservado por pouco tempo: {link}`,
      liveBuyersPopup: true,
      active: true,
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveProduct(newProduct);
    StorageService.saveLandingPage(newLandingPage);
    SupabaseSyncService.syncSingleProduct(newProduct, newLandingPage);

    onPageCreated(newProduct, newLandingPage);
    onClose();

    // Reset
    setName('');
    setSlug('');
    setHeadline('');
    setSubheadline('');
    setYoutubeUrl('');
    setDeliveryUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
                <span>Criar Nova Subpágina de Vendas</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  URL Própria
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Gere uma página exclusiva para qualquer produto com checkout transparente e WhatsApp integrado.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Product Name & AI Generator */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Nome do Produto ou Oferta *
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                required
                placeholder="Ex: Livro Foco Implacável, Método Seca Barriga, Mentoria High-Ticket"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleGenerateWithAi}
                disabled={isGeneratingAi}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isGeneratingAi ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isGeneratingAi ? 'Escrevendo...' : 'Gerar com IA'}</span>
              </button>
            </div>
          </div>

          {/* Slug & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Slug da Subpágina (URL da Campanha) *
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs">
                <span className="text-slate-500 mr-1 font-mono">/p/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="bg-transparent text-emerald-400 font-mono font-bold w-full focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Categoria / Nicho
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Livros & Educação">Livros & Educação (Ebooks)</option>
                <option value="Saúde & Emagrecimento">Saúde & Emagrecimento</option>
                <option value="Marketing & Negócios">Marketing & Negócios</option>
                <option value="Cosméticos & Beleza">Cosméticos & Beleza</option>
                <option value="Cursos & Treinamentos">Cursos & Treinamentos</option>
                <option value="Produto Físico">Produto Físico</option>
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Preço da Oferta (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Preço Original Âncora (De R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Media Switcher & YouTube */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Mídia Principal do Topo da Página
              </label>
              <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setMediaType('image')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mediaType === 'image' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Imagem / Mockup
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('video')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mediaType === 'video' ? 'bg-red-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Vídeo do YouTube
                </button>
              </div>
            </div>

            {mediaType === 'video' ? (
              <div>
                <label className="block text-xs font-semibold text-rose-400 uppercase mb-1">
                  Link do Vídeo no YouTube (Opcional - VSL de Vendas)
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Imagem do Produto (URL)
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-500 self-center mr-1">Presets:</span>
                  {imagePresets.map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => setImageUrl(preset.url)}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Delivery Access Link */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 space-y-1.5">
            <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Link de Acesso / Entrega Pós-Venda (Enviado no WhatsApp e E-mail)
            </label>
            <input
              type="text"
              value={deliveryUrl}
              onChange={(e) => setDeliveryUrl(e.target.value)}
              placeholder="Ex: https://drive.google.com/seulivro ou https://membros.seusite.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-400">
              O comprador recebe este link direto no WhatsApp e e-mail assim que o Pix ou cartão for aprovado.
            </p>
          </div>

          {/* Headline & Subheadline */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Headline Principal da Página
            </label>
            <textarea
              rows={2}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Ex: Descubra o Segredo para Eliminar Hábitos Negativos em 21 Dias..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Subheadline Explicativa
            </label>
            <textarea
              rows={2}
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              placeholder="Ex: A metodologia comprovada que mais de 3.000 pessoas usam diariamente para alcançar alta performance."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              Publicar Subpágina & Checkout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
