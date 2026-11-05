import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google Gen AI server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Copywriting Endpoint
app.post('/api/ai/generate-copy', async (req, res) => {
  try {
    const { productName, niche, audience, offerDetails, tone } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      // Graceful fallback if key not configured
      return res.json({
        success: true,
        fallback: true,
        data: {
          headline: `Descubra o Segredo Definitivo para Dominar ${productName || 'Seu Mercado'} em Tempo Recorde`,
          subheadline: `O método comprovado que mais de 3.420 pessoas usaram para alcançar resultados extraordinários sem complicações.`,
          bulletPoints: [
            `Acesso imediato ao conteúdo prático passo a passo`,
            `Garantia blindada de 7 dias com risco zero`,
            `Avisos e suporte prioritário direto no seu WhatsApp`,
            `Bônus exclusivos liberados na finalização da compra`,
          ],
          painPoints: [
            `Cansado de tentar estratégias que não funcionam?`,
            `Falta de tempo e excesso de informação confusa`,
            `Medo de investir e não ter o suporte necessário`,
          ],
          whatsappNotificationText: `Olá {nome}! Seu pedido de *${productName}* foi gerado com sucesso. Acesse seu link exclusivo de pagamento: {link}. Qualquer dúvida, responda aqui!`,
          whatsappRecoveryText1h: `Oi {nome}, tudo bem? Vi que você iniciou o pedido do *${productName}*, mas ainda não concluiu. Separei sua vaga com bônus por mais alguns minutos: {link}`,
        },
      });
    }

    const prompt = `Você é um copywriter de elite especialista em páginas de vendas de altíssima conversão, checkout transparente e recuperação de carrinho via WhatsApp no mercado brasileiro.
    Gere uma copy irresistível para o seguinte produto:
    - Nome do Produto: ${productName}
    - Nicho: ${niche || 'Geral / Infoproduto / Produto Físico'}
    - Público-Alvo: ${audience || 'Pessoas em busca de resultados rápidos e comprovados'}
    - Detalhes da Oferta: ${offerDetails || 'Oferta especial com desconto e bônus exclusivos'}
    - Tom de Voz: ${tone || 'Persuasivo, urgente, confiável e focado em ação'}

    Retorne APENAS um JSON válido no seguinte formato exato (sem formatação markdown além do JSON):
    {
      "headline": "Título principal impactante com gatilho de benefício direto",
      "subheadline": "Subtítulo explicando como funciona e gerando curiosidade imediata",
      "bulletPoints": [
        "Benefício transformador 1 com prova ou detalhe",
        "Benefício transformador 2 que elimina uma dor",
        "Benefício transformador 3 que gera rapidez de resultado",
        "Benefício transformador 4 com bônus ou diferencial"
      ],
      "painPoints": [
        "Dor profunda 1 do cliente",
        "Dor profunda 2 do cliente",
        "Dor profunda 3 do cliente"
      ],
      "whatsappNotificationText": "Texto para WhatsApp com aviso de pedido gerado e link {link}",
      "whatsappRecoveryText1h": "Texto persuasivo de recuperação de carrinho após 1 hora com {nome} e {link}"
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    return res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error('Error generating AI copy, providing smart copywriting fallback:', error);
    const { productName } = req.body || {};
    return res.json({
      success: true,
      fallback: true,
      data: {
        headline: `Descubra o Método Validado para Transformar Seus Resultados com ${productName || 'Seu Produto'}`,
        subheadline: `A metodologia prática e comprovada que mais de 3.420 pessoas utilizam para acelerar seus objetivos sem complicações.`,
        bulletPoints: [
          `Acesso imediato e vitalício com liberação instantânea`,
          `Garantia incondicional de satisfação com risco zero`,
          `Confirmação e notificações automáticas direto no seu WhatsApp`,
          `Bônus exclusivos liberados na finalização da compra`,
        ],
        painPoints: [
          `Cansado de métodos complicados que prometem muito e não entregam?`,
          `Falta de tempo e excesso de informação confusa na internet`,
          `Insegurança ao tentar começar sem um passo a passo estruturado`,
        ],
        whatsappNotificationText: `Olá {nome}! Seu pedido de *${productName || 'nosso produto'}* foi registrado com sucesso! Acesse seu link de pagamento: {link}. Qualquer dúvida, estamos online aqui!`,
        whatsappRecoveryText1h: `Oi {nome}! Guardamos sua vaga no *${productName || 'nosso produto'}* com o bônus especial por mais alguns minutos. Conclua aqui: {link}`,
      },
    });
  }
});

// WhatsApp Notification Simulation Endpoint
app.post('/api/whatsapp/send', (req, res) => {
  const { phone, customerName, message, orderId, paymentLink, type } = req.body;
  
  console.log(`[WhatsApp Webhook Dispatch] Enviando para: ${phone} | Tipo: ${type || 'checkout_created'}`);
  console.log(`[Mensagem]: ${message}`);

  return res.json({
    success: true,
    dispatchId: `wa_msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    status: 'delivered',
    timestamp: new Date().toISOString(),
    recipient: phone,
    previewUrl: `https://wa.me/${(phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(message || '')}`,
  });
});

// Webhook simulation endpoint for external CRMs (Zapier, Make, n8n, etc.)
app.post('/api/webhooks/test-dispatch', (req, res) => {
  const { webhookUrl, event, payload } = req.body;

  console.log(`[External Webhook] Trigger: ${event} para ${webhookUrl}`);
  return res.json({
    success: true,
    event,
    receivedAt: new Date().toISOString(),
    statusCode: 200,
    message: 'Webhook simulado com sucesso!',
  });
});

// In development, hook up Vite dev server middlewares
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built static client
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 ZapFunnel Server running on http://localhost:${PORT}`);
  });
}

startServer();
