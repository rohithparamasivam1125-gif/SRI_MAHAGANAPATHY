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

// Regex specifically targeting packaging notes like (25/pkt), (100/pkt), (50/box), etc.
// Will NOT touch (20mm), (1/2"), (6m), (90m), (41" H x 35" Dia), (FR), etc.
const PKT_REGEX = /\s*\(\s*\d+\s*\/\s*(?:pkt|pkts|packet|pack|box|bag|ctn|set)\s*\)/gi;
const PKT_REGEX_2 = /\s*\(\s*\d+\s*(?:pkt|pkts|packet|pack|box|bag|ctn|set)\s*\)/gi;

function cleanString(str) {
  if (!str || typeof str !== 'string') return str;
  return str.replace(PKT_REGEX, '').replace(PKT_REGEX_2, '').trim();
}

async function removePktFromFirestore() {
  console.log("Fetching all products from Firestore...");
  const colRef = collection(db, "products");
  const snapshot = await getDocs(colRef);
  
  console.log(`Found ${snapshot.docs.length} products in database.`);

  const batch = writeBatch(db);
  let updatedCount = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    let hasChanges = false;

    // Check product name
    const cleanedName = cleanString(data.name);
    if (cleanedName !== data.name) {
      console.log(`Renaming: "${data.name}" -> "${cleanedName}"`);
      data.name = cleanedName;
      hasChanges = true;
    }

    // Check variants
    if (Array.isArray(data.variants)) {
      const cleanedVariants = data.variants.map((v) => {
        const cleanedSize = cleanString(v.size);
        if (cleanedSize !== v.size) {
          console.log(`  Size change: "${v.size}" -> "${cleanedSize}"`);
          hasChanges = true;
          return { ...v, size: cleanedSize };
        }
        return v;
      });

      if (hasChanges) {
        data.variants = cleanedVariants;
      }
    }

    if (hasChanges) {
      const docRef = doc(db, "products", docSnap.id);
      batch.update(docRef, {
        name: data.name,
        variants: data.variants,
        updatedAt: new Date()
      });
      updatedCount++;
    }
  }

  if (updatedCount > 0) {
    console.log(`Committing batch update for ${updatedCount} products...`);
    await batch.commit();
    console.log(`Successfully updated ${updatedCount} products in Firestore!`);
  } else {
    console.log("No products needed updating.");
  }
}

removePktFromFirestore().then(() => {
  console.log("Done.");
  process.exit(0);
}).catch((err) => {
  console.error("Error updating Firestore:", err);
  process.exit(1);
});
