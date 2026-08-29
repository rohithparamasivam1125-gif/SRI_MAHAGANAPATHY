import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  subscribeToProducts, 
  subscribeToInvoices, 
  subscribeToQuotations,
  addProduct as fsAddProduct, 
  updateProduct as fsUpdateProduct, 
  deleteProduct as fsDeleteProduct, 
  bulkImportProducts,
  createInvoice as fsCreateInvoice,
  deleteInvoice as fsDeleteInvoice,
  createQuotation as fsCreateQuotation,
  deleteQuotation as fsDeleteQuotation,
  getShopSettings,
  saveShopSettings
} from '../firebase/firestoreService';
import { DEFAULT_PRODUCTS } from '../data/defaultProducts';
import { generateInvoiceNumber } from '../utils/formatters';

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
  invoiceSequence: 101,
  quotationSequence: 101,
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
      return cached ? JSON.parse(cached) : [];
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

  // Active Quotation Cart & Print View
  const [quotationCart, setQuotationCart] = useState([]);
  const [activeQuotationForPrint, setActiveQuotationForPrint] = useState(null);

  // Statuses
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  const [firebaseError, setFirebaseError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

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
        setInvoices(data);
        localStorage.setItem('mahaganapathy_cached_invoices', JSON.stringify(data));
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
    customerName, 
    customerPhone, 
    paymentMode, 
    notes, 
    discountOverall = 0, 
    discountType = 'percent', 
    discountAmountDirect = 0,
    isGstBill = true 
  }) => {
    if (cart.length === 0) {
      showToast('Cart is empty. Please add items to create a bill.', 'error');
      return null;
    }

    const nextSeq = (settings.invoiceSequence || 100) + 1;
    const invNumber = generateInvoiceNumber(nextSeq, settings.invoicePrefix || 'SMG-');

    // Calculate Bill Totals
    let subtotal = 0;
    let totalTax = 0;

    const finalizedItems = cart.map((item) => {
      const lineBase = item.price * item.qty;
      const itemDiscount = (lineBase * (item.discountPercent || 0)) / 100;
      const lineTaxable = lineBase - itemDiscount;
      const itemTax = isGstBill ? (lineTaxable * (item.gstRate || 0)) / 100 : 0;
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

    const invoicePayload = {
      invoiceNumber: invNumber,
      date: new Date().toISOString(),
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim() || '',
      paymentMode: paymentMode || 'Cash',
      items: finalizedItems,
      totalItemsCount: cart.length,
      subtotal: Number(subtotal.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      discountOverall: finalDiscountPercent,
      discountAmount: Number(finalOverallDiscount.toFixed(2)),
      roundOff,
      grandTotal,
      isGstBill,
      notes: notes || '',
      shopDetails: {
        name: settings.shopName,
        phone: settings.phone,
        address: settings.address,
        gstin: settings.gstin
      }
    };

    try {
      await fsCreateInvoice(invoicePayload);

      // Update sequence in settings
      const newSettings = { ...settings, invoiceSequence: nextSeq };
      setSettings(newSettings);
      saveShopSettings({ invoiceSequence: nextSeq });

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
    siteLocation, 
    validityDays = 15, 
    notes, 
    discountOverall = 0, 
    discountType = 'percent',
    discountAmountDirect = 0,
    isGstEstimate = true 
  }) => {
    if (quotationCart.length === 0) {
      showToast('Quotation list is empty. Please add items first.', 'error');
      return null;
    }

    const nextSeq = (settings.quotationSequence || 100) + 1;
    const prefix = settings.quotationPrefix || 'QUO-';
    const quoNumber = `${prefix}${new Date().getFullYear()}-${String(nextSeq).padStart(4, '0')}`;

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

    const quotationPayload = {
      quotationNumber: quoNumber,
      date: new Date().toISOString(),
      validUntil: validUntilDate.toISOString(),
      validityDays: Number(validityDays || 15),
      customerName: customerName.trim() || 'Prospective Client',
      customerPhone: customerPhone.trim() || '',
      siteLocation: siteLocation ? siteLocation.trim() : '',
      items: finalizedItems,
      totalItemsCount: quotationCart.length,
      subtotal: Number(subtotal.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      discountOverall: finalDiscountPercent,
      discountAmount: Number(finalOverallDiscount.toFixed(2)),
      roundOff,
      grandTotal,
      isGstEstimate,
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
        quotationCart,
        activeQuotationForPrint,
        setActiveQuotationForPrint,
        isLoadingProducts,
        isFirebaseConnected,
        firebaseError,
        toastMessage,
        showToast,
        seedStarterProducts,
        handleAddProduct,
        handleUpdateProduct,
        handleDeleteProduct,
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
        deleteInvoiceRecord
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
