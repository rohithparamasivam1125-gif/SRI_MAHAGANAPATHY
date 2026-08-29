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

// 100% Exact 15-Section Verified Catalog directly from user specification
const verifiedCatalog = [
  // 1. ROTO MOULDED / BLOW MOULDED TANKS
  {
    name: "Roto Mould – Water Storage Tanks (White / Yellow / Gold)",
    category: "Plumbing",
    subcategory: "Water Storage Tanks",
    brand: "Leo Plast",
    hsnCode: "3925",
    gstRate: 18,
    description: "Roto Moulded Triple Layer Water Storage Tank",
    variants: [
      { size: "500 Ltr (41\" H x 35\" Dia)", price: 2900, mrp: 3500, stock: 20, unit: "Pcs", barcode: "LEO-ROTO-500" },
      { size: "750 Ltr (44\" H x 39\" Dia)", price: 4200, mrp: 5000, stock: 15, unit: "Pcs", barcode: "LEO-ROTO-750" },
      { size: "1000 Ltr (51\" H x 43\" Dia)", price: 5600, mrp: 6800, stock: 15, unit: "Pcs", barcode: "LEO-ROTO-1000" },
      { size: "1500 Ltr (52\" H x 50\" Dia)", price: 8500, mrp: 10200, stock: 10, unit: "Pcs", barcode: "LEO-ROTO-1500" },
      { size: "2000 Ltr (61\" H x 54\" Dia)", price: 11800, mrp: 14000, stock: 5, unit: "Pcs", barcode: "LEO-ROTO-2000" }
    ]
  },
  {
    name: "Blow Mould – Water Storage Tanks (White / Yellow)",
    category: "Plumbing",
    subcategory: "Water Storage Tanks",
    brand: "Leo Plast",
    hsnCode: "3925",
    gstRate: 18,
    description: "Blow Moulded Heavy Duty Water Storage Tank",
    variants: [
      { size: "500 Ltr (41\" H x 34\" Dia)", price: 2900, mrp: 3500, stock: 20, unit: "Pcs", barcode: "LEO-BLOW-500" },
      { size: "750 Ltr (47\" H x 37\" Dia)", price: 4200, mrp: 5000, stock: 15, unit: "Pcs", barcode: "LEO-BLOW-750" },
      { size: "1000 Ltr (52\" H x 43\" Dia)", price: 5600, mrp: 6800, stock: 15, unit: "Pcs", barcode: "LEO-BLOW-1000" },
      { size: "1500 Ltr (57\" H x 48\" Dia)", price: 8500, mrp: 10200, stock: 10, unit: "Pcs", barcode: "LEO-BLOW-1500" },
      { size: "2000 Ltr (62\" H x 54\" Dia)", price: 11800, mrp: 14000, stock: 5, unit: "Pcs", barcode: "LEO-BLOW-2000" }
    ]
  },
  {
    name: "Water Camper (50 Litre with Tap)",
    category: "Plumbing",
    subcategory: "Water Storage Tanks",
    brand: "Leo Plast",
    hsnCode: "3925",
    gstRate: 18,
    description: "50 Litre Insulated Water Camper with Tap",
    variants: [
      { size: "50 Litre", price: 850, mrp: 1100, stock: 25, unit: "Pcs", barcode: "LEO-CAMPER-50L" }
    ]
  },

  // 2. PVC FITTINGS
  {
    name: "PVC Elbow – ISI Hy",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "ISI Certified Heavy PVC 90° Elbow (IS 7834)",
    variants: [
      { size: "20 mm (100/pkt)", price: 6.50, mrp: 9.00, stock: 100, unit: "Pcs", barcode: "LEO-ELB-ISI-20" },
      { size: "25 mm (50/pkt)", price: 9.80, mrp: 14.00, stock: 100, unit: "Pcs", barcode: "LEO-ELB-ISI-25" },
      { size: "32 mm (60/pkt)", price: 13.70, mrp: 19.00, stock: 80, unit: "Pcs", barcode: "LEO-ELB-ISI-32" },
      { size: "40 mm (25/pkt)", price: 20.50, mrp: 28.00, stock: 60, unit: "Pcs", barcode: "LEO-ELB-ISI-40" },
      { size: "50 mm (15/pkt)", price: 31.80, mrp: 42.00, stock: 50, unit: "Pcs", barcode: "LEO-ELB-ISI-50" },
      { size: "63 mm (70/pkt)", price: 47.90, mrp: 65.00, stock: 70, unit: "Pcs", barcode: "LEO-ELB-ISI-63" },
      { size: "75 mm (40/pkt)", price: 70.00, mrp: 95.00, stock: 40, unit: "Pcs", barcode: "LEO-ELB-ISI-75" },
      { size: "90 mm (20/pkt)", price: 113.00, mrp: 150.00, stock: 20, unit: "Pcs", barcode: "LEO-ELB-ISI-90" },
      { size: "110 mm (12/pkt)", price: 180.00, mrp: 240.00, stock: 12, unit: "Pcs", barcode: "LEO-ELB-ISI-110" }
    ]
  },
  {
    name: "PVC Tee – ISI Hy",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "ISI Certified Heavy PVC 3-Way Equal Branch Tee (IS 7834)",
    variants: [
      { size: "20 mm (80/pkt)", price: 8.60, mrp: 12.00, stock: 80, unit: "Pcs", barcode: "LEO-TEE-ISI-20" },
      { size: "25 mm (50/pkt)", price: 13.70, mrp: 18.00, stock: 50, unit: "Pcs", barcode: "LEO-TEE-ISI-25" },
      { size: "32 mm (30/pkt)", price: 18.00, mrp: 25.00, stock: 30, unit: "Pcs", barcode: "LEO-TEE-ISI-32" },
      { size: "40 mm (15/pkt)", price: 27.50, mrp: 38.00, stock: 15, unit: "Pcs", barcode: "LEO-TEE-ISI-40" },
      { size: "50 mm (10/pkt)", price: 46.00, mrp: 62.00, stock: 10, unit: "Pcs", barcode: "LEO-TEE-ISI-50" },
      { size: "63 mm (40/pkt)", price: 65.00, mrp: 88.00, stock: 40, unit: "Pcs", barcode: "LEO-TEE-ISI-63" },
      { size: "75 mm (20/pkt)", price: 97.00, mrp: 130.00, stock: 20, unit: "Pcs", barcode: "LEO-TEE-ISI-75" },
      { size: "90 mm (15/pkt)", price: 156.00, mrp: 210.00, stock: 15, unit: "Pcs", barcode: "LEO-TEE-ISI-90" },
      { size: "110 mm (8/pkt)", price: 244.00, mrp: 320.00, stock: 8, unit: "Pcs", barcode: "LEO-TEE-ISI-110" }
    ]
  },
  {
    name: "PVC Elbow – Agri",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Agricultural irrigation PVC 90° elbow",
    variants: [
      { size: "63 mm (70/pkt)", price: 40.00, mrp: 55.00, stock: 70, unit: "Pcs", barcode: "LEO-ELB-AGRI-63" },
      { size: "75 mm (40/pkt)", price: 50.00, mrp: 68.00, stock: 40, unit: "Pcs", barcode: "LEO-ELB-AGRI-75" },
      { size: "90 mm (25/pkt)", price: 70.00, mrp: 95.00, stock: 25, unit: "Pcs", barcode: "LEO-ELB-AGRI-90" },
      { size: "110 mm (12/pkt)", price: 120.00, mrp: 160.00, stock: 12, unit: "Pcs", barcode: "LEO-ELB-AGRI-110" }
    ]
  },
  {
    name: "PVC Tee – Agri",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Agricultural irrigation PVC 3-way tee",
    variants: [
      { size: "63 mm (40/pkt)", price: 54.00, mrp: 72.00, stock: 40, unit: "Pcs", barcode: "LEO-TEE-AGRI-63" },
      { size: "75 mm (25/pkt)", price: 65.00, mrp: 88.00, stock: 25, unit: "Pcs", barcode: "LEO-TEE-AGRI-75" },
      { size: "90 mm (15/pkt)", price: 95.00, mrp: 130.00, stock: 15, unit: "Pcs", barcode: "LEO-TEE-AGRI-90" },
      { size: "110 mm (8/pkt)", price: 160.00, mrp: 215.00, stock: 8, unit: "Pcs", barcode: "LEO-TEE-AGRI-110" }
    ]
  },
  {
    name: "PVC Elbow – LW (Light Weight)",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Light Weight PVC 90° elbow",
    variants: [
      { size: "63 mm (70/pkt)", price: 34.20, mrp: 46.00, stock: 70, unit: "Pcs", barcode: "LEO-ELB-LW-63" },
      { size: "75 mm (40/pkt)", price: 42.80, mrp: 58.00, stock: 40, unit: "Pcs", barcode: "LEO-ELB-LW-75" },
      { size: "90 mm (25/pkt)", price: 64.00, mrp: 86.00, stock: 25, unit: "Pcs", barcode: "LEO-ELB-LW-90" },
      { size: "110 mm (12/pkt)", price: 103.00, mrp: 140.00, stock: 12, unit: "Pcs", barcode: "LEO-ELB-LW-110" }
    ]
  },
  {
    name: "PVC Tee – LW (Light Weight)",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Light Weight PVC 3-way equal tee",
    variants: [
      { size: "63 mm (40/pkt)", price: 46.20, mrp: 62.00, stock: 40, unit: "Pcs", barcode: "LEO-TEE-LW-63" },
      { size: "75 mm (25/pkt)", price: 55.60, mrp: 75.00, stock: 25, unit: "Pcs", barcode: "LEO-TEE-LW-75" },
      { size: "90 mm (15/pkt)", price: 88.00, mrp: 120.00, stock: 15, unit: "Pcs", barcode: "LEO-TEE-LW-90" },
      { size: "110 mm (8/pkt)", price: 135.00, mrp: 180.00, stock: 8, unit: "Pcs", barcode: "LEO-TEE-LW-110" }
    ]
  },
  {
    name: "PVC MTA (Male Threaded Adaptor)",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Male Threaded PVC solvent weld adaptor",
    variants: [
      { size: "20 mm (100/pkt)", price: 4.40, mrp: 6.50, stock: 100, unit: "Pcs", barcode: "LEO-MTA-20" },
      { size: "25 mm (50/pkt)", price: 5.80, mrp: 8.50, stock: 50, unit: "Pcs", barcode: "LEO-MTA-25" },
      { size: "32 mm (50/pkt)", price: 9.00, mrp: 13.00, stock: 50, unit: "Pcs", barcode: "LEO-MTA-32" },
      { size: "40 mm (40/pkt)", price: 13.70, mrp: 19.00, stock: 40, unit: "Pcs", barcode: "LEO-MTA-40" },
      { size: "50 mm (15/pkt)", price: 21.00, mrp: 29.00, stock: 15, unit: "Pcs", barcode: "LEO-MTA-50" },
      { size: "63 mm (120/pkt)", price: 33.00, mrp: 45.00, stock: 120, unit: "Pcs", barcode: "LEO-MTA-63" },
      { size: "75 mm (80/pkt)", price: 42.80, mrp: 58.00, stock: 80, unit: "Pcs", barcode: "LEO-MTA-75" },
      { size: "90 mm (40/pkt)", price: 66.00, mrp: 90.00, stock: 40, unit: "Pcs", barcode: "LEO-MTA-90" }
    ]
  },
  {
    name: "PVC FTA (Female Threaded Adaptor)",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Female Threaded PVC solvent weld adaptor",
    variants: [
      { size: "20 mm (100/pkt)", price: 4.50, mrp: 6.50, stock: 100, unit: "Pcs", barcode: "LEO-FTA-20" },
      { size: "25 mm (50/pkt)", price: 6.40, mrp: 9.00, stock: 50, unit: "Pcs", barcode: "LEO-FTA-25" },
      { size: "32 mm (50/pkt)", price: 8.60, mrp: 12.00, stock: 50, unit: "Pcs", barcode: "LEO-FTA-32" },
      { size: "40 mm (25/pkt)", price: 13.70, mrp: 19.00, stock: 25, unit: "Pcs", barcode: "LEO-FTA-40" },
      { size: "50 mm (15/pkt)", price: 23.00, mrp: 32.00, stock: 15, unit: "Pcs", barcode: "LEO-FTA-50" },
      { size: "63 mm (100/pkt)", price: 35.00, mrp: 48.00, stock: 100, unit: "Pcs", barcode: "LEO-FTA-63" },
      { size: "75 mm (70/pkt)", price: 51.00, mrp: 70.00, stock: 70, unit: "Pcs", barcode: "LEO-FTA-75" },
      { size: "90 mm (40/pkt)", price: 80.00, mrp: 110.00, stock: 40, unit: "Pcs", barcode: "LEO-FTA-90" },
      { size: "110 mm (20/pkt)", price: 130.00, mrp: 175.00, stock: 20, unit: "Pcs", barcode: "LEO-FTA-110" }
    ]
  },

  // 3. rPVC PLUMBING & IRRIGATION PIPES
  {
    name: "ISI Pipes – Heavy Plumbing (IS 4985 : 2021 - 6m)",
    category: "Plumbing",
    subcategory: "Pipes",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "ISI certified lead free plumbing and pressure pipes (6 Meters)",
    variants: [
      { size: "3/4\" (25mm) Plumbing", price: 411.00, mrp: 550.00, stock: 100, unit: "Pcs", barcode: "LEO-ISI-34" },
      { size: "1\" (32mm) Plumbing", price: 612.00, mrp: 820.00, stock: 80, unit: "Pcs", barcode: "LEO-ISI-1" },
      { size: "1 1/4\" (40mm) Plumbing", price: 855.00, mrp: 1150.00, stock: 60, unit: "Pcs", barcode: "LEO-ISI-1.25" },
      { size: "1 1/2\" (50mm) Plumbing", price: 1070.00, mrp: 1450.00, stock: 50, unit: "Pcs", barcode: "LEO-ISI-1.5" },
      { size: "2\" (63mm) 4 kgf/cm²", price: 620.00, mrp: 830.00, stock: 50, unit: "Pcs", barcode: "LEO-ISI-2-4K" },
      { size: "2 1/2\" (75mm) 4 kgf/cm²", price: 876.00, mrp: 1170.00, stock: 40, unit: "Pcs", barcode: "LEO-ISI-2.5-4K" },
      { size: "3\" (90mm) 4 kgf/cm²", price: 1240.00, mrp: 1650.00, stock: 35, unit: "Pcs", barcode: "LEO-ISI-3-4K" },
      { size: "4\" (110mm) 4 kgf/cm²", price: 1710.00, mrp: 2280.00, stock: 25, unit: "Pcs", barcode: "LEO-ISI-4-4K" }
    ]
  },
  {
    name: "Conduit Pipes – Electrical Wiring (3m)",
    category: "Electrical",
    subcategory: "Conduit Pipes",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Rigid PVC electrical conduit pipes in Silver, Gold, Platinum grades",
    variants: [
      { size: "19 mm Silver", price: 63.50, mrp: 85.00, stock: 200, unit: "Pcs", barcode: "LEO-COND-19-SILVER" },
      { size: "20 mm Silver", price: 63.50, mrp: 85.00, stock: 200, unit: "Pcs", barcode: "LEO-COND-20-SILVER" },
      { size: "25 mm Silver", price: 84.60, mrp: 115.00, stock: 150, unit: "Pcs", barcode: "LEO-COND-25-SILVER" },
      { size: "19 mm Gold", price: 73.50, mrp: 98.00, stock: 200, unit: "Pcs", barcode: "LEO-COND-19-GOLD" },
      { size: "20 mm Gold", price: 73.50, mrp: 98.00, stock: 200, unit: "Pcs", barcode: "LEO-COND-20-GOLD" },
      { size: "25 mm Gold", price: 106.00, mrp: 142.00, stock: 150, unit: "Pcs", barcode: "LEO-COND-25-GOLD" },
      { size: "19 mm Platinum", price: 84.60, mrp: 115.00, stock: 150, unit: "Pcs", barcode: "LEO-COND-19-PLAT" },
      { size: "20 mm Platinum", price: 84.60, mrp: 115.00, stock: 150, unit: "Pcs", barcode: "LEO-COND-20-PLAT" },
      { size: "25 mm Platinum", price: 126.50, mrp: 170.00, stock: 120, unit: "Pcs", barcode: "LEO-COND-25-PLAT" }
    ]
  },
  {
    name: "Agri Pipes – Agricultural Irrigation Pipes (6m)",
    category: "Plumbing",
    subcategory: "Pipes",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Agricultural rPVC pipes (All sets 1/2\" to 8\")",
    variants: [
      { size: "1/2\" (20mm) 15 kg", price: 271.00, mrp: 360.00, stock: 50, unit: "Pcs", barcode: "LEO-AGRI-1/2-15K" },
      { size: "3/4\" (25mm) 10 kg", price: 185.00, mrp: 250.00, stock: 50, unit: "Pcs", barcode: "LEO-AGRI-3/4-10K" },
      { size: "3/4\" (25mm) 15 kg", price: 352.00, mrp: 470.00, stock: 50, unit: "Pcs", barcode: "LEO-AGRI-3/4-15K" },
      { size: "1\" (32mm) 10 kg", price: 271.00, mrp: 360.00, stock: 50, unit: "Pcs", barcode: "LEO-AGRI-1-10K" },
      { size: "1\" (32mm) 15 kg", price: 488.00, mrp: 650.00, stock: 50, unit: "Pcs", barcode: "LEO-AGRI-1-15K" },
      { size: "1 1/4\" (40mm) 6 kg", price: 394.00, mrp: 525.00, stock: 40, unit: "Pcs", barcode: "LEO-AGRI-1.25-6K" },
      { size: "1 1/4\" (40mm) 15 kg", price: 684.00, mrp: 910.00, stock: 40, unit: "Pcs", barcode: "LEO-AGRI-1.25-15K" },
      { size: "1 1/2\" (50mm) 6 kg", price: 493.00, mrp: 660.00, stock: 40, unit: "Pcs", barcode: "LEO-AGRI-1.5-6K" },
      { size: "1 1/2\" (50mm) 15 kg", price: 893.00, mrp: 1190.00, stock: 40, unit: "Pcs", barcode: "LEO-AGRI-1.5-15K" },
      { size: "2\" (63mm) 4 kg", price: 548.00, mrp: 730.00, stock: 35, unit: "Pcs", barcode: "LEO-AGRI-2-4K" },
      { size: "2\" (63mm) 6 kg", price: 841.00, mrp: 1120.00, stock: 35, unit: "Pcs", barcode: "LEO-AGRI-2-6K" },
      { size: "2 1/2\" (75mm) 4 kg", price: 800.00, mrp: 1070.00, stock: 30, unit: "Pcs", barcode: "LEO-AGRI-2.5-4K" },
      { size: "2 1/2\" (75mm) 6 kg", price: 1035.00, mrp: 1380.00, stock: 30, unit: "Pcs", barcode: "LEO-AGRI-2.5-6K" },
      { size: "3\" (90mm) 4 kg", price: 1035.00, mrp: 1380.00, stock: 25, unit: "Pcs", barcode: "LEO-AGRI-3-4K" },
      { size: "3\" (90mm) 6 kg", price: 1368.00, mrp: 1820.00, stock: 25, unit: "Pcs", barcode: "LEO-AGRI-3-6K" },
      { size: "4\" (110mm) 4 kg", price: 1368.00, mrp: 1820.00, stock: 20, unit: "Pcs", barcode: "LEO-AGRI-4-4K" },
      { size: "4\" (110mm) 6 kg", price: 1755.00, mrp: 2340.00, stock: 20, unit: "Pcs", barcode: "LEO-AGRI-4-6K" },
      { size: "5\" (140mm) 4 kg", price: 2051.00, mrp: 2735.00, stock: 15, unit: "Pcs", barcode: "LEO-AGRI-5-4K" },
      { size: "5\" (140mm) 6 kg", price: 2955.00, mrp: 3940.00, stock: 15, unit: "Pcs", barcode: "LEO-AGRI-5-6K" },
      { size: "6\" (160mm) 4 kg", price: 2740.00, mrp: 3650.00, stock: 10, unit: "Pcs", barcode: "LEO-AGRI-6-4K" },
      { size: "6\" (160mm) 6 kg", price: 3907.00, mrp: 5200.00, stock: 10, unit: "Pcs", barcode: "LEO-AGRI-6-6K" },
      { size: "7\" (180mm) 6 kg", price: 4875.00, mrp: 6500.00, stock: 8, unit: "Pcs", barcode: "LEO-AGRI-7-6K" },
      { size: "8\" (200mm) 6 kg", price: 5910.00, mrp: 7880.00, stock: 5, unit: "Pcs", barcode: "LEO-AGRI-8-6K" }
    ]
  },

  // 4. PVC FITTINGS (End Cap, Reducer, Reducing Bush, Thread End Cap, Coupler)
  {
    name: "End Cap (Plain)",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Plain solvent weld PVC pipe end cap (25mm to 180mm)",
    variants: [
      { size: "25 mm (50/pkt)", price: 4.70, mrp: 7.00, stock: 50, unit: "Pcs", barcode: "LEO-CAP-25" },
      { size: "32 mm (50/pkt)", price: 6.50, mrp: 9.00, stock: 50, unit: "Pcs", barcode: "LEO-CAP-32" },
      { size: "40 mm (40/pkt)", price: 11.00, mrp: 15.00, stock: 40, unit: "Pcs", barcode: "LEO-CAP-40" },
      { size: "50 mm (15/pkt)", price: 15.40, mrp: 21.00, stock: 15, unit: "Pcs", barcode: "LEO-CAP-50" },
      { size: "63 mm (180/pkt)", price: 24.00, mrp: 33.00, stock: 180, unit: "Pcs", barcode: "LEO-CAP-63" },
      { size: "75 mm (120/pkt)", price: 32.00, mrp: 44.00, stock: 120, unit: "Pcs", barcode: "LEO-CAP-75" },
      { size: "90 mm (75/pkt)", price: 47.00, mrp: 64.00, stock: 75, unit: "Pcs", barcode: "LEO-CAP-90" },
      { size: "110 mm (40/pkt)", price: 64.00, mrp: 88.00, stock: 40, unit: "Pcs", barcode: "LEO-CAP-110" },
      { size: "140 mm (25/pkt)", price: 106.00, mrp: 145.00, stock: 25, unit: "Pcs", barcode: "LEO-CAP-140" },
      { size: "160 mm (12/pkt)", price: 180.00, mrp: 240.00, stock: 12, unit: "Pcs", barcode: "LEO-CAP-160" },
      { size: "180 mm (12/pkt)", price: 240.00, mrp: 320.00, stock: 12, unit: "Pcs", barcode: "LEO-CAP-180" }
    ]
  },
  {
    name: "Reducer",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "PVC pipe reducer fitting (All 14 sizes)",
    variants: [
      { size: "32x25 (50/pkt)", price: 8.50, mrp: 12.00, stock: 50, unit: "Pcs", barcode: "LEO-RED-32-25" },
      { size: "40x32 (30/pkt)", price: 13.70, mrp: 18.00, stock: 30, unit: "Pcs", barcode: "LEO-RED-40-32" },
      { size: "50x40 (20/pkt)", price: 19.70, mrp: 27.00, stock: 20, unit: "Pcs", barcode: "LEO-RED-50-40" },
      { size: "63x32 (140/pkt)", price: 29.00, mrp: 40.00, stock: 140, unit: "Pcs", barcode: "LEO-RED-63-32" },
      { size: "63x40 (120/pkt)", price: 29.00, mrp: 40.00, stock: 120, unit: "Pcs", barcode: "LEO-RED-63-40" },
      { size: "63x50 (120/pkt)", price: 31.70, mrp: 43.00, stock: 120, unit: "Pcs", barcode: "LEO-RED-63-50" },
      { size: "75x50 (80/pkt)", price: 37.60, mrp: 51.00, stock: 80, unit: "Pcs", barcode: "LEO-RED-75-50" },
      { size: "75x63 (70/pkt)", price: 42.70, mrp: 58.00, stock: 70, unit: "Pcs", barcode: "LEO-RED-75-63" },
      { size: "90x50 (50/pkt)", price: 52.20, mrp: 70.00, stock: 50, unit: "Pcs", barcode: "LEO-RED-90-50" },
      { size: "90x63 (50/pkt)", price: 54.70, mrp: 74.00, stock: 50, unit: "Pcs", barcode: "LEO-RED-90-63" },
      { size: "90x75 (40/pkt)", price: 56.40, mrp: 76.00, stock: 40, unit: "Pcs", barcode: "LEO-RED-90-75" },
      { size: "110x63 (30/pkt)", price: 82.00, mrp: 110.00, stock: 30, unit: "Pcs", barcode: "LEO-RED-110-63" },
      { size: "110x75 (30/pkt)", price: 82.00, mrp: 110.00, stock: 30, unit: "Pcs", barcode: "LEO-RED-110-75" },
      { size: "110x90 (30/pkt)", price: 92.00, mrp: 125.00, stock: 30, unit: "Pcs", barcode: "LEO-RED-110-90" }
    ]
  },
  {
    name: "Reducing Bush",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "PVC pipe reducing bush fitting (All 14 sizes)",
    variants: [
      { size: "32x25 (50/pkt)", price: 5.20, mrp: 7.50, stock: 50, unit: "Pcs", barcode: "LEO-BUSH-32-25" },
      { size: "40x32 (30/pkt)", price: 7.70, mrp: 11.00, stock: 30, unit: "Pcs", barcode: "LEO-BUSH-40-32" },
      { size: "50x40 (25/pkt)", price: 14.60, mrp: 20.00, stock: 25, unit: "Pcs", barcode: "LEO-BUSH-50-40" },
      { size: "50x32 (20/pkt)", price: 17.00, mrp: 23.00, stock: 20, unit: "Pcs", barcode: "LEO-BUSH-50-32" },
      { size: "63x50 (200/pkt)", price: 25.00, mrp: 34.00, stock: 200, unit: "Pcs", barcode: "LEO-BUSH-63-50" },
      { size: "63x40 (200/pkt)", price: 25.00, mrp: 34.00, stock: 200, unit: "Pcs", barcode: "LEO-BUSH-63-40" },
      { size: "63x32 (175/pkt)", price: 27.40, mrp: 37.00, stock: 175, unit: "Pcs", barcode: "LEO-BUSH-63-32" },
      { size: "75x63 (150/pkt)", price: 33.40, mrp: 45.00, stock: 150, unit: "Pcs", barcode: "LEO-BUSH-75-63" },
      { size: "75x50 (150/pkt)", price: 36.80, mrp: 50.00, stock: 150, unit: "Pcs", barcode: "LEO-BUSH-75-50" },
      { size: "90x75 (80/pkt)", price: 51.30, mrp: 70.00, stock: 80, unit: "Pcs", barcode: "LEO-BUSH-90-75" },
      { size: "90x63 (80/pkt)", price: 55.60, mrp: 75.00, stock: 80, unit: "Pcs", barcode: "LEO-BUSH-90-63" },
      { size: "110x90 (50/pkt)", price: 85.50, mrp: 115.00, stock: 50, unit: "Pcs", barcode: "LEO-BUSH-110-90" },
      { size: "110x75 (50/pkt)", price: 85.50, mrp: 115.00, stock: 50, unit: "Pcs", barcode: "LEO-BUSH-110-75" },
      { size: "110x63 (50/pkt)", price: 85.50, mrp: 115.00, stock: 50, unit: "Pcs", barcode: "LEO-BUSH-110-63" }
    ]
  },
  {
    name: "Thread End Cap",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Threaded PVC pipe end cap (25mm to 90mm)",
    variants: [
      { size: "25 mm (50/pkt)", price: 6.50, mrp: 9.00, stock: 50, unit: "Pcs", barcode: "LEO-THRCAP-25" },
      { size: "32 mm (50/pkt)", price: 9.40, mrp: 13.00, stock: 50, unit: "Pcs", barcode: "LEO-THRCAP-32" },
      { size: "40 mm (40/pkt)", price: 13.70, mrp: 19.00, stock: 40, unit: "Pcs", barcode: "LEO-THRCAP-40" },
      { size: "50 mm (15/pkt)", price: 20.00, mrp: 28.00, stock: 15, unit: "Pcs", barcode: "LEO-THRCAP-50" },
      { size: "63 mm (180/pkt)", price: 31.00, mrp: 42.00, stock: 180, unit: "Pcs", barcode: "LEO-THRCAP-63" },
      { size: "75 mm (120/pkt)", price: 38.00, mrp: 52.00, stock: 120, unit: "Pcs", barcode: "LEO-THRCAP-75" },
      { size: "90 mm (75/pkt)", price: 55.00, mrp: 75.00, stock: 75, unit: "Pcs", barcode: "LEO-THRCAP-90" }
    ]
  },
  {
    name: "Coupler (PVC Straight Socket)",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Straight PVC socket pipe coupler (25mm to 110mm)",
    variants: [
      { size: "25 mm (50/pkt)", price: 6.00, mrp: 8.50, stock: 50, unit: "Pcs", barcode: "LEO-COUP-25" },
      { size: "32 mm (50/pkt)", price: 8.60, mrp: 12.00, stock: 50, unit: "Pcs", barcode: "LEO-COUP-32" },
      { size: "40 mm (30/pkt)", price: 12.00, mrp: 16.50, stock: 30, unit: "Pcs", barcode: "LEO-COUP-40" },
      { size: "50 mm (20/pkt)", price: 18.80, mrp: 26.00, stock: 20, unit: "Pcs", barcode: "LEO-COUP-50" },
      { size: "63 mm (100/pkt)", price: 29.00, mrp: 40.00, stock: 100, unit: "Pcs", barcode: "LEO-COUP-63" },
      { size: "75 mm (60/pkt)", price: 39.80, mrp: 54.00, stock: 60, unit: "Pcs", barcode: "LEO-COUP-75" },
      { size: "90 mm (40/pkt)", price: 62.00, mrp: 84.00, stock: 40, unit: "Pcs", barcode: "LEO-COUP-90" },
      { size: "110 mm (22/pkt)", price: 100.00, mrp: 135.00, stock: 22, unit: "Pcs", barcode: "LEO-COUP-110" }
    ]
  },

  // 5. PVC / SWR PVC FITTINGS
  {
    name: "Brass Elbow",
    category: "Plumbing",
    subcategory: "PVC Brass Fittings",
    brand: "Leo Plast",
    hsnCode: "7412",
    gstRate: 18,
    description: "PVC Brass Insert 90° Elbow",
    variants: [
      { size: "3/4\" x 1/2\" (30/pkt)", price: 62.40, mrp: 85.00, stock: 30, unit: "Pcs", barcode: "LEO-BR-ELB-3412" },
      { size: "1\" x 1/2\" (30/pkt)", price: 64.10, mrp: 88.00, stock: 30, unit: "Pcs", barcode: "LEO-BR-ELB-112" },
      { size: "1\" x 3/4\" (25/pkt)", price: 94.00, mrp: 128.00, stock: 25, unit: "Pcs", barcode: "LEO-BR-ELB-134" }
    ]
  },
  {
    name: "Brass FTA",
    category: "Plumbing",
    subcategory: "PVC Brass Fittings",
    brand: "Leo Plast",
    hsnCode: "7412",
    gstRate: 18,
    description: "PVC Female Threaded Adaptor with Brass Insert",
    variants: [
      { size: "3/4\" x 1/2\" (30/pkt)", price: 59.90, mrp: 82.00, stock: 30, unit: "Pcs", barcode: "LEO-BR-FTA-3412" },
      { size: "1\" x 1/2\" (30/pkt)", price: 64.10, mrp: 88.00, stock: 30, unit: "Pcs", barcode: "LEO-BR-FTA-112" },
      { size: "1\" x 3/4\" (25/pkt)", price: 74.40, mrp: 102.00, stock: 25, unit: "Pcs", barcode: "LEO-BR-FTA-134" }
    ]
  },
  {
    name: "Brass Tee",
    category: "Plumbing",
    subcategory: "PVC Brass Fittings",
    brand: "Leo Plast",
    hsnCode: "7412",
    gstRate: 18,
    description: "PVC 3-Way Tee with Brass Insert",
    variants: [
      { size: "3/4\" x 1/2\" (30/pkt)", price: 64.00, mrp: 88.00, stock: 30, unit: "Pcs", barcode: "LEO-BR-TEE-3412" },
      { size: "1\" x 1/2\" (25/pkt)", price: 71.80, mrp: 98.00, stock: 25, unit: "Pcs", barcode: "LEO-BR-TEE-112" },
      { size: "1\" x 3/4\" (20/pkt)", price: 102.60, mrp: 140.00, stock: 20, unit: "Pcs", barcode: "LEO-BR-TEE-134" }
    ]
  },
  {
    name: "Union",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "PVC 3-piece pipe union (25mm to 50mm)",
    variants: [
      { size: "25 mm (25/pkt)", price: 34.50, mrp: 48.00, stock: 25, unit: "Pcs", barcode: "LEO-UNION-25" },
      { size: "32 mm (20/pkt)", price: 39.80, mrp: 55.00, stock: 20, unit: "Pcs", barcode: "LEO-UNION-32" },
      { size: "40 mm (15/pkt)", price: 56.20, mrp: 78.00, stock: 15, unit: "Pcs", barcode: "LEO-UNION-40" },
      { size: "50 mm (10/pkt)", price: 87.50, mrp: 120.00, stock: 10, unit: "Pcs", barcode: "LEO-UNION-50" }
    ]
  },
  {
    name: "Elbow 45°",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "PVC 45 degree directional elbow (25mm to 50mm)",
    variants: [
      { size: "25 mm (50/pkt)", price: 10.50, mrp: 15.00, stock: 50, unit: "Pcs", barcode: "LEO-ELB45-25" },
      { size: "32 mm (30/pkt)", price: 15.50, mrp: 22.00, stock: 30, unit: "Pcs", barcode: "LEO-ELB45-32" },
      { size: "40 mm (30/pkt)", price: 18.80, mrp: 26.00, stock: 30, unit: "Pcs", barcode: "LEO-ELB45-40" },
      { size: "50 mm (15/pkt)", price: 29.00, mrp: 40.00, stock: 15, unit: "Pcs", barcode: "LEO-ELB45-50" }
    ]
  },
  {
    name: "SWR PVC – Single Elbow",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "SWR Drainage PVC Single 87.5° bend",
    variants: [
      { size: "75 mm (84/pkt)", price: 73.00, mrp: 98.00, stock: 84, unit: "Pcs", barcode: "LEO-SWR-ELB-75" },
      { size: "110 mm (42/pkt)", price: 137.00, mrp: 185.00, stock: 42, unit: "Pcs", barcode: "LEO-SWR-ELB-110" }
    ]
  },
  {
    name: "SWR PVC – Single Tee",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "SWR Drainage PVC Single branch tee",
    variants: [
      { size: "75 mm (72/pkt)", price: 94.00, mrp: 128.00, stock: 72, unit: "Pcs", barcode: "LEO-SWR-TEE-75" },
      { size: "110 mm (26/pkt)", price: 184.00, mrp: 248.00, stock: 26, unit: "Pcs", barcode: "LEO-SWR-TEE-110" }
    ]
  },
  {
    name: "SWR PVC – Single Door Elbow",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "SWR Drainage PVC Elbow with inspection door",
    variants: [
      { size: "75 mm (72/pkt)", price: 90.00, mrp: 122.00, stock: 72, unit: "Pcs", barcode: "LEO-SWR-DELB-75" },
      { size: "110 mm (35/pkt)", price: 163.00, mrp: 220.00, stock: 35, unit: "Pcs", barcode: "LEO-SWR-DELB-110" }
    ]
  },
  {
    name: "SWR PVC – Single Door Tee",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "SWR Drainage PVC Tee with inspection door",
    variants: [
      { size: "75 mm (45/pkt)", price: 120.00, mrp: 165.00, stock: 45, unit: "Pcs", barcode: "LEO-SWR-DTEE-75" },
      { size: "110 mm (24/pkt)", price: 223.00, mrp: 300.00, stock: 24, unit: "Pcs", barcode: "LEO-SWR-DTEE-110" }
    ]
  },

  // 6. SWR PVC FITTINGS
  {
    name: "Door Elbow (SWR PVC)",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "SWR Door Elbow (63mm to 110mm)",
    variants: [
      { size: "63 mm (60/pkt)", price: 54.70, mrp: 75.00, stock: 60, unit: "Pcs", barcode: "LEO-SWR-DE-63" },
      { size: "75 mm (30/pkt)", price: 76.90, mrp: 105.00, stock: 30, unit: "Pcs", barcode: "LEO-SWR-DE-75" },
      { size: "90 mm (20/pkt)", price: 106.90, mrp: 145.00, stock: 20, unit: "Pcs", barcode: "LEO-SWR-DE-90" },
      { size: "110 mm (11/pkt)", price: 156.95, mrp: 210.00, stock: 11, unit: "Pcs", barcode: "LEO-SWR-DE-110" }
    ]
  },
  {
    name: "Door Tee (SWR PVC)",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "SWR Door Tee (63mm to 110mm)",
    variants: [
      { size: "63 mm (40/pkt)", price: 70.20, mrp: 95.00, stock: 40, unit: "Pcs", barcode: "LEO-SWR-DT-63" },
      { size: "75 mm (20/pkt)", price: 97.50, mrp: 132.00, stock: 20, unit: "Pcs", barcode: "LEO-SWR-DT-75" },
      { size: "90 mm (15/pkt)", price: 145.30, mrp: 198.00, stock: 15, unit: "Pcs", barcode: "LEO-SWR-DT-90" },
      { size: "110 mm (8/pkt)", price: 196.60, mrp: 265.00, stock: 8, unit: "Pcs", barcode: "LEO-SWR-DT-110" }
    ]
  },
  {
    name: "Nahani Trap with Jali",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3922",
    gstRate: 18,
    description: "PVC Nahani floor trap with jali",
    variants: [
      { size: "110x63 (16/pkt)", price: 130.00, mrp: 175.00, stock: 16, unit: "Pcs", barcode: "LEO-NAHANI-110-63" },
      { size: "110x75 (16/pkt)", price: 130.00, mrp: 175.00, stock: 16, unit: "Pcs", barcode: "LEO-NAHANI-110-75" }
    ]
  },
  {
    name: "Multi Floor Trap with Jali",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3922",
    gstRate: 18,
    description: "Multi inlet floor trap with jali",
    variants: [
      { size: "110x75 (15/pkt)", price: 177.50, mrp: 240.00, stock: 15, unit: "Pcs", barcode: "LEO-MULTITRAP-110" }
    ]
  },
  {
    name: "Vent Cowl",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Ventilation top cowl mushroom cap",
    variants: [
      { size: "63 mm (150/pkt)", price: 12.90, mrp: 18.00, stock: 150, unit: "Pcs", barcode: "LEO-COWL-63" },
      { size: "75 mm (120/pkt)", price: 17.00, mrp: 24.00, stock: 120, unit: "Pcs", barcode: "LEO-COWL-75" },
      { size: "90 mm (90/pkt)", price: 25.70, mrp: 35.00, stock: 90, unit: "Pcs", barcode: "LEO-COWL-90" },
      { size: "110 mm (40/pkt)", price: 34.20, mrp: 48.00, stock: 40, unit: "Pcs", barcode: "LEO-COWL-110" }
    ]
  },
  {
    name: "Single Y",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "45 degree Y branch junction",
    variants: [
      { size: "63 mm (25/pkt)", price: 93.20, mrp: 128.00, stock: 25, unit: "Pcs", barcode: "LEO-Y-63" },
      { size: "75 mm (20/pkt)", price: 112.00, mrp: 155.00, stock: 20, unit: "Pcs", barcode: "LEO-Y-75" },
      { size: "90 mm (11/pkt)", price: 180.00, mrp: 245.00, stock: 11, unit: "Pcs", barcode: "LEO-Y-90" },
      { size: "110 mm (6/pkt)", price: 218.00, mrp: 295.00, stock: 6, unit: "Pcs", barcode: "LEO-Y-110" }
    ]
  },
  {
    name: "Service Saddle",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Branch tapping service saddle clamp",
    variants: [
      { size: "63x20 (70/pkt)", price: 90.00, mrp: 125.00, stock: 70, unit: "Pcs", barcode: "LEO-SADDLE-63-20" },
      { size: "63x25 (70/pkt)", price: 90.00, mrp: 125.00, stock: 70, unit: "Pcs", barcode: "LEO-SADDLE-63-25" },
      { size: "63x32 (70/pkt)", price: 90.00, mrp: 125.00, stock: 70, unit: "Pcs", barcode: "LEO-SADDLE-63-32" },
      { size: "75x20 (60/pkt)", price: 108.00, mrp: 148.00, stock: 60, unit: "Pcs", barcode: "LEO-SADDLE-75-20" },
      { size: "75x25 (60/pkt)", price: 108.00, mrp: 148.00, stock: 60, unit: "Pcs", barcode: "LEO-SADDLE-75-25" },
      { size: "75x32 (60/pkt)", price: 108.00, mrp: 148.00, stock: 60, unit: "Pcs", barcode: "LEO-SADDLE-75-32" },
      { size: "90x20 (50/pkt)", price: 125.00, mrp: 170.00, stock: 50, unit: "Pcs", barcode: "LEO-SADDLE-90-20" },
      { size: "90x25 (50/pkt)", price: 125.00, mrp: 170.00, stock: 50, unit: "Pcs", barcode: "LEO-SADDLE-90-25" },
      { size: "90x32 (50/pkt)", price: 125.00, mrp: 170.00, stock: 50, unit: "Pcs", barcode: "LEO-SADDLE-90-32" },
      { size: "110x20 (40/pkt)", price: 157.00, mrp: 215.00, stock: 40, unit: "Pcs", barcode: "LEO-SADDLE-110-20" },
      { size: "110x25 (40/pkt)", price: 157.00, mrp: 215.00, stock: 40, unit: "Pcs", barcode: "LEO-SADDLE-110-25" },
      { size: "110x32 (40/pkt)", price: 157.00, mrp: 215.00, stock: 40, unit: "Pcs", barcode: "LEO-SADDLE-110-32" }
    ]
  },
  {
    name: "SWR Elbow 45°",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "SWR Drainage 45 degree elbow",
    variants: [
      { size: "63 mm (90/pkt)", price: 38.00, mrp: 52.00, stock: 90, unit: "Pcs", barcode: "LEO-SWR-45-63" },
      { size: "75 mm (50/pkt)", price: 56.40, mrp: 78.00, stock: 50, unit: "Pcs", barcode: "LEO-SWR-45-75" },
      { size: "90 mm (25/pkt)", price: 94.00, mrp: 128.00, stock: 25, unit: "Pcs", barcode: "LEO-SWR-45-90" },
      { size: "110 mm (16/pkt)", price: 110.00, mrp: 150.00, stock: 16, unit: "Pcs", barcode: "LEO-SWR-45-110" }
    ]
  },

  // 7. cPVC PLUMBING SYSTEMS
  {
    name: "cPVC Pipes – SDR 11",
    category: "Plumbing",
    subcategory: "CPVC Pipes",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Chlorinated Polyvinyl Chloride Hot & Cold water pipes SDR 11",
    variants: [
      { size: "3/4\" (20mm) 3 Mtrs", price: 375.00, mrp: 500.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-34-11-3M" },
      { size: "3/4\" (20mm) 5 Mtrs", price: 625.00, mrp: 830.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-34-11-5M" },
      { size: "1\" (25mm) 3 Mtrs", price: 600.00, mrp: 800.00, stock: 40, unit: "Pcs", barcode: "LEO-CPVC-1-11-3M" },
      { size: "1\" (25mm) 5 Mtrs", price: 1000.00, mrp: 1330.00, stock: 40, unit: "Pcs", barcode: "LEO-CPVC-1-11-5M" },
      { size: "1 1/4\" (32mm) 3 Mtrs", price: 900.00, mrp: 1200.00, stock: 30, unit: "Pcs", barcode: "LEO-CPVC-1.25-11-3M" },
      { size: "1 1/4\" (32mm) 5 Mtrs", price: 1500.00, mrp: 2000.00, stock: 30, unit: "Pcs", barcode: "LEO-CPVC-1.25-11-5M" },
      { size: "1 1/2\" (40mm) 3 Mtrs", price: 1251.00, mrp: 1670.00, stock: 20, unit: "Pcs", barcode: "LEO-CPVC-1.5-11-3M" },
      { size: "1 1/2\" (40mm) 5 Mtrs", price: 2085.00, mrp: 2780.00, stock: 20, unit: "Pcs", barcode: "LEO-CPVC-1.5-11-5M" }
    ]
  },
  {
    name: "cPVC Pipes – SDR 13.5",
    category: "Plumbing",
    subcategory: "CPVC Pipes",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Chlorinated Polyvinyl Chloride Hot & Cold water pipes SDR 13.5",
    variants: [
      { size: "3/4\" (20mm) 3 Mtrs", price: 330.00, mrp: 440.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-34-135-3M" },
      { size: "3/4\" (20mm) 5 Mtrs", price: 550.00, mrp: 735.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-34-135-5M" },
      { size: "1\" (25mm) 3 Mtrs", price: 510.00, mrp: 680.00, stock: 40, unit: "Pcs", barcode: "LEO-CPVC-1-135-3M" },
      { size: "1\" (25mm) 5 Mtrs", price: 850.00, mrp: 1130.00, stock: 40, unit: "Pcs", barcode: "LEO-CPVC-1-135-5M" },
      { size: "1 1/4\" (32mm) 3 Mtrs", price: 774.00, mrp: 1030.00, stock: 30, unit: "Pcs", barcode: "LEO-CPVC-1.25-135-3M" },
      { size: "1 1/4\" (32mm) 5 Mtrs", price: 1290.00, mrp: 1720.00, stock: 30, unit: "Pcs", barcode: "LEO-CPVC-1.25-135-5M" },
      { size: "1 1/2\" (40mm) 3 Mtrs", price: 1089.00, mrp: 1450.00, stock: 20, unit: "Pcs", barcode: "LEO-CPVC-1.5-135-3M" },
      { size: "1 1/2\" (40mm) 5 Mtrs", price: 1815.00, mrp: 2420.00, stock: 20, unit: "Pcs", barcode: "LEO-CPVC-1.5-135-5M" }
    ]
  },
  {
    name: "cPVC Elbow 90°",
    category: "Plumbing",
    subcategory: "CPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "cPVC 90° solvent weld elbow",
    variants: [
      { size: "3/4\" (50/pkt)", price: 18.00, mrp: 25.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-ELB-34" },
      { size: "1\" (30/pkt)", price: 35.00, mrp: 48.00, stock: 30, unit: "Pcs", barcode: "LEO-CPVC-ELB-1" },
      { size: "1 1/4\" (15/pkt)", price: 75.00, mrp: 102.00, stock: 15, unit: "Pcs", barcode: "LEO-CPVC-ELB-1.25" },
      { size: "1 1/2\" (10/pkt)", price: 140.00, mrp: 190.00, stock: 10, unit: "Pcs", barcode: "LEO-CPVC-ELB-1.5" }
    ]
  },
  {
    name: "cPVC Tee",
    category: "Plumbing",
    subcategory: "CPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "cPVC equal 3-way branch tee",
    variants: [
      { size: "3/4\" (50/pkt)", price: 30.00, mrp: 42.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-TEE-34" },
      { size: "1\" (20/pkt)", price: 50.00, mrp: 68.00, stock: 20, unit: "Pcs", barcode: "LEO-CPVC-TEE-1" },
      { size: "1 1/4\" (10/pkt)", price: 90.00, mrp: 122.00, stock: 10, unit: "Pcs", barcode: "LEO-CPVC-TEE-1.25" },
      { size: "1 1/2\" (5/pkt)", price: 180.00, mrp: 245.00, stock: 5, unit: "Pcs", barcode: "LEO-CPVC-TEE-1.5" }
    ]
  },
  {
    name: "cPVC Coupler",
    category: "Plumbing",
    subcategory: "CPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "cPVC straight socket coupler",
    variants: [
      { size: "3/4\" (100/pkt)", price: 14.00, mrp: 20.00, stock: 100, unit: "Pcs", barcode: "LEO-CPVC-COUP-34" },
      { size: "1\" (50/pkt)", price: 25.00, mrp: 35.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-COUP-1" },
      { size: "1 1/4\" (20/pkt)", price: 42.00, mrp: 58.00, stock: 20, unit: "Pcs", barcode: "LEO-CPVC-COUP-1.25" },
      { size: "1 1/2\" (15/pkt)", price: 75.00, mrp: 102.00, stock: 15, unit: "Pcs", barcode: "LEO-CPVC-COUP-1.5" }
    ]
  },
  {
    name: "cPVC End Cap",
    category: "Plumbing",
    subcategory: "CPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "cPVC pipe end cap",
    variants: [
      { size: "3/4\" (100/pkt)", price: 11.00, mrp: 15.00, stock: 100, unit: "Pcs", barcode: "LEO-CPVC-CAP-34" },
      { size: "1\" (50/pkt)", price: 18.00, mrp: 25.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-CAP-1" },
      { size: "1 1/4\" (30/pkt)", price: 31.80, mrp: 43.00, stock: 30, unit: "Pcs", barcode: "LEO-CPVC-CAP-1.25" },
      { size: "1 1/2\" (20/pkt)", price: 47.30, mrp: 64.00, stock: 20, unit: "Pcs", barcode: "LEO-CPVC-CAP-1.5" }
    ]
  },
  {
    name: "cPVC FTA",
    category: "Plumbing",
    subcategory: "CPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "cPVC female threaded adaptor",
    variants: [
      { size: "3/4\" (50/pkt)", price: 25.00, mrp: 35.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-FTA-34" },
      { size: "1\" (30/pkt)", price: 40.00, mrp: 55.00, stock: 30, unit: "Pcs", barcode: "LEO-CPVC-FTA-1" },
      { size: "1 1/4\" (15/pkt)", price: 70.00, mrp: 95.00, stock: 15, unit: "Pcs", barcode: "LEO-CPVC-FTA-1.25" },
      { size: "1 1/2\" (10/pkt)", price: 120.00, mrp: 165.00, stock: 10, unit: "Pcs", barcode: "LEO-CPVC-FTA-1.5" }
    ]
  },
  {
    name: "cPVC MTA",
    category: "Plumbing",
    subcategory: "CPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "cPVC male threaded adaptor",
    variants: [
      { size: "3/4\" (50/pkt)", price: 16.40, mrp: 23.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-MTA-34" },
      { size: "1\" (50/pkt)", price: 32.00, mrp: 44.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-MTA-1" },
      { size: "1 1/4\" (20/pkt)", price: 50.00, mrp: 68.00, stock: 20, unit: "Pcs", barcode: "LEO-CPVC-MTA-1.25" },
      { size: "1 1/2\" (15/pkt)", price: 72.00, mrp: 98.00, stock: 15, unit: "Pcs", barcode: "LEO-CPVC-MTA-1.5" }
    ]
  },

  // 8. uPVC ASTM PLUMBING SYSTEMS
  {
    name: "uPVC Pipes – ASTM D 1785 / SCH-40 (Lead Free - 6m)",
    category: "Plumbing",
    subcategory: "UPVC Pipes",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "uPVC Schedule 40 lead free high pressure pipes",
    variants: [
      { size: "3/4\" (20mm)", price: 470.00, mrp: 625.00, stock: 50, unit: "Pcs", barcode: "LEO-UPVC-SCH-34" },
      { size: "1\" (25mm)", price: 700.00, mrp: 935.00, stock: 40, unit: "Pcs", barcode: "LEO-UPVC-SCH-1" },
      { size: "1 1/4\" (32mm)", price: 940.00, mrp: 1250.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-SCH-1.25" },
      { size: "1 1/2\" (40mm)", price: 1170.00, mrp: 1560.00, stock: 20, unit: "Pcs", barcode: "LEO-UPVC-SCH-1.5" }
    ]
  },
  {
    name: "uPVC Pipes – ASTM D 1785 Plumbing Pipes (Lead Free - 6m)",
    category: "Plumbing",
    subcategory: "UPVC Pipes",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "uPVC Plumbing grade lead free pipes",
    variants: [
      { size: "3/4\" (20mm)", price: 400.00, mrp: 535.00, stock: 50, unit: "Pcs", barcode: "LEO-UPVC-PLM-34" },
      { size: "1\" (25mm)", price: 585.00, mrp: 780.00, stock: 40, unit: "Pcs", barcode: "LEO-UPVC-PLM-1" },
      { size: "1 1/4\" (32mm)", price: 775.00, mrp: 1030.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-PLM-1.25" },
      { size: "1 1/2\" (40mm)", price: 995.00, mrp: 1325.00, stock: 20, unit: "Pcs", barcode: "LEO-UPVC-PLM-1.5" }
    ]
  },
  {
    name: "uPVC Elbow 90°",
    category: "Plumbing",
    subcategory: "UPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "uPVC Schedule 40 90° elbow",
    variants: [
      { size: "3/4\" (40/pkt)", price: 16.50, mrp: 23.00, stock: 40, unit: "Pcs", barcode: "LEO-UPVC-ELB-34" },
      { size: "1\" (30/pkt)", price: 26.60, mrp: 36.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-ELB-1" },
      { size: "1 1/4\" (15/pkt)", price: 40.50, mrp: 55.00, stock: 15, unit: "Pcs", barcode: "LEO-UPVC-ELB-1.25" },
      { size: "1 1/2\" (10/pkt)", price: 56.00, mrp: 76.00, stock: 10, unit: "Pcs", barcode: "LEO-UPVC-ELB-1.5" }
    ]
  },
  {
    name: "uPVC Tee",
    category: "Plumbing",
    subcategory: "UPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "uPVC Schedule 40 3-way equal tee",
    variants: [
      { size: "3/4\" (30/pkt)", price: 21.60, mrp: 29.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-TEE-34" },
      { size: "1\" (20/pkt)", price: 34.30, mrp: 46.00, stock: 20, unit: "Pcs", barcode: "LEO-UPVC-TEE-1" },
      { size: "1 1/4\" (12/pkt)", price: 54.00, mrp: 73.00, stock: 12, unit: "Pcs", barcode: "LEO-UPVC-TEE-1.25" },
      { size: "1 1/2\" (6/pkt)", price: 76.90, mrp: 104.00, stock: 6, unit: "Pcs", barcode: "LEO-UPVC-TEE-1.5" }
    ]
  },
  {
    name: "uPVC Coupler",
    category: "Plumbing",
    subcategory: "UPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "uPVC straight pipe socket coupler",
    variants: [
      { size: "3/4\" (50/pkt)", price: 11.70, mrp: 16.00, stock: 50, unit: "Pcs", barcode: "LEO-UPVC-COUP-34" },
      { size: "1\" (30/pkt)", price: 18.20, mrp: 25.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-COUP-1" },
      { size: "1 1/4\" (15/pkt)", price: 25.70, mrp: 35.00, stock: 15, unit: "Pcs", barcode: "LEO-UPVC-COUP-1.25" },
      { size: "1 1/2\" (10/pkt)", price: 35.90, mrp: 48.00, stock: 10, unit: "Pcs", barcode: "LEO-UPVC-COUP-1.5" }
    ]
  },
  {
    name: "uPVC End Cap",
    category: "Plumbing",
    subcategory: "UPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "uPVC pipe end cap",
    variants: [
      { size: "3/4\" (50/pkt)", price: 7.60, mrp: 10.50, stock: 50, unit: "Pcs", barcode: "LEO-UPVC-CAP-34" },
      { size: "1\" (50/pkt)", price: 12.80, mrp: 17.50, stock: 50, unit: "Pcs", barcode: "LEO-UPVC-CAP-1" },
      { size: "1 1/4\" (20/pkt)", price: 19.70, mrp: 27.00, stock: 20, unit: "Pcs", barcode: "LEO-UPVC-CAP-1.25" },
      { size: "1 1/2\" (10/pkt)", price: 26.50, mrp: 36.00, stock: 10, unit: "Pcs", barcode: "LEO-UPVC-CAP-1.5" }
    ]
  },
  {
    name: "uPVC MTA",
    category: "Plumbing",
    subcategory: "UPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "uPVC Male Threaded Adaptor",
    variants: [
      { size: "3/4\" (60/pkt)", price: 8.90, mrp: 12.00, stock: 60, unit: "Pcs", barcode: "LEO-UPVC-MTA-34" },
      { size: "1\" (30/pkt)", price: 15.00, mrp: 20.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-MTA-1" },
      { size: "1 1/4\" (30/pkt)", price: 22.00, mrp: 30.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-MTA-1.25" },
      { size: "1 1/2\" (15/pkt)", price: 30.00, mrp: 40.00, stock: 15, unit: "Pcs", barcode: "LEO-UPVC-MTA-1.5" }
    ]
  },
  {
    name: "uPVC FTA",
    category: "Plumbing",
    subcategory: "UPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "uPVC Female Threaded Adaptor",
    variants: [
      { size: "3/4\" (60/pkt)", price: 11.20, mrp: 15.00, stock: 60, unit: "Pcs", barcode: "LEO-UPVC-FTA-34" },
      { size: "1\" (30/pkt)", price: 18.00, mrp: 24.50, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-FTA-1" },
      { size: "1 1/4\" (20/pkt)", price: 26.50, mrp: 36.00, stock: 20, unit: "Pcs", barcode: "LEO-UPVC-FTA-1.25" },
      { size: "1 1/2\" (15/pkt)", price: 34.20, mrp: 46.50, stock: 15, unit: "Pcs", barcode: "LEO-UPVC-FTA-1.5" }
    ]
  },

  // 9. uPVC ASTM PLUMBING SYSTEMS – FITTINGS
  {
    name: "Tank Nipple",
    category: "Plumbing",
    subcategory: "UPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Threaded uPVC water tank outlet nipple",
    variants: [
      { size: "3/4\" (30/pkt)", price: 29.30, mrp: 40.00, stock: 30, unit: "Pcs", barcode: "LEO-TN-34" },
      { size: "1\" (20/pkt)", price: 42.00, mrp: 58.00, stock: 20, unit: "Pcs", barcode: "LEO-TN-1" },
      { size: "1 1/4\" (10/pkt)", price: 59.80, mrp: 82.00, stock: 10, unit: "Pcs", barcode: "LEO-TN-1.25" },
      { size: "1 1/2\" (10/pkt)", price: 88.90, mrp: 120.00, stock: 10, unit: "Pcs", barcode: "LEO-TN-1.5" },
      { size: "2\" (5/pkt)", price: 143.60, mrp: 195.00, stock: 5, unit: "Pcs", barcode: "LEO-TN-2" }
    ]
  },
  {
    name: "uPVC Elbow 45°",
    category: "Plumbing",
    subcategory: "UPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "uPVC 45 degree elbow",
    variants: [
      { size: "3/4\" (30/pkt)", price: 14.60, mrp: 20.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-45-34" },
      { size: "1\" (30/pkt)", price: 23.10, mrp: 32.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-45-1" },
      { size: "1 1/4\" (20/pkt)", price: 35.90, mrp: 48.00, stock: 20, unit: "Pcs", barcode: "LEO-UPVC-45-1.25" },
      { size: "1 1/2\" (10/pkt)", price: 51.30, mrp: 70.00, stock: 10, unit: "Pcs", barcode: "LEO-UPVC-45-1.5" }
    ]
  },
  {
    name: "uPVC Reducer",
    category: "Plumbing",
    subcategory: "UPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "uPVC pipe reducer",
    variants: [
      { size: "1x3/4\" (30/pkt)", price: 16.00, mrp: 22.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-RED-1-34" },
      { size: "1 1/4\"x3/4\" (30/pkt)", price: 25.70, mrp: 35.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-RED-1.25-34" },
      { size: "1 1/4\"x1\" (20/pkt)", price: 26.50, mrp: 36.00, stock: 20, unit: "Pcs", barcode: "LEO-UPVC-RED-1.25-1" },
      { size: "1 1/2\"x1\" (20/pkt)", price: 34.20, mrp: 46.00, stock: 20, unit: "Pcs", barcode: "LEO-UPVC-RED-1.5-1" },
      { size: "1 1/2\"x1 1/4\" (10/pkt)", price: 35.90, mrp: 48.00, stock: 10, unit: "Pcs", barcode: "LEO-UPVC-RED-1.5-1.25" }
    ]
  },
  {
    name: "uPVC Union",
    category: "Plumbing",
    subcategory: "UPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "uPVC socket union",
    variants: [
      { size: "3/4\" (20/pkt)", price: 38.50, mrp: 52.00, stock: 20, unit: "Pcs", barcode: "LEO-UPVC-UNION-34" },
      { size: "1\" (15/pkt)", price: 59.90, mrp: 82.00, stock: 15, unit: "Pcs", barcode: "LEO-UPVC-UNION-1" },
      { size: "1 1/4\" (10/pkt)", price: 85.50, mrp: 115.00, stock: 10, unit: "Pcs", barcode: "LEO-UPVC-UNION-1.25" },
      { size: "1 1/2\" (5/pkt)", price: 120.00, mrp: 165.00, stock: 5, unit: "Pcs", barcode: "LEO-UPVC-UNION-1.5" }
    ]
  },
  {
    name: "uPVC Brass Elbow",
    category: "Plumbing",
    subcategory: "UPVC Brass Fittings",
    brand: "Leo Plast",
    hsnCode: "7412",
    gstRate: 18,
    description: "uPVC Brass Insert 90° Elbow",
    variants: [
      { size: "3/4\"x1/2\" (30/pkt)", price: 85.00, mrp: 115.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-BRELB-3412" },
      { size: "1\"x1/2\" (25/pkt)", price: 106.80, mrp: 145.00, stock: 25, unit: "Pcs", barcode: "LEO-UPVC-BRELB-112" },
      { size: "1\"x3/4\" (15/pkt)", price: 125.00, mrp: 170.00, stock: 15, unit: "Pcs", barcode: "LEO-UPVC-BRELB-134" }
    ]
  },
  {
    name: "uPVC Brass FTA",
    category: "Plumbing",
    subcategory: "UPVC Brass Fittings",
    brand: "Leo Plast",
    hsnCode: "7412",
    gstRate: 18,
    description: "uPVC Female Threaded Adaptor with Brass Insert",
    variants: [
      { size: "3/4\"x1/2\" (30/pkt)", price: 78.00, mrp: 105.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-BRFTA-3412" },
      { size: "1\"x1/2\" (30/pkt)", price: 90.00, mrp: 122.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-BRFTA-112" }
    ]
  },
  {
    name: "uPVC Brass Tee",
    category: "Plumbing",
    subcategory: "UPVC Brass Fittings",
    brand: "Leo Plast",
    hsnCode: "7412",
    gstRate: 18,
    description: "uPVC 3-Way Tee with Brass Insert",
    variants: [
      { size: "3/4\"x1/2\" (30/pkt)", price: 100.00, mrp: 135.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-BRTEE-3412" },
      { size: "1\"x1/2\" (20/pkt)", price: 110.00, mrp: 150.00, stock: 20, unit: "Pcs", barcode: "LEO-UPVC-BRTEE-112" },
      { size: "1\"x3/4\" (15/pkt)", price: 140.00, mrp: 190.00, stock: 15, unit: "Pcs", barcode: "LEO-UPVC-BRTEE-134" }
    ]
  },
  {
    name: "uPVC Plug & Connectors",
    category: "Plumbing",
    subcategory: "UPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "uPVC Threaded plugs and cPVC to uPVC transition connectors",
    variants: [
      { size: "1/2\" Plug (100/pkt)", price: 5.10, mrp: 7.50, stock: 100, unit: "Pcs", barcode: "LEO-PLUG-12" },
      { size: "3/4\" Plug (50/pkt)", price: 7.20, mrp: 10.00, stock: 50, unit: "Pcs", barcode: "LEO-PLUG-34" },
      { size: "3/4\"x3/4\" cPVC to uPVC Connector (50/pkt)", price: 25.70, mrp: 35.00, stock: 50, unit: "Pcs", barcode: "LEO-CONN-34" },
      { size: "1\"x1\" cPVC to uPVC Connector (30/pkt)", price: 38.50, mrp: 52.00, stock: 30, unit: "Pcs", barcode: "LEO-CONN-1" }
    ]
  },

  // 10. HDPE IRRIGATION SYSTEM / FLEXIBLE HOSES
  {
    name: "PE 80 – HDPE Pipes (Per Meter)",
    category: "Plumbing",
    subcategory: "HDPE Pipes",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "PE 80 High-Density Polyethylene pipes",
    variants: [
      { size: "1/2\" (16mm) 12.5 kg", price: 27.00, mrp: 36.00, stock: 500, unit: "Mtr", barcode: "LEO-HDPE-16" },
      { size: "5/8\" (20mm) 10 kg", price: 40.00, mrp: 54.00, stock: 500, unit: "Mtr", barcode: "LEO-HDPE-20" },
      { size: "3/4\" (25mm) 10 kg", price: 55.00, mrp: 74.00, stock: 500, unit: "Mtr", barcode: "LEO-HDPE-25" },
      { size: "1\" (32mm) 6 kg", price: 66.00, mrp: 88.00, stock: 300, unit: "Mtr", barcode: "LEO-HDPE-32-6K" },
      { size: "1\" (32mm) 8 kg", price: 82.00, mrp: 110.00, stock: 300, unit: "Mtr", barcode: "LEO-HDPE-32-8K" },
      { size: "1\" (32mm) 10 kg", price: 96.00, mrp: 128.00, stock: 300, unit: "Mtr", barcode: "LEO-HDPE-32-10K" },
      { size: "1 1/4\" (40mm) 6 kg", price: 96.00, mrp: 128.00, stock: 200, unit: "Mtr", barcode: "LEO-HDPE-40-6K" },
      { size: "1 1/4\" (40mm) 8 kg", price: 112.00, mrp: 150.00, stock: 200, unit: "Mtr", barcode: "LEO-HDPE-40-8K" },
      { size: "1 1/4\" (40mm) 10 kg", price: 140.00, mrp: 188.00, stock: 200, unit: "Mtr", barcode: "LEO-HDPE-40-10K" },
      { size: "1 1/2\" (50mm) 6 kg", price: 140.00, mrp: 188.00, stock: 200, unit: "Mtr", barcode: "LEO-HDPE-50-6K" },
      { size: "1 1/2\" (50mm) 10 kg", price: 200.00, mrp: 265.00, stock: 200, unit: "Mtr", barcode: "LEO-HDPE-50-10K" },
      { size: "2\" (63mm) 4 kg", price: 200.00, mrp: 265.00, stock: 150, unit: "Mtr", barcode: "LEO-HDPE-63" },
      { size: "2 1/2\" (75mm) 4 kg", price: 255.00, mrp: 340.00, stock: 100, unit: "Mtr", barcode: "LEO-HDPE-75" }
    ]
  },
  {
    name: "Suction Hoses (30 Mtrs Roll)",
    category: "Plumbing",
    subcategory: "Hoses",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Heavy duty suction delivery water hose (30m Roll)",
    variants: [
      { size: "3/4\"", price: 1350.00, mrp: 1800.00, stock: 10, unit: "Roll", barcode: "LEO-SUCT-34" },
      { size: "1\"", price: 1850.00, mrp: 2450.00, stock: 10, unit: "Roll", barcode: "LEO-SUCT-1" },
      { size: "1 1/4\"", price: 2700.00, mrp: 3600.00, stock: 8, unit: "Roll", barcode: "LEO-SUCT-1.25" },
      { size: "1 1/2\"", price: 3300.00, mrp: 4400.00, stock: 8, unit: "Roll", barcode: "LEO-SUCT-1.5" },
      { size: "2\"", price: 4800.00, mrp: 6400.00, stock: 6, unit: "Roll", barcode: "LEO-SUCT-2" },
      { size: "2 1/4\"", price: 6000.00, mrp: 8000.00, stock: 4, unit: "Roll", barcode: "LEO-SUCT-2.25" },
      { size: "2 1/2\"", price: 7000.00, mrp: 9300.00, stock: 4, unit: "Roll", barcode: "LEO-SUCT-2.5" }
    ]
  },
  {
    name: "Braided Hoses (30 Mtrs Roll)",
    category: "Plumbing",
    subcategory: "Hoses",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Braided flexible pressure water hose (30m Roll)",
    variants: [
      { size: "3/4\"", price: 1430.00, mrp: 1900.00, stock: 15, unit: "Roll", barcode: "LEO-BRAID-34" },
      { size: "1\"", price: 2210.00, mrp: 2950.00, stock: 12, unit: "Roll", barcode: "LEO-BRAID-1" },
      { size: "1 1/4\"", price: 4290.00, mrp: 5700.00, stock: 6, unit: "Roll", barcode: "LEO-BRAID-1.25" },
      { size: "1 1/2\"", price: 5200.00, mrp: 6900.00, stock: 5, unit: "Roll", barcode: "LEO-BRAID-1.5" }
    ]
  },

  // 11. FABRICATED BEND & COUPLERS
  {
    name: "Fabricated Bend – 4 KG",
    category: "Plumbing",
    subcategory: "PVC Bends",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "4 KG Fabricated long bend",
    variants: [
      { size: "63 mm", price: 65.00, mrp: 90.00, stock: 30, unit: "Pcs", barcode: "LEO-BEND-63-4K" },
      { size: "75 mm", price: 100.00, mrp: 135.00, stock: 30, unit: "Pcs", barcode: "LEO-BEND-75-4K" },
      { size: "90 mm", price: 160.00, mrp: 215.00, stock: 20, unit: "Pcs", barcode: "LEO-BEND-90-4K" },
      { size: "110 mm", price: 245.00, mrp: 330.00, stock: 15, unit: "Pcs", barcode: "LEO-BEND-110-4K" }
    ]
  },
  {
    name: "Fabricated Bend – 6 KG",
    category: "Plumbing",
    subcategory: "PVC Bends",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "6 KG Fabricated long bend (40mm to 180mm)",
    variants: [
      { size: "40 mm", price: 29.40, mrp: 40.00, stock: 40, unit: "Pcs", barcode: "LEO-BEND-40-6K" },
      { size: "50 mm", price: 41.70, mrp: 56.00, stock: 30, unit: "Pcs", barcode: "LEO-BEND-50-6K" },
      { size: "63 mm", price: 81.80, mrp: 110.00, stock: 30, unit: "Pcs", barcode: "LEO-BEND-63-6K" },
      { size: "75 mm", price: 117.80, mrp: 160.00, stock: 25, unit: "Pcs", barcode: "LEO-BEND-75-6K" },
      { size: "90 mm", price: 175.00, mrp: 235.00, stock: 20, unit: "Pcs", barcode: "LEO-BEND-90-6K" },
      { size: "110 mm", price: 260.00, mrp: 350.00, stock: 15, unit: "Pcs", barcode: "LEO-BEND-110-6K" },
      { size: "140 mm", price: 677.00, mrp: 900.00, stock: 10, unit: "Pcs", barcode: "LEO-BEND-140-6K" },
      { size: "160 mm", price: 1145.00, mrp: 1520.00, stock: 8, unit: "Pcs", barcode: "LEO-BEND-160-6K" },
      { size: "180 mm", price: 1780.00, mrp: 2370.00, stock: 5, unit: "Pcs", barcode: "LEO-BEND-180-6K" }
    ]
  },
  {
    name: "Fabricated Bend – 15 KG",
    category: "Plumbing",
    subcategory: "PVC Bends",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "15 KG Heavy Fabricated bend",
    variants: [
      { size: "20 mm", price: 13.10, mrp: 18.00, stock: 50, unit: "Pcs", barcode: "LEO-BEND-20-15K" },
      { size: "25 mm", price: 20.30, mrp: 28.00, stock: 50, unit: "Pcs", barcode: "LEO-BEND-25-15K" },
      { size: "32 mm", price: 30.10, mrp: 42.00, stock: 40, unit: "Pcs", barcode: "LEO-BEND-32-15K" },
      { size: "40 mm", price: 46.60, mrp: 64.00, stock: 30, unit: "Pcs", barcode: "LEO-BEND-40-15K" },
      { size: "50 mm", price: 70.00, mrp: 95.00, stock: 20, unit: "Pcs", barcode: "LEO-BEND-50-15K" }
    ]
  },
  {
    name: "Fabricated Coupler & Special Bends",
    category: "Plumbing",
    subcategory: "PVC Bends",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Fabricated Couplers, S Bends, Repair Couplers, By-Pass Bends, Wired Bends",
    variants: [
      { size: "Coupler 6 KG 63mm", price: 27.00, mrp: 38.00, stock: 30, unit: "Pcs", barcode: "LEO-FCOUP-63-6K" },
      { size: "Coupler 6 KG 75mm", price: 38.65, mrp: 52.00, stock: 25, unit: "Pcs", barcode: "LEO-FCOUP-75-6K" },
      { size: "Coupler 6 KG 90mm", price: 53.80, mrp: 72.00, stock: 20, unit: "Pcs", barcode: "LEO-FCOUP-90-6K" },
      { size: "Coupler 6 KG 110mm", price: 80.00, mrp: 110.00, stock: 15, unit: "Pcs", barcode: "LEO-FCOUP-110-6K" },
      { size: "S Bend 6 KG 63mm", price: 105.00, mrp: 145.00, stock: 20, unit: "Pcs", barcode: "LEO-SBEND-63" },
      { size: "S Bend 6 KG 75mm", price: 145.00, mrp: 195.00, stock: 20, unit: "Pcs", barcode: "LEO-SBEND-75" },
      { size: "S Bend 6 KG 90mm", price: 225.00, mrp: 300.00, stock: 15, unit: "Pcs", barcode: "LEO-SBEND-90" },
      { size: "S Bend 6 KG 110mm", price: 340.00, mrp: 450.00, stock: 10, unit: "Pcs", barcode: "LEO-SBEND-110" },
      { size: "Repair Coupler 6 KG 63mm", price: 80.00, mrp: 110.00, stock: 20, unit: "Pcs", barcode: "LEO-REP-63" },
      { size: "Repair Coupler 6 KG 75mm", price: 97.00, mrp: 130.00, stock: 20, unit: "Pcs", barcode: "LEO-REP-75" },
      { size: "Repair Coupler 6 KG 90mm", price: 125.00, mrp: 170.00, stock: 15, unit: "Pcs", barcode: "LEO-REP-90" },
      { size: "Repair Coupler 6 KG 110mm", price: 160.00, mrp: 215.00, stock: 10, unit: "Pcs", barcode: "LEO-REP-110" },
      { size: "PVC By-Pass Bend 25mm", price: 45.00, mrp: 62.00, stock: 30, unit: "Pcs", barcode: "LEO-BYPASS-25" },
      { size: "PVC By-Pass Bend 32mm", price: 70.00, mrp: 95.00, stock: 30, unit: "Pcs", barcode: "LEO-BYPASS-32" },
      { size: "cPVC By-Pass Bend 3/4\"", price: 80.00, mrp: 110.00, stock: 20, unit: "Pcs", barcode: "LEO-CPVC-BYPASS-34" },
      { size: "cPVC By-Pass Bend 1\"", price: 150.00, mrp: 200.00, stock: 15, unit: "Pcs", barcode: "LEO-CPVC-BYPASS-1" },
      { size: "Wired Bend 19mm", price: 9.60, mrp: 14.00, stock: 50, unit: "Pcs", barcode: "LEO-WBEND-19" },
      { size: "Wired Bend 20mm", price: 9.60, mrp: 14.00, stock: 50, unit: "Pcs", barcode: "LEO-WBEND-20" },
      { size: "Wired Bend 25mm", price: 14.50, mrp: 20.00, stock: 50, unit: "Pcs", barcode: "LEO-WBEND-25" }
    ]
  },

  // 12. SOLVENTS & CLAMPS
  {
    name: "PVC Solvents (Tin Container with Brush)",
    category: "Plumbing",
    subcategory: "Solvents & Adhesives",
    brand: "Leo Plast",
    hsnCode: "3506",
    gstRate: 18,
    description: "PVC solvent weld cement in tin container with brush",
    variants: [
      { size: "50ml", price: 56.00, mrp: 75.00, stock: 50, unit: "Tin", barcode: "LEO-SOLV-PVC-50" },
      { size: "100ml", price: 80.00, mrp: 110.00, stock: 40, unit: "Tin", barcode: "LEO-SOLV-PVC-100" },
      { size: "250ml", price: 155.00, mrp: 210.00, stock: 30, unit: "Tin", barcode: "LEO-SOLV-PVC-250" },
      { size: "500ml", price: 265.00, mrp: 355.00, stock: 20, unit: "Tin", barcode: "LEO-SOLV-PVC-500" },
      { size: "1000ml", price: 500.00, mrp: 665.00, stock: 15, unit: "Tin", barcode: "LEO-SOLV-PVC-1000" }
    ]
  },
  {
    name: "uPVC & cPVC Solvents (Tin Container with Brush)",
    category: "Plumbing",
    subcategory: "Solvents & Adhesives",
    brand: "Leo Plast",
    hsnCode: "3506",
    gstRate: 18,
    description: "uPVC and cPVC solvent cements in tin container with brush",
    variants: [
      { size: "uPVC 50ml", price: 70.00, mrp: 95.00, stock: 40, unit: "Tin", barcode: "LEO-SOLV-UPVC-50" },
      { size: "uPVC 125ml", price: 120.00, mrp: 160.00, stock: 30, unit: "Tin", barcode: "LEO-SOLV-UPVC-125" },
      { size: "uPVC 250ml", price: 210.00, mrp: 280.00, stock: 20, unit: "Tin", barcode: "LEO-SOLV-UPVC-250" },
      { size: "cPVC 50ml", price: 85.00, mrp: 115.00, stock: 40, unit: "Tin", barcode: "LEO-SOLV-CPVC-50" },
      { size: "cPVC 125ml", price: 150.00, mrp: 200.00, stock: 30, unit: "Tin", barcode: "LEO-SOLV-CPVC-125" },
      { size: "cPVC 250ml", price: 260.00, mrp: 350.00, stock: 20, unit: "Tin", barcode: "LEO-SOLV-CPVC-250" }
    ]
  },
  {
    name: "Step Clamp",
    category: "Plumbing",
    subcategory: "Pipe Clamps",
    brand: "Leo Plast",
    hsnCode: "7326",
    gstRate: 18,
    description: "Heavy step mounting clamp (4\" to 36\")",
    variants: [
      { size: "4\"", price: 120.00, mrp: 160.00, stock: 20, unit: "Pcs", barcode: "LEO-STEP-4" },
      { size: "6\"", price: 145.00, mrp: 195.00, stock: 20, unit: "Pcs", barcode: "LEO-STEP-6" },
      { size: "8\"", price: 155.00, mrp: 210.00, stock: 20, unit: "Pcs", barcode: "LEO-STEP-8" },
      { size: "10\"", price: 180.00, mrp: 240.00, stock: 15, unit: "Pcs", barcode: "LEO-STEP-10" },
      { size: "12\"", price: 205.00, mrp: 275.00, stock: 15, unit: "Pcs", barcode: "LEO-STEP-12" },
      { size: "16\"", price: 250.00, mrp: 335.00, stock: 10, unit: "Pcs", barcode: "LEO-STEP-16" },
      { size: "18\"", price: 290.00, mrp: 390.00, stock: 10, unit: "Pcs", barcode: "LEO-STEP-18" },
      { size: "24\"", price: 370.00, mrp: 495.00, stock: 10, unit: "Pcs", barcode: "LEO-STEP-24" },
      { size: "30\"", price: 420.00, mrp: 560.00, stock: 8, unit: "Pcs", barcode: "LEO-STEP-30" },
      { size: "36\"", price: 515.00, mrp: 690.00, stock: 5, unit: "Pcs", barcode: "LEO-STEP-36" }
    ]
  },
  {
    name: "PVC SS Clamp",
    category: "Plumbing",
    subcategory: "Pipe Clamps",
    brand: "Leo Plast",
    hsnCode: "7326",
    gstRate: 18,
    description: "Stainless steel pipe clamp (25mm to 110mm)",
    variants: [
      { size: "25 mm", price: 11.50, mrp: 16.00, stock: 100, unit: "Pcs", barcode: "LEO-SSCLAMP-25" },
      { size: "32 mm", price: 12.00, mrp: 17.00, stock: 100, unit: "Pcs", barcode: "LEO-SSCLAMP-32" },
      { size: "40 mm", price: 13.50, mrp: 19.00, stock: 80, unit: "Pcs", barcode: "LEO-SSCLAMP-40" },
      { size: "50 mm", price: 16.00, mrp: 22.00, stock: 60, unit: "Pcs", barcode: "LEO-SSCLAMP-50" },
      { size: "63 mm", price: 21.00, mrp: 29.00, stock: 50, unit: "Pcs", barcode: "LEO-SSCLAMP-63" },
      { size: "75 mm", price: 25.00, mrp: 35.00, stock: 40, unit: "Pcs", barcode: "LEO-SSCLAMP-75" },
      { size: "90 mm", price: 30.00, mrp: 42.00, stock: 30, unit: "Pcs", barcode: "LEO-SSCLAMP-90" },
      { size: "110 mm", price: 34.00, mrp: 48.00, stock: 30, unit: "Pcs", barcode: "LEO-SSCLAMP-110" }
    ]
  },
  {
    name: "cPVC & uPVC Clamps",
    category: "Plumbing",
    subcategory: "Pipe Clamps",
    brand: "Leo Plast",
    hsnCode: "7326",
    gstRate: 18,
    description: "Specialized cPVC and uPVC mounting clamps",
    variants: [
      { size: "3/4\" cPVC Clamp", price: 10.00, mrp: 14.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-CLAMP-34" },
      { size: "1\" cPVC Clamp", price: 11.00, mrp: 15.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-CLAMP-1" },
      { size: "1 1/4\" cPVC Clamp", price: 14.00, mrp: 19.00, stock: 30, unit: "Pcs", barcode: "LEO-CPVC-CLAMP-1.25" },
      { size: "1 1/2\" cPVC Clamp", price: 17.00, mrp: 23.00, stock: 30, unit: "Pcs", barcode: "LEO-CPVC-CLAMP-1.5" },
      { size: "3/4\" uPVC Clamp", price: 10.00, mrp: 14.00, stock: 50, unit: "Pcs", barcode: "LEO-UPVC-CLAMP-34" },
      { size: "1\" uPVC Clamp", price: 12.00, mrp: 16.50, stock: 50, unit: "Pcs", barcode: "LEO-UPVC-CLAMP-1" },
      { size: "1 1/4\" uPVC Clamp", price: 14.00, mrp: 19.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-CLAMP-1.25" },
      { size: "1 1/2\" uPVC Clamp", price: 20.00, mrp: 28.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-CLAMP-1.5" }
    ]
  },

  // 13. BALL VALVES / SANITARY WARE / MANHOLE COVER
  {
    name: "PP Ball Valves – Long Handle with MS Plate Inserts",
    category: "Plumbing",
    subcategory: "Valves",
    brand: "Leo Plast",
    hsnCode: "8481",
    gstRate: 18,
    description: "PP Long Handle ball valve with MS plate inserts",
    variants: [
      { size: "3/4\"", price: 120.00, mrp: 160.00, stock: 30, unit: "Pcs", barcode: "LEO-PPBV-34" },
      { size: "1\"", price: 135.00, mrp: 180.00, stock: 30, unit: "Pcs", barcode: "LEO-PPBV-1" },
      { size: "1 1/4\"", price: 200.00, mrp: 270.00, stock: 20, unit: "Pcs", barcode: "LEO-PPBV-1.25" },
      { size: "1 1/2\"", price: 250.00, mrp: 335.00, stock: 20, unit: "Pcs", barcode: "LEO-PPBV-1.5" },
      { size: "2\"", price: 317.00, mrp: 425.00, stock: 15, unit: "Pcs", barcode: "LEO-PPBV-2" },
      { size: "2 1/2\"", price: 470.00, mrp: 630.00, stock: 10, unit: "Pcs", barcode: "LEO-PPBV-2.5" },
      { size: "3\"", price: 625.00, mrp: 835.00, stock: 8, unit: "Pcs", barcode: "LEO-PPBV-3" },
      { size: "4\"", price: 1150.00, mrp: 1530.00, stock: 5, unit: "Pcs", barcode: "LEO-PPBV-4" }
    ]
  },
  {
    name: "uPVC / cPVC / rPVC Ball Valves – Single Handle",
    category: "Plumbing",
    subcategory: "Valves",
    brand: "Leo Plast",
    hsnCode: "8481",
    gstRate: 18,
    description: "Single handle solvent weld compact ball valves",
    variants: [
      { size: "3/4\" uPVC", price: 106.00, mrp: 145.00, stock: 25, unit: "Pcs", barcode: "LEO-UPVC-BV-34" },
      { size: "1\" uPVC", price: 144.00, mrp: 195.00, stock: 25, unit: "Pcs", barcode: "LEO-UPVC-BV-1" },
      { size: "1 1/4\" uPVC", price: 230.00, mrp: 310.00, stock: 15, unit: "Pcs", barcode: "LEO-UPVC-BV-1.25" },
      { size: "1 1/2\" uPVC", price: 300.00, mrp: 400.00, stock: 15, unit: "Pcs", barcode: "LEO-UPVC-BV-1.5" },
      { size: "2\" uPVC", price: 480.00, mrp: 640.00, stock: 10, unit: "Pcs", barcode: "LEO-UPVC-BV-2" },
      { size: "3/4\" cPVC", price: 168.00, mrp: 225.00, stock: 25, unit: "Pcs", barcode: "LEO-CPVC-BV-34" },
      { size: "1\" cPVC", price: 225.00, mrp: 300.00, stock: 25, unit: "Pcs", barcode: "LEO-CPVC-BV-1" },
      { size: "1 1/4\" cPVC", price: 480.00, mrp: 640.00, stock: 15, unit: "Pcs", barcode: "LEO-CPVC-BV-1.25" },
      { size: "1 1/2\" cPVC", price: 864.00, mrp: 1150.00, stock: 10, unit: "Pcs", barcode: "LEO-CPVC-BV-1.5" },
      { size: "2\" cPVC", price: 1440.00, mrp: 1920.00, stock: 8, unit: "Pcs", barcode: "LEO-CPVC-BV-2" },
      { size: "3/4\" rPVC", price: 90.00, mrp: 120.00, stock: 25, unit: "Pcs", barcode: "LEO-RPVC-BV-34" },
      { size: "1\" rPVC", price: 110.00, mrp: 150.00, stock: 25, unit: "Pcs", barcode: "LEO-RPVC-BV-1" },
      { size: "1 1/4\" rPVC", price: 190.00, mrp: 255.00, stock: 15, unit: "Pcs", barcode: "LEO-RPVC-BV-1.25" },
      { size: "1 1/2\" rPVC", price: 260.00, mrp: 350.00, stock: 15, unit: "Pcs", barcode: "LEO-RPVC-BV-1.5" },
      { size: "2\" rPVC", price: 450.00, mrp: 600.00, stock: 10, unit: "Pcs", barcode: "LEO-RPVC-BV-2" }
    ]
  },
  {
    name: "Sanitary Ware & Manhole Cover",
    category: "Plumbing",
    subcategory: "Sanitary Ware",
    brand: "Leo Plast",
    hsnCode: "3922",
    gstRate: 18,
    description: "Flush tank, seat cover, FRP covers, PP Rope",
    variants: [
      { size: "Flush Tank Classic", price: 900.00, mrp: 1200.00, stock: 15, unit: "Pcs", barcode: "LEO-FLUSH-TANK" },
      { size: "Seat Cover Classic (White / Ivory)", price: 430.00, mrp: 580.00, stock: 20, unit: "Pcs", barcode: "LEO-SEAT-COVER" },
      { size: "FRP Manhole Cover 12x12", price: 800.00, mrp: 1080.00, stock: 10, unit: "Pcs", barcode: "LEO-FRP-12" },
      { size: "FRP Manhole Cover 18x18", price: 1550.00, mrp: 2100.00, stock: 8, unit: "Pcs", barcode: "LEO-FRP-18" },
      { size: "FRP Manhole Cover 24x24", price: 2350.00, mrp: 3150.00, stock: 6, unit: "Pcs", barcode: "LEO-FRP-24" },
      { size: "FRP Manhole Cover 28x28", price: 4700.00, mrp: 6300.00, stock: 4, unit: "Pcs", barcode: "LEO-FRP-28" },
      { size: "Yellow PP Rope 12mm", price: 23.00, mrp: 32.00, stock: 100, unit: "Mtr", barcode: "LEO-ROPE-12" },
      { size: "Yellow PP Rope 14mm", price: 31.00, mrp: 42.00, stock: 100, unit: "Mtr", barcode: "LEO-ROPE-14" },
      { size: "Yellow PP Rope 16mm", price: 40.00, mrp: 55.00, stock: 100, unit: "Mtr", barcode: "LEO-ROPE-16" },
      { size: "Yellow PP Rope 18mm", price: 50.00, mrp: 68.00, stock: 100, unit: "Mtr", barcode: "LEO-ROPE-18" }
    ]
  },

  // 14. LEO PLAST M-SERIES
  {
    name: "Leo Plast M-Series PTMT Bathroom Faucets",
    category: "Plumbing",
    subcategory: "Faucets & Taps",
    brand: "Leo Plast",
    hsnCode: "8481",
    gstRate: 18,
    description: "Durable high quality PTMT bathroom and sink cocks",
    variants: [
      { size: "Short Body", price: 160.00, mrp: 220.00, stock: 50, unit: "Pcs", barcode: "LEO-M-SHORT" },
      { size: "Long Body", price: 200.00, mrp: 275.00, stock: 50, unit: "Pcs", barcode: "LEO-M-LONG" },
      { size: "Angle Cock", price: 160.00, mrp: 220.00, stock: 50, unit: "Pcs", barcode: "LEO-M-ANGLE" },
      { size: "2 Way Cock", price: 350.00, mrp: 480.00, stock: 30, unit: "Pcs", barcode: "LEO-M-2WAY" },
      { size: "Pillar Cock", price: 240.00, mrp: 330.00, stock: 30, unit: "Pcs", barcode: "LEO-M-PILLAR" },
      { size: "Pillar Cock Long", price: 360.00, mrp: 490.00, stock: 25, unit: "Pcs", barcode: "LEO-M-PILLAR-LONG" },
      { size: "Garden Cock", price: 230.00, mrp: 315.00, stock: 30, unit: "Pcs", barcode: "LEO-M-GARDEN" },
      { size: "Machine Cock", price: 230.00, mrp: 315.00, stock: 30, unit: "Pcs", barcode: "LEO-M-MACHINE" },
      { size: "Wall Sink Cock", price: 450.00, mrp: 615.00, stock: 20, unit: "Pcs", barcode: "LEO-M-WALL-SINK" },
      { size: "Pillar Sink Cock", price: 450.00, mrp: 615.00, stock: 20, unit: "Pcs", barcode: "LEO-M-PILL-SINK" },
      { size: "Wall Mixture", price: 1580.00, mrp: 2150.00, stock: 10, unit: "Pcs", barcode: "LEO-M-WALL-MIXTURE" },
      { size: "2 Way Angle Cock", price: 350.00, mrp: 480.00, stock: 25, unit: "Pcs", barcode: "LEO-M-2WAY-ANGLE" },
      { size: "Health Faucet Set", price: 430.00, mrp: 590.00, stock: 30, unit: "Pcs", barcode: "LEO-M-HEALTH-FAUCET" },
      { size: "Health Faucet Gun Only", price: 180.00, mrp: 250.00, stock: 40, unit: "Pcs", barcode: "LEO-M-HEALTH-GUN" },
      { size: "Shower Set", price: 380.00, mrp: 520.00, stock: 25, unit: "Pcs", barcode: "LEO-M-SHOWER" },
      { size: "Connection Tube 18\"", price: 85.00, mrp: 120.00, stock: 50, unit: "Pcs", barcode: "LEO-TUBE-18" },
      { size: "Connection Tube 24\"", price: 95.00, mrp: 135.00, stock: 50, unit: "Pcs", barcode: "LEO-TUBE-24" },
      { size: "Connection Tube 1 Mtr", price: 135.00, mrp: 185.00, stock: 30, unit: "Pcs", barcode: "LEO-TUBE-1M" },
      { size: "Connection Tube 1.5 Mtr", price: 170.00, mrp: 235.00, stock: 30, unit: "Pcs", barcode: "LEO-TUBE-1.5M" }
    ]
  },

  // 15. EDGE SERIES + ALFA SERIES
  {
    name: "Edge Series PTMT Faucets (Square Profile)",
    category: "Plumbing",
    subcategory: "Faucets & Taps",
    brand: "Leo Plast",
    hsnCode: "8481",
    gstRate: 18,
    description: "Premium Square profile designer PTMT bathroom fittings",
    variants: [
      { size: "Edge Short Body", price: 327.00, mrp: 440.00, stock: 30, unit: "Pcs", barcode: "LEO-EDGE-SHORT" },
      { size: "Edge Long Body", price: 380.00, mrp: 510.00, stock: 30, unit: "Pcs", barcode: "LEO-EDGE-LONG" },
      { size: "Edge Angle Cock", price: 300.00, mrp: 405.00, stock: 30, unit: "Pcs", barcode: "LEO-EDGE-ANGLE" },
      { size: "Edge 2 Way Cock", price: 630.00, mrp: 850.00, stock: 20, unit: "Pcs", barcode: "LEO-EDGE-2WAY" },
      { size: "Edge Pillar Cock", price: 400.00, mrp: 540.00, stock: 20, unit: "Pcs", barcode: "LEO-EDGE-PILLAR" },
      { size: "Edge Pillar Sink Cock", price: 555.00, mrp: 750.00, stock: 15, unit: "Pcs", barcode: "LEO-EDGE-PILL-SINK" },
      { size: "Edge Wall Sink Cock", price: 630.00, mrp: 850.00, stock: 15, unit: "Pcs", barcode: "LEO-EDGE-WALL-SINK" },
      { size: "Edge 2 Way Angle Cock", price: 550.00, mrp: 740.00, stock: 20, unit: "Pcs", barcode: "LEO-EDGE-2WAY-ANGLE" },
      { size: "Edge Wall Mixture Set", price: 2200.00, mrp: 2950.00, stock: 10, unit: "Pcs", barcode: "LEO-EDGE-WALL-MIXTURE" }
    ]
  },
  {
    name: "Alfa Series PTMT Faucets (Economy)",
    category: "Plumbing",
    subcategory: "Faucets & Taps",
    brand: "Leo Plast",
    hsnCode: "8481",
    gstRate: 18,
    description: "Economy range PTMT taps",
    variants: [
      { size: "Alfa Short Body", price: 111.00, mrp: 150.00, stock: 50, unit: "Pcs", barcode: "LEO-ALFA-SHORT" },
      { size: "Alfa Long Body", price: 123.00, mrp: 165.00, stock: 50, unit: "Pcs", barcode: "LEO-ALFA-LONG" },
      { size: "Alfa Angle Cock", price: 111.00, mrp: 150.00, stock: 50, unit: "Pcs", barcode: "LEO-ALFA-ANGLE" }
    ]
  }
];

async function purgeAndSeedCleanDatabase() {
  console.log("1. Fetching all existing products in Firestore to purge old unmatched items...");
  const snap = await getDocs(collection(db, "products"));
  console.log(`Found ${snap.docs.length} existing items in database.`);

  // Delete all existing in batches of 400
  const deleteDocs = snap.docs;
  for (let i = 0; i < deleteDocs.length; i += 400) {
    const chunk = deleteDocs.slice(i, i + 400);
    const batch = writeBatch(db);
    for (const d of chunk) {
      batch.delete(d.ref);
    }
    await batch.commit();
    console.log(`Deleted batch of ${chunk.length} old products.`);
  }

  console.log("All old products deleted cleanly.");

  console.log(`2. Now inserting only the ${verifiedCatalog.length} 100% verified catalog products...`);
  
  for (let i = 0; i < verifiedCatalog.length; i += 20) {
    const chunk = verifiedCatalog.slice(i, i + 20);
    const batch = writeBatch(db);
    for (const item of chunk) {
      const docRef = doc(collection(db, "products"));
      batch.set(docRef, {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    await batch.commit();
    console.log(`Inserted verified batch ${Math.floor(i / 20) + 1} (${chunk.length} items).`);
  }

  console.log("✅ FINISHED! The database now strictly contains ONLY your 15-section verified catalog items!");
  process.exit(0);
}

purgeAndSeedCleanDatabase().catch(err => {
  console.error("Error in purgeAndSeed:", err);
  process.exit(1);
});
