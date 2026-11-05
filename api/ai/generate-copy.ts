import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productName, niche, audience, offerDetails, tone } = req.body || {};

  try {
    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `Você é um copywriter de elite especialista em páginas de vendas de altíssima conversão, checkout transparente e recuperação de carrinho via WhatsApp no mercado brasileiro.
      Gere uma copy irresistível para:
      - Nome do Produto: ${productName}
      - Nicho: ${niche || 'Geral / Infoproduto / Produto Físico'}
      - Público-Alvo: ${audience || 'Pessoas em busca de resultados rápidos'}
      - Detalhes da Oferta: ${offerDetails || 'Oferta especial'}
      - Tom de Voz: ${tone || 'Persuasivo e focado em ação'}

      Retorne APENAS um JSON válido no seguinte formato:
      {
        "headline": "Título principal com gatilho de benefício direto",
        "subheadline": "Subtítulo explicando como funciona",
        "bulletPoints": [
          "Benefício transformador 1",
          "Benefício transformador 2",
          "Benefício transformador 3",
          "Benefício transformador 4"
        ],
        "painPoints": [
          "Dor 1 do cliente",
          "Dor 2 do cliente",
          "Dor 3 do cliente"
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

      const parsed = JSON.parse(response.text || '{}');
      return res.status(200).json({ success: true, data: parsed });
    }
  } catch (error) {
    console.warn('Vercel Gemini fallback trigger:', error);
  }

  // Smart fallback
  return res.status(200).json({
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
