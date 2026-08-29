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

export const subscribeToProducts = (onData, onError) => {
  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const products = snapshot.docs.map((doc) => ({
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
  const docRef = doc(db, QUOTATIONS_COLLECTION, id);
  await updateDoc(docRef, {
    ...quotationData,
    updatedAt: serverTimestamp(),
  });
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
