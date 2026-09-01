import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  getDocs,
  where,
  setDoc,
  getDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from './firebaseConfig';

const PRODUCTS_COLLECTION = 'products';
const INVOICES_COLLECTION = 'invoices';
const QUOTATIONS_COLLECTION = 'quotations';
const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'shop_profile';

// ==========================================
// PRODUCTS SERVICE
// ==========================================

const PKT_REGEX = /\s*\(\s*\d+\s*(?:\/|\s)*(?:pkt|pkts|packet|pack|box|bag|ctn|set)\s*\)/gi;

export const sanitizeProduct = (product) => {
  if (!product) return product;
  const name = product.name ? product.name.replace(PKT_REGEX, '').trim() : product.name;
  const variants = Array.isArray(product.variants)
    ? product.variants.map((v) => ({
        ...v,
        size: v.size ? v.size.replace(PKT_REGEX, '').trim() : v.size,
      }))
    : product.variants;
  return { ...product, name, variants };
};

export const subscribeToProducts = (onData, onError) => {
  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const products = snapshot.docs.map((doc) => sanitizeProduct({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort in memory by name for maximum compatibility
        products.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        onData(products);
      },
      (error) => {
        console.error('Firestore Products subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('Failed to subscribe to products:', error);
    if (onError) onError(error);
    return () => {};
  }
};

export const addProduct = async (productData) => {
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateProduct = async (id, productData) => {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(docRef, {
    ...productData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteProduct = async (id) => {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(docRef);
};

// Bulk delete products by brand name
export const bulkDeleteProductsByBrand = async (brandName) => {
  if (!brandName) return 0;
  const cleanBrand = brandName.trim().toLowerCase();
  const q = query(collection(db, PRODUCTS_COLLECTION));
  const snapshot = await getDocs(q);
  
  const docsToDelete = snapshot.docs.filter((d) => {
    const data = d.data();
    return (data.brand || 'Unbranded').trim().toLowerCase() === cleanBrand;
  });

  if (docsToDelete.length === 0) return 0;

  const chunkSize = 400;
  let totalDeleted = 0;

  for (let i = 0; i < docsToDelete.length; i += chunkSize) {
    const chunk = docsToDelete.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    chunk.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
    totalDeleted += chunk.length;
  }

  return totalDeleted;
};

// Batch insert products (e.g. from Excel or Seeding)
export const bulkImportProducts = async (productsArray) => {
  if (!productsArray || productsArray.length === 0) return 0;
  
  // Firestore batches support max 500 operations
  const chunkSize = 400;
  let totalImported = 0;

  for (let i = 0; i < productsArray.length; i += chunkSize) {
    const chunk = productsArray.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    chunk.forEach((item) => {
      const docRef = doc(collection(db, PRODUCTS_COLLECTION));
      batch.set(docRef, {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
    totalImported += chunk.length;
  }

  return totalImported;
};

// ==========================================
// INVOICES SERVICE
// ==========================================

export const subscribeToInvoices = (onData, onError) => {
  try {
    const q = query(collection(db, INVOICES_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const invoices = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        onData(invoices);
      },
      (error) => {
        console.error('Firestore Invoices subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('Failed to subscribe to invoices:', error);
    if (onError) onError(error);
    return () => {};
  }
};

export const createInvoice = async (invoiceData) => {
  const batch = writeBatch(db);
  const invoiceDocRef = doc(collection(db, INVOICES_COLLECTION));

  batch.set(invoiceDocRef, {
    ...invoiceData,
    createdAt: serverTimestamp(),
  });

  // Optional: deduct stock for purchased items if matching product id is available
  if (invoiceData.items && Array.isArray(invoiceData.items)) {
    invoiceData.items.forEach((item) => {
      if (item.productId && item.variantIndex !== undefined) {
        const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
        // Note: variant stock updates are handled when loading or through batch
      }
    });
  }

  await batch.commit();
  return invoiceDocRef.id;
};

export const deleteInvoice = async (id) => {
  const docRef = doc(db, INVOICES_COLLECTION, id);
  await deleteDoc(docRef);
};

// Auto-purge invoices older than given days (default: 40 days)
export const purgeExpiredInvoices = async (retentionDays = 40) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffTime = cutoffDate.getTime();

    const snapshot = await getDocs(collection(db, INVOICES_COLLECTION));
    if (snapshot.empty) return 0;

    let deletedCount = 0;
    const batch = writeBatch(db);
    let hasBatchOperations = false;

    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      let invoiceTime = null;

      if (data.date) {
        invoiceTime = new Date(data.date).getTime();
      } else if (data.createdAt?.toDate) {
        invoiceTime = data.createdAt.toDate().getTime();
      } else if (data.createdAt?.seconds) {
        invoiceTime = data.createdAt.seconds * 1000;
      }

      if (invoiceTime && invoiceTime < cutoffTime) {
        batch.delete(docSnap.ref);
        hasBatchOperations = true;
        deletedCount++;
      }
    });

    if (hasBatchOperations) {
      await batch.commit();
      console.log(`[Auto-Purge] Automatically deleted ${deletedCount} invoices older than ${retentionDays} days.`);
    }

    return deletedCount;
  } catch (error) {
    console.error('Failed to purge expired invoices:', error);
    return 0;
  }
};

// ==========================================
// QUOTATIONS / ESTIMATES SERVICE
// ==========================================

export const subscribeToQuotations = (onData, onError) => {
  try {
    const q = query(collection(db, QUOTATIONS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const quotations = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        onData(quotations);
      },
      (error) => {
        console.error('Firestore Quotations subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('Failed to subscribe to quotations:', error);
    if (onError) onError(error);
    return () => {};
  }
};

export const createQuotation = async (quotationData) => {
  const docRef = await addDoc(collection(db, QUOTATIONS_COLLECTION), {
    ...quotationData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateQuotation = async (id, quotationData) => {
  let docId = id;
  if (!docId && quotationData.quotationNumber) {
    const q = query(collection(db, QUOTATIONS_COLLECTION), where('quotationNumber', '==', quotationData.quotationNumber));
    const snap = await getDocs(q);
    if (!snap.empty) {
      docId = snap.docs[0].id;
    }
  }

  if (!docId) {
    const newDoc = await addDoc(collection(db, QUOTATIONS_COLLECTION), {
      ...quotationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newDoc.id;
  }

  const docRef = doc(db, QUOTATIONS_COLLECTION, docId);
  await updateDoc(docRef, {
    ...quotationData,
    updatedAt: serverTimestamp(),
  });
  return docId;
};

export const deleteQuotation = async (id) => {
  const docRef = doc(db, QUOTATIONS_COLLECTION, id);
  await deleteDoc(docRef);
};

// ==========================================
// SHOP SETTINGS SERVICE
// ==========================================

export const getShopSettings = async () => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (e) {
    console.warn('Error fetching shop settings from Firestore:', e);
  }
  return null;
};

export const saveShopSettings = async (settings) => {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  await setDoc(docRef, {
    ...settings,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

// ==========================================
// SYSTEM / APP LOCK SERVICE
// ==========================================

const SYSTEM_COLLECTION = 'system_control';
const APP_STATUS_DOC_ID = 'app_status';

export const subscribeToAppStatus = (onData, onError) => {
  try {
    const docRef = doc(db, SYSTEM_COLLECTION, APP_STATUS_DOC_ID);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onData({ id: snapshot.id, ...snapshot.data() });
        } else {
          // Default: App is active / unlocked
          onData({ isLocked: false });
        }
      },
      (error) => {
        console.error('Firestore App Status subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('Failed to subscribe to app status:', error);
    if (onError) onError(error);
    return () => {};
  }
};

export const updateAppStatus = async (statusData) => {
  const docRef = doc(db, SYSTEM_COLLECTION, APP_STATUS_DOC_ID);
  await setDoc(docRef, {
    ...statusData,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};
