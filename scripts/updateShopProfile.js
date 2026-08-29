import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

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

const shopProfile = {
  shopName: "Sri Mahaganapathy Electricals and Hardware",
  tagline: "Wholesale & Retail Electricals, Leo Plast Pipes & Hardware Solutions",
  address: "1/110, Kaliamman Kovil Back Side, Maniyanur",
  phone: "+91 90876 83308",
  email: "srimahaganapathy.stores@gmail.com",
  gstin: "33AAAAA0000A1Z5",
  upiId: "9087683308@upi",
  invoicePrefix: "SMG-",
  defaultGstRate: 18,
  terms: "1. Goods once sold will not be taken back without original bill.\n2. Warranty as per manufacturer terms.\n3. Subject to local jurisdiction.",
  invoiceSequence: 101,
  thermalPrintMode: false,
  updatedAt: new Date().toISOString()
};

async function updateProfile() {
  console.log("Updating shop profile in Firestore...");
  const docRef = doc(db, "settings", "shop_profile");
  await setDoc(docRef, shopProfile, { merge: true });
  console.log("✅ Shop profile updated in Firestore:", shopProfile);
  process.exit(0);
}

updateProfile().catch(err => {
  console.error("Error updating profile:", err);
  process.exit(1);
});
