import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  subscribeToProducts, 
  subscribeToInvoices, 
  subscribeToQuotations,
  subscribeToAppStatus,
  updateAppStatus,
  addProduct as fsAddProduct, 
  updateProduct as fsUpdateProduct, 
  deleteProduct as fsDeleteProduct, 
  bulkDeleteProductsByBrand,
  bulkImportProducts,
  deduplicateProducts,
  createInvoice as fsCreateInvoice,
  updateInvoice as fsUpdateInvoice,
  deleteInvoice as fsDeleteInvoice,
  purgeExpiredInvoices,
  createQuotation as fsCreateQuotation,
  updateQuotation as fsUpdateQuotation,
  deleteQuotation as fsDeleteQuotation,
  getShopSettings,
  saveShopSettings
} from '../firebase/firestoreService';
import { DEFAULT_PRODUCTS } from '../data/defaultProducts';
import { generateInvoiceNumber } from '../utils/formatters';

export const RETENTION_DAYS = 40;

export const getInvoiceExpiryInfo = (inv, retentionDays = RETENTION_DAYS) => {
  let createdTime = null;
  if (inv?.date) {
    createdTime = new Date(inv.date).getTime();
  } else if (inv?.createdAt?.toDate) {
    createdTime = inv.createdAt.toDate().getTime();
  } else if (inv?.createdAt?.seconds) {
    createdTime = inv.createdAt.seconds * 1000;
  } else {
    createdTime = Date.now();
  }

  const expiryTimestamp = createdTime + (retentionDays * 24 * 60 * 60 * 1000);
  const expiryDate = new Date(expiryTimestamp);
  const diffMs = expiryTimestamp - Date.now();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
  const isExpired = diffMs <= 0;

  return {
    createdTime,
    expiryDate,
    expiryTimestamp,
    daysLeft,
    isExpired,
    retentionDays
  };
};

const filterValidInvoices = (list) => {
  if (!Array.isArray(list)) return [];
  return list.filter((inv) => !getInvoiceExpiryInfo(inv).isExpired);
};

const AppContext = createContext();

const DEFAULT_SHOP_SETTINGS = {
  shopName: "Sri Mahaganapathy Electricals and Hardware",
  tagline: "Wholesale & Retail Electricals, Hardware Solutions",
  address: "1/110, Kaliamman Kovil Back Side, Maniyanur",
  phone: "+91 90876 83308",
  email: "srimahaganapathy.stores@gmail.com",
  gstin: "33AAAAA0000A1Z5",
  upiId: "9087683308@upi",
  invoicePrefix: "SMG-",
  quotationPrefix: "QUO-",
  defaultGstRate: 18,
  terms: "1. Goods once sold will not be taken back without original bill.\n2. Warranty as per manufacturer terms.\n3. Subject to local jurisdiction.",
  invoiceSequence: 0,
  quotationSequence: 0,
  thermalPrintMode: false
};

const sanitizeSettings = (loaded) => {
  if (!loaded) return DEFAULT_SHOP_SETTINGS;
  const result = { ...DEFAULT_SHOP_SETTINGS, ...loaded };
  // Replace old tagline if present
  if (result.tagline && result.tagline.includes('Leo Plast Pipes')) {
    result.tagline = "Wholesale & Retail Electricals, Hardware Solutions";
  }
  return result;
};

export const AppProvider = ({ children }) => {
  // Navigation View State: 'billing', 'quotations', 'products', 'invoices', 'dashboard', 'settings'
  const [currentTab, setCurrentTab] = useState('billing');

  // Datasets
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('mahaganapathy_cached_products') || localStorage.getItem('rajaganapathy_cached_products');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [invoices, setInvoices] = useState(() => {
    try {
      const cached = localStorage.getItem('mahaganapathy_cached_invoices') || localStorage.getItem('rajaganapathy_cached_invoices');
      return cached ? filterValidInvoices(JSON.parse(cached)) : [];
    } catch {
      return [];
    }
  });
  const [quotations, setQuotations] = useState(() => {
    try {
      const cached = localStorage.getItem('mahaganapathy_cached_quotations') || localStorage.getItem('rajaganapathy_cached_quotations');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('mahaganapathy_shop_settings') || localStorage.getItem('rajaganapathy_shop_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SHOP_SETTINGS;
  });

  // Active Billing Cart
  const [cart, setCart] = useState([]);
  const [activeInvoiceForPrint, setActiveInvoiceForPrint] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);

  // Active Quotation Cart & Print View
  const [quotationCart, setQuotationCart] = useState([]);
  const [activeQuotationForPrint, setActiveQuotationForPrint] = useState(null);
  const [editingQuotation, setEditingQuotation] = useState(null);

  // Statuses
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  const [firebaseError, setFirebaseError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [appStatus, setAppStatus] = useState({ isLocked: false });

  const showToast = (msg, type = 'success') => {
    setToastMessage({ message: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Real-time Firestore Subscriptions with Safety Timeout
  useEffect(() => {
    let isMounted = true;
    setIsLoadingProducts(true);

    // Safety timeout: if Firestore takes >2.5s (e.g. fresh DB or permission check), stop spinner
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoadingProducts(false);
      }
    }, 2500);

    // Subscribe to products
    const unsubProducts = subscribeToProducts(
      (data) => {
        if (!isMounted) return;
        setProducts(data);
        localStorage.setItem('mahaganapathy_cached_products', JSON.stringify(data));
        setIsLoadingProducts(false);
        setIsFirebaseConnected(true);
        setFirebaseError(null);
      },
      (error) => {
        console.warn('Firestore Products Error (using offline fallback if any):', error);
        if (!isMounted) return;
        setIsFirebaseConnected(false);
        setIsLoadingProducts(false);
        setFirebaseError(error.code || error.message);
      }
    );

    // Subscribe to invoices
    const unsubInvoices = subscribeToInvoices(
      (data) => {
        if (!isMounted) return;
        const validList = filterValidInvoices(data);
        setInvoices(validList);
        localStorage.setItem('mahaganapathy_cached_invoices', JSON.stringify(validList));
        
        // Auto purge expired bills older than 40 days from cloud Firestore in background
        purgeExpiredInvoices(RETENTION_DAYS).catch((err) => {
          console.warn('Auto purge error:', err);
        });
      },
      (error) => {
        console.warn('Firestore Invoices Error:', error);
      }
    );

    // Subscribe to quotations
    const unsubQuotations = subscribeToQuotations(
      (data) => {
        if (!isMounted) return;
        setQuotations(data);
        localStorage.setItem('mahaganapathy_cached_quotations', JSON.stringify(data));
      },
      (error) => {
        console.warn('Firestore Quotations Error:', error);
      }
    );

    // Subscribe to Remote App Status (Kill switch / Lock)
    const unsubAppStatus = subscribeToAppStatus(
      (data) => {
        if (!isMounted) return;
        setAppStatus(data || { isLocked: false });
      },
      (error) => {
        console.warn('Firestore App Status Error:', error);
      }
    );

    // Load Settings
    getShopSettings().then((remoteSettings) => {
      if (remoteSettings && isMounted) {
        setSettings((prev) => sanitizeSettings({ ...prev, ...remoteSettings }));
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      unsubProducts();
      unsubInvoices();
      unsubQuotations();
      unsubAppStatus();
    };
  }, []);

  // Sync settings locally whenever updated
  useEffect(() => {
    localStorage.setItem('mahaganapathy_shop_settings', JSON.stringify(settings));
  }, [settings]);

  // Seed default products to Firebase
  const seedStarterProducts = async () => {
    try {
      showToast('Uploading starter Electrical & Plumbing products to Firebase...', 'info');
      const count = await bulkImportProducts(DEFAULT_PRODUCTS);
      showToast(`Successfully uploaded ${count} products to Firebase!`, 'success');
      return count;
    } catch (err) {
      console.error('Seed error:', err);
      showToast('Failed to upload to Firebase: ' + err.message, 'error');
      throw err;
    }
  };

  // Remove Duplicate Products from Firebase
  const cleanDuplicateProducts = async () => {
    try {
      showToast('Scanning & removing duplicate products from database...', 'info');
      const deletedCount = await deduplicateProducts();
      if (deletedCount > 0) {
        showToast(`Cleaned up ${deletedCount} duplicate products successfully!`, 'success');
      } else {
        showToast('No duplicate products found in database.', 'info');
      }
      return deletedCount;
    } catch (err) {
      console.error('Deduplicate error:', err);
      showToast('Failed to clean duplicate products: ' + err.message, 'error');
      throw err;
    }
  };

  // Product CRUD
  const handleAddProduct = async (productData) => {
    try {
      await fsAddProduct(productData);
      showToast(`Product "${productData.name}" added successfully!`, 'success');
    } catch (e) {
      showToast('Error adding product: ' + e.message, 'error');
      throw e;
    }
  };

  const handleUpdateProduct = async (id, productData) => {
    try {
      await fsUpdateProduct(id, productData);
      showToast('Product updated successfully!', 'success');
    } catch (e) {
      showToast('Error updating product: ' + e.message, 'error');
      throw e;
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await fsDeleteProduct(id);
      showToast('Product removed from database.', 'success');
    } catch (e) {
      showToast('Error deleting product: ' + e.message, 'error');
    }
  };

  const handleDeleteBrand = async (brandName) => {
    try {
      if (!brandName) return 0;
      showToast(`Deleting all products under brand "${brandName}"...`, 'info');
      const deletedCount = await bulkDeleteProductsByBrand(brandName);
      
      // Remove brand color from settings if present
      const updatedBrandColors = { ...(settings.brandColors || {}) };
      delete updatedBrandColors[brandName];
      const newSettings = { ...settings, brandColors: updatedBrandColors };
      await saveShopSettings(newSettings);
      setSettings(newSettings);

      showToast(`Brand "${brandName}" and ${deletedCount} products deleted successfully!`, 'success');
      return deletedCount;
    } catch (e) {
      console.error('Error deleting brand:', e);
      showToast('Failed to delete brand products: ' + e.message, 'error');
      throw e;
    }
  };

  // ==========================================
  // CART & BILLING OPERATIONS
  // ==========================================

  const addToCart = (product, variant) => {
    setCart((prevCart) => {
      const cartItemId = `${product.id}_${variant.size}`;
      const existingIndex = prevCart.findIndex((item) => item.cartItemId === cartItemId);

      if (existingIndex > -1) {
        // Increment quantity
        const updated = [...prevCart];
        updated[existingIndex].qty += 1;
        return updated;
      }

      // Add new item
      const newItem = {
        cartItemId,
        productId: product.id || '',
        name: product.name,
        category: product.category,
        brand: product.brand || '',
        hsnCode: product.hsnCode || '',
        gstRate: product.gstRate !== undefined ? product.gstRate : 18,
        size: variant.size,
        unit: variant.unit || 'Pcs',
        price: Number(variant.price) || 0,
        mrp: Number(variant.mrp) || Number(variant.price) || 0,
        qty: 1,
        discountPercent: 0,
        availableStock: variant.stock || 0
      };

      return [newItem, ...prevCart];
    });
  };

  const updateCartItem = (cartItemId, updates) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const updated = { ...item, ...updates };
          if (updated.qty < 0.1) updated.qty = 0.1;
          return updated;
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Finalize & Save Bill to Firestore
  const processCheckout = async ({ 
    invoiceNumber: customInvNum,
    customerName, 
    customerPhone, 
    customerGstin,
    paymentMode, 
    notes, 
    discountOverall = 0, 
    discountType = 'percent', 
    discountAmountDirect = 0,
    isGstBill = true,
    showDiscount = true
  }) => {
    if (cart.length === 0) {
      showToast('Cart is empty. Please add items to create a bill.', 'error');
      return null;
    }

    const nextSeq = (settings.invoiceSequence !== undefined ? Number(settings.invoiceSequence) : 0) + 1;
    const isCustom = Boolean(customInvNum && customInvNum.trim());
    const invNumber = isCustom ? customInvNum.trim() : generateInvoiceNumber(nextSeq, settings.invoicePrefix || 'SMG-');

    // Calculate Bill Totals
    let subtotal = 0;
    let totalTax = 0;

    const finalizedItems = cart.map((item) => {
      const lineBase = item.price * item.qty;
      const itemDiscount = (lineBase * (item.discountPercent || 0)) / 100;
      const lineTaxable = lineBase - itemDiscount;
      const gstRate = item.gstRate !== undefined ? item.gstRate : 18;
      const itemTax = isGstBill ? (lineTaxable * gstRate) / 100 : 0;
      const cgstRate = gstRate / 2;
      const sgstRate = gstRate / 2;
      const cgstAmount = isGstBill ? Number((itemTax / 2).toFixed(2)) : 0;
      const sgstAmount = isGstBill ? Number((itemTax / 2).toFixed(2)) : 0;
      const lineTotal = lineTaxable + itemTax;

      subtotal += lineTaxable;
      totalTax += itemTax;

      return {
        ...item,
        gstRate,
        cgstRate,
        sgstRate,
        cgstAmount,
        sgstAmount,
        lineBase,
        itemDiscount,
        lineTaxable,
        itemTax,
        lineTotal
      };
    });

    const netBeforeOverall = subtotal + totalTax;
    let finalOverallDiscount = 0;
    let finalDiscountPercent = 0;

    if (discountType === 'amount') {
      finalOverallDiscount = Math.min(netBeforeOverall, Math.max(0, Number(discountAmountDirect) || 0));
      finalDiscountPercent = netBeforeOverall > 0 ? Number(((finalOverallDiscount / netBeforeOverall) * 100).toFixed(2)) : 0;
    } else {
      finalDiscountPercent = Number(discountOverall) || 0;
      finalOverallDiscount = (netBeforeOverall * finalDiscountPercent) / 100;
    }

    const grandTotal = Math.round(netBeforeOverall - finalOverallDiscount);
    const roundOff = Number((grandTotal - (netBeforeOverall - finalOverallDiscount)).toFixed(2));
    const cgstTotal = isGstBill ? Number((totalTax / 2).toFixed(2)) : 0;
    const sgstTotal = isGstBill ? Number((totalTax / 2).toFixed(2)) : 0;

    const invoicePayload = {
      invoiceNumber: invNumber,
      date: new Date().toISOString(),
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim() || '',
      customerGstin: customerGstin ? customerGstin.trim().toUpperCase() : '',
      paymentMode: paymentMode || 'Cash',
      items: finalizedItems,
      totalItemsCount: cart.length,
      subtotal: Number(subtotal.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      cgstAmount: cgstTotal,
      sgstAmount: sgstTotal,
      igstAmount: 0,
      discountOverall: finalDiscountPercent,
      discountAmount: Number(finalOverallDiscount.toFixed(2)),
      discountType: discountType || 'percent',
      discountAmountDirect: discountType === 'amount' ? Number(discountAmountDirect || finalOverallDiscount) : 0,
      roundOff,
      grandTotal,
      isGstBill,
      showDiscount: showDiscount !== false,
      notes: notes || '',
      shopDetails: {
        name: settings.shopName,
        phone: settings.phone,
        address: settings.address,
        gstin: settings.gstin
      }
    };

    try {
      const docId = await fsCreateInvoice(invoicePayload);
      invoicePayload.id = docId;

      // Update sequence in settings only if system auto-generated
      if (!isCustom) {
        const newSettings = { ...settings, invoiceSequence: nextSeq };
        setSettings(newSettings);
        saveShopSettings({ invoiceSequence: nextSeq });
      }

      // Clear cart & trigger print preview
      clearCart();
      setActiveInvoiceForPrint(invoicePayload);
      showToast(`Bill #${invNumber} generated successfully! Total: ₹${grandTotal}`, 'success');

      return invoicePayload;
    } catch (e) {
      console.error('Checkout error:', e);
      showToast('Error saving invoice to Firebase: ' + e.message, 'error');
      throw e;
    }
  };

  // ==========================================
  // INVOICE EDITING OPERATIONS
  // ==========================================

  const loadInvoiceForEdit = (invoice) => {
    if (!invoice) return;
    const targetInvoice = invoice.id ? invoice : (invoices.find((inv) => inv.invoiceNumber === invoice.invoiceNumber) || invoice);
    const cartItems = (targetInvoice.items || []).map((item, idx) => ({
      cartItemId: item.cartItemId || `${item.productId || 'item'}_${item.size || 'std'}_${idx}`,
      productId: item.productId || '',
      name: item.name || '',
      category: item.category || 'General',
      brand: item.brand || '',
      hsnCode: item.hsnCode || '',
      gstRate: item.gstRate !== undefined ? item.gstRate : 18,
      size: item.size || 'Standard',
      unit: item.unit || 'Pcs',
      price: Number(item.price) || 0,
      mrp: Number(item.mrp) || Number(item.price) || 0,
      qty: Number(item.qty) || 1,
      discountPercent: Number(item.discountPercent) || 0,
      availableStock: item.availableStock || 100
    }));

    setCart(cartItems);
    setEditingInvoice(targetInvoice);
    setCurrentTab('billing');
    showToast(`Loaded Bill #${targetInvoice.invoiceNumber} for editing.`, 'info');
  };

  const cancelInvoiceEdit = () => {
    setEditingInvoice(null);
    clearCart();
    showToast('Cancelled invoice edit mode.', 'info');
  };

  const updateExistingInvoice = async ({
    invoiceNumber: customInvNum,
    customerName,
    customerPhone,
    customerGstin,
    paymentMode,
    notes,
    discountOverall = 0,
    discountType = 'percent',
    discountAmountDirect = 0,
    isGstBill = true,
    showDiscount = true
  }) => {
    if (!editingInvoice) return null;
    if (cart.length === 0) {
      showToast('Bill is empty. Please add items first.', 'error');
      return null;
    }

    const finalInvoiceNumber = customInvNum && customInvNum.trim() ? customInvNum.trim() : editingInvoice.invoiceNumber;

    let subtotal = 0;
    let totalTax = 0;

    const finalizedItems = cart.map((item) => {
      const lineBase = item.price * item.qty;
      const itemDiscount = (lineBase * (item.discountPercent || 0)) / 100;
      const lineTaxable = lineBase - itemDiscount;
      const gstRate = item.gstRate !== undefined ? item.gstRate : 18;
      const itemTax = isGstBill ? (lineTaxable * gstRate) / 100 : 0;
      const cgstRate = gstRate / 2;
      const sgstRate = gstRate / 2;
      const cgstAmount = itemTax / 2;
      const sgstAmount = itemTax / 2;
      const lineTotal = lineTaxable + itemTax;

      subtotal += lineTaxable;
      totalTax += itemTax;

      return {
        ...item,
        gstRate,
        cgstRate,
        sgstRate,
        cgstAmount,
        sgstAmount,
        lineBase,
        itemDiscount,
        lineTaxable,
        itemTax,
        lineTotal
      };
    });

    const netBeforeOverall = subtotal + totalTax;
    let finalOverallDiscount = 0;
    let finalDiscountPercent = 0;

    if (discountType === 'amount') {
      finalOverallDiscount = Math.min(netBeforeOverall, Math.max(0, Number(discountAmountDirect) || 0));
      finalDiscountPercent = netBeforeOverall > 0 ? Number(((finalOverallDiscount / netBeforeOverall) * 100).toFixed(2)) : 0;
    } else {
      finalDiscountPercent = Number(discountOverall) || 0;
      finalOverallDiscount = (netBeforeOverall * finalDiscountPercent) / 100;
    }

    const grandTotal = Math.round(netBeforeOverall - finalOverallDiscount);
    const roundOff = Number((grandTotal - (netBeforeOverall - finalOverallDiscount)).toFixed(2));
    const cgstTotal = isGstBill ? Number((totalTax / 2).toFixed(2)) : 0;
    const sgstTotal = isGstBill ? Number((totalTax / 2).toFixed(2)) : 0;

    const invoicePayload = {
      ...editingInvoice,
      invoiceNumber: finalInvoiceNumber,
      customerName: customerName ? customerName.trim() || 'Walk-in Customer' : 'Walk-in Customer',
      customerPhone: customerPhone ? customerPhone.trim() : '',
      customerGstin: customerGstin ? customerGstin.trim().toUpperCase() : '',
      paymentMode: paymentMode || 'Cash',
      items: finalizedItems,
      totalItemsCount: cart.length,
      subtotal: Number(subtotal.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      cgstAmount: cgstTotal,
      sgstAmount: sgstTotal,
      igstAmount: 0,
      discountOverall: finalDiscountPercent,
      discountAmount: Number(finalOverallDiscount.toFixed(2)),
      discountType: discountType || 'percent',
      discountAmountDirect: discountType === 'amount' ? Number(discountAmountDirect || finalOverallDiscount) : 0,
      roundOff,
      grandTotal,
      isGstBill,
      showDiscount: showDiscount !== false,
      notes: notes || '',
      updatedAt: new Date().toISOString()
    };

    try {
      const targetDocId = editingInvoice.id || (invoices.find((inv) => inv.invoiceNumber === editingInvoice.invoiceNumber)?.id);
      await fsUpdateInvoice(targetDocId, invoicePayload);

      setEditingInvoice(null);
      clearCart();
      setActiveInvoiceForPrint(invoicePayload);
      showToast(`Bill #${finalInvoiceNumber} updated successfully! Total: ₹${grandTotal}`, 'success');

      return invoicePayload;
    } catch (e) {
      console.error('Update invoice error:', e);
      showToast('Error updating invoice in Firebase: ' + e.message, 'error');
      throw e;
    }
  };

  const updateInvoiceNumberOnly = async (invoiceId, newInvoiceNumber) => {
    try {
      if (!newInvoiceNumber || !newInvoiceNumber.trim()) {
        showToast('Bill number cannot be empty', 'error');
        return false;
      }
      const trimmedNumber = newInvoiceNumber.trim().toUpperCase();
      const targetInvoice = invoices.find((inv) => inv.id === invoiceId || inv.invoiceNumber === invoiceId);
      const targetDocId = targetInvoice?.id || invoiceId;

      await fsUpdateInvoice(targetDocId, {
        invoiceNumber: trimmedNumber,
        updatedAt: new Date().toISOString()
      });

      if (activeInvoiceForPrint && (activeInvoiceForPrint.id === targetDocId || activeInvoiceForPrint.invoiceNumber === invoiceId)) {
        setActiveInvoiceForPrint((prev) => prev ? { ...prev, invoiceNumber: trimmedNumber } : null);
      }

      showToast(`Bill number updated to #${trimmedNumber}`, 'success');
      return true;
    } catch (err) {
      console.error('Error updating bill number:', err);
      showToast('Failed to update bill number: ' + err.message, 'error');
      throw err;
    }
  };

  // ==========================================
  // QUOTATION / ESTIMATE OPERATIONS
  // ==========================================

  const addToQuotationCart = (product, variant) => {
    setQuotationCart((prevCart) => {
      const cartItemId = `${product.id}_${variant.size}`;
      const existingIndex = prevCart.findIndex((item) => item.cartItemId === cartItemId);

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].qty += 1;
        return updated;
      }

      const newItem = {
        cartItemId,
        productId: product.id || '',
        name: product.name,
        category: product.category,
        brand: product.brand || '',
        hsnCode: product.hsnCode || '',
        gstRate: product.gstRate !== undefined ? product.gstRate : 18,
        size: variant.size,
        unit: variant.unit || 'Pcs',
        price: Number(variant.price) || 0,
        mrp: Number(variant.mrp) || Number(variant.price) || 0,
        qty: 1,
        discountPercent: 0,
        availableStock: variant.stock || 0
      };

      return [newItem, ...prevCart];
    });
  };

  const updateQuotationCartItem = (cartItemId, updates) => {
    setQuotationCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const updated = { ...item, ...updates };
          if (updated.qty < 0.1) updated.qty = 0.1;
          return updated;
        }
        return item;
      })
    );
  };

  const removeFromQuotationCart = (cartItemId) => {
    setQuotationCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearQuotationCart = () => {
    setQuotationCart([]);
  };

  // Finalize & Save Quotation
  const processQuotation = async ({ 
    customerName, 
    customerPhone, 
    customerGstin,
    siteLocation, 
    validityDays = 15, 
    notes, 
    discountOverall = 0, 
    discountType = 'percent',
    discountAmountDirect = 0,
    isGstEstimate = true,
    showDiscount = true
  }) => {
    if (quotationCart.length === 0) {
      showToast('Quotation list is empty. Please add items first.', 'error');
      return null;
    }

    const nextSeq = (settings.quotationSequence !== undefined ? Number(settings.quotationSequence) : 0) + 1;
    const prefix = settings.quotationPrefix || 'QUO-';
    const quoNumber = `${prefix}${new Date().getFullYear()}-${String(nextSeq).padStart(4, '0')}`;

    let subtotal = 0;
    let totalTax = 0;

    const finalizedItems = quotationCart.map((item) => {
      const lineBase = item.price * item.qty;
      const itemDiscount = (lineBase * (item.discountPercent || 0)) / 100;
      const lineTaxable = lineBase - itemDiscount;
      const gstRate = item.gstRate !== undefined ? item.gstRate : 18;
      const itemTax = isGstEstimate ? (lineTaxable * gstRate) / 100 : 0;
      const cgstRate = gstRate / 2;
      const sgstRate = gstRate / 2;
      const cgstAmount = isGstEstimate ? Number((itemTax / 2).toFixed(2)) : 0;
      const sgstAmount = isGstEstimate ? Number((itemTax / 2).toFixed(2)) : 0;
      const lineTotal = lineTaxable + itemTax;

      subtotal += lineTaxable;
      totalTax += itemTax;

      return {
        ...item,
        gstRate,
        cgstRate,
        sgstRate,
        cgstAmount,
        sgstAmount,
        lineBase,
        itemDiscount,
        lineTaxable,
        itemTax,
        lineTotal
      };
    });

    const netBeforeOverall = subtotal + totalTax;
    let finalOverallDiscount = 0;
    let finalDiscountPercent = 0;

    if (discountType === 'amount') {
      finalOverallDiscount = Math.min(netBeforeOverall, Math.max(0, Number(discountAmountDirect) || 0));
      finalDiscountPercent = netBeforeOverall > 0 ? Number(((finalOverallDiscount / netBeforeOverall) * 100).toFixed(2)) : 0;
    } else {
      finalDiscountPercent = Number(discountOverall) || 0;
      finalOverallDiscount = (netBeforeOverall * finalDiscountPercent) / 100;
    }

    const grandTotal = Math.round(netBeforeOverall - finalOverallDiscount);
    const roundOff = Number((grandTotal - (netBeforeOverall - finalOverallDiscount)).toFixed(2));
    const cgstTotal = isGstEstimate ? Number((totalTax / 2).toFixed(2)) : 0;
    const sgstTotal = isGstEstimate ? Number((totalTax / 2).toFixed(2)) : 0;

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + Number(validityDays || 15));

    const quotationPayload = {
      quotationNumber: quoNumber,
      date: new Date().toISOString(),
      validUntil: validUntilDate.toISOString(),
      validityDays: Number(validityDays || 15),
      customerName: customerName.trim() || 'Prospective Client',
      customerPhone: customerPhone.trim() || '',
      customerGstin: customerGstin ? customerGstin.trim().toUpperCase() : '',
      siteLocation: siteLocation ? siteLocation.trim() : '',
      items: finalizedItems,
      totalItemsCount: quotationCart.length,
      subtotal: Number(subtotal.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      cgstAmount: cgstTotal,
      sgstAmount: sgstTotal,
      igstAmount: 0,
      discountOverall: finalDiscountPercent,
      discountAmount: Number(finalOverallDiscount.toFixed(2)),
      roundOff,
      grandTotal,
      isGstEstimate,
      showDiscount: showDiscount !== false,
      notes: notes || '',
      status: 'Active', // 'Active' | 'Converted' | 'Expired'
      shopDetails: {
        name: settings.shopName,
        phone: settings.phone,
        address: settings.address,
        gstin: settings.gstin
      }
    };

    try {
      const docId = await fsCreateQuotation(quotationPayload);
      quotationPayload.id = docId;

      // Update sequence in settings
      const newSettings = { ...settings, quotationSequence: nextSeq };
      setSettings(newSettings);
      saveShopSettings({ quotationSequence: nextSeq });

      clearQuotationCart();
      setActiveQuotationForPrint(quotationPayload);
      showToast(`Quotation #${quoNumber} created! Total: ₹${grandTotal}`, 'success');

      return quotationPayload;
    } catch (e) {
      console.error('Quotation save error:', e);
      showToast('Error saving quotation: ' + e.message, 'error');
      throw e;
    }
  };

  // Convert Quotation into Active Counter Bill
  const convertQuotationToActiveBill = (quotation) => {
    if (!quotation || !quotation.items || quotation.items.length === 0) {
      showToast('No items found in quotation to convert.', 'error');
      return;
    }

    // Map quotation items to bill cart format
    const billItems = quotation.items.map((item, idx) => ({
      cartItemId: `${item.productId || 'item'}_${item.size || 'std'}_${idx}`,
      productId: item.productId || '',
      name: item.name,
      category: item.category || 'General',
      brand: item.brand || '',
      hsnCode: item.hsnCode || '',
      gstRate: item.gstRate !== undefined ? item.gstRate : 18,
      size: item.size,
      unit: item.unit || 'Pcs',
      price: Number(item.price) || 0,
      mrp: Number(item.mrp) || Number(item.price) || 0,
      qty: Number(item.qty) || 1,
      discountPercent: Number(item.discountPercent) || 0,
      availableStock: item.availableStock || 50
    }));

    setCart(billItems);
    setCurrentTab('billing');
    showToast(`Quotation #${quotation.quotationNumber} loaded into Counter Bill! Ready to checkout.`, 'success');
  };

  // Load existing Quotation for editing
  const loadQuotationForEdit = (quotation) => {
    if (!quotation) return;
    const cartItems = (quotation.items || []).map((item, idx) => ({
      cartItemId: item.cartItemId || `${item.productId || 'quo_item'}_${item.size || 'std'}_${idx}`,
      productId: item.productId || '',
      name: item.name || '',
      category: item.category || 'General',
      brand: item.brand || '',
      hsnCode: item.hsnCode || '',
      gstRate: item.gstRate !== undefined ? item.gstRate : 18,
      size: item.size || 'Standard',
      unit: item.unit || 'Pcs',
      price: Number(item.price) || 0,
      mrp: Number(item.mrp) || Number(item.price) || 0,
      qty: Number(item.qty) || 1,
      discountPercent: Number(item.discountPercent) || 0,
      availableStock: item.availableStock || 100
    }));
    setQuotationCart(cartItems);
    setEditingQuotation(quotation);
    setCurrentTab('quotations');
    showToast(`Loaded Quotation #${quotation.quotationNumber} for editing.`, 'info');
  };

  const cancelQuotationEdit = () => {
    setEditingQuotation(null);
    clearQuotationCart();
    showToast('Cancelled quotation edit mode.', 'info');
  };

  // Update existing Quotation in Firestore
  const updateExistingQuotation = async ({ 
    customerName, 
    customerPhone, 
    customerGstin,
    siteLocation, 
    validityDays = 15, 
    notes, 
    discountOverall = 0, 
    discountType = 'percent',
    discountAmountDirect = 0, 
    isGstEstimate = true,
    showDiscount = true
  }) => {
    if (!editingQuotation) {
      showToast('No active quotation in edit mode.', 'error');
      return null;
    }
    if (quotationCart.length === 0) {
      showToast('Quotation list is empty. Please add items first.', 'error');
      return null;
    }

    let subtotal = 0;
    let totalTax = 0;

    const finalizedItems = quotationCart.map((item) => {
      const lineBase = item.price * item.qty;
      const itemDiscount = (lineBase * (item.discountPercent || 0)) / 100;
      const lineTaxable = lineBase - itemDiscount;
      const itemTax = isGstEstimate ? (lineTaxable * (item.gstRate !== undefined ? item.gstRate : 18)) / 100 : 0;
      const lineTotal = lineTaxable + itemTax;

      subtotal += lineTaxable;
      totalTax += itemTax;

      return {
        ...item,
        lineBase,
        itemDiscount,
        lineTaxable,
        itemTax,
        lineTotal
      };
    });

    const netBeforeOverall = subtotal + totalTax;
    let finalOverallDiscount = 0;
    let finalDiscountPercent = 0;

    if (discountType === 'amount') {
      finalOverallDiscount = Math.min(netBeforeOverall, Math.max(0, Number(discountAmountDirect) || 0));
      finalDiscountPercent = netBeforeOverall > 0 ? Number(((finalOverallDiscount / netBeforeOverall) * 100).toFixed(2)) : 0;
    } else {
      finalDiscountPercent = Number(discountOverall) || 0;
      finalOverallDiscount = (netBeforeOverall * finalDiscountPercent) / 100;
    }

    const grandTotal = Math.round(netBeforeOverall - finalOverallDiscount);
    const roundOff = Number((grandTotal - (netBeforeOverall - finalOverallDiscount)).toFixed(2));

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + Number(validityDays || 15));

    const updatedPayload = {
      quotationNumber: editingQuotation.quotationNumber,
      date: editingQuotation.date || new Date().toISOString(),
      customerName: customerName.trim() || 'Prospective Client',
      customerPhone: customerPhone.trim() || '',
      customerGstin: customerGstin ? customerGstin.trim().toUpperCase() : '',
      siteLocation: siteLocation ? siteLocation.trim() : '',
      validityDays: Number(validityDays || 15),
      validUntil: validUntilDate.toISOString(),
      items: finalizedItems,
      totalItemsCount: quotationCart.length,
      subtotal: Number(subtotal.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      discountOverall: finalDiscountPercent,
      discountAmount: Number(finalOverallDiscount.toFixed(2)),
      roundOff,
      grandTotal,
      isGstEstimate,
      showDiscount: showDiscount !== false,
      notes: notes || '',
      shopDetails: {
        name: settings.shopName,
        phone: settings.phone,
        address: settings.address,
        gstin: settings.gstin
      }
    };

    try {
      const docId = await fsUpdateQuotation(editingQuotation.id, updatedPayload);

      const fullQuotation = {
        ...editingQuotation,
        ...updatedPayload,
        id: docId || editingQuotation.id
      };

      setEditingQuotation(null);
      clearQuotationCart();
      setActiveQuotationForPrint(fullQuotation);
      showToast(`Quotation #${editingQuotation.quotationNumber} updated successfully! Total: ₹${grandTotal}`, 'success');

      return fullQuotation;
    } catch (e) {
      console.error('Quotation update error:', e);
      showToast('Error updating quotation: ' + e.message, 'error');
      throw e;
    }
  };

  const deleteQuotationRecord = async (id) => {
    try {
      await fsDeleteQuotation(id);
      showToast('Quotation deleted.', 'success');
    } catch (e) {
      showToast('Error deleting quotation: ' + e.message, 'error');
    }
  };

  const updateShopSettings = async (newSettings) => {
    setSettings(newSettings);
    try {
      await saveShopSettings(newSettings);
      showToast('Shop details saved successfully!', 'success');
    } catch (e) {
      showToast('Saved locally (Firebase sync error: ' + e.message + ')', 'info');
    }
  };

  const deleteInvoiceRecord = async (id) => {
    try {
      await fsDeleteInvoice(id);
      showToast('Invoice deleted.', 'success');
    } catch (e) {
      showToast('Error deleting invoice: ' + e.message, 'error');
    }
  };

  const toggleAppLock = async (locked) => {
    try {
      await updateAppStatus({
        isLocked: locked,
        updatedAt: new Date().toISOString()
      });
      showToast(
        locked 
          ? 'Application status set to: BLOCKED / HALTED' 
          : 'Application status set to: ACTIVE / UNLOCKED',
        locked ? 'error' : 'success'
      );
    } catch (e) {
      showToast('Error updating App Status: ' + e.message, 'error');
      throw e;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        products,
        invoices,
        quotations,
        settings,
        cart,
        activeInvoiceForPrint,
        setActiveInvoiceForPrint,
        editingInvoice,
        setEditingInvoice,
        loadInvoiceForEdit,
        cancelInvoiceEdit,
        updateExistingInvoice,
        quotationCart,
        activeQuotationForPrint,
        setActiveQuotationForPrint,
        editingQuotation,
        setEditingQuotation,
        loadQuotationForEdit,
        cancelQuotationEdit,
        updateExistingQuotation,
        isLoadingProducts,
        isFirebaseConnected,
        firebaseError,
        toastMessage,
        showToast,
        appStatus,
        toggleAppLock,
        seedStarterProducts,
        cleanDuplicateProducts,
        handleAddProduct,
        handleUpdateProduct,
        handleDeleteProduct,
        handleDeleteBrand,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        processCheckout,
        addToQuotationCart,
        updateQuotationCartItem,
        removeFromQuotationCart,
        clearQuotationCart,
        processQuotation,
        deleteQuotationRecord,
        convertQuotationToActiveBill,
        updateShopSettings,
        deleteInvoiceRecord,
        updateInvoiceNumberOnly
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
