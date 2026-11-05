import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/admin/DashboardOverview';
import { ProductList } from './components/admin/ProductList';
import { PageEditor } from './components/admin/PageEditor';
import { LeadsAndOrders } from './components/admin/LeadsAndOrders';
import { CartRecovery } from './components/admin/CartRecovery';
import { AnalyticsView } from './components/admin/AnalyticsView';
import { IntegrationsAndSupabase } from './components/admin/IntegrationsAndSupabase';
import { WhatsAppInboxModal } from './components/admin/WhatsAppInboxModal';
import { CreateNewPageModal } from './components/admin/CreateNewPageModal';
import { PagesManagementDrawer } from './components/admin/PagesManagementDrawer';
import { ProprietaryCheckoutModal } from './components/checkout/ProprietaryCheckoutModal';
import { LandingPageView } from './components/public/LandingPageView';
import { StorageService, WhatsAppLog } from './lib/storage';
import { Product, LandingPageConfig, Order, Lead, AbandonedCart, ClickAnalytic, RecoveryRule } from './types';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [publicPageSlug, setPublicPageSlug] = useState<string | null>(null);
  const [editingPage, setEditingPage] = useState<LandingPageConfig | null>(null);

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPageConfig[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [analytics, setAnalytics] = useState<ClickAnalytic[]>([]);
  const [recoveryRules, setRecoveryRules] = useState<RecoveryRule[]>([]);
  const [whatsAppLogs, setWhatsAppLogs] = useState<WhatsAppLog[]>([]);

  // Modals & Panels
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCheckoutProduct, setSelectedCheckoutProduct] = useState<Product | null>(null);
  const [checkoutInitialOrderId, setCheckoutInitialOrderId] = useState<string | undefined>(undefined);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isPagesDrawerOpen, setIsPagesDrawerOpen] = useState(false);

  const loadData = () => {
    setProducts(StorageService.getProducts());
    setLandingPages(StorageService.getLandingPages());
    setOrders(StorageService.getOrders());
    setLeads(StorageService.getLeads());
    setAbandonedCarts(StorageService.getAbandonedCarts());
    setAnalytics(StorageService.getAnalytics());
    setRecoveryRules(StorageService.getRecoveryRules());
    setWhatsAppLogs(StorageService.getWhatsAppLogs());
  };

  useEffect(() => {
    loadData();

    // Check URL parameters for direct public page or checkout link
    const searchParams = new URLSearchParams(window.location.search);
    const slugParam = searchParams.get('slug');
    const orderParam = searchParams.get('checkout_order');

    if (slugParam) {
      setPublicPageSlug(slugParam);
    }

    if (orderParam) {
      const order = StorageService.getOrderById(orderParam);
      if (order) {
        const prod = StorageService.getProductById(order.productId);
        if (prod) {
          setSelectedCheckoutProduct(prod);
          setCheckoutInitialOrderId(order.id);
          setIsCheckoutOpen(true);
        }
      }
    }

    const handleStorageUpdate = () => {
      loadData();
    };

    window.addEventListener('zap_storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('zap_storage_updated', handleStorageUpdate);
  }, []);

  const handleOpenCheckout = (product: Product) => {
    setSelectedCheckoutProduct(product);
    setCheckoutInitialOrderId(undefined);
    setIsCheckoutOpen(true);
  };

  const handleSelectPublicPage = (slug: string) => {
    setPublicPageSlug(slug);
    // Record page visit
    const prod = products.find((p) => p.slug === slug);
    if (prod) {
      StorageService.recordClick({
        productId: prod.id,
        productName: prod.name,
        slug: prod.slug,
        city: 'São Paulo',
        state: 'SP',
        device: window.innerWidth < 768 ? 'mobile' : 'desktop',
        hour: new Date().getHours(),
        dayOfWeek: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][new Date().getDay()],
        utmSource: 'Campanha Direta',
        converted: false,
      });
    }
  };

  const handleEditPage = (page: LandingPageConfig) => {
    setEditingPage(page);
    setCurrentTab('editor');
  };

  // If a public page is active, show the customer-facing landing page
  if (publicPageSlug) {
    const activePage = landingPages.find((lp) => lp.slug === publicPageSlug) || landingPages[0];
    const activeProduct = products.find((p) => p.slug === publicPageSlug || p.id === activePage?.productId) || products[0];

    if (activePage && activeProduct) {
      return (
        <>
          <LandingPageView
            page={activePage}
            product={activeProduct}
            onOpenCheckout={(prod) => handleOpenCheckout(prod)}
            onBackToAdmin={() => setPublicPageSlug(null)}
          />

          {isCheckoutOpen && selectedCheckoutProduct && (
            <ProprietaryCheckoutModal
              isOpen={isCheckoutOpen}
              onClose={() => setIsCheckoutOpen(false)}
              product={selectedCheckoutProduct}
              initialOrderId={checkoutInitialOrderId}
              onOrderCompleted={() => loadData()}
            />
          )}
        </>
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setEditingPage(null);
        }}
        products={products}
        onOpenNewPageModal={() => setIsNewProductModalOpen(true)}
        onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
        onOpenPagesDrawer={() => setIsPagesDrawerOpen(true)}
        onSelectPublicPage={handleSelectPublicPage}
        unreadWhatsAppCount={whatsAppLogs.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentTab === 'dashboard' && (
          <DashboardOverview
            products={products}
            orders={orders}
            leads={leads}
            abandonedCarts={abandonedCarts}
            onSelectProductPage={handleSelectPublicPage}
            onOpenCheckoutModal={handleOpenCheckout}
            onOpenRecoveryTab={() => setCurrentTab('recovery')}
            onRefreshData={loadData}
          />
        )}

        {currentTab === 'pages' && (
          <ProductList
            products={products}
            landingPages={landingPages}
            onSelectProductPage={handleSelectPublicPage}
            onEditPage={handleEditPage}
            onOpenCheckoutModal={handleOpenCheckout}
            onRefreshData={loadData}
            isNewModalOpen={isNewProductModalOpen}
            setIsNewModalOpen={setIsNewProductModalOpen}
          />
        )}

        {currentTab === 'editor' && editingPage && (
          <PageEditor
            page={editingPage}
            product={products.find((p) => p.id === editingPage.productId)}
            onBack={() => setCurrentTab('pages')}
            onPreview={handleSelectPublicPage}
            onSaveSuccess={loadData}
          />
        )}

        {currentTab === 'leads' && (
          <LeadsAndOrders
            orders={orders}
            leads={leads}
            onRefreshData={loadData}
          />
        )}

        {currentTab === 'recovery' && (
          <CartRecovery
            abandonedCarts={abandonedCarts}
            recoveryRules={recoveryRules}
            onRefreshData={loadData}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            analytics={analytics}
            products={products}
            orders={orders}
          />
        )}

        {currentTab === 'integrations' && (
          <IntegrationsAndSupabase
            onRefreshData={loadData}
          />
        )}
      </main>

      {/* Global Create New Page Modal - Accessible from any tab! */}
      <CreateNewPageModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        onPageCreated={(prod, lp) => {
          loadData();
          handleSelectPublicPage(lp.slug);
        }}
      />

      {/* Global Pages Management Drawer (Edit, Remove, View, Checkout) */}
      <PagesManagementDrawer
        isOpen={isPagesDrawerOpen}
        onClose={() => setIsPagesDrawerOpen(false)}
        products={products}
        landingPages={landingPages}
        onSelectPublicPage={handleSelectPublicPage}
        onEditPage={handleEditPage}
        onOpenCheckoutModal={handleOpenCheckout}
        onOpenNewPageModal={() => setIsNewProductModalOpen(true)}
        onRefreshData={loadData}
      />

      {/* Global Checkout Modal */}
      {isCheckoutOpen && selectedCheckoutProduct && (
        <ProprietaryCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          product={selectedCheckoutProduct}
          initialOrderId={checkoutInitialOrderId}
          onOrderCompleted={() => loadData()}
        />
      )}

      {/* Global WhatsApp Simulator Modal */}
      <WhatsAppInboxModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        logs={whatsAppLogs}
      />
    </div>
  );
}
