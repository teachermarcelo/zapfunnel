import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Zap, 
  CreditCard, 
  FileText, 
  Check, 
  Copy, 
  MessageCircle, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  Sparkles,
  Phone,
  User,
  Mail,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, Order } from '../../types';
import { StorageService } from '../../lib/storage';

interface ProprietaryCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onOrderCompleted?: (order: Order) => void;
  initialOrderId?: string;
}

export const ProprietaryCheckoutModal: React.FC<ProprietaryCheckoutModalProps> = ({
  isOpen,
  onClose,
  product,
  onOrderCompleted,
  initialOrderId,
}) => {
  // Step 1: Customer info; Step 2: Payment options
  const [step, setStep] = useState<'info' | 'payment'>('info');

  // Customer inputs
  const [customerName, setCustomerName] = useState('Marcelo Silveira');
  const [customerPhone, setCustomerPhone] = useState('(11) 98542-1190');
  const [customerEmail, setCustomerEmail] = useState('marcelo.silveira@gmail.com');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix');
  const [installments, setInstallments] = useState(1);

  // Credit card state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('789');
  const [cardHolder, setCardHolder] = useState('MARCELO SILVEIRA');

  // Generated order state
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [directWhatsAppUrl, setDirectWhatsAppUrl] = useState<string>('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccessPaid, setIsSuccessPaid] = useState(false);

  // 15-minute countdown
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins

  useEffect(() => {
    if (initialOrderId) {
      const existing = StorageService.getOrderById(initialOrderId);
      if (existing) {
        setCurrentOrder(existing);
        setCustomerName(existing.customerName);
        setCustomerPhone(existing.customerPhone);
        setCustomerEmail(existing.customerEmail);
        setPaymentMethod(existing.paymentMethod);
        setStep('payment');
        if (existing.status === 'paid') setIsSuccessPaid(true);
      }
    }
  }, [initialOrderId]);

  useEffect(() => {
    if (step === 'payment' && timeLeft > 0 && !isSuccessPaid) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft, isSuccessPaid]);

  if (!isOpen) return null;

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerPhone(formatPhone(e.target.value));
  };

  const handleGeneratePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerEmail) {
      alert('Por favor preencha todos os campos para receber o link no WhatsApp!');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const { order, directWhatsAppUrl: waUrl } = StorageService.createCheckoutOrder({
        product,
        customerName,
        customerPhone,
        customerEmail,
        paymentMethod,
        installments,
        utmSource: 'Checkout Próprio',
      });

      setCurrentOrder(order);
      setDirectWhatsAppUrl(waUrl);
      setIsProcessing(false);
      setStep('payment');

      if (onOrderCompleted) onOrderCompleted(order);
    }, 600);
  };

  const handleCopyPix = () => {
    if (currentOrder?.pixCode) {
      navigator.clipboard.writeText(currentOrder.pixCode);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    }
  };

  const handleSimulatePaymentApproval = () => {
    if (!currentOrder) return;
    setIsProcessing(true);

    setTimeout(() => {
      StorageService.markOrderAsPaid(currentOrder.id);
      setIsProcessing(false);
      setIsSuccessPaid(true);

      // Trigger celebratory confetti!
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.error(err);
      }
    }, 800);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTimer = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative my-6">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950/60 p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5 fill-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-white text-base">Checkout Seguro</span>
                <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  Aviso no WhatsApp
                </span>
              </div>
              <p className="text-xs text-slate-400">{product.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Summary Bar */}
        <div className="bg-slate-950/80 px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ambiente Criptografado SSL 256-bit</span>
          </div>
          <div className="font-bold text-white">
            Total:{' '}
            <span className="text-emerald-400 text-sm">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* SUCCESS SCREEN */}
          {isSuccessPaid ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-white">Pagamento Confirmado! 🎉</h2>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Parabéns, <b>{customerName}</b>! O comprovante oficial e seu acesso para <b>{product.name}</b> foram enviados agora mesmo para seu WhatsApp:
              </p>
              <div className="font-mono text-sm font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 py-2 px-4 rounded-xl inline-block">
                {customerPhone}
              </div>

              {/* Delivery Access Button */}
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 text-left space-y-2.5 my-3">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  🚀 Seu Link de Acesso Liberado:
                </span>
                <a
                  href={product.deliveryUrl || 'https://drive.google.com/sample-acesso-produto'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Acessar Conteúdo do Produto Agora</span>
                </a>
                <p className="text-[10px] text-slate-400 text-center">
                  O link também foi enviado para seu WhatsApp ({customerPhone}) e seu e-mail ({customerEmail}).
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/55${customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Olá! Meu pedido ${currentOrder?.id} de ${product.name} foi aprovado! Link de acesso: ${product.deliveryUrl || 'https://drive.google.com/sample-acesso'}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Ver Recibo no WhatsApp</span>
                </a>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Fechar Janela
                </button>
              </div>
            </div>
          ) : step === 'info' ? (
            /* STEP 1: CAPTURE WHATSAPP & INFO */
            <form onSubmit={handleGeneratePayment} className="space-y-4">
              <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-300 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Insira seu WhatsApp abaixo para <b>receber o link de pagamento instantaneamente</b> no seu celular e garantir o valor promocional!
                </span>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo de Souza"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* WhatsApp Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1 flex items-center justify-between">
                  <span>WhatsApp com DDD *</span>
                  <span className="text-[10px] text-emerald-400 font-normal">Link enviado direto no app</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="(11) 98765-4321"
                    value={customerPhone}
                    onChange={handlePhoneChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-emerald-400 font-mono font-bold placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Seu Melhor E-mail *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="seuemail@exemplo.com.br"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                  Escolha Como Deseja Pagar:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                      paymentMethod === 'pix'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Zap className="w-5 h-5 fill-current" />
                    <span className="text-[11px] font-bold">Pix Dinâmico</span>
                    <span className="text-[9px] text-emerald-400">Imediato</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                      paymentMethod === 'credit_card'
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 ring-2 ring-cyan-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-[11px] font-bold">Cartão Stripe</span>
                    <span className="text-[9px] text-cyan-400">Até 12x</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('boleto')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                      paymentMethod === 'boleto'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400 ring-2 ring-amber-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-[11px] font-bold">Boleto</span>
                    <span className="text-[9px] text-slate-500">1 a 3 dias</span>
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Gerar Link & Receber no WhatsApp</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: DYNAMIC PAYMENT & WHATSAPP ALERT */
            <div className="space-y-6">
              {/* WhatsApp notification banner */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Link enviado para seu WhatsApp!</span>
                    <span className="text-[11px] text-emerald-300 font-mono">{customerPhone}</span>
                  </div>
                </div>

                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] flex items-center space-x-1 shrink-0 hover:bg-emerald-400 transition-colors"
                >
                  <span>Abrir Zap</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* PIX VIEW */}
              {paymentMethod === 'pix' && currentOrder && (
                <div className="space-y-4 text-center">
                  <div className="flex items-center justify-center space-x-1 text-xs text-amber-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Código expira em: <b>{formattedTimer}</b></span>
                  </div>

                  {/* Render True SVG QR Code */}
                  <div className="bg-white p-3 rounded-2xl w-56 h-56 mx-auto shadow-2xl flex items-center justify-center">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: currentOrder.pixQrCodeSvg || '',
                      }}
                    />
                  </div>

                  <p className="text-xs text-slate-400">
                    Abra o app do seu banco, escolha <b>Pagar com Pix &rarr; Pix Copia e Cola</b>:
                  </p>

                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={currentOrder.pixCode || ''}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-300 pr-24 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1 transition-all cursor-pointer"
                    >
                      {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSimulatePaymentApproval}
                      disabled={isProcessing}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Simular Pagamento Pix Aprovado</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* CREDIT CARD VIEW (Stripe simulator) */}
              {paymentMethod === 'credit_card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Número do Cartão de Crédito
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Validade (MM/AA)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Código CVC
                      </label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Parcelamento no Cartão
                    </label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      {[1, 2, 3, 4, 6, 10, 12].map((inst) => {
                        const valPerInst = (product.price / inst).toFixed(2).replace('.', ',');
                        return (
                          <option key={inst} value={inst}>
                            {inst}x de R$ {valPerInst} sem juros (Total: R$ {product.price.toFixed(2).replace('.', ',')})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulatePaymentApproval}
                    disabled={isProcessing}
                    className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pagar R$ {product.price.toFixed(2).replace('.', ',')} com Cartão Seguro</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* BOLETO VIEW */}
              {paymentMethod === 'boleto' && currentOrder && (
                <div className="space-y-4 text-center">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-left space-y-2">
                    <span className="text-[11px] font-bold text-amber-400 uppercase">Linha Digitável:</span>
                    <div className="font-mono text-xs text-white bg-slate-900 p-2.5 rounded border border-slate-800 break-all select-all">
                      {currentOrder.boletoBarcode}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400">
                    O boleto foi gerado e enviado para seu e-mail e WhatsApp. A compensação ocorre em até 3 dias úteis.
                  </p>

                  <button
                    type="button"
                    onClick={handleSimulatePaymentApproval}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    Simular Compensação de Boleto
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
