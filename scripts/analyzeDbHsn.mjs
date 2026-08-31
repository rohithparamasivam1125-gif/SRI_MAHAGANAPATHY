import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function analyzeHsn() {
  const colRef = collection(db, "products");
  const snapshot = await getDocs(colRef);

  console.log(`Total Products in DB: ${snapshot.docs.length}\n`);

  const hsnMap = {};
  const missingHsn = [];
  const invalidHsn = [];

  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const name = data.name || "Unnamed";
    const category = data.category || "General";
    const hsn = data.hsnCode ? String(data.hsnCode).trim() : "";
    const gstRate = data.gstRate !== undefined ? data.gstRate : 18;

    if (!hsn) {
      missingHsn.push({ id: docSnap.id, name, category, gstRate });
    } else {
      if (!/^\d{2,8}$/.test(hsn)) {
        invalidHsn.push({ id: docSnap.id, name, hsn, category });
      }
      if (!hsnMap[hsn]) {
        hsnMap[hsn] = { count: 0, categories: new Set(), samples: [] };
      }
      hsnMap[hsn].count += 1;
      hsnMap[hsn].categories.add(category);
      if (hsnMap[hsn].samples.length < 3) {
        hsnMap[hsn].samples.push(name);
      }
    }
  });

  console.log("=== HSN CODE DISTRIBUTION IN DB ===");
  Object.keys(hsnMap).sort().forEach(hsn => {
    const info = hsnMap[hsn];
    console.log(`HSN: [${hsn}] | Count: ${info.count} | Categories: ${Array.from(info.categories).join(', ')}`);
    console.log(`   Sample Products: ${info.samples.join(' | ')}`);
  });

  console.log("\n=== SUMMARY ===");
  console.log(`Products with Valid HSN: ${snapshot.docs.length - missingHsn.length - invalidHsn.length}`);
  console.log(`Products with Missing HSN: ${missingHsn.length}`);
  if (missingHsn.length > 0) {
    console.log("Samples with missing HSN:", missingHsn.slice(0, 10));
  }
  console.log(`Products with Invalid HSN format: ${invalidHsn.length}`);
  if (invalidHsn.length > 0) {
    console.log("Invalid HSN products:", invalidHsn);
  }
}

analyzeHsn().catch(console.error);
