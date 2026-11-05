export const SUPABASE_SQL_MIGRATION = `-- ====================================================================
-- ZAPFUNNEL PRO - SUPABASE MIGRATION SCRIPT (SEM CONFLITOS DE TABELAS)
-- Prefixo 'zap_' exclusivo para não sobrescrever tabelas já existentes!
-- ====================================================================

-- 1. Habilitar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Produtos
CREATE TABLE IF NOT EXISTS zap_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  category TEXT DEFAULT 'Geral',
  description TEXT,
  image_url TEXT,
  badge TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft')),
  sales_count INTEGER DEFAULT 0,
  revenue NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Páginas de Vendas (Landing Pages por Produto)
CREATE TABLE IF NOT EXISTS zap_landing_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES zap_products(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  theme TEXT DEFAULT 'emerald',
  hero_badge TEXT,
  hero_headline TEXT NOT NULL,
  hero_subheadline TEXT,
  hero_cta_text TEXT DEFAULT 'Comprar Agora',
  hero_media_type TEXT DEFAULT 'image',
  hero_media_url TEXT,
  hero_social_proof TEXT DEFAULT '+3.400 clientes',
  benefits JSONB DEFAULT '[]'::jsonb,
  pain_points JSONB DEFAULT '[]'::jsonb,
  features_list JSONB DEFAULT '[]'::jsonb,
  testimonials JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  guarantee_days INTEGER DEFAULT 7,
  countdown_minutes INTEGER DEFAULT 15,
  whatsapp_message_custom TEXT,
  whatsapp_recovery_1h TEXT,
  live_buyers_popup BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Leads Capturados no Checkout
CREATE TABLE IF NOT EXISTS zap_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  product_id UUID REFERENCES zap_products(id) ON DELETE SET NULL,
  product_title TEXT,
  source TEXT DEFAULT 'organic',
  city TEXT,
  state TEXT,
  status TEXT DEFAULT 'initiated' CHECK (status IN ('initiated', 'paid', 'abandoned', 'recovered')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Pedidos e Transações (Stripe / Pix / Boleto)
CREATE TABLE IF NOT EXISTS zap_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES zap_products(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('pix', 'credit_card', 'boleto')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'refunded')),
  pix_code TEXT,
  boleto_barcode TEXT,
  stripe_charge_id TEXT,
  whatsapp_dispatched BOOLEAN DEFAULT false,
  email_dispatched BOOLEAN DEFAULT false,
  recovery_attempts INTEGER DEFAULT 0,
  utm_source TEXT DEFAULT 'direct',
  city TEXT,
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- 6. Tabela de Carrinhos Abandonados para Automação
CREATE TABLE IF NOT EXISTS zap_abandoned_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES zap_orders(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  product_id UUID REFERENCES zap_products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  abandoned_at TIMESTAMPTZ DEFAULT NOW(),
  recovery_stage TEXT DEFAULT 'pending' CHECK (recovery_stage IN ('pending', 'stage_15m', 'stage_1h', 'stage_24h', 'recovered')),
  last_recovery_sent_at TIMESTAMPTZ,
  payment_link TEXT
);

-- 7. Tabela de Análise de Cliques & Geografia (Tráfego & Horários de Pico)
CREATE TABLE IF NOT EXISTS zap_click_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES zap_products(id) ON DELETE CASCADE,
  product_name TEXT,
  slug TEXT,
  city TEXT,
  state TEXT,
  device TEXT DEFAULT 'mobile',
  hour INTEGER,
  day_of_week TEXT,
  utm_source TEXT DEFAULT 'direct',
  converted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabela de Regras de Recuperação de WhatsApp / Email
CREATE TABLE IF NOT EXISTS zap_recovery_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  delay_minutes INTEGER NOT NULL,
  channel TEXT DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'email', 'both')),
  active BOOLEAN DEFAULT true,
  message_template TEXT NOT NULL,
  discount_code TEXT,
  discount_percent NUMERIC(5, 2) DEFAULT 0
);

-- 9. Tabela de Webhooks Externos (Zapier, Make, n8n, CRM)
CREATE TABLE IF NOT EXISTS zap_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] DEFAULT ARRAY['order.paid', 'cart.abandoned'],
  active BOOLEAN DEFAULT true,
  last_status INTEGER,
  last_triggered_at TIMESTAMPTZ
);

-- Índices para alta performance em campanhas e anúncios
CREATE INDEX IF NOT EXISTS idx_zap_products_slug ON zap_products(slug);
CREATE INDEX IF NOT EXISTS idx_zap_landing_slug ON zap_landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_zap_orders_status ON zap_orders(status);
CREATE INDEX IF NOT EXISTS idx_zap_leads_phone ON zap_leads(phone);
CREATE INDEX IF NOT EXISTS idx_zap_abandoned_stage ON zap_abandoned_carts(recovery_stage);
CREATE INDEX IF NOT EXISTS idx_zap_analytics_hour ON zap_click_analytics(hour, day_of_week);

-- Habilitar RLS (Row Level Security) opcionalmente aberta para leitura pública das páginas
ALTER TABLE zap_landing_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Landing Pages Access" ON zap_landing_pages FOR SELECT USING (active = true);
`;
