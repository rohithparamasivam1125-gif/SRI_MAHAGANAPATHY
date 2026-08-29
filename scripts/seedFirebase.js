import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc, serverTimestamp } from "firebase/firestore";
import { DEFAULT_PRODUCTS } from "../src/data/defaultProducts.js";

const firebaseConfig = {
  apiKey: "AIzaSyD8v_jKigAHcTwcFDGWtJZFBPcRrBflX_Y",
  authDomain: "rajaganapathy-billing.firebaseapp.com",
  projectId: "rajaganapathy-billing",
  storageBucket: "rajaganapathy-billing.firebasestorage.app",
  messagingSenderId: "857475525638",
  appId: "1:857475525638:web:e734d4b2c192cbf029e787",
  measurementId: "G-5SQPL9E9T7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log(`Starting to seed ${DEFAULT_PRODUCTS.length} Electrical & Plumbing products into Firebase Firestore...`);
  
  const batch = writeBatch(db);
  const colRef = collection(db, "products");

  for (const item of DEFAULT_PRODUCTS) {
    const docRef = doc(colRef);
    batch.set(docRef, {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
  console.log("✅ Successfully seeded all products directly into Firebase Firestore!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding error:", err);
  process.exit(1);
});
