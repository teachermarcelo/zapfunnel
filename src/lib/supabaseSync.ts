import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageService } from './storage';
import { Product, LandingPageConfig, Order, Lead } from '../types';

let activeClient: SupabaseClient | null = null;

export function getClient(): SupabaseClient | null {
  if (activeClient) return activeClient;

  const cfg = StorageService.getSupabaseConfig();
  const url = cfg.url?.trim() || (import.meta.env.VITE_SUPABASE_URL as string)?.trim() || 'https://rvgcniaowzmsudzliozf.supabase.co';
  const anonKey = cfg.anonKey?.trim() || (import.meta.env.VITE_SUPABASE_ANON_KEY as string)?.trim();

  if (url && anonKey) {
    try {
      activeClient = createClient(url, anonKey);
      return activeClient;
    } catch (e) {
      console.warn('Erro ao conectar ao Supabase:', e);
      return null;
    }
  }
  return null;
}

export function resetClient(): void {
  activeClient = null;
}

export const SupabaseSyncService = {
  // Check if Supabase credentials are valid
  async testConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
    try {
      const client = createClient(url, anonKey);
      const { data, error } = await client.from('zap_products').select('id').limit(1);
      if (error && error.message) {
        return { success: false, message: `Erro do Supabase: ${error.message}` };
      }
      return { success: true, message: 'Conectado com sucesso às tabelas zap_*!' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Falha na conexão com Supabase' };
    }
  },

  // Pull all data from Supabase and merge into LocalStorage
  async pullFromSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
    const client = getClient();
    if (!client) {
      return { success: false, count: 0, error: 'Supabase não configurado ou chave anon ausente' };
    }

    try {
      // 1. Fetch products
      const { data: dbProducts, error: prodErr } = await client
        .from('zap_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (prodErr) throw prodErr;

      let importedCount = 0;

      if (dbProducts && dbProducts.length > 0) {
        const localProducts = StorageService.getProducts();
        const mergedProducts: Product[] = [...localProducts];

        for (const row of dbProducts) {
          const mapped: Product = {
            id: row.id || `prod_${Date.now()}`,
            name: row.name,
            slug: row.slug,
            price: Number(row.price),
            originalPrice: Number(row.original_price || row.price * 2),
            category: row.category || 'Geral',
            description: row.description || '',
            imageUrl: row.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
            badge: row.badge || undefined,
            status: (row.status as any) || 'active',
            deliveryUrl: row.delivery_url || undefined,
            createdAt: row.created_at || new Date().toISOString(),
            salesCount: Number(row.sales_count || 0),
            revenue: Number(row.revenue || 0),
          };

          const idx = mergedProducts.findIndex((p) => p.slug === mapped.slug || p.id === mapped.id);
          if (idx >= 0) {
            mergedProducts[idx] = { ...mergedProducts[idx], ...mapped };
          } else {
            mergedProducts.unshift(mapped);
            importedCount++;
          }
        }

        StorageService.saveProducts(mergedProducts);
      }

      // 2. Fetch Landing Pages
      const { data: dbPages, error: pagesErr } = await client
        .from('zap_landing_pages')
        .select('*');

      if (!pagesErr && dbPages && dbPages.length > 0) {
        const localPages = StorageService.getLandingPages();
        const mergedPages: LandingPageConfig[] = [...localPages];

        for (const row of dbPages) {
          const mapped: LandingPageConfig = {
            id: row.id,
            productId: row.product_id,
            slug: row.slug,
            title: row.title,
            deliveryUrl: row.delivery_url || undefined,
            theme: row.theme || 'emerald',
            hero: {
              badge: row.hero_badge || '⚡ Oferta Especial',
              headline: row.hero_headline || row.title,
              subheadline: row.hero_subheadline || '',
              ctaText: row.hero_cta_text || 'Quero Garantir Minha Vaga',
              mediaType: (row.hero_media_type as any) || 'image',
              mediaUrl: row.hero_media_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
              youtubeUrl: row.youtube_url || undefined,
              socialProofCount: row.hero_social_proof || '+2.800 clientes',
            },
            benefits: Array.isArray(row.benefits) ? row.benefits : [],
            painPoints: Array.isArray(row.pain_points) ? row.pain_points : [],
            featuresList: Array.isArray(row.features_list) ? row.features_list : [],
            testimonials: Array.isArray(row.testimonials) ? row.testimonials : [],
            faqs: Array.isArray(row.faqs) ? row.faqs : [],
            guaranteeDays: Number(row.guarantee_days || 7),
            countdownMinutes: Number(row.countdown_minutes || 15),
            whatsappMessageCustom: row.whatsapp_message_custom || '',
            whatsappRecovery1h: row.whatsapp_recovery_1h || '',
            liveBuyersPopup: Boolean(row.live_buyers_popup),
            active: Boolean(row.active),
            updatedAt: row.updated_at || new Date().toISOString(),
          };

          const idx = mergedPages.findIndex((p) => p.slug === mapped.slug);
          if (idx >= 0) {
            mergedPages[idx] = { ...mergedPages[idx], ...mapped };
          } else {
            mergedPages.push(mapped);
          }
        }

        StorageService.saveLandingPages(mergedPages);
      }

      window.dispatchEvent(new Event('zap_storage_updated'));
      return { success: true, count: importedCount };
    } catch (err: any) {
      console.warn('Erro ao puxar dados do Supabase:', err);
      return { success: false, count: 0, error: err?.message || 'Erro desconhecido' };
    }
  },

  // Push all local products and landing pages to Supabase
  async pushAllToSupabase(): Promise<{ success: boolean; pushedProducts: number; error?: string }> {
    const client = getClient();
    if (!client) {
      return { success: false, pushedProducts: 0, error: 'Supabase não conectado' };
    }

    try {
      const products = StorageService.getProducts();
      let pushed = 0;

      for (const p of products) {
        const { error } = await client.from('zap_products').upsert({
          name: p.name,
          slug: p.slug,
          price: p.price,
          original_price: p.originalPrice,
          category: p.category,
          description: p.description,
          image_url: p.imageUrl,
          badge: p.badge,
          status: p.status,
          sales_count: p.salesCount,
          revenue: p.revenue,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'slug' });

        if (!error) pushed++;
      }

      const landingPages = StorageService.getLandingPages();
      for (const lp of landingPages) {
        await client.from('zap_landing_pages').upsert({
          slug: lp.slug,
          title: lp.title,
          theme: lp.theme,
          hero_badge: lp.hero.badge,
          hero_headline: lp.hero.headline,
          hero_subheadline: lp.hero.subheadline,
          hero_cta_text: lp.hero.ctaText,
          hero_media_type: lp.hero.mediaType,
          hero_media_url: lp.hero.mediaUrl,
          hero_social_proof: lp.hero.socialProofCount,
          benefits: lp.benefits,
          pain_points: lp.painPoints,
          features_list: lp.featuresList,
          testimonials: lp.testimonials,
          faqs: lp.faqs,
          guarantee_days: lp.guaranteeDays,
          countdown_minutes: lp.countdownMinutes,
          whatsapp_message_custom: lp.whatsappMessageCustom,
          whatsapp_recovery_1h: lp.whatsappRecovery1h,
          live_buyers_popup: lp.liveBuyersPopup,
          active: lp.active,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'slug' });
      }

      return { success: true, pushedProducts: pushed };
    } catch (err: any) {
      return { success: false, pushedProducts: 0, error: err?.message };
    }
  },

  // Save single product & page to Supabase in background
  async syncSingleProduct(product: Product, page?: LandingPageConfig): Promise<void> {
    const client = getClient();
    if (!client) return;

    try {
      await client.from('zap_products').upsert({
        name: product.name,
        slug: product.slug,
        price: product.price,
        original_price: product.originalPrice,
        category: product.category,
        description: product.description,
        image_url: product.imageUrl,
        badge: product.badge,
        status: product.status,
        sales_count: product.salesCount,
        revenue: product.revenue,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'slug' });

      if (page) {
        await client.from('zap_landing_pages').upsert({
          slug: page.slug,
          title: page.title,
          theme: page.theme,
          hero_badge: page.hero.badge,
          hero_headline: page.hero.headline,
          hero_subheadline: page.hero.subheadline,
          hero_cta_text: page.hero.ctaText,
          hero_media_type: page.hero.mediaType,
          hero_media_url: page.hero.mediaUrl,
          hero_social_proof: page.hero.socialProofCount,
          benefits: page.benefits,
          pain_points: page.painPoints,
          features_list: page.featuresList,
          testimonials: page.testimonials,
          faqs: page.faqs,
          guarantee_days: page.guaranteeDays,
          countdown_minutes: page.countdownMinutes,
          whatsapp_message_custom: page.whatsappMessageCustom,
          whatsapp_recovery_1h: page.whatsappRecovery1h,
          live_buyers_popup: page.liveBuyersPopup,
          active: page.active,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'slug' });
      }
    } catch (err) {
      console.warn('Sync background Supabase falhou silenciosamente:', err);
    }
  },

  // Quick JSON Export/Import: transfer state across environments in 1-click
  exportStateJson(): string {
    const state = {
      version: 1,
      exportedAt: new Date().toISOString(),
      products: StorageService.getProducts(),
      landingPages: StorageService.getLandingPages(),
      orders: StorageService.getOrders(),
      leads: StorageService.getLeads(),
      abandonedCarts: StorageService.getAbandonedCarts(),
      analytics: StorageService.getAnalytics(),
      whatsAppLogs: StorageService.getWhatsAppLogs(),
    };
    return JSON.stringify(state, null, 2);
  },

  importStateJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.products)) StorageService.saveProducts(parsed.products);
      if (Array.isArray(parsed.landingPages)) StorageService.saveLandingPages(parsed.landingPages);
      if (Array.isArray(parsed.orders)) StorageService.saveOrders(parsed.orders);
      if (Array.isArray(parsed.leads)) {
        for (const l of parsed.leads) StorageService.saveLead(l);
      }
      if (Array.isArray(parsed.abandonedCarts)) {
        for (const ac of parsed.abandonedCarts) StorageService.saveAbandonedCart(ac);
      }
      window.dispatchEvent(new Event('zap_storage_updated'));
      return true;
    } catch (e) {
      console.error('Falha ao importar JSON de dados:', e);
      return false;
    }
  },
};
