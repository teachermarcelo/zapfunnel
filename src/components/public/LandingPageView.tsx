import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Star, 
  ArrowRight, 
  Lock, 
  Zap, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  ArrowLeft,
  ShoppingBag
} from 'lucide-react';
import { LandingPageConfig, Product } from '../../types';
import { extractYouTubeId } from '../../lib/youtubeHelper';

interface LandingPageViewProps {
  page: LandingPageConfig;
  product: Product;
  onOpenCheckout: (product: Product) => void;
  onBackToAdmin: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  page,
  product,
  onOpenCheckout,
  onBackToAdmin,
}) => {
  const [openFaqId, setOpenFaqId] = useState<string | null>(page.faqs[0]?.id || null);
  const [timeLeft, setTimeLeft] = useState(page.countdownMinutes * 60);
  const [showBuyerPopup, setShowBuyerPopup] = useState(false);
  const [buyerPopupData, setBuyerPopupData] = useState({ name: 'Lucas S.', city: 'São Paulo, SP' });

  // Urgency Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live Buyer Popups
  useEffect(() => {
    if (!page.liveBuyersPopup) return;
    const buyers = [
      { name: 'Lucas S.', city: 'São Paulo, SP' },
      { name: 'Mariana C.', city: 'Rio de Janeiro, RJ' },
      { name: 'Rodrigo M.', city: 'Belo Horizonte, MG' },
      { name: 'Beatriz L.', city: 'Curitiba, PR' },
      { name: 'Thiago F.', city: 'Campinas, SP' },
    ];

    const interval = setInterval(() => {
      const randomBuyer = buyers[Math.floor(Math.random() * buyers.length)];
      setBuyerPopupData(randomBuyer);
      setShowBuyerPopup(true);
      setTimeout(() => setShowBuyerPopup(false), 4500);
    }, 12000);

    return () => clearInterval(interval);
  }, [page.liveBuyersPopup]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTimer = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Theme accent colors
  const themeColors = {
    emerald: {
      primary: 'from-emerald-500 to-teal-500',
      badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      btn: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 shadow-emerald-500/30',
      accentText: 'text-emerald-400',
      borderAccent: 'border-emerald-500/30',
    },
    indigo: {
      primary: 'from-indigo-500 to-purple-600',
      badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      btn: 'bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-400 text-white shadow-indigo-500/30',
      accentText: 'text-indigo-400',
      borderAccent: 'border-indigo-500/30',
    },
    dark: {
      primary: 'from-slate-700 to-slate-900',
      badge: 'bg-slate-800 text-slate-200 border-slate-700',
      btn: 'bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950 shadow-white/10',
      accentText: 'text-slate-200',
      borderAccent: 'border-slate-700',
    },
    amber: {
      primary: 'from-amber-500 to-yellow-600',
      badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      btn: 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 text-slate-950 shadow-amber-500/30',
      accentText: 'text-amber-400',
      borderAccent: 'border-amber-500/30',
    },
    rose: {
      primary: 'from-rose-500 to-pink-600',
      badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      btn: 'bg-gradient-to-r from-rose-500 via-pink-600 to-rose-400 text-white shadow-rose-500/30',
      accentText: 'text-rose-400',
      borderAccent: 'border-rose-500/30',
    },
  }[page.theme || 'emerald'];

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 pb-20">
      {/* Top Floating Admin Return Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs sticky top-0 z-40">
        <button
          onClick={onBackToAdmin}
          className="flex items-center space-x-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">Voltar ao Painel Administrativo</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="hidden sm:inline text-slate-400 font-mono text-[11px]">
            URL da Campanha: /p/{page.slug}
          </span>
          <button
            onClick={() => onOpenCheckout(product)}
            className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors cursor-pointer"
          >
            Abrir Checkout Próprio
          </button>
        </div>
      </div>

      {/* Urgency Countdown Ribbon */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-rose-600 text-white py-2 px-4 text-center text-xs font-bold tracking-wide shadow-md flex items-center justify-center space-x-2">
        <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
        <span>ATENÇÃO: Desconto especial com confirmação no WhatsApp encerra em:</span>
        <span className="bg-black/40 px-2.5 py-0.5 rounded font-mono font-black text-sm tracking-widest text-amber-300">
          {formattedTimer}
        </span>
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold border shadow-sm backdrop-blur-sm animate-pulse"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{page.hero.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            {page.hero.headline}
          </h1>

          {/* Subheadline */}
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            {page.hero.subheadline}
          </p>

          {/* Stars & Social Proof */}
          <div className="flex items-center justify-center space-x-2 pt-1">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="text-xs font-bold text-white">4.9 / 5.0</span>
            <span className="text-xs text-slate-400">• {page.hero.socialProofCount}</span>
          </div>

          {/* Hero CTA Button */}
          <div className="pt-4">
            <button
              onClick={() => onOpenCheckout(product)}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center space-x-3 shadow-2xl transition-all cursor-pointer transform hover:scale-105 active:scale-95 ${themeColors.btn}`}
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>{page.hero.ctaText}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Acesso imediato enviado no seu WhatsApp e E-mail</span>
            </p>
          </div>
        </div>

        {/* Hero Media / YouTube Video / Mockup Box */}
        <div className="mt-12 max-w-4xl mx-auto relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all" />
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-2 sm:p-4">
            {page.hero.mediaType === 'video' && page.hero.youtubeUrl ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-slate-800">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${extractYouTubeId(page.hero.youtubeUrl) || 'dQw4w9WgXcQ'}?rel=0&modestbranding=1&playsinline=1`}
                  title={product.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <img
                src={page.hero.mediaUrl}
                alt={product.name}
                className="w-full h-80 sm:h-[420px] object-cover rounded-2xl shadow-inner"
              />
            )}

            {/* Floating Guarantee Tag */}
            <div className="absolute bottom-6 right-6 bg-slate-950/90 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-3 shadow-2xl flex items-center space-x-3 pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-white block">Garantia Blindada</span>
                <span className="text-[11px] text-emerald-400">{page.guaranteeDays} Dias Incondicionais</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAIN POINTS SECTION */}
      {page.painPoints && page.painPoints.length > 0 && (
        <section className="py-16 bg-slate-900/60 border-y border-slate-800 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Você se identifica com algum desses problemas?
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Se você enfrenta alguma dessas dificuldades no seu dia a dia:
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {page.painPoints.map((pain, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl shadow-lg flex items-start space-x-3"
                >
                  <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    ✕
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">{pain}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BENEFITS / MODULES SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${themeColors.accentText}`}>
            Transformação Comprovada
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            O Que Você Vai Conquistar a Partir de Hoje
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Desenvolvido para eliminar o atrito e entregar o resultado no menor tempo possível.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {page.benefits.map((benefit, i) => (
            <div
              key={benefit.id || i}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 relative group hover:border-slate-700 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base">
                0{i + 1}
              </div>
              <h3 className="font-extrabold text-white text-base leading-snug">
                {benefit.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING ANCHOR SECTION */}
      <section className="py-16 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 sm:px-6">
        <div className="max-w-xl mx-auto bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-1">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-md">
              Acesso Imediato Liberado
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white pt-2">{product.name}</h3>
          </div>

          {/* Pricing Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-xs text-slate-400 line-through">
              De R$ {product.originalPrice.toFixed(2).replace('.', ',')}
            </div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Por apenas 12x de:
            </div>
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              R$ {(product.price / 12).toFixed(2).replace('.', ',')}
            </div>
            <div className="text-xs text-slate-400 font-medium">
              ou R$ {product.price.toFixed(2).replace('.', ',')} à vista no Pix Dinâmico
            </div>
          </div>

          {/* Features list */}
          <div className="space-y-2.5 text-left text-xs text-slate-300">
            {page.featuresList.map((feat, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Buy CTA */}
          <div className="pt-2">
            <button
              onClick={() => onOpenCheckout(product)}
              className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center space-x-2 shadow-2xl transition-all cursor-pointer transform hover:scale-105 active:scale-95 ${themeColors.btn}`}
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>Garantir Meu Acesso no WhatsApp</span>
            </button>
            <p className="text-[11px] text-slate-400 mt-2">
              Seu link exclusivo e comprovante chegam na hora pelo WhatsApp
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {page.testimonials && page.testimonials.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Depoimentos Reais
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              O Que Dizem Nossos Clientes Satisfeitos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {page.testimonials.map((test) => (
              <div
                key={test.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={test.avatar}
                    alt={test.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/40"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{test.name}</h4>
                    <span className="text-[11px] text-slate-400">{test.role}</span>
                  </div>
                </div>

                <div className="flex text-amber-400">
                  {[...Array(test.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{test.comment}"
                </p>

                <div className="pt-2 border-t border-slate-800/60 flex items-center space-x-1.5 text-[10px] text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Compra Verificada via WhatsApp</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ SECTION */}
      {page.faqs && page.faqs.length > 0 && (
        <section className="py-16 px-4 sm:px-6 max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Dúvidas Frequentes
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Perguntas e Respostas
            </h2>
          </div>

          <div className="space-y-3">
            {page.faqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-4 text-left font-bold text-sm text-white flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* LIVE BUYER POPUP */}
      {showBuyerPopup && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 z-40 bg-slate-900 border border-emerald-500/30 rounded-2xl p-3 shadow-2xl flex items-center space-x-3 animate-fade-in text-xs max-w-xs">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white">{buyerPopupData.name} comprou agora!</div>
            <div className="text-[10px] text-slate-400">{buyerPopupData.city} • via Pix</div>
          </div>
        </div>
      )}

      {/* STICKY MOBILE CTA BAR */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 p-3 backdrop-blur-md flex items-center justify-between">
        <div>
          <div className="text-[10px] text-slate-400 line-through">
            R$ {product.originalPrice.toFixed(2).replace('.', ',')}
          </div>
          <div className="text-base font-extrabold text-emerald-400 leading-tight">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </div>
        </div>

        <button
          onClick={() => onOpenCheckout(product)}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-lg ${themeColors.btn}`}
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Comprar no WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
