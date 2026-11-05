import {
  Product,
  LandingPageConfig,
  Lead,
  Order,
  AbandonedCart,
  ClickAnalytic,
  RecoveryRule,
  WebhookConfig,
  SupabaseConfig,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_LANDING_PAGES,
  INITIAL_LEADS,
  INITIAL_ORDERS,
  INITIAL_ABANDONED_CARTS,
  INITIAL_CLICK_ANALYTICS,
  INITIAL_RECOVERY_RULES,
  INITIAL_WEBHOOKS,
} from '../data/mockData';
import { generatePixCopiaECola, generateQrCodeSvg } from './pixHelper';

const STORAGE_KEYS = {
  PRODUCTS: 'zap_products_v1',
  LANDING_PAGES: 'zap_landing_pages_v1',
  LEADS: 'zap_leads_v1',
  ORDERS: 'zap_orders_v1',
  ABANDONED: 'zap_abandoned_v1',
  ANALYTICS: 'zap_analytics_v1',
  RECOVERY_RULES: 'zap_recovery_rules_v1',
  WEBHOOKS: 'zap_webhooks_v1',
  SUPABASE_CONFIG: 'zap_supabase_cfg_v1',
  WHATSAPP_LOGS: 'zap_whatsapp_logs_v1',
};

export interface WhatsAppLog {
  id: string;
  phone: string;
  customerName: string;
  message: string;
  sentAt: string;
  type: 'order_created' | 'cart_recovery_15m' | 'cart_recovery_1h' | 'cart_recovery_24h' | 'order_paid';
  status: 'sent' | 'delivered' | 'read';
}

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    return JSON.parse(saved);
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('zap_storage_updated'));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

export const StorageService = {
  // Products
  getProducts(): Product[] {
    return getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },
  saveProducts(products: Product[]): void {
    setItem(STORAGE_KEYS.PRODUCTS, products);
  },
  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  },
  getProductBySlug(slug: string): Product | undefined {
    return this.getProducts().find((p) => p.slug === slug);
  },
  saveProduct(product: Product): void {
    const list = this.getProducts();
    const index = list.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      list[index] = product;
    } else {
      list.unshift(product);
    }
    this.saveProducts(list);
  },
  deleteProduct(id: string): void {
    const list = this.getProducts().filter((p) => p.id !== id);
    this.saveProducts(list);
    const pages = this.getLandingPages().filter((lp) => lp.productId !== id);
    this.saveLandingPages(pages);
  },

  // Landing Pages
  getLandingPages(): LandingPageConfig[] {
    return getItem<LandingPageConfig[]>(STORAGE_KEYS.LANDING_PAGES, INITIAL_LANDING_PAGES);
  },
  saveLandingPages(pages: LandingPageConfig[]): void {
    setItem(STORAGE_KEYS.LANDING_PAGES, pages);
  },
  getLandingPageBySlug(slug: string): LandingPageConfig | undefined {
    return this.getLandingPages().find((p) => p.slug === slug);
  },
  getLandingPageByProductId(productId: string): LandingPageConfig | undefined {
    return this.getLandingPages().find((p) => p.productId === productId);
  },
  saveLandingPage(page: LandingPageConfig): void {
    const list = this.getLandingPages();
    const index = list.findIndex((p) => p.id === page.id || p.productId === page.productId);
    if (index >= 0) {
      list[index] = { ...list[index], ...page, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...page, updatedAt: new Date().toISOString() });
    }
    this.saveLandingPages(list);
  },

  // Leads
  getLeads(): Lead[] {
    return getItem<Lead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
  },
  saveLead(lead: Lead): void {
    const list = this.getLeads();
    const existingIndex = list.findIndex((l) => l.id === lead.id || (l.phone === lead.phone && l.productId === lead.productId));
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...lead };
    } else {
      list.unshift(lead);
    }
    setItem(STORAGE_KEYS.LEADS, list);
  },

  // Orders
  getOrders(): Order[] {
    return getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },
  saveOrders(orders: Order[]): void {
    setItem(STORAGE_KEYS.ORDERS, orders);
  },
  getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id);
  },
  saveOrder(order: Order): void {
    const list = this.getOrders();
    const index = list.findIndex((o) => o.id === order.id);
    if (index >= 0) {
      list[index] = order;
    } else {
      list.unshift(order);
    }
    this.saveOrders(list);

    // If order is paid, update product salesCount & revenue
    if (order.status === 'paid') {
      const products = this.getProducts();
      const product = products.find((p) => p.id === order.productId);
      if (product) {
        product.salesCount += 1;
        product.revenue += order.amount;
        this.saveProducts(products);
      }
    }
  },

  // Create Instant Checkout Order
  createCheckoutOrder(params: {
    product: Product;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    paymentMethod: 'pix' | 'credit_card' | 'boleto';
    installments?: number;
    utmSource?: string;
  }): { order: Order; whatsappMessage: string; directWhatsAppUrl: string } {
    const orderId = `ord_${Date.now().toString().slice(-6)}`;
    const txId = `ZAP${orderId}`;
    const cleanPhone = params.customerPhone.replace(/\D/g, '');

    // Generate dynamic PIX payload
    const pixCode = generatePixCopiaECola(
      'pagamentos@zapfunnel.com.br',
      'ZAPFUNNEL PAGAMENTOS',
      'SAO PAULO',
      params.product.price,
      txId
    );
    const pixQrCodeSvg = generateQrCodeSvg(pixCode, 240);

    const host = window.location.origin;
    const checkoutLink = `${host}/?checkout_order=${orderId}&slug=${params.product.slug}`;

    const newOrder: Order = {
      id: orderId,
      productId: params.product.id,
      productTitle: params.product.name,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
      amount: params.product.price,
      paymentMethod: params.paymentMethod,
      status: 'pending',
      pixCode,
      pixQrCodeSvg,
      boletoBarcode: '34191.79001 01043.510047 91020.150008 7 9876000000' + Math.floor(params.product.price * 100).toString().padStart(6, '0'),
      cardLast4: params.paymentMethod === 'credit_card' ? '4242' : undefined,
      installments: params.installments || 1,
      createdAt: new Date().toISOString(),
      whatsappDispatched: true,
      emailDispatched: true,
      recoveryAttempts: 0,
      utmSource: params.utmSource || 'Tráfego Direto',
      city: 'São Paulo',
      state: 'SP',
    };

    this.saveOrder(newOrder);

    // Save lead
    const newLead: Lead = {
      id: `lead_${Date.now().toString().slice(-6)}`,
      name: params.customerName,
      phone: params.customerPhone,
      email: params.customerEmail,
      productId: params.product.id,
      productTitle: params.product.name,
      createdAt: new Date().toISOString(),
      source: params.utmSource || 'Página de Vendas',
      city: 'São Paulo',
      state: 'SP',
      status: 'initiated',
    };
    this.saveLead(newLead);

    // Create Abandoned Cart item in case they don't pay
    const abandonedCart: AbandonedCart = {
      id: `aband_${Date.now().toString().slice(-6)}`,
      orderId: newOrder.id,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
      productId: params.product.id,
      productName: params.product.name,
      amount: params.product.price,
      abandonedAt: new Date().toISOString(),
      recoveryStage: 'pending',
      paymentLink: checkoutLink,
    };
    this.saveAbandonedCart(abandonedCart);

    // WhatsApp Message
    const whatsappMessage = `Olá *${params.customerName}*! Seu pedido de *${params.product.name}* (R$ ${params.product.price.toFixed(2).replace('.', ',')}) foi iniciado com sucesso!\n\n💳 Link seguro para concluir: ${checkoutLink}\n\nSe optou por Pix, o código Copia e Cola expira em 15 minutos. Qualquer dúvida responda esta mensagem!`;

    // Direct WhatsApp API link for the customer
    const directWhatsAppUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;

    // Log WhatsApp dispatch
    this.addWhatsAppLog({
      id: `wa_${Date.now()}`,
      phone: params.customerPhone,
      customerName: params.customerName,
      message: whatsappMessage,
      sentAt: new Date().toISOString(),
      type: 'order_created',
      status: 'delivered',
    });

    // Track click analytics conversion
    this.recordClick({
      productId: params.product.id,
      productName: params.product.name,
      slug: params.product.slug,
      city: 'São Paulo',
      state: 'SP',
      device: window.innerWidth < 768 ? 'mobile' : 'desktop',
      hour: new Date().getHours(),
      dayOfWeek: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][new Date().getDay()],
      utmSource: params.utmSource || 'Página de Vendas',
      converted: true,
    });

    return { order: newOrder, whatsappMessage, directWhatsAppUrl };
  },

  // Mark Order as Paid
  markOrderAsPaid(orderId: string): void {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      order.status = 'paid';
      order.paidAt = new Date().toISOString();
      this.saveOrders(orders);

      // Update lead status
      const leads = this.getLeads();
      const lead = leads.find((l) => l.phone === order.customerPhone && l.productId === order.productId);
      if (lead) {
        lead.status = 'paid';
        setItem(STORAGE_KEYS.LEADS, leads);
      }

      // Update abandoned cart
      const abandoned = this.getAbandonedCarts();
      const abItem = abandoned.find((a) => a.orderId === orderId);
      if (abItem) {
        abItem.recoveryStage = 'recovered';
        this.saveAbandonedCarts(abandoned);
      }

      // Lookup delivery URL
      const product = this.getProductById(order.productId);
      const page = this.getLandingPageByProductId(order.productId);
      const deliveryUrl = product?.deliveryUrl || page?.deliveryUrl || 'https://drive.google.com/sample-acesso-produto';

      // Add WhatsApp confirmation log
      const paidMsg = `Parabéns *${order.customerName}*! 🎉 Seu pagamento de R$ ${order.amount.toFixed(2).replace('.', ',')} para *${order.productTitle}* foi confirmado com sucesso!\n\n🚀 *SEU LINK DE ACESSO LIBERADO:* ${deliveryUrl}\n\nUma cópia também foi enviada para seu e-mail: ${order.customerEmail}. Guarde este link com segurança!`;
      this.addWhatsAppLog({
        id: `wa_paid_${Date.now()}`,
        phone: order.customerPhone,
        customerName: order.customerName,
        message: paidMsg,
        sentAt: new Date().toISOString(),
        type: 'order_paid',
        status: 'read',
      });
    }
  },

  // Abandoned Carts
  getAbandonedCarts(): AbandonedCart[] {
    return getItem<AbandonedCart[]>(STORAGE_KEYS.ABANDONED, INITIAL_ABANDONED_CARTS);
  },
  saveAbandonedCarts(carts: AbandonedCart[]): void {
    setItem(STORAGE_KEYS.ABANDONED, carts);
  },
  saveAbandonedCart(cart: AbandonedCart): void {
    const list = this.getAbandonedCarts();
    const index = list.findIndex((c) => c.id === cart.id || (c.orderId && c.orderId === cart.orderId));
    if (index >= 0) {
      list[index] = cart;
    } else {
      list.unshift(cart);
    }
    this.saveAbandonedCarts(list);
  },

  // WhatsApp Simulator Logs
  getWhatsAppLogs(): WhatsAppLog[] {
    const defaults: WhatsAppLog[] = [
      {
        id: 'wa_init_1',
        phone: '(11) 98452-9912',
        customerName: 'Marcos Vinicius Silva',
        message: 'Olá Marcos! Seu pedido de Livro: Hábitos Milionários foi gerado! Link: https://zapfunnel.app/checkout/ord_1001',
        sentAt: '2026-11-05T06:14:02Z',
        type: 'order_created',
        status: 'read',
      },
      {
        id: 'wa_init_2',
        phone: '(21) 99341-8822',
        customerName: 'Fernanda Caroline Costa',
        message: 'Oi Fernanda! Seu pedido de Método Seca Barriga Turbo 30D ficou pendente. Seu link com desconto especial ainda está reservado: https://zapfunnel.app/checkout/ord_1002',
        sentAt: '2026-11-05T06:45:00Z',
        type: 'cart_recovery_15m',
        status: 'delivered',
      },
    ];
    return getItem<WhatsAppLog[]>(STORAGE_KEYS.WHATSAPP_LOGS, defaults);
  },
  addWhatsAppLog(log: WhatsAppLog): void {
    const logs = this.getWhatsAppLogs();
    logs.unshift(log);
    setItem(STORAGE_KEYS.WHATSAPP_LOGS, logs);
  },

  // Click & Geo Analytics
  getAnalytics(): ClickAnalytic[] {
    return getItem<ClickAnalytic[]>(STORAGE_KEYS.ANALYTICS, INITIAL_CLICK_ANALYTICS);
  },
  recordClick(data: Omit<ClickAnalytic, 'id' | 'timestamp'>): void {
    const list = this.getAnalytics();
    const newClick: ClickAnalytic = {
      ...data,
      id: `clk_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    list.unshift(newClick);
    setItem(STORAGE_KEYS.ANALYTICS, list.slice(0, 500));
  },

  // Recovery Rules
  getRecoveryRules(): RecoveryRule[] {
    return getItem<RecoveryRule[]>(STORAGE_KEYS.RECOVERY_RULES, INITIAL_RECOVERY_RULES);
  },
  saveRecoveryRules(rules: RecoveryRule[]): void {
    setItem(STORAGE_KEYS.RECOVERY_RULES, rules);
  },

  // Trigger Recovery Message manually
  triggerRecoveryMessage(cartId: string, ruleStage: 'stage_15m' | 'stage_1h' | 'stage_24h'): { directUrl: string; message: string } {
    const carts = this.getAbandonedCarts();
    const cart = carts.find((c) => c.id === cartId);
    if (!cart) return { directUrl: '', message: '' };

    let msg = `Olá *${cart.customerName}*! Seu pedido de *${cart.productName}* ficou reservado. Conclua seu pagamento com segurança: ${cart.paymentLink}`;
    if (ruleStage === 'stage_1h') {
      msg = `Oi *${cart.customerName}*! Notamos que você não concluiu a compra de *${cart.productName}*. Estamos segurando seus bônus exclusivos por mais alguns minutos: ${cart.paymentLink}`;
    } else if (ruleStage === 'stage_24h') {
      msg = `Atenção *${cart.customerName}*! Liberamos 10% de desconto adicional para você finalizar o *${cart.productName}* usando o cupom VOLTA10: ${cart.paymentLink}`;
    }

    cart.recoveryStage = ruleStage;
    cart.lastRecoverySentAt = new Date().toISOString();
    this.saveAbandonedCarts(carts);

    this.addWhatsAppLog({
      id: `wa_rec_${Date.now()}`,
      phone: cart.customerPhone,
      customerName: cart.customerName,
      message: msg,
      sentAt: new Date().toISOString(),
      type: ruleStage === 'stage_15m' ? 'cart_recovery_15m' : ruleStage === 'stage_1h' ? 'cart_recovery_1h' : 'cart_recovery_24h',
      status: 'delivered',
    });

    const cleanPhone = cart.customerPhone.replace(/\D/g, '');
    const directUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
    return { directUrl, message: msg };
  },

  // Webhooks
  getWebhooks(): WebhookConfig[] {
    return getItem<WebhookConfig[]>(STORAGE_KEYS.WEBHOOKS, INITIAL_WEBHOOKS);
  },
  saveWebhooks(webhooks: WebhookConfig[]): void {
    setItem(STORAGE_KEYS.WEBHOOKS, webhooks);
  },

  // Supabase Configuration
  getSupabaseConfig(): SupabaseConfig {
    return getItem<SupabaseConfig>(STORAGE_KEYS.SUPABASE_CONFIG, {
      url: '',
      anonKey: '',
      isConnected: false,
      lastSync: undefined,
    });
  },
  saveSupabaseConfig(cfg: SupabaseConfig): void {
    setItem(STORAGE_KEYS.SUPABASE_CONFIG, cfg);
  },

  // CSV Export for Leads, Orders, and Analytics
  exportToCsv(type: 'orders' | 'leads' | 'analytics'): string {
    if (type === 'orders') {
      const orders = this.getOrders();
      const headers = ['ID Pedido', 'Produto', 'Cliente', 'WhatsApp', 'Email', 'Valor (R$)', 'Método', 'Status', 'Data', 'Origem UTM', 'Cidade', 'Estado'];
      const rows = orders.map((o) => [
        o.id,
        `"${o.productTitle}"`,
        `"${o.customerName}"`,
        o.customerPhone,
        o.customerEmail,
        o.amount.toFixed(2),
        o.paymentMethod,
        o.status,
        o.createdAt,
        o.utmSource,
        o.city,
        o.state,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else if (type === 'leads') {
      const leads = this.getLeads();
      const headers = ['ID Lead', 'Nome', 'WhatsApp', 'Email', 'Produto', 'Origem', 'Status', 'Cidade', 'Estado', 'Data'];
      const rows = leads.map((l) => [
        l.id,
        `"${l.name}"`,
        l.phone,
        l.email,
        `"${l.productTitle}"`,
        l.source,
        l.status,
        l.city,
        l.state,
        l.createdAt,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else {
      const analytics = this.getAnalytics();
      const headers = ['ID', 'Produto', 'Cidade', 'Estado', 'Dispositivo', 'Hora', 'Dia da Semana', 'Origem UTM', 'Converteu', 'Data'];
      const rows = analytics.map((a) => [
        a.id,
        `"${a.productName}"`,
        a.city,
        a.state,
        a.device,
        a.hour,
        a.dayOfWeek,
        a.utmSource,
        a.converted ? 'Sim' : 'Não',
        a.timestamp,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }
  },
};
