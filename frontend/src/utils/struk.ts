import { Transaction, TransactionItem } from '../types';
import { formatCurrency, formatDateTime } from './formatting';

export const generateStrukHTML = (transaction: Transaction, storeName = 'POS Store'): string => {
  const items = transaction.items || [];
  
  let html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Struk</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: monospace; background: white; }
        .receipt { width: 80mm; margin: 0 auto; padding: 10mm; }
        .header { text-align: center; margin-bottom: 10mm; border-bottom: 1px dashed #000; padding-bottom: 5mm; }
        .header h1 { font-size: 16px; margin-bottom: 5px; }
        .header p { font-size: 11px; margin: 2px 0; }
        .items { margin: 10mm 0; }
        .item { display: flex; justify-content: space-between; font-size: 11px; margin: 3px 0; }
        .item-name { flex: 1; }
        .item-qty { width: 30px; text-align: right; }
        .item-price { width: 40px; text-align: right; }
        .divider { border-bottom: 1px dashed #000; margin: 5mm 0; }
        .total-row { display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; margin: 5px 0; }
        .footer { text-align: center; font-size: 10px; margin-top: 10mm; border-top: 1px dashed #000; padding-top: 5mm; }
        @media print { body { margin: 0; padding: 0; } }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h1>${storeName}</h1>
          <p>ID: ${transaction.id.substring(0, 8)}</p>
          <p>${formatDateTime(transaction.created_at)}</p>
        </div>

        <div class="items">
          ${items.map(item => `
            <div class="item">
              <div class="item-name">${item.product_id}</div>
              <div class="item-qty">x${item.quantity}</div>
              <div class="item-price">${formatCurrency(item.price)}</div>
            </div>
          `).join('')}
        </div>

        <div class="divider"></div>

        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(transaction.subtotal)}</span>
        </div>

        ${transaction.discount_value > 0 ? `
          <div class="total-row" style="font-weight: normal; color: red;">
            <span>Diskon:</span>
            <span>-${formatCurrency(transaction.discount_value)}</span>
          </div>
        ` : ''}

        ${transaction.tax_value > 0 ? `
          <div class="total-row" style="font-weight: normal;">
            <span>Pajak (${transaction.tax_percent}%):</span>
            <span>${formatCurrency(transaction.tax_value)}</span>
          </div>
        ` : ''}

        <div class="divider"></div>

        <div class="total-row" style="font-size: 14px;">
          <span>TOTAL:</span>
          <span>${formatCurrency(transaction.total)}</span>
        </div>

        <div class="total-row" style="font-weight: normal;">
          <span>Dibayar:</span>
          <span>${formatCurrency(transaction.amount_paid)}</span>
        </div>

        <div class="total-row" style="font-weight: normal;">
          <span>Kembalian:</span>
          <span>${formatCurrency(transaction.change_amount)}</span>
        </div>

        <div class="footer">
          <p>Metode: ${transaction.payment_method}</p>
          <p>Terima kasih atas pembelian Anda!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
};

export const printStruk = (transaction: Transaction, storeName = 'POS Store') => {
  const html = generateStrukHTML(transaction, storeName);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
};

export const generatePDF = async (transaction: Transaction, storeName = 'POS Store') => {
  const html = generateStrukHTML(transaction, storeName);
  // Note: This requires html2pdf library to be properly integrated
  // For now, just use browser print to PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
};

export const generateWhatsAppMessage = (transaction: Transaction): string => {
  const items = transaction.items || [];
  let message = `*STRUK PENJUALAN*\n\n`;
  message += `ID Transaksi: ${transaction.id.substring(0, 8)}\n`;
  message += `Waktu: ${formatDateTime(transaction.created_at)}\n\n`;

  message += `*Detail Produk:*\n`;
  items.forEach(item => {
    message += `• ${item.product_id} x${item.quantity} = ${formatCurrency(item.subtotal)}\n`;
  });

  message += `\n*Ringkasan:*\n`;
  message += `Subtotal: ${formatCurrency(transaction.subtotal)}\n`;
  if (transaction.discount_value > 0) {
    message += `Diskon: -${formatCurrency(transaction.discount_value)}\n`;
  }
  if (transaction.tax_value > 0) {
    message += `Pajak: ${formatCurrency(transaction.tax_value)}\n`;
  }
  message += `*Total: ${formatCurrency(transaction.total)}*\n`;
  message += `Dibayar: ${formatCurrency(transaction.amount_paid)}\n`;
  message += `Kembalian: ${formatCurrency(transaction.change_amount)}\n`;

  return encodeURIComponent(message);
};

export const shareWhatsApp = (transaction: Transaction) => {
  const message = generateWhatsAppMessage(transaction);
  window.open(`https://wa.me/?text=${message}`, '_blank');
};
