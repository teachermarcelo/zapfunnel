export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  category: string;
  description: string;
  imageUrl: string;
  badge?: string;
  status: 'active' | 'draft';
  deliveryUrl?: string;
  createdAt: string;
  salesCount: number;
  revenue: number;
}

export interface LandingPageConfig {
  id: string;
  productId: string;
  slug: string;
  title: string;
  deliveryUrl?: string;
  theme: 'emerald' | 'indigo' | 'dark' | 'amber' | 'rose';
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    ctaText: string;
    mediaType: 'image' | 'video';
    mediaUrl: string;
    youtubeUrl?: string;
    socialProofCount: string;
  };
  benefits: {
    id: string;
    title: string;
    description: string;
  }[];
  painPoints: string[];
  featuresList: string[];
  testimonials: {
    id: string;
    name: string;
    role: string;
    avatar: string;
    comment: string;
    rating: number;
    verified: boolean;
  }[];
  faqs: {
    id: string;
    question: string;
    answer: string;
  }[];
  guaranteeDays: number;
  countdownMinutes: number;
  whatsappMessageCustom: string;
  whatsappRecovery1h: string;
  liveBuyersPopup: boolean;
  active: boolean;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  productId: string;
  productTitle: string;
  createdAt: string;
  source: string;
  city: string;
  state: string;
  status: 'initiated' | 'paid' | 'abandoned' | 'recovered';
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  amount: number;
  paymentMethod: 'pix' | 'credit_card' | 'boleto';
  status: 'pending' | 'paid' | 'expired' | 'refunded';
  pixCode?: string;
  pixQrCodeSvg?: string;
  boletoBarcode?: string;
  boletoDigitable?: string;
  cardLast4?: string;
  installments?: number;
  createdAt: string;
  paidAt?: string;
  whatsappDispatched: boolean;
  emailDispatched: boolean;
  recoveryAttempts: number;
  utmSource: string;
  city: string;
  state: string;
}

export interface AbandonedCart {
  id: string;
  orderId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  productId: string;
  productName: string;
  amount: number;
  abandonedAt: string;
  recoveryStage: 'pending' | 'stage_15m' | 'stage_1h' | 'stage_24h' | 'recovered';
  lastRecoverySentAt?: string;
  paymentLink: string;
}

export interface ClickAnalytic {
  id: string;
  productId: string;
  productName: string;
  slug: string;
  city: string;
  state: string;
  device: 'mobile' | 'desktop';
  hour: number;
  dayOfWeek: string;
  utmSource: string;
  timestamp: string;
  converted: boolean;
}

export interface RecoveryRule {
  id: string;
  name: string;
  delayMinutes: number;
  channel: 'whatsapp' | 'email' | 'both';
  active: boolean;
  messageTemplate: string;
  discountCode?: string;
  discountPercent?: number;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: ('order.created' | 'order.paid' | 'cart.abandoned' | 'lead.captured')[];
  active: boolean;
  lastStatus?: number;
  lastTriggeredAt?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSync?: string;
}
