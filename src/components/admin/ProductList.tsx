import React, { useState } from 'react';
import { 
  Plus, 
  Sparkles, 
  Copy, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Check, 
  ShoppingBag, 
  Tag, 
  Zap,
  Globe,
  Loader2
} from 'lucide-react';
import { Product, LandingPageConfig } from '../../types';
import { StorageService } from '../../lib/storage';

interface ProductListProps {
  products: Product[];
  landingPages: LandingPageConfig[];
  onSelectProductPage: (slug: string) => void;
  onEditPage: (page: LandingPageConfig) => void;
  onOpenCheckoutModal: (product: Product) => void;
  onRefreshData: () => void;
  isNewModalOpen: boolean;
  setIsNewModalOpen: (open: boolean) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  landingPages,
  onSelectProductPage,
  onEditPage,
  onOpenCheckoutModal,
  onRefreshData,
  isNewModalOpen,
  setIsNewModalOpen,
}) => {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // New Product Modal State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Infoproduto');
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
  
  // AI generation loading
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Presets
  const imagePresets = [
    { label: 'Ebook / Livro', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80' },
    { label: 'Emagrecimento / Fitness', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80' },
    { label: 'Mentoria / Negócios', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80' },
    { label: 'Cosméticos / Beleza', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80' },
    { label: 'Curso Tech / IA', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80' },
  ];

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(val));
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const copyUrl = (targetSlug: string) => {
    const url = `${window.location.origin}/?slug=${targetSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(targetSlug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleGenerateWithAi = async () => {
    if (!name.trim()) {
      alert('Digite o nome do produto primeiro para a IA gerar a copy!');
      return;
    }
    setIsGeneratingAi(true);
    setAiError(null);

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
        // Fallback
        setHeadline(`Descubra Como Dominar ${name} e Multiplicar Seus Resultados em Tempo Recorde`);
        setSubheadline(`A metodologia passo a passo que mais de 3.200 clientes usam para ter sucesso garantido.`);
      }
    } catch (err: any) {
      console.error('Error generating with AI:', err);
      setHeadline(`Descubra Como Dominar ${name} e Multiplicar Seus Resultados em Tempo Recorde`);
      setSubheadline(`A metodologia passo a passo que mais de 3.200 clientes usam para ter sucesso garantido.`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
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
    onRefreshData();
    setIsNewModalOpen(false);

    // Reset form
    setName('');
    setSlug('');
    setHeadline('');
    setSubheadline('');
  };

  const handleDelete = (id: string, prodName: string) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${prodName}" e sua subpágina de vendas?`)) {
      StorageService.deleteProduct(id);
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-emerald-400" />
            <span>Subpáginas de Vendas ({products.length})</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Crie e personalize páginas de vendas únicas para cada produto (livro, emagrecimento, curso, suplemento) com URLs personalizadas.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Subpágina</span>
        </button>
      </div>

      {/* Grid of Products / Pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {products.map((product) => {
          const lp = landingPages.find((l) => l.productId === product.id) || landingPages.find((l) => l.slug === product.slug);
          const fullUrl = `${window.location.origin}/?slug=${product.slug}`;

          return (
            <div
              key={product.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    {product.badge || product.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] text-slate-400 font-medium">Página Ativa</span>
                  </div>
                </div>

                {/* Main Product Info */}
                <div className="flex space-x-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-24 h-24 rounded-xl object-cover border border-slate-700 shrink-0 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-white text-base leading-snug line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center space-x-2 pt-1">
                      <span className="text-lg font-black text-emerald-400">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-xs text-slate-500 line-through">
                        R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {product.salesCount} vendas • R$ {product.revenue.toFixed(2)} faturados
                    </div>
                  </div>
                </div>

                {/* Dedicated URL box */}
                <div className="mt-4 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate mr-2">
                    <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-mono text-xs text-slate-300 truncate">
                      {window.location.host}/?slug={product.slug}
                    </span>
                  </div>
                  <button
                    onClick={() => copyUrl(product.slug)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
                    title="Copiar link para campanhas de anúncios"
                  >
                    {copiedSlug === product.slug ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectProductPage(product.slug)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ver Pública</span>
                  </button>

                  {lp && (
                    <button
                      onClick={() => onEditPage(lp)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar Página</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenCheckoutModal(product)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    Testar Checkout
                  </button>

                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Excluir Subpágina"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create New Subpage / Product */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span>Criar Nova Subpágina de Vendas</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Gere uma página exclusiva para qualquer produto com checkout próprio e avisos de WhatsApp.
                </p>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="mt-6 space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Nome do Produto ou Oferta *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Livro Foco Implacável, Seca Barriga Turbo, etc."
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateWithAi}
                    disabled={isGeneratingAi}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingAi ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>{isGeneratingAi ? 'Gerando...' : 'Gerar Copy com IA'}</span>
                  </button>
                </div>
              </div>

              {/* Slug & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Slug / URL da Página *
                  </label>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs">
                    <span className="text-slate-500 mr-1">/p/</span>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="bg-transparent text-emerald-400 font-mono w-full focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Nicho / Categoria
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
                    Preço Original / Âncora (De R$)
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

              {/* Theme & Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Tema Visual da Página
                  </label>
                  <div className="flex space-x-2">
                    {(['emerald', 'indigo', 'dark', 'amber', 'rose'] as const).map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`h-8 flex-1 rounded-lg border text-[11px] font-bold capitalize transition-all ${
                          theme === t
                            ? 'border-white ring-2 ring-emerald-500 scale-105'
                            : 'border-slate-800 opacity-70 hover:opacity-100'
                        } ${
                          t === 'emerald'
                            ? 'bg-emerald-600 text-white'
                            : t === 'indigo'
                            ? 'bg-indigo-600 text-white'
                            : t === 'dark'
                            ? 'bg-slate-950 text-slate-200 border-slate-700'
                            : t === 'amber'
                            ? 'bg-amber-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Badge de Destaque
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Ex: Mais Vendido, Vagas Limitadas"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Headline & Subheadline (AI generated or manual) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Título Principal da Landing Page (Headline)
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
                  Subtítulo Explicativo (Subheadline)
                </label>
                <textarea
                  rows={2}
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  placeholder="Ex: A metodologia comprovada que mais de 2.000 pessoas usam diariamente para alcançar alta performance."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Media Type Switcher & Media Fields */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-white uppercase tracking-wider">
                    Mídia de Destaque
                  </label>
                  <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setMediaType('image')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                        mediaType === 'image' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                      }`}
                    >
                      Imagem
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaType('video')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
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
                      Link do Vídeo no YouTube (Opcional)
                    </label>
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
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

              {/* Delivery / Access URL */}
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-1.5">
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Link de Acesso / Entrega Pós-Venda (WhatsApp & E-mail)
                </label>
                <input
                  type="text"
                  value={deliveryUrl}
                  onChange={(e) => setDeliveryUrl(e.target.value)}
                  placeholder="Ex: https://drive.google.com/seulivro ou https://membros.seusite.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-400">
                  Enviado instantaneamente para o WhatsApp e e-mail do cliente assim que o pagamento for aprovado.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
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
      )}
    </div>
  );
};
