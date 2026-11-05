/**
 * PIX EMV Standard & Dynamic Payload Generator
 */

// Generate standard EMV formatted PIX Payload
export function generatePixCopiaECola(
  chavePix: string,
  beneficiario: string,
  cidade: string,
  valor: number,
  identificador: string
): string {
  const cleanKey = chavePix.trim();
  const cleanBeneficiary = beneficiario.slice(0, 25).trim().toUpperCase();
  const cleanCity = cidade.slice(0, 15).trim().toUpperCase();
  const formattedAmount = valor.toFixed(2);
  const cleanTxId = (identificador || 'PAGTO').replace(/[^a-zA-Z0-9]/g, '').slice(0, 25);

  function formatField(id: string, value: string): string {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  }

  // Merchant Account Information (GUI + Chave)
  const gui = formatField('00', 'br.gov.bcb.pix');
  const keyField = formatField('01', cleanKey);
  const merchantAccountInfo = formatField('26', `${gui}${keyField}`);

  // Merchant Category Code
  const mcc = formatField('52', '0000');
  // Currency code 986 = BRL
  const currency = formatField('53', '986');
  // Transaction Amount
  const amountField = formatField('54', formattedAmount);
  // Country Code
  const country = formatField('58', 'BR');
  // Merchant Name
  const merchantName = formatField('59', cleanBeneficiary);
  // Merchant City
  const merchantCity = formatField('60', cleanCity);
  // Additional Data Field (TxID)
  const txIdField = formatField('05', cleanTxId);
  const additionalData = formatField('62', txIdField);

  // Payload without CRC
  const payloadWithoutCrc = `000201${merchantAccountInfo}${mcc}${currency}${amountField}${country}${merchantName}${merchantCity}${additionalData}6304`;

  // Calculate CRC16 (CCITT-FALSE)
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

  const crc = crc16(payloadWithoutCrc);
  return `${payloadWithoutCrc}${crc}`;
}

/**
 * Generate a visual 29x29 matrix pseudo-QR code in SVG for instant rendering.
 * It encodes position detection patterns and deterministic hash pattern based on payload.
 */
export function generateQrCodeSvg(payload: string, size: number = 240): string {
  const matrixSize = 29;
  const matrix: boolean[][] = Array(matrixSize)
    .fill(false)
    .map(() => Array(matrixSize).fill(false));

  // Add Finder Patterns at 3 corners
  function drawFinderPattern(startX: number, startY: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startY + r][startX + c] = isBorder || isCenter;
      }
    }
  }

  drawFinderPattern(0, 0); // Top-left
  drawFinderPattern(matrixSize - 7, 0); // Top-right
  drawFinderPattern(0, matrixSize - 7); // Bottom-left

  // Timing patterns
  for (let i = 8; i < matrixSize - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Deterministic hash fill for data area
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash * 31 + payload.charCodeAt(i)) >>> 0;
  }

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Skip finder zones
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= matrixSize - 8;
      const inBottomLeft = r >= matrixSize - 8 && c < 8;
      const inTiming = r === 6 || c === 6;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming) {
        // Pseudo-random bit based on position & payload hash
        const bit = ((hash ^ (r * 37 + c * 17)) + (r * c)) % 3 !== 0;
        matrix[r][c] = bit;
      }
    }
  }

  const cellSize = size / matrixSize;
  let rects = '';
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        rects += `<rect x="${(c * cellSize).toFixed(1)}" y="${(r * cellSize).toFixed(1)}" width="${cellSize.toFixed(1)}" height="${cellSize.toFixed(1)}" fill="#000000" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="mx-auto rounded-lg bg-white p-2 shadow-inner">${rects}</svg>`;
}
