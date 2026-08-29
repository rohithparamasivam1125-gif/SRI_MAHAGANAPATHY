import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

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

const ISI_AND_AGRI_PRODUCTS = [
  {
    name: "Leo Plast ISI Plumbing Pipes (IS 4985 : 2021)",
    category: "Plumbing",
    subcategory: "Pipes",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "ISI Certified Lead-Free Heavy Plumbing Pipes (Page 07 Top Table)",
    variants: [
      { size: "3/4\" (25mm) Plumbing", price: 411.00, mrp: 520.00, stock: 60, unit: "Pcs", barcode: "LEO-ISI-075" },
      { size: "1\" (32mm) Plumbing", price: 612.00, mrp: 780.00, stock: 60, unit: "Pcs", barcode: "LEO-ISI-100" },
      { size: "1-1/4\" (40mm) Plumbing", price: 855.00, mrp: 1090.00, stock: 40, unit: "Pcs", barcode: "LEO-ISI-125" },
      { size: "1-1/2\" (50mm) Plumbing", price: 1070.00, mrp: 1360.00, stock: 40, unit: "Pcs", barcode: "LEO-ISI-150" },
      { size: "2\" (63mm) 4 kgf/cm²", price: 620.00, mrp: 790.00, stock: 30, unit: "Pcs", barcode: "LEO-ISI-200" },
      { size: "2-1/2\" (75mm) 4 kgf/cm²", price: 876.00, mrp: 1120.00, stock: 25, unit: "Pcs", barcode: "LEO-ISI-250" },
      { size: "3\" (90mm) 4 kgf/cm²", price: 1240.00, mrp: 1580.00, stock: 20, unit: "Pcs", barcode: "LEO-ISI-300" },
      { size: "4\" (110mm) 4 kgf/cm²", price: 1710.00, mrp: 2180.00, stock: 15, unit: "Pcs", barcode: "LEO-ISI-400" }
    ]
  },
  {
    name: "Leo Plast Agri Agricultural Irrigation Pipes",
    category: "Plumbing",
    subcategory: "Pipes",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Agricultural & Farm Irrigation PVC Pipes (Page 07 Middle & Bottom Tables)",
    variants: [
      { size: "1/2\" (20mm) 15kg", price: 271.00, mrp: 350.00, stock: 50, unit: "Pcs", barcode: "LEO-AG-050" },
      { size: "3/4\" (25mm) 10kg", price: 185.00, mrp: 240.00, stock: 60, unit: "Pcs", barcode: "LEO-AG-075-10K" },
      { size: "3/4\" (25mm) 15kg", price: 352.00, mrp: 450.00, stock: 60, unit: "Pcs", barcode: "LEO-AG-075-15K" },
      { size: "1\" (32mm) 10kg", price: 271.00, mrp: 350.00, stock: 50, unit: "Pcs", barcode: "LEO-AG-100-10K" },
      { size: "1\" (32mm) 15kg", price: 488.00, mrp: 620.00, stock: 50, unit: "Pcs", barcode: "LEO-AG-100-15K" },
      { size: "1-1/4\" (40mm) 6kg", price: 394.00, mrp: 500.00, stock: 40, unit: "Pcs", barcode: "LEO-AG-125-6K" },
      { size: "1-1/4\" (40mm) 15kg", price: 684.00, mrp: 870.00, stock: 40, unit: "Pcs", barcode: "LEO-AG-125-15K" },
      { size: "1-1/2\" (50mm) 6kg", price: 493.00, mrp: 630.00, stock: 30, unit: "Pcs", barcode: "LEO-AG-150-6K" },
      { size: "1-1/2\" (50mm) 15kg", price: 893.00, mrp: 1140.00, stock: 30, unit: "Pcs", barcode: "LEO-AG-150-15K" },
      { size: "2\" (63mm) 4kg", price: 548.00, mrp: 700.00, stock: 30, unit: "Pcs", barcode: "LEO-AG-200-4K" },
      { size: "2\" (63mm) 6kg", price: 841.00, mrp: 1070.00, stock: 30, unit: "Pcs", barcode: "LEO-AG-200-6K" },
      { size: "2-1/2\" (75mm) 4kg", price: 800.00, mrp: 1020.00, stock: 20, unit: "Pcs", barcode: "LEO-AG-250-4K" },
      { size: "2-1/2\" (75mm) 6kg", price: 1035.00, mrp: 1320.00, stock: 20, unit: "Pcs", barcode: "LEO-AG-250-6K" },
      { size: "3\" (90mm) 4kg", price: 1035.00, mrp: 1320.00, stock: 20, unit: "Pcs", barcode: "LEO-AG-300-4K" },
      { size: "3\" (90mm) 6kg", price: 1368.00, mrp: 1740.00, stock: 20, unit: "Pcs", barcode: "LEO-AG-300-6K" },
      { size: "4\" (110mm) 4kg", price: 1368.00, mrp: 1740.00, stock: 15, unit: "Pcs", barcode: "LEO-AG-400-4K" },
      { size: "4\" (110mm) 6kg", price: 1755.00, mrp: 2240.00, stock: 15, unit: "Pcs", barcode: "LEO-AG-400-6K" },
      { size: "5\" (140mm) 4kg", price: 2051.00, mrp: 2600.00, stock: 10, unit: "Pcs", barcode: "LEO-AG-500-4K" },
      { size: "5\" (140mm) 6kg", price: 2955.00, mrp: 3750.00, stock: 10, unit: "Pcs", barcode: "LEO-AG-500-6K" },
      { size: "6\" (160mm) 4kg", price: 2740.00, mrp: 3500.00, stock: 8, unit: "Pcs", barcode: "LEO-AG-600-4K" },
      { size: "6\" (160mm) 6kg", price: 3907.00, mrp: 4980.00, stock: 8, unit: "Pcs", barcode: "LEO-AG-600-6K" },
      { size: "7\" (180mm) 6kg", price: 4875.00, mrp: 6200.00, stock: 5, unit: "Pcs", barcode: "LEO-AG-700-6K" },
      { size: "8\" (200mm) 6kg", price: 5910.00, mrp: 7500.00, stock: 5, unit: "Pcs", barcode: "LEO-AG-800-6K" }
    ]
  }
];

async function addISI() {
  const colRef = collection(db, "products");
  for (const item of ISI_AND_AGRI_PRODUCTS) {
    await addDoc(colRef, {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  console.log("✅ Added Leo Plast ISI Plumbing Pipes and Agri Pipes directly to Firebase!");
  process.exit(0);
}

addISI().catch((e) => {
  console.error(e);
  process.exit(1);
});
