import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCtmNU3Dn_4aJPmktNoOSvJsAnmATNU-nM",
  authDomain: "srimahaganapathy-billing.firebaseapp.com",
  projectId: "srimahaganapathy-billing",
  storageBucket: "srimahaganapathy-billing.firebasestorage.app",
  messagingSenderId: "805404396338",
  appId: "1:805404396338:web:cb3e18647f30bdeb6b652b",
  measurementId: "G-D0DLSS8J4W"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function removeTempBrandProducts() {
  console.log("Fetching all products from Firestore to find TEMP brand items...");
  const colRef = collection(db, "products");
  const snapshot = await getDocs(colRef);
  
  console.log(`Total products in database: ${snapshot.docs.length}`);

  const tempDocs = [];
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const brand = (data.brand || '').trim().toUpperCase();
    if (brand === 'TEMP') {
      tempDocs.push({ id: docSnap.id, name: data.name, brand: data.brand });
    }
  }

  console.log(`Found ${tempDocs.length} products with brand "TEMP".`);

  if (tempDocs.length === 0) {
    console.log("No TEMP brand products found.");
    return;
  }

  // Delete in batches of up to 400
  const BATCH_SIZE = 400;
  for (let i = 0; i < tempDocs.length; i += BATCH_SIZE) {
    const chunk = tempDocs.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    
    for (const item of chunk) {
      console.log(`Deleting [TEMP]: ${item.name} (${item.id})`);
      const docRef = doc(db, "products", item.id);
      batch.delete(docRef);
    }

    console.log(`Committing batch deletion (${chunk.length} items)...`);
    await batch.commit();
  }

  console.log(`Successfully deleted all ${tempDocs.length} TEMP brand products from Firestore!`);
}

removeTempBrandProducts().then(() => {
  console.log("Complete.");
  process.exit(0);
}).catch((err) => {
  console.error("Error deleting TEMP products:", err);
  process.exit(1);
});
