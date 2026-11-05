/**
 * PIX EMV Standard & Authentic QR Code Generator (Banco Central do Brasil)
 */
import QRCode from 'qrcode';

export function normalizePixKey(rawKey: string): string {
  const trimmed = (rawKey || '').trim();
  // Email
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }
  // Digits only
  const digitsOnly = trimmed.replace(/\D/g, '');
  // CPF (11 digits)
  if (digitsOnly.length === 11) {
    return digitsOnly;
  }
  // CNPJ (14 digits)
  if (digitsOnly.length === 14) {
    return digitsOnly;
  }
  // Phone with 10 or 11 digits without +55
  if (digitsOnly.length >= 10 && digitsOnly.length <= 11 && !trimmed.startsWith('+')) {
    return `+55${digitsOnly}`;
  }
  // Random EVP (UUID format) or other
  return trimmed;
}

function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Generate authentic EMV standard Pix Copia e Cola
export function generatePixCopiaECola(
  chavePix: string,
  beneficiario: string,
  cidade: string,
  valor: number,
  identificador: string = '***'
): string {
  const cleanKey = normalizePixKey(chavePix || '03953418920');
  
  // Clean beneficiary (max 25 chars, uppercase, no accents)
  const cleanBeneficiary = (beneficiario || 'ZAPFUNNEL PAGAMENTOS BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .slice(0, 25)
    .trim()
    .toUpperCase() || 'RECEBEDOR PIX';

  // Clean city (max 15 chars, uppercase, no accents)
  const cleanCity = (cidade || 'SAO PAULO')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .slice(0, 15)
    .trim()
    .toUpperCase() || 'SAO PAULO';

  const formattedAmount = Number(valor > 0 ? valor : 1).toFixed(2);
  const cleanTxId = (identificador && identificador !== '***') 
    ? identificador.replace(/[^A-Za-z0-9]/g, '').slice(0, 25) 
    : '***';

  // 00: Payload Format Indicator (01)
  const p00 = formatField('00', '01');
  // 01: Point of Initiation Method (12 = dynamic, 11 = static)
  const p01 = formatField('01', '12');

  // 26: Merchant Account Information
  const gui = formatField('00', 'br.gov.bcb.pix');
  const keyField = formatField('01', cleanKey);
  const merchantAccountInfo = formatField('26', `${gui}${keyField}`);

  // 52: Merchant Category Code
  const mcc = formatField('52', '0000');
  // 53: Transaction Currency (986 = BRL)
  const currency = formatField('53', '986');
  // 54: Transaction Amount
  const amountField = formatField('54', formattedAmount);
  // 58: Country Code (BR)
  const country = formatField('58', 'BR');
  // 59: Merchant Name
  const merchantName = formatField('59', cleanBeneficiary);
  // 60: Merchant City
  const merchantCity = formatField('60', cleanCity);
  // 62: Additional Data Field (TxID)
  const txIdField = formatField('05', cleanTxId);
  const additionalData = formatField('62', txIdField);

  // Payload with CRC prefix
  const payloadWithoutCrc = `${p00}${p01}${merchantAccountInfo}${mcc}${currency}${amountField}${country}${merchantName}${merchantCity}${additionalData}6304`;
  const checksum = crc16(payloadWithoutCrc);

  return `${payloadWithoutCrc}${checksum}`;
}

/**
 * Generate 100% genuine, scan-compliant QR Code SVG string synchronously
 * using ISO/IEC 18004 standard with Reed-Solomon error correction
 */
export function generateQrCodeSvg(payload: string, size: number = 240): string {
  try {
    const qr = QRCode.create(payload, { errorCorrectionLevel: 'M' });
    const moduleCount = qr.modules.size;
    const margin = 2;
    const totalUnits = moduleCount + margin * 2;

    let path = '';
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qr.modules.get(r, c)) {
          path += `M${c + margin},${r + margin}h1v1h-1z`;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalUnits} ${totalUnits}" width="${size}" height="${size}" shape-rendering="crispEdges" class="mx-auto rounded-2xl bg-white p-3 shadow-lg w-56 h-56 sm:w-64 sm:h-64"><rect width="100%" height="100%" fill="#ffffff"/><path d="${path}" fill="#000000"/></svg>`;
  } catch (err) {
    console.error('Erro ao gerar QRCode SVG:', err);
    return '';
  }
}
