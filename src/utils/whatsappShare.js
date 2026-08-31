/**
 * Utility to share a generated PDF file via WhatsApp
 * Uses Web Share API (native file attachment to WhatsApp) where available,
 * or triggers direct PDF download and opens WhatsApp Web on desktop.
 */
export const sharePdfFile = async ({
  file,
  blob,
  filename,
  type = 'invoice',
  docNumber = '',
  customerName = '',
  grandTotal = 0,
  showToast = (msg, type) => console.log(msg)
}) => {
  const isInvoice = type === 'invoice';
  const title = isInvoice ? `Invoice #${docNumber}` : `Quotation #${docNumber}`;
  const text = isInvoice 
    ? `Sri Mahaganapathy Electricals & Hardware - Invoice #${docNumber} for ₹${Number(grandTotal).toLocaleString('en-IN')}`
    : `Sri Mahaganapathy Electricals & Hardware - Quotation #${docNumber} for ₹${Number(grandTotal).toLocaleString('en-IN')}`;

  // Check if browser supports sharing files directly
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: title,
        text: text
      });
      showToast(`Shared ${title} successfully!`, 'success');
      return true;
    } catch (err) {
      if (err.name === 'AbortError') {
        // User simply closed the share sheet
        return false;
      }
      console.warn('Native share failed, falling back to download + WhatsApp web:', err);
    }
  }

  // Desktop / Fallback flow:
  // 1. Download PDF to device automatically
  try {
    const url = URL.createObjectURL(blob || file);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || (isInvoice ? `Invoice_${docNumber}.pdf` : `Quotation_${docNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    // 2. Open WhatsApp Web in a new tab so user can send to whoever they want
    window.open('https://web.whatsapp.com/', '_blank');

    showToast(`PDF downloaded (${filename})! Opening WhatsApp to share with client.`, 'success');
    return true;
  } catch (err) {
    console.error('Download/Open WhatsApp error:', err);
    showToast('Could not open WhatsApp: ' + err.message, 'error');
    return false;
  }
};
