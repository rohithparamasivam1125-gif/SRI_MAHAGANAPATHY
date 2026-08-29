import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc, getDocs } from "firebase/firestore";

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

const fullCatalog = [
  // 1. ROTO MOULDED / BLOW MOULDED TANKS
  {
    name: "Leo Plast Roto Mould Water Storage Tank",
    category: "Plumbing",
    subcategory: "Water Tanks",
    brand: "Leo Plast",
    hsnCode: "3925",
    gstRate: 18,
    description: "Roto Moulded Triple Layer Water Storage Tank (White / Yellow / Gold)",
    variants: [
      { size: "500 Ltr (41\" H x 35\" Dia)", price: 2900, mrp: 3500, stock: 20, unit: "Pcs", barcode: "LEO-ROTO-500" },
      { size: "750 Ltr (44\" H x 39\" Dia)", price: 4200, mrp: 5000, stock: 15, unit: "Pcs", barcode: "LEO-ROTO-750" },
      { size: "1000 Ltr (51\" H x 43\" Dia)", price: 5600, mrp: 6800, stock: 15, unit: "Pcs", barcode: "LEO-ROTO-1000" },
      { size: "1500 Ltr (52\" H x 50\" Dia)", price: 8500, mrp: 10200, stock: 10, unit: "Pcs", barcode: "LEO-ROTO-1500" },
      { size: "2000 Ltr (61\" H x 54\" Dia)", price: 11800, mrp: 14000, stock: 5, unit: "Pcs", barcode: "LEO-ROTO-2000" }
    ]
  },
  {
    name: "Leo Plast Blow Mould Water Storage Tank",
    category: "Plumbing",
    subcategory: "Water Tanks",
    brand: "Leo Plast",
    hsnCode: "3925",
    gstRate: 18,
    description: "Blow Moulded Heavy Duty Water Storage Tank (White / Yellow)",
    variants: [
      { size: "500 Ltr (41\" H x 34\" Dia)", price: 2900, mrp: 3500, stock: 20, unit: "Pcs", barcode: "LEO-BLOW-500" },
      { size: "750 Ltr (47\" H x 37\" Dia)", price: 4200, mrp: 5000, stock: 15, unit: "Pcs", barcode: "LEO-BLOW-750" },
      { size: "1000 Ltr (52\" H x 43\" Dia)", price: 5600, mrp: 6800, stock: 15, unit: "Pcs", barcode: "LEO-BLOW-1000" },
      { size: "1500 Ltr (57\" H x 48\" Dia)", price: 8500, mrp: 10200, stock: 10, unit: "Pcs", barcode: "LEO-BLOW-1500" },
      { size: "2000 Ltr (62\" H x 54\" Dia)", price: 11800, mrp: 14000, stock: 5, unit: "Pcs", barcode: "LEO-BLOW-2000" }
    ]
  },
  {
    name: "Leo Plast Water Camper (with Tap)",
    category: "Plumbing",
    subcategory: "Water Tanks",
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
    name: "Leo Plast PVC Elbow ISI Hy",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "ISI Certified Heavy PVC 90° Elbow (IS 7834)",
    variants: [
      { size: "20 mm", price: 6.50, mrp: 9.00, stock: 100, unit: "Pcs", barcode: "LEO-ELB-20" },
      { size: "25 mm", price: 9.80, mrp: 14.00, stock: 100, unit: "Pcs", barcode: "LEO-ELB-25" },
      { size: "32 mm", price: 13.70, mrp: 19.00, stock: 80, unit: "Pcs", barcode: "LEO-ELB-32" },
      { size: "40 mm", price: 20.50, mrp: 28.00, stock: 60, unit: "Pcs", barcode: "LEO-ELB-40" },
      { size: "50 mm", price: 31.80, mrp: 42.00, stock: 50, unit: "Pcs", barcode: "LEO-ELB-50" },
      { size: "63 mm", price: 47.90, mrp: 65.00, stock: 70, unit: "Pcs", barcode: "LEO-ELB-63" },
      { size: "75 mm", price: 70.00, mrp: 95.00, stock: 40, unit: "Pcs", barcode: "LEO-ELB-75" },
      { size: "90 mm", price: 113.00, mrp: 150.00, stock: 20, unit: "Pcs", barcode: "LEO-ELB-90" },
      { size: "110 mm", price: 180.00, mrp: 240.00, stock: 12, unit: "Pcs", barcode: "LEO-ELB-110" }
    ]
  },
  {
    name: "Leo Plast PVC Tee ISI Hy",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "ISI Certified Heavy PVC 3-Way Equal Branch Tee (IS 7834)",
    variants: [
      { size: "20 mm", price: 8.60, mrp: 12.00, stock: 80, unit: "Pcs", barcode: "LEO-TEE-20" },
      { size: "25 mm", price: 13.70, mrp: 18.00, stock: 50, unit: "Pcs", barcode: "LEO-TEE-25" },
      { size: "32 mm", price: 18.00, mrp: 25.00, stock: 30, unit: "Pcs", barcode: "LEO-TEE-32" },
      { size: "40 mm", price: 27.50, mrp: 38.00, stock: 15, unit: "Pcs", barcode: "LEO-TEE-40" },
      { size: "50 mm", price: 46.00, mrp: 62.00, stock: 10, unit: "Pcs", barcode: "LEO-TEE-50" },
      { size: "63 mm", price: 65.00, mrp: 88.00, stock: 40, unit: "Pcs", barcode: "LEO-TEE-63" },
      { size: "75 mm", price: 97.00, mrp: 130.00, stock: 20, unit: "Pcs", barcode: "LEO-TEE-75" },
      { size: "90 mm", price: 156.00, mrp: 210.00, stock: 15, unit: "Pcs", barcode: "LEO-TEE-90" },
      { size: "110 mm", price: 244.00, mrp: 320.00, stock: 8, unit: "Pcs", barcode: "LEO-TEE-110" }
    ]
  },
  {
    name: "Leo Plast PVC Elbow Agri",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Agricultural irrigation PVC 90 degree elbow",
    variants: [
      { size: "63 mm", price: 40.00, mrp: 55.00, stock: 70, unit: "Pcs", barcode: "LEO-ELB-AGRI-63" },
      { size: "75 mm", price: 50.00, mrp: 68.00, stock: 40, unit: "Pcs", barcode: "LEO-ELB-AGRI-75" },
      { size: "90 mm", price: 70.00, mrp: 95.00, stock: 25, unit: "Pcs", barcode: "LEO-ELB-AGRI-90" },
      { size: "110 mm", price: 120.00, mrp: 160.00, stock: 12, unit: "Pcs", barcode: "LEO-ELB-AGRI-110" }
    ]
  },
  {
    name: "Leo Plast PVC Tee Agri",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Agricultural irrigation PVC 3-way tee",
    variants: [
      { size: "63 mm", price: 54.00, mrp: 72.00, stock: 40, unit: "Pcs", barcode: "LEO-TEE-AGRI-63" },
      { size: "75 mm", price: 65.00, mrp: 88.00, stock: 25, unit: "Pcs", barcode: "LEO-TEE-AGRI-75" },
      { size: "90 mm", price: 95.00, mrp: 130.00, stock: 15, unit: "Pcs", barcode: "LEO-TEE-AGRI-90" },
      { size: "110 mm", price: 160.00, mrp: 215.00, stock: 8, unit: "Pcs", barcode: "LEO-TEE-AGRI-110" }
    ]
  },
  {
    name: "Leo Plast PVC Elbow LW (Light Weight)",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Light Weight PVC 90 degree elbow",
    variants: [
      { size: "63 mm", price: 34.20, mrp: 46.00, stock: 70, unit: "Pcs", barcode: "LEO-ELB-LW-63" },
      { size: "75 mm", price: 42.80, mrp: 58.00, stock: 40, unit: "Pcs", barcode: "LEO-ELB-LW-75" },
      { size: "90 mm", price: 64.00, mrp: 86.00, stock: 25, unit: "Pcs", barcode: "LEO-ELB-LW-90" },
      { size: "110 mm", price: 103.00, mrp: 140.00, stock: 12, unit: "Pcs", barcode: "LEO-ELB-LW-110" }
    ]
  },
  {
    name: "Leo Plast PVC Tee LW (Light Weight)",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Light Weight PVC 3-way equal tee",
    variants: [
      { size: "63 mm", price: 46.20, mrp: 62.00, stock: 40, unit: "Pcs", barcode: "LEO-TEE-LW-63" },
      { size: "75 mm", price: 55.60, mrp: 75.00, stock: 25, unit: "Pcs", barcode: "LEO-TEE-LW-75" },
      { size: "90 mm", price: 88.00, mrp: 120.00, stock: 15, unit: "Pcs", barcode: "LEO-TEE-LW-90" },
      { size: "110 mm", price: 135.00, mrp: 180.00, stock: 8, unit: "Pcs", barcode: "LEO-TEE-LW-110" }
    ]
  },
  {
    name: "Leo Plast PVC MTA (Male Threaded Adaptor)",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Male Threaded PVC solvent weld adaptor",
    variants: [
      { size: "20 mm", price: 4.40, mrp: 6.50, stock: 100, unit: "Pcs", barcode: "LEO-MTA-20" },
      { size: "25 mm", price: 5.80, mrp: 8.50, stock: 50, unit: "Pcs", barcode: "LEO-MTA-25" },
      { size: "32 mm", price: 9.00, mrp: 13.00, stock: 50, unit: "Pcs", barcode: "LEO-MTA-32" },
      { size: "40 mm", price: 13.70, mrp: 19.00, stock: 40, unit: "Pcs", barcode: "LEO-MTA-40" },
      { size: "50 mm", price: 21.00, mrp: 29.00, stock: 15, unit: "Pcs", barcode: "LEO-MTA-50" },
      { size: "63 mm", price: 33.00, mrp: 45.00, stock: 120, unit: "Pcs", barcode: "LEO-MTA-63" },
      { size: "75 mm", price: 42.80, mrp: 58.00, stock: 80, unit: "Pcs", barcode: "LEO-MTA-75" },
      { size: "90 mm", price: 66.00, mrp: 90.00, stock: 40, unit: "Pcs", barcode: "LEO-MTA-90" }
    ]
  },
  {
    name: "Leo Plast PVC FTA (Female Threaded Adaptor)",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Female Threaded PVC solvent weld adaptor",
    variants: [
      { size: "20 mm", price: 4.50, mrp: 6.50, stock: 100, unit: "Pcs", barcode: "LEO-FTA-20" },
      { size: "25 mm", price: 6.40, mrp: 9.00, stock: 50, unit: "Pcs", barcode: "LEO-FTA-25" },
      { size: "32 mm", price: 8.60, mrp: 12.00, stock: 50, unit: "Pcs", barcode: "LEO-FTA-32" },
      { size: "40 mm", price: 13.70, mrp: 19.00, stock: 25, unit: "Pcs", barcode: "LEO-FTA-40" },
      { size: "50 mm", price: 23.00, mrp: 32.00, stock: 15, unit: "Pcs", barcode: "LEO-FTA-50" },
      { size: "63 mm", price: 35.00, mrp: 48.00, stock: 100, unit: "Pcs", barcode: "LEO-FTA-63" },
      { size: "75 mm", price: 51.00, mrp: 70.00, stock: 70, unit: "Pcs", barcode: "LEO-FTA-75" },
      { size: "90 mm", price: 80.00, mrp: 110.00, stock: 40, unit: "Pcs", barcode: "LEO-FTA-90" },
      { size: "110 mm", price: 130.00, mrp: 175.00, stock: 20, unit: "Pcs", barcode: "LEO-FTA-110" }
    ]
  },

  // 3. rPVC PLUMBING & IRRIGATION PIPES
  {
    name: "Leo Plast ISI Plumbing Pipes (IS 4985 : 2021)",
    category: "Plumbing",
    subcategory: "Pipes",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Lead-free ISI certified heavy uPVC/rPVC plumbing and pressure pipes (6 Meters)",
    variants: [
      { size: "3/4\" (25mm) Plumbing", price: 411.00, mrp: 550.00, stock: 100, unit: "Pcs", barcode: "LEO-ISI-3/4" },
      { size: "1\" (32mm) Plumbing", price: 612.00, mrp: 820.00, stock: 80, unit: "Pcs", barcode: "LEO-ISI-1" },
      { size: "1 1/4\" (40mm) Plumbing", price: 855.00, mrp: 1150.00, stock: 60, unit: "Pcs", barcode: "LEO-ISI-1-1/4" },
      { size: "1 1/2\" (50mm) Plumbing", price: 1070.00, mrp: 1450.00, stock: 50, unit: "Pcs", barcode: "LEO-ISI-1-1/2" },
      { size: "2\" (63mm) 4 kgf/cm²", price: 620.00, mrp: 830.00, stock: 50, unit: "Pcs", barcode: "LEO-ISI-2-4KG" },
      { size: "2 1/2\" (75mm) 4 kgf/cm²", price: 876.00, mrp: 1170.00, stock: 40, unit: "Pcs", barcode: "LEO-ISI-2-1/2-4KG" },
      { size: "3\" (90mm) 4 kgf/cm²", price: 1240.00, mrp: 1650.00, stock: 35, unit: "Pcs", barcode: "LEO-ISI-3-4KG" },
      { size: "4\" (110mm) 4 kgf/cm²", price: 1710.00, mrp: 2280.00, stock: 25, unit: "Pcs", barcode: "LEO-ISI-4-4KG" }
    ]
  },
  {
    name: "Leo Plast Conduit Electrical Wiring Pipes (3m)",
    category: "Electrical",
    subcategory: "Conduit Pipes",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Rigid PVC Conduit electrical pipes (3 Meters length)",
    variants: [
      { size: "19 mm Silver", price: 63.50, mrp: 85.00, stock: 200, unit: "Pcs", barcode: "LEO-COND-19-SILVER" },
      { size: "20 mm Silver", price: 63.50, mrp: 85.00, stock: 200, unit: "Pcs", barcode: "LEO-COND-20-SILVER" },
      { size: "25 mm Silver", price: 84.60, mrp: 115.00, stock: 150, unit: "Pcs", barcode: "LEO-COND-25-SILVER" },
      { size: "19 mm Gold Heavy", price: 73.50, mrp: 98.00, stock: 200, unit: "Pcs", barcode: "LEO-COND-19-GOLD" },
      { size: "20 mm Gold Heavy", price: 73.50, mrp: 98.00, stock: 200, unit: "Pcs", barcode: "LEO-COND-20-GOLD" },
      { size: "25 mm Gold Heavy", price: 106.00, mrp: 142.00, stock: 150, unit: "Pcs", barcode: "LEO-COND-25-GOLD" },
      { size: "19 mm Platinum Super", price: 84.60, mrp: 115.00, stock: 150, unit: "Pcs", barcode: "LEO-COND-19-PLAT" },
      { size: "20 mm Platinum Super", price: 84.60, mrp: 115.00, stock: 150, unit: "Pcs", barcode: "LEO-COND-20-PLAT" },
      { size: "25 mm Platinum Super", price: 126.50, mrp: 170.00, stock: 120, unit: "Pcs", barcode: "LEO-COND-25-PLAT" }
    ]
  },
  {
    name: "Leo Plast Agri Agricultural Irrigation Pipes (6m)",
    category: "Plumbing",
    subcategory: "Pipes",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Agricultural rPVC pipes with high durability (6 Meters length)",
    variants: [
      { size: "1/2\" (20mm) 15kg", price: 271.00, mrp: 360.00, stock: 50, unit: "Pcs", barcode: "LEO-AGRI-1/2-15K" },
      { size: "3/4\" (25mm) 10kg", price: 185.00, mrp: 250.00, stock: 50, unit: "Pcs", barcode: "LEO-AGRI-3/4-10K" },
      { size: "3/4\" (25mm) 15kg", price: 352.00, mrp: 470.00, stock: 50, unit: "Pcs", barcode: "LEO-AGRI-3/4-15K" },
      { size: "1\" (32mm) 10kg", price: 271.00, mrp: 360.00, stock: 50, unit: "Pcs", barcode: "LEO-AGRI-1-10K" },
      { size: "1\" (32mm) 15kg", price: 488.00, mrp: 650.00, stock: 50, unit: "Pcs", barcode: "LEO-AGRI-1-15K" },
      { size: "1-1/4\" (40mm) 6kg", price: 394.00, mrp: 525.00, stock: 40, unit: "Pcs", barcode: "LEO-AGRI-1.25-6K" },
      { size: "1-1/4\" (40mm) 15kg", price: 684.00, mrp: 910.00, stock: 40, unit: "Pcs", barcode: "LEO-AGRI-1.25-15K" },
      { size: "1-1/2\" (50mm) 6kg", price: 493.00, mrp: 660.00, stock: 40, unit: "Pcs", barcode: "LEO-AGRI-1.5-6K" },
      { size: "1-1/2\" (50mm) 15kg", price: 893.00, mrp: 1190.00, stock: 40, unit: "Pcs", barcode: "LEO-AGRI-1.5-15K" },
      { size: "2\" (63mm) 4kg", price: 548.00, mrp: 730.00, stock: 35, unit: "Pcs", barcode: "LEO-AGRI-2-4K" },
      { size: "2\" (63mm) 6kg", price: 841.00, mrp: 1120.00, stock: 35, unit: "Pcs", barcode: "LEO-AGRI-2-6K" },
      { size: "2-1/2\" (75mm) 4kg", price: 800.00, mrp: 1070.00, stock: 30, unit: "Pcs", barcode: "LEO-AGRI-2.5-4K" },
      { size: "2-1/2\" (75mm) 6kg", price: 1035.00, mrp: 1380.00, stock: 30, unit: "Pcs", barcode: "LEO-AGRI-2.5-6K" },
      { size: "3\" (90mm) 4kg", price: 1035.00, mrp: 1380.00, stock: 25, unit: "Pcs", barcode: "LEO-AGRI-3-4K" },
      { size: "3\" (90mm) 6kg", price: 1368.00, mrp: 1820.00, stock: 25, unit: "Pcs", barcode: "LEO-AGRI-3-6K" },
      { size: "4\" (110mm) 4kg", price: 1368.00, mrp: 1820.00, stock: 20, unit: "Pcs", barcode: "LEO-AGRI-4-4K" },
      { size: "4\" (110mm) 6kg", price: 1755.00, mrp: 2340.00, stock: 20, unit: "Pcs", barcode: "LEO-AGRI-4-6K" },
      { size: "5\" (140mm) 4kg", price: 2051.00, mrp: 2735.00, stock: 15, unit: "Pcs", barcode: "LEO-AGRI-5-4K" },
      { size: "5\" (140mm) 6kg", price: 2955.00, mrp: 3940.00, stock: 15, unit: "Pcs", barcode: "LEO-AGRI-5-6K" },
      { size: "6\" (160mm) 4kg", price: 2740.00, mrp: 3650.00, stock: 10, unit: "Pcs", barcode: "LEO-AGRI-6-4K" },
      { size: "6\" (160mm) 6kg", price: 3907.00, mrp: 5200.00, stock: 10, unit: "Pcs", barcode: "LEO-AGRI-6-6K" },
      { size: "7\" (180mm) 6kg", price: 4875.00, mrp: 6500.00, stock: 8, unit: "Pcs", barcode: "LEO-AGRI-7-6K" },
      { size: "8\" (200mm) 6kg", price: 5910.00, mrp: 7880.00, stock: 5, unit: "Pcs", barcode: "LEO-AGRI-8-6K" }
    ]
  },

  // 4. PVC FITTINGS (End Cap, Reducer, Reducing Bush, Thread End Cap, Coupler)
  {
    name: "Leo Plast PVC End Cap (Plain)",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Plain solvent weld PVC pipe end cap",
    variants: [
      { size: "25 mm", price: 4.70, mrp: 7.00, stock: 50, unit: "Pcs", barcode: "LEO-CAP-25" },
      { size: "32 mm", price: 6.50, mrp: 9.00, stock: 50, unit: "Pcs", barcode: "LEO-CAP-32" },
      { size: "40 mm", price: 11.00, mrp: 15.00, stock: 40, unit: "Pcs", barcode: "LEO-CAP-40" },
      { size: "50 mm", price: 15.40, mrp: 21.00, stock: 15, unit: "Pcs", barcode: "LEO-CAP-50" },
      { size: "63 mm", price: 24.00, mrp: 33.00, stock: 180, unit: "Pcs", barcode: "LEO-CAP-63" },
      { size: "75 mm", price: 32.00, mrp: 44.00, stock: 120, unit: "Pcs", barcode: "LEO-CAP-75" },
      { size: "90 mm", price: 47.00, mrp: 64.00, stock: 75, unit: "Pcs", barcode: "LEO-CAP-90" },
      { size: "110 mm", price: 64.00, mrp: 88.00, stock: 40, unit: "Pcs", barcode: "LEO-CAP-110" },
      { size: "140 mm", price: 106.00, mrp: 145.00, stock: 25, unit: "Pcs", barcode: "LEO-CAP-140" },
      { size: "160 mm", price: 180.00, mrp: 240.00, stock: 12, unit: "Pcs", barcode: "LEO-CAP-160" },
      { size: "180 mm", price: 240.00, mrp: 320.00, stock: 12, unit: "Pcs", barcode: "LEO-CAP-180" }
    ]
  },
  {
    name: "Leo Plast PVC Reducer",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "PVC pipe reducer fitting",
    variants: [
      { size: "32x25 mm", price: 8.50, mrp: 12.00, stock: 50, unit: "Pcs", barcode: "LEO-RED-32-25" },
      { size: "40x32 mm", price: 13.70, mrp: 18.00, stock: 30, unit: "Pcs", barcode: "LEO-RED-40-32" },
      { size: "50x40 mm", price: 19.70, mrp: 27.00, stock: 20, unit: "Pcs", barcode: "LEO-RED-50-40" },
      { size: "63x32 mm", price: 29.00, mrp: 40.00, stock: 140, unit: "Pcs", barcode: "LEO-RED-63-32" },
      { size: "63x40 mm", price: 29.00, mrp: 40.00, stock: 120, unit: "Pcs", barcode: "LEO-RED-63-40" },
      { size: "63x50 mm", price: 31.70, mrp: 43.00, stock: 120, unit: "Pcs", barcode: "LEO-RED-63-50" },
      { size: "75x50 mm", price: 37.60, mrp: 51.00, stock: 80, unit: "Pcs", barcode: "LEO-RED-75-50" },
      { size: "75x63 mm", price: 42.70, mrp: 58.00, stock: 70, unit: "Pcs", barcode: "LEO-RED-75-63" },
      { size: "90x50 mm", price: 52.20, mrp: 70.00, stock: 50, unit: "Pcs", barcode: "LEO-RED-90-50" },
      { size: "90x63 mm", price: 54.70, mrp: 74.00, stock: 50, unit: "Pcs", barcode: "LEO-RED-90-63" },
      { size: "90x75 mm", price: 56.40, mrp: 76.00, stock: 40, unit: "Pcs", barcode: "LEO-RED-90-75" },
      { size: "110x63 mm", price: 82.00, mrp: 110.00, stock: 30, unit: "Pcs", barcode: "LEO-RED-110-63" },
      { size: "110x75 mm", price: 82.00, mrp: 110.00, stock: 30, unit: "Pcs", barcode: "LEO-RED-110-75" },
      { size: "110x90 mm", price: 92.00, mrp: 125.00, stock: 30, unit: "Pcs", barcode: "LEO-RED-110-90" }
    ]
  },
  {
    name: "Leo Plast PVC Reducing Bush",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "PVC pipe reducing bush fitting",
    variants: [
      { size: "32x25 mm", price: 5.20, mrp: 7.50, stock: 50, unit: "Pcs", barcode: "LEO-BUSH-32-25" },
      { size: "40x32 mm", price: 7.70, mrp: 11.00, stock: 30, unit: "Pcs", barcode: "LEO-BUSH-40-32" },
      { size: "50x40 mm", price: 14.60, mrp: 20.00, stock: 25, unit: "Pcs", barcode: "LEO-BUSH-50-40" },
      { size: "50x32 mm", price: 17.00, mrp: 23.00, stock: 20, unit: "Pcs", barcode: "LEO-BUSH-50-32" },
      { size: "63x50 mm", price: 25.00, mrp: 34.00, stock: 200, unit: "Pcs", barcode: "LEO-BUSH-63-50" },
      { size: "63x40 mm", price: 25.00, mrp: 34.00, stock: 200, unit: "Pcs", barcode: "LEO-BUSH-63-40" },
      { size: "63x32 mm", price: 27.40, mrp: 37.00, stock: 175, unit: "Pcs", barcode: "LEO-BUSH-63-32" },
      { size: "75x63 mm", price: 33.40, mrp: 45.00, stock: 150, unit: "Pcs", barcode: "LEO-BUSH-75-63" },
      { size: "75x50 mm", price: 36.80, mrp: 50.00, stock: 150, unit: "Pcs", barcode: "LEO-BUSH-75-50" },
      { size: "90x75 mm", price: 51.30, mrp: 70.00, stock: 80, unit: "Pcs", barcode: "LEO-BUSH-90-75" },
      { size: "90x63 mm", price: 55.60, mrp: 75.00, stock: 80, unit: "Pcs", barcode: "LEO-BUSH-90-63" },
      { size: "110x90 mm", price: 85.50, mrp: 115.00, stock: 50, unit: "Pcs", barcode: "LEO-BUSH-110-90" },
      { size: "110x75 mm", price: 85.50, mrp: 115.00, stock: 50, unit: "Pcs", barcode: "LEO-BUSH-110-75" },
      { size: "110x63 mm", price: 85.50, mrp: 115.00, stock: 50, unit: "Pcs", barcode: "LEO-BUSH-110-63" }
    ]
  },
  {
    name: "Leo Plast PVC Thread End Cap",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Threaded PVC pipe end cap",
    variants: [
      { size: "25 mm", price: 6.50, mrp: 9.00, stock: 50, unit: "Pcs", barcode: "LEO-THRCAP-25" },
      { size: "32 mm", price: 9.40, mrp: 13.00, stock: 50, unit: "Pcs", barcode: "LEO-THRCAP-32" },
      { size: "40 mm", price: 13.70, mrp: 19.00, stock: 40, unit: "Pcs", barcode: "LEO-THRCAP-40" },
      { size: "50 mm", price: 20.00, mrp: 28.00, stock: 15, unit: "Pcs", barcode: "LEO-THRCAP-50" },
      { size: "63 mm", price: 31.00, mrp: 42.00, stock: 180, unit: "Pcs", barcode: "LEO-THRCAP-63" },
      { size: "75 mm", price: 38.00, mrp: 52.00, stock: 120, unit: "Pcs", barcode: "LEO-THRCAP-75" },
      { size: "90 mm", price: 55.00, mrp: 75.00, stock: 75, unit: "Pcs", barcode: "LEO-THRCAP-90" }
    ]
  },
  {
    name: "Leo Plast PVC Coupler",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Straight PVC solvent weld pipe coupler",
    variants: [
      { size: "25 mm", price: 6.00, mrp: 8.50, stock: 50, unit: "Pcs", barcode: "LEO-COUPLER-25" },
      { size: "32 mm", price: 8.60, mrp: 12.00, stock: 50, unit: "Pcs", barcode: "LEO-COUPLER-32" },
      { size: "40 mm", price: 12.00, mrp: 16.50, stock: 30, unit: "Pcs", barcode: "LEO-COUPLER-40" },
      { size: "50 mm", price: 18.80, mrp: 26.00, stock: 20, unit: "Pcs", barcode: "LEO-COUPLER-50" },
      { size: "63 mm", price: 29.00, mrp: 40.00, stock: 100, unit: "Pcs", barcode: "LEO-COUPLER-63" },
      { size: "75 mm", price: 39.80, mrp: 54.00, stock: 60, unit: "Pcs", barcode: "LEO-COUPLER-75" },
      { size: "90 mm", price: 62.00, mrp: 84.00, stock: 40, unit: "Pcs", barcode: "LEO-COUPLER-90" },
      { size: "110 mm", price: 100.00, mrp: 135.00, stock: 22, unit: "Pcs", barcode: "LEO-COUPLER-110" }
    ]
  },

  // 5. PVC / SWR PVC FITTINGS
  {
    name: "Leo Plast PVC Brass Elbow",
    category: "Plumbing",
    subcategory: "PVC Brass Fittings",
    brand: "Leo Plast",
    hsnCode: "7412",
    gstRate: 18,
    description: "PVC 90° Elbow with heavy Brass Threaded Insert",
    variants: [
      { size: "3/4\" x 1/2\"", price: 62.40, mrp: 85.00, stock: 30, unit: "Pcs", barcode: "LEO-BR-ELB-3412" },
      { size: "1\" x 1/2\"", price: 64.10, mrp: 88.00, stock: 30, unit: "Pcs", barcode: "LEO-BR-ELB-112" },
      { size: "1\" x 3/4\"", price: 94.00, mrp: 128.00, stock: 25, unit: "Pcs", barcode: "LEO-BR-ELB-134" }
    ]
  },
  {
    name: "Leo Plast PVC Brass FTA",
    category: "Plumbing",
    subcategory: "PVC Brass Fittings",
    brand: "Leo Plast",
    hsnCode: "7412",
    gstRate: 18,
    description: "PVC Female Threaded Adaptor with Brass Insert",
    variants: [
      { size: "3/4\" x 1/2\"", price: 59.90, mrp: 82.00, stock: 30, unit: "Pcs", barcode: "LEO-BR-FTA-3412" },
      { size: "1\" x 1/2\"", price: 64.10, mrp: 88.00, stock: 30, unit: "Pcs", barcode: "LEO-BR-FTA-112" },
      { size: "1\" x 3/4\"", price: 74.40, mrp: 102.00, stock: 25, unit: "Pcs", barcode: "LEO-BR-FTA-134" }
    ]
  },
  {
    name: "Leo Plast PVC Brass Tee",
    category: "Plumbing",
    subcategory: "PVC Brass Fittings",
    brand: "Leo Plast",
    hsnCode: "7412",
    gstRate: 18,
    description: "PVC 3-Way Tee with heavy Brass Threaded Insert",
    variants: [
      { size: "3/4\" x 1/2\"", price: 64.00, mrp: 88.00, stock: 30, unit: "Pcs", barcode: "LEO-BR-TEE-3412" },
      { size: "1\" x 1/2\"", price: 71.80, mrp: 98.00, stock: 25, unit: "Pcs", barcode: "LEO-BR-TEE-112" },
      { size: "1\" x 3/4\"", price: 102.60, mrp: 140.00, stock: 20, unit: "Pcs", barcode: "LEO-BR-TEE-134" }
    ]
  },
  {
    name: "Leo Plast PVC Union",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "PVC 3-piece pipe union for quick disconnection",
    variants: [
      { size: "25 mm", price: 34.50, mrp: 48.00, stock: 25, unit: "Pcs", barcode: "LEO-UNION-25" },
      { size: "32 mm", price: 39.80, mrp: 55.00, stock: 20, unit: "Pcs", barcode: "LEO-UNION-32" },
      { size: "40 mm", price: 56.20, mrp: 78.00, stock: 15, unit: "Pcs", barcode: "LEO-UNION-40" },
      { size: "50 mm", price: 87.50, mrp: 120.00, stock: 10, unit: "Pcs", barcode: "LEO-UNION-50" }
    ]
  },
  {
    name: "Leo Plast PVC Elbow 45°",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "PVC 45 degree directional elbow",
    variants: [
      { size: "25 mm", price: 10.50, mrp: 15.00, stock: 50, unit: "Pcs", barcode: "LEO-ELB45-25" },
      { size: "32 mm", price: 15.50, mrp: 22.00, stock: 30, unit: "Pcs", barcode: "LEO-ELB45-32" },
      { size: "40 mm", price: 18.80, mrp: 26.00, stock: 30, unit: "Pcs", barcode: "LEO-ELB45-40" },
      { size: "50 mm", price: 29.00, mrp: 40.00, stock: 15, unit: "Pcs", barcode: "LEO-ELB45-50" }
    ]
  },
  {
    name: "Leo Plast SWR PVC Single Elbow",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "SWR Drainage PVC Single 87.5° bend",
    variants: [
      { size: "75 mm", price: 73.00, mrp: 98.00, stock: 84, unit: "Pcs", barcode: "LEO-SWR-ELB-75" },
      { size: "110 mm", price: 137.00, mrp: 185.00, stock: 42, unit: "Pcs", barcode: "LEO-SWR-ELB-110" }
    ]
  },
  {
    name: "Leo Plast SWR PVC Single Tee",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "SWR Drainage PVC Single branch tee",
    variants: [
      { size: "75 mm", price: 94.00, mrp: 128.00, stock: 72, unit: "Pcs", barcode: "LEO-SWR-TEE-75" },
      { size: "110 mm", price: 184.00, mrp: 248.00, stock: 26, unit: "Pcs", barcode: "LEO-SWR-TEE-110" }
    ]
  },
  {
    name: "Leo Plast SWR PVC Single Door Elbow",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "SWR Drainage PVC Elbow with inspection door",
    variants: [
      { size: "75 mm", price: 90.00, mrp: 122.00, stock: 72, unit: "Pcs", barcode: "LEO-SWR-DELB-75" },
      { size: "110 mm", price: 163.00, mrp: 220.00, stock: 35, unit: "Pcs", barcode: "LEO-SWR-DELB-110" }
    ]
  },
  {
    name: "Leo Plast SWR PVC Single Door Tee",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "SWR Drainage PVC Tee with inspection door",
    variants: [
      { size: "75 mm", price: 120.00, mrp: 165.00, stock: 45, unit: "Pcs", barcode: "LEO-SWR-DTEE-75" },
      { size: "110 mm", price: 223.00, mrp: 300.00, stock: 24, unit: "Pcs", barcode: "LEO-SWR-DTEE-110" }
    ]
  },

  // 6. SWR PVC FITTINGS (Door Elbow, Door Tee, Traps, Vent Cowl, Single Y, Saddle)
  {
    name: "Leo Plast SWR Door Elbow",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "SWR Drainage Door Elbow (63mm to 110mm)",
    variants: [
      { size: "63 mm", price: 54.70, mrp: 75.00, stock: 60, unit: "Pcs", barcode: "LEO-SWR-DE-63" },
      { size: "75 mm", price: 76.90, mrp: 105.00, stock: 30, unit: "Pcs", barcode: "LEO-SWR-DE-75" },
      { size: "90 mm", price: 106.90, mrp: 145.00, stock: 20, unit: "Pcs", barcode: "LEO-SWR-DE-90" },
      { size: "110 mm", price: 156.95, mrp: 210.00, stock: 11, unit: "Pcs", barcode: "LEO-SWR-DE-110" }
    ]
  },
  {
    name: "Leo Plast SWR Door Tee",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "SWR Drainage Door Tee (63mm to 110mm)",
    variants: [
      { size: "63 mm", price: 70.20, mrp: 95.00, stock: 40, unit: "Pcs", barcode: "LEO-SWR-DT-63" },
      { size: "75 mm", price: 97.50, mrp: 132.00, stock: 20, unit: "Pcs", barcode: "LEO-SWR-DT-75" },
      { size: "90 mm", price: 145.30, mrp: 198.00, stock: 15, unit: "Pcs", barcode: "LEO-SWR-DT-90" },
      { size: "110 mm", price: 196.60, mrp: 265.00, stock: 8, unit: "Pcs", barcode: "LEO-SWR-DT-110" }
    ]
  },
  {
    name: "Leo Plast SWR Nahani Trap with Jali",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3922",
    gstRate: 18,
    description: "PVC Nahani floor trap with stainless strainer jali",
    variants: [
      { size: "110 x 63 mm", price: 130.00, mrp: 175.00, stock: 16, unit: "Pcs", barcode: "LEO-NAHANI-110-63" },
      { size: "110 x 75 mm", price: 130.00, mrp: 175.00, stock: 16, unit: "Pcs", barcode: "LEO-NAHANI-110-75" }
    ]
  },
  {
    name: "Leo Plast SWR Multi Floor Trap with Jali",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3922",
    gstRate: 18,
    description: "Multi inlet floor trap with jali",
    variants: [
      { size: "110 x 75 mm", price: 177.50, mrp: 240.00, stock: 15, unit: "Pcs", barcode: "LEO-MULTITRAP-110" }
    ]
  },
  {
    name: "Leo Plast SWR Vent Cowl",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Ventilation top cowl mushroom cap",
    variants: [
      { size: "63 mm", price: 12.90, mrp: 18.00, stock: 150, unit: "Pcs", barcode: "LEO-COWL-63" },
      { size: "75 mm", price: 17.00, mrp: 24.00, stock: 120, unit: "Pcs", barcode: "LEO-COWL-75" },
      { size: "90 mm", price: 25.70, mrp: 35.00, stock: 90, unit: "Pcs", barcode: "LEO-COWL-90" },
      { size: "110 mm", price: 34.20, mrp: 48.00, stock: 40, unit: "Pcs", barcode: "LEO-COWL-110" }
    ]
  },
  {
    name: "Leo Plast SWR Single Y Junction",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "45 degree Y branch junction",
    variants: [
      { size: "63 mm", price: 93.20, mrp: 128.00, stock: 25, unit: "Pcs", barcode: "LEO-Y-63" },
      { size: "75 mm", price: 112.00, mrp: 155.00, stock: 20, unit: "Pcs", barcode: "LEO-Y-75" },
      { size: "90 mm", price: 180.00, mrp: 245.00, stock: 11, unit: "Pcs", barcode: "LEO-Y-90" },
      { size: "110 mm", price: 218.00, mrp: 295.00, stock: 6, unit: "Pcs", barcode: "LEO-Y-110" }
    ]
  },
  {
    name: "Leo Plast PVC Service Saddle",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Branch tapping service saddle clamp",
    variants: [
      { size: "63 x 20 mm", price: 90.00, mrp: 125.00, stock: 70, unit: "Pcs", barcode: "LEO-SADDLE-63-20" },
      { size: "63 x 25 mm", price: 90.00, mrp: 125.00, stock: 70, unit: "Pcs", barcode: "LEO-SADDLE-63-25" },
      { size: "63 x 32 mm", price: 90.00, mrp: 125.00, stock: 70, unit: "Pcs", barcode: "LEO-SADDLE-63-32" },
      { size: "75 x 20 mm", price: 108.00, mrp: 148.00, stock: 60, unit: "Pcs", barcode: "LEO-SADDLE-75-20" },
      { size: "75 x 25 mm", price: 108.00, mrp: 148.00, stock: 60, unit: "Pcs", barcode: "LEO-SADDLE-75-25" },
      { size: "75 x 32 mm", price: 108.00, mrp: 148.00, stock: 60, unit: "Pcs", barcode: "LEO-SADDLE-75-32" },
      { size: "90 x 20 mm", price: 125.00, mrp: 170.00, stock: 50, unit: "Pcs", barcode: "LEO-SADDLE-90-20" },
      { size: "90 x 25 mm", price: 125.00, mrp: 170.00, stock: 50, unit: "Pcs", barcode: "LEO-SADDLE-90-25" },
      { size: "90 x 32 mm", price: 125.00, mrp: 170.00, stock: 50, unit: "Pcs", barcode: "LEO-SADDLE-90-32" },
      { size: "110 x 20 mm", price: 157.00, mrp: 215.00, stock: 40, unit: "Pcs", barcode: "LEO-SADDLE-110-20" },
      { size: "110 x 25 mm", price: 157.00, mrp: 215.00, stock: 40, unit: "Pcs", barcode: "LEO-SADDLE-110-25" },
      { size: "110 x 32 mm", price: 157.00, mrp: 215.00, stock: 40, unit: "Pcs", barcode: "LEO-SADDLE-110-32" }
    ]
  },
  {
    name: "Leo Plast SWR Elbow 45°",
    category: "Plumbing",
    subcategory: "SWR Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "SWR Drainage 45 degree elbow",
    variants: [
      { size: "63 mm", price: 38.00, mrp: 52.00, stock: 90, unit: "Pcs", barcode: "LEO-SWR-45-63" },
      { size: "75 mm", price: 56.40, mrp: 78.00, stock: 50, unit: "Pcs", barcode: "LEO-SWR-45-75" },
      { size: "90 mm", price: 94.00, mrp: 128.00, stock: 25, unit: "Pcs", barcode: "LEO-SWR-45-90" },
      { size: "110 mm", price: 110.00, mrp: 150.00, stock: 16, unit: "Pcs", barcode: "LEO-SWR-45-110" }
    ]
  },

  // 7. cPVC PLUMBING SYSTEMS (Pipes & Fittings)
  {
    name: "Leo Plast cPVC Pipes (SDR 11 & SDR 13.5)",
    category: "Plumbing",
    subcategory: "CPVC Pipes",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Chlorinated Polyvinyl Chloride Hot & Cold water pipes",
    variants: [
      { size: "3/4\" SDR 11 (3m)", price: 375.00, mrp: 500.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-34-11-3M" },
      { size: "3/4\" SDR 11 (5m)", price: 625.00, mrp: 830.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-34-11-5M" },
      { size: "1\" SDR 11 (3m)", price: 600.00, mrp: 800.00, stock: 40, unit: "Pcs", barcode: "LEO-CPVC-1-11-3M" },
      { size: "1\" SDR 11 (5m)", price: 1000.00, mrp: 1330.00, stock: 40, unit: "Pcs", barcode: "LEO-CPVC-1-11-5M" },
      { size: "1-1/4\" SDR 11 (3m)", price: 900.00, mrp: 1200.00, stock: 30, unit: "Pcs", barcode: "LEO-CPVC-1.25-11-3M" },
      { size: "1-1/4\" SDR 11 (5m)", price: 1500.00, mrp: 2000.00, stock: 30, unit: "Pcs", barcode: "LEO-CPVC-1.25-11-5M" },
      { size: "1-1/2\" SDR 11 (3m)", price: 1251.00, mrp: 1670.00, stock: 20, unit: "Pcs", barcode: "LEO-CPVC-1.5-11-3M" },
      { size: "1-1/2\" SDR 11 (5m)", price: 2085.00, mrp: 2780.00, stock: 20, unit: "Pcs", barcode: "LEO-CPVC-1.5-11-5M" },
      { size: "3/4\" SDR 13.5 (3m)", price: 330.00, mrp: 440.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-34-135-3M" },
      { size: "3/4\" SDR 13.5 (5m)", price: 550.00, mrp: 735.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-34-135-5M" },
      { size: "1\" SDR 13.5 (3m)", price: 510.00, mrp: 680.00, stock: 40, unit: "Pcs", barcode: "LEO-CPVC-1-135-3M" },
      { size: "1\" SDR 13.5 (5m)", price: 850.00, mrp: 1130.00, stock: 40, unit: "Pcs", barcode: "LEO-CPVC-1-135-5M" },
      { size: "1-1/4\" SDR 13.5 (3m)", price: 774.00, mrp: 1030.00, stock: 30, unit: "Pcs", barcode: "LEO-CPVC-1.25-135-3M" },
      { size: "1-1/4\" SDR 13.5 (5m)", price: 1290.00, mrp: 1720.00, stock: 30, unit: "Pcs", barcode: "LEO-CPVC-1.25-135-5M" },
      { size: "1-1/2\" SDR 13.5 (3m)", price: 1089.00, mrp: 1450.00, stock: 20, unit: "Pcs", barcode: "LEO-CPVC-1.5-135-3M" },
      { size: "1-1/2\" SDR 13.5 (5m)", price: 1815.00, mrp: 2420.00, stock: 20, unit: "Pcs", barcode: "LEO-CPVC-1.5-135-5M" }
    ]
  },
  {
    name: "Leo Plast cPVC Elbow 90°",
    category: "Plumbing",
    subcategory: "CPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "cPVC 90° solvent weld elbow",
    variants: [
      { size: "3/4\"", price: 18.00, mrp: 25.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-ELB-34" },
      { size: "1\"", price: 35.00, mrp: 48.00, stock: 30, unit: "Pcs", barcode: "LEO-CPVC-ELB-1" },
      { size: "1-1/4\"", price: 75.00, mrp: 102.00, stock: 15, unit: "Pcs", barcode: "LEO-CPVC-ELB-1.25" },
      { size: "1-1/2\"", price: 140.00, mrp: 190.00, stock: 10, unit: "Pcs", barcode: "LEO-CPVC-ELB-1.5" }
    ]
  },
  {
    name: "Leo Plast cPVC Tee",
    category: "Plumbing",
    subcategory: "CPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "cPVC equal 3-way branch tee",
    variants: [
      { size: "3/4\"", price: 30.00, mrp: 42.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-TEE-34" },
      { size: "1\"", price: 50.00, mrp: 68.00, stock: 20, unit: "Pcs", barcode: "LEO-CPVC-TEE-1" },
      { size: "1-1/4\"", price: 90.00, mrp: 122.00, stock: 10, unit: "Pcs", barcode: "LEO-CPVC-TEE-1.25" },
      { size: "1-1/2\"", price: 180.00, mrp: 245.00, stock: 5, unit: "Pcs", barcode: "LEO-CPVC-TEE-1.5" }
    ]
  },
  {
    name: "Leo Plast cPVC Coupler",
    category: "Plumbing",
    subcategory: "CPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "cPVC straight socket coupler",
    variants: [
      { size: "3/4\"", price: 14.00, mrp: 20.00, stock: 100, unit: "Pcs", barcode: "LEO-CPVC-COUP-34" },
      { size: "1\"", price: 25.00, mrp: 35.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-COUP-1" },
      { size: "1-1/4\"", price: 42.00, mrp: 58.00, stock: 20, unit: "Pcs", barcode: "LEO-CPVC-COUP-1.25" },
      { size: "1-1/2\"", price: 75.00, mrp: 102.00, stock: 15, unit: "Pcs", barcode: "LEO-CPVC-COUP-1.5" }
    ]
  },
  {
    name: "Leo Plast cPVC End Cap",
    category: "Plumbing",
    subcategory: "CPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "cPVC pipe end cap",
    variants: [
      { size: "3/4\"", price: 11.00, mrp: 15.00, stock: 100, unit: "Pcs", barcode: "LEO-CPVC-CAP-34" },
      { size: "1\"", price: 18.00, mrp: 25.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-CAP-1" },
      { size: "1-1/4\"", price: 31.80, mrp: 43.00, stock: 30, unit: "Pcs", barcode: "LEO-CPVC-CAP-1.25" },
      { size: "1-1/2\"", price: 47.30, mrp: 64.00, stock: 20, unit: "Pcs", barcode: "LEO-CPVC-CAP-1.5" }
    ]
  },
  {
    name: "Leo Plast cPVC FTA & MTA",
    category: "Plumbing",
    subcategory: "CPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "cPVC plastic threaded adaptors",
    variants: [
      { size: "3/4\" FTA", price: 25.00, mrp: 35.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-FTA-34" },
      { size: "1\" FTA", price: 40.00, mrp: 55.00, stock: 30, unit: "Pcs", barcode: "LEO-CPVC-FTA-1" },
      { size: "1-1/4\" FTA", price: 70.00, mrp: 95.00, stock: 15, unit: "Pcs", barcode: "LEO-CPVC-FTA-1.25" },
      { size: "1-1/2\" FTA", price: 120.00, mrp: 165.00, stock: 10, unit: "Pcs", barcode: "LEO-CPVC-FTA-1.5" },
      { size: "3/4\" MTA", price: 16.40, mrp: 23.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-MTA-34" },
      { size: "1\" MTA", price: 32.00, mrp: 44.00, stock: 50, unit: "Pcs", barcode: "LEO-CPVC-MTA-1" },
      { size: "1-1/4\" MTA", price: 50.00, mrp: 68.00, stock: 20, unit: "Pcs", barcode: "LEO-CPVC-MTA-1.25" },
      { size: "1-1/2\" MTA", price: 72.00, mrp: 98.00, stock: 15, unit: "Pcs", barcode: "LEO-CPVC-MTA-1.5" }
    ]
  },

  // 8. uPVC ASTM PLUMBING SYSTEMS (Pipes & Fittings)
  {
    name: "Leo Plast uPVC Pipes (ASTM D 1785 SCH-40 Lead Free - 6m)",
    category: "Plumbing",
    subcategory: "UPVC Pipes",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "uPVC Schedule 40 lead free high pressure pipes",
    variants: [
      { size: "3/4\" (20mm) SCH-40", price: 470.00, mrp: 625.00, stock: 50, unit: "Pcs", barcode: "LEO-UPVC-SCH-34" },
      { size: "1\" (25mm) SCH-40", price: 700.00, mrp: 935.00, stock: 40, unit: "Pcs", barcode: "LEO-UPVC-SCH-1" },
      { size: "1-1/4\" (32mm) SCH-40", price: 940.00, mrp: 1250.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-SCH-1.25" },
      { size: "1-1/2\" (40mm) SCH-40", price: 1170.00, mrp: 1560.00, stock: 20, unit: "Pcs", barcode: "LEO-UPVC-SCH-1.5" },
      { size: "3/4\" (20mm) Plumbing", price: 400.00, mrp: 535.00, stock: 50, unit: "Pcs", barcode: "LEO-UPVC-PLM-34" },
      { size: "1\" (25mm) Plumbing", price: 585.00, mrp: 780.00, stock: 40, unit: "Pcs", barcode: "LEO-UPVC-PLM-1" },
      { size: "1-1/4\" (32mm) Plumbing", price: 775.00, mrp: 1030.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-PLM-1.25" },
      { size: "1-1/2\" (40mm) Plumbing", price: 995.00, mrp: 1325.00, stock: 20, unit: "Pcs", barcode: "LEO-UPVC-PLM-1.5" }
    ]
  },
  {
    name: "Leo Plast uPVC Fittings (Elbow, Tee, Coupler, Cap, MTA, FTA)",
    category: "Plumbing",
    subcategory: "UPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "uPVC Schedule 40 plumbing fittings",
    variants: [
      { size: "3/4\" Elbow 90°", price: 16.50, mrp: 23.00, stock: 40, unit: "Pcs", barcode: "LEO-UPVC-ELB-34" },
      { size: "1\" Elbow 90°", price: 26.60, mrp: 36.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-ELB-1" },
      { size: "1-1/4\" Elbow 90°", price: 40.50, mrp: 55.00, stock: 15, unit: "Pcs", barcode: "LEO-UPVC-ELB-1.25" },
      { size: "1-1/2\" Elbow 90°", price: 56.00, mrp: 76.00, stock: 10, unit: "Pcs", barcode: "LEO-UPVC-ELB-1.5" },
      { size: "3/4\" Tee", price: 21.60, mrp: 29.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-TEE-34" },
      { size: "1\" Tee", price: 34.30, mrp: 46.00, stock: 20, unit: "Pcs", barcode: "LEO-UPVC-TEE-1" },
      { size: "1-1/4\" Tee", price: 54.00, mrp: 73.00, stock: 12, unit: "Pcs", barcode: "LEO-UPVC-TEE-1.25" },
      { size: "1-1/2\" Tee", price: 76.90, mrp: 104.00, stock: 6, unit: "Pcs", barcode: "LEO-UPVC-TEE-1.5" },
      { size: "3/4\" Coupler", price: 11.70, mrp: 16.00, stock: 50, unit: "Pcs", barcode: "LEO-UPVC-COUP-34" },
      { size: "1\" Coupler", price: 18.20, mrp: 25.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-COUP-1" },
      { size: "1-1/4\" Coupler", price: 25.70, mrp: 35.00, stock: 15, unit: "Pcs", barcode: "LEO-UPVC-COUP-1.25" },
      { size: "1-1/2\" Coupler", price: 35.90, mrp: 48.00, stock: 10, unit: "Pcs", barcode: "LEO-UPVC-COUP-1.5" },
      { size: "3/4\" End Cap", price: 7.60, mrp: 10.50, stock: 50, unit: "Pcs", barcode: "LEO-UPVC-CAP-34" },
      { size: "1\" End Cap", price: 12.80, mrp: 17.50, stock: 50, unit: "Pcs", barcode: "LEO-UPVC-CAP-1" },
      { size: "1-1/4\" End Cap", price: 19.70, mrp: 27.00, stock: 20, unit: "Pcs", barcode: "LEO-UPVC-CAP-1.25" },
      { size: "1-1/2\" End Cap", price: 26.50, mrp: 36.00, stock: 10, unit: "Pcs", barcode: "LEO-UPVC-CAP-1.5" },
      { size: "3/4\" MTA", price: 8.90, mrp: 12.00, stock: 60, unit: "Pcs", barcode: "LEO-UPVC-MTA-34" },
      { size: "1\" MTA", price: 15.00, mrp: 20.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-MTA-1" },
      { size: "1-1/4\" MTA", price: 22.00, mrp: 30.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-MTA-1.25" },
      { size: "1-1/2\" MTA", price: 30.00, mrp: 40.00, stock: 15, unit: "Pcs", barcode: "LEO-UPVC-MTA-1.5" },
      { size: "3/4\" FTA", price: 11.20, mrp: 15.00, stock: 60, unit: "Pcs", barcode: "LEO-UPVC-FTA-34" },
      { size: "1\" FTA", price: 18.00, mrp: 24.50, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-FTA-1" },
      { size: "1-1/4\" FTA", price: 26.50, mrp: 36.00, stock: 20, unit: "Pcs", barcode: "LEO-UPVC-FTA-1.25" },
      { size: "1-1/2\" FTA", price: 34.20, mrp: 46.50, stock: 15, unit: "Pcs", barcode: "LEO-UPVC-FTA-1.5" }
    ]
  },

  // 9. uPVC ASTM PLUMBING SYSTEMS – FITTINGS (Tank Nipple, Union, Brass, Reducers)
  {
    name: "Leo Plast uPVC Tank Nipple",
    category: "Plumbing",
    subcategory: "UPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Heavy threaded uPVC water tank outlet nipple",
    variants: [
      { size: "3/4\"", price: 29.30, mrp: 40.00, stock: 30, unit: "Pcs", barcode: "LEO-TN-34" },
      { size: "1\"", price: 42.00, mrp: 58.00, stock: 20, unit: "Pcs", barcode: "LEO-TN-1" },
      { size: "1-1/4\"", price: 59.80, mrp: 82.00, stock: 10, unit: "Pcs", barcode: "LEO-TN-1.25" },
      { size: "1-1/2\"", price: 88.90, mrp: 120.00, stock: 10, unit: "Pcs", barcode: "LEO-TN-1.5" },
      { size: "2\"", price: 143.60, mrp: 195.00, stock: 5, unit: "Pcs", barcode: "LEO-TN-2" }
    ]
  },
  {
    name: "Leo Plast uPVC Brass Fittings",
    category: "Plumbing",
    subcategory: "UPVC Brass Fittings",
    brand: "Leo Plast",
    hsnCode: "7412",
    gstRate: 18,
    description: "uPVC Schedule 40 Brass Insert Elbow, Tee, FTA",
    variants: [
      { size: "3/4\" x 1/2\" Brass Elbow", price: 85.00, mrp: 115.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-BRELB-3412" },
      { size: "1\" x 1/2\" Brass Elbow", price: 106.80, mrp: 145.00, stock: 25, unit: "Pcs", barcode: "LEO-UPVC-BRELB-112" },
      { size: "1\" x 3/4\" Brass Elbow", price: 125.00, mrp: 170.00, stock: 15, unit: "Pcs", barcode: "LEO-UPVC-BRELB-134" },
      { size: "3/4\" x 1/2\" Brass FTA", price: 78.00, mrp: 105.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-BRFTA-3412" },
      { size: "1\" x 1/2\" Brass FTA", price: 90.00, mrp: 122.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-BRFTA-112" },
      { size: "3/4\" x 1/2\" Brass Tee", price: 100.00, mrp: 135.00, stock: 30, unit: "Pcs", barcode: "LEO-UPVC-BRTEE-3412" },
      { size: "1\" x 1/2\" Brass Tee", price: 110.00, mrp: 150.00, stock: 20, unit: "Pcs", barcode: "LEO-UPVC-BRTEE-112" },
      { size: "1\" x 3/4\" Brass Tee", price: 140.00, mrp: 190.00, stock: 15, unit: "Pcs", barcode: "LEO-UPVC-BRTEE-134" }
    ]
  },

  // 10. HDPE IRRIGATION SYSTEM / FLEXIBLE HOSES
  {
    name: "Leo Plast HDPE / PE 80 Irrigation Pipe (Per Meter)",
    category: "Plumbing",
    subcategory: "HDPE Pipes",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "High-density polyethylene PE 80 irrigation pipe",
    variants: [
      { size: "1/2\" (16mm) 12.5kg", price: 27.00, mrp: 36.00, stock: 500, unit: "Mtr", barcode: "LEO-HDPE-16" },
      { size: "5/8\" (20mm) 10kg", price: 40.00, mrp: 54.00, stock: 500, unit: "Mtr", barcode: "LEO-HDPE-20" },
      { size: "3/4\" (25mm) 10kg", price: 55.00, mrp: 74.00, stock: 500, unit: "Mtr", barcode: "LEO-HDPE-25" },
      { size: "1\" (32mm) 6kg", price: 66.00, mrp: 88.00, stock: 300, unit: "Mtr", barcode: "LEO-HDPE-32-6K" },
      { size: "1\" (32mm) 8kg", price: 82.00, mrp: 110.00, stock: 300, unit: "Mtr", barcode: "LEO-HDPE-32-8K" },
      { size: "1\" (32mm) 10kg", price: 96.00, mrp: 128.00, stock: 300, unit: "Mtr", barcode: "LEO-HDPE-32-10K" },
      { size: "1-1/4\" (40mm) 6kg", price: 96.00, mrp: 128.00, stock: 200, unit: "Mtr", barcode: "LEO-HDPE-40-6K" },
      { size: "1-1/4\" (40mm) 8kg", price: 112.00, mrp: 150.00, stock: 200, unit: "Mtr", barcode: "LEO-HDPE-40-8K" },
      { size: "1-1/4\" (40mm) 10kg", price: 140.00, mrp: 188.00, stock: 200, unit: "Mtr", barcode: "LEO-HDPE-40-10K" },
      { size: "1-1/2\" (50mm) 6kg", price: 140.00, mrp: 188.00, stock: 200, unit: "Mtr", barcode: "LEO-HDPE-50-6K" },
      { size: "1-1/2\" (50mm) 10kg", price: 200.00, mrp: 265.00, stock: 200, unit: "Mtr", barcode: "LEO-HDPE-50-10K" },
      { size: "2\" (63mm) 4kg", price: 200.00, mrp: 265.00, stock: 150, unit: "Mtr", barcode: "LEO-HDPE-63" },
      { size: "2-1/2\" (75mm) 4kg", price: 255.00, mrp: 340.00, stock: 100, unit: "Mtr", barcode: "LEO-HDPE-75" }
    ]
  },
  {
    name: "Leo Plast Flexible Suction & Braided Hoses (30m Roll)",
    category: "Plumbing",
    subcategory: "Hoses",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Heavy duty suction and braided delivery water hoses (30 Meters)",
    variants: [
      { size: "3/4\" Suction (30m)", price: 1350.00, mrp: 1800.00, stock: 10, unit: "Roll", barcode: "LEO-SUCT-34" },
      { size: "1\" Suction (30m)", price: 1850.00, mrp: 2450.00, stock: 10, unit: "Roll", barcode: "LEO-SUCT-1" },
      { size: "1-1/4\" Suction (30m)", price: 2700.00, mrp: 3600.00, stock: 8, unit: "Roll", barcode: "LEO-SUCT-1.25" },
      { size: "1-1/2\" Suction (30m)", price: 3300.00, mrp: 4400.00, stock: 8, unit: "Roll", barcode: "LEO-SUCT-1.5" },
      { size: "2\" Suction (30m)", price: 4800.00, mrp: 6400.00, stock: 6, unit: "Roll", barcode: "LEO-SUCT-2" },
      { size: "2-1/4\" Suction (30m)", price: 6000.00, mrp: 8000.00, stock: 4, unit: "Roll", barcode: "LEO-SUCT-2.25" },
      { size: "2-1/2\" Suction (30m)", price: 7000.00, mrp: 9300.00, stock: 4, unit: "Roll", barcode: "LEO-SUCT-2.5" },
      { size: "3/4\" Braided (30m)", price: 1430.00, mrp: 1900.00, stock: 15, unit: "Roll", barcode: "LEO-BRAID-34" },
      { size: "1\" Braided (30m)", price: 2210.00, mrp: 2950.00, stock: 12, unit: "Roll", barcode: "LEO-BRAID-1" },
      { size: "1-1/4\" Braided (30m)", price: 4290.00, mrp: 5700.00, stock: 6, unit: "Roll", barcode: "LEO-BRAID-1.25" },
      { size: "1-1/2\" Braided (30m)", price: 5200.00, mrp: 6900.00, stock: 5, unit: "Roll", barcode: "LEO-BRAID-1.5" }
    ]
  },

  // 11. FABRICATED BEND & COUPLERS
  {
    name: "Leo Plast Fabricated Bends (4kg, 6kg, 15kg)",
    category: "Plumbing",
    subcategory: "PVC Bends",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Long radius fabricated PVC bends",
    variants: [
      { size: "63 mm (4 KG)", price: 65.00, mrp: 90.00, stock: 30, unit: "Pcs", barcode: "LEO-BEND-63-4K" },
      { size: "75 mm (4 KG)", price: 100.00, mrp: 135.00, stock: 30, unit: "Pcs", barcode: "LEO-BEND-75-4K" },
      { size: "90 mm (4 KG)", price: 160.00, mrp: 215.00, stock: 20, unit: "Pcs", barcode: "LEO-BEND-90-4K" },
      { size: "110 mm (4 KG)", price: 245.00, mrp: 330.00, stock: 15, unit: "Pcs", barcode: "LEO-BEND-110-4K" },
      { size: "40 mm (6 KG)", price: 29.40, mrp: 40.00, stock: 40, unit: "Pcs", barcode: "LEO-BEND-40-6K" },
      { size: "50 mm (6 KG)", price: 41.70, mrp: 56.00, stock: 30, unit: "Pcs", barcode: "LEO-BEND-50-6K" },
      { size: "63 mm (6 KG)", price: 81.80, mrp: 110.00, stock: 30, unit: "Pcs", barcode: "LEO-BEND-63-6K" },
      { size: "75 mm (6 KG)", price: 117.80, mrp: 160.00, stock: 25, unit: "Pcs", barcode: "LEO-BEND-75-6K" },
      { size: "90 mm (6 KG)", price: 175.00, mrp: 235.00, stock: 20, unit: "Pcs", barcode: "LEO-BEND-90-6K" },
      { size: "110 mm (6 KG)", price: 260.00, mrp: 350.00, stock: 15, unit: "Pcs", barcode: "LEO-BEND-110-6K" },
      { size: "140 mm (6 KG)", price: 677.00, mrp: 900.00, stock: 10, unit: "Pcs", barcode: "LEO-BEND-140-6K" },
      { size: "160 mm (6 KG)", price: 1145.00, mrp: 1520.00, stock: 8, unit: "Pcs", barcode: "LEO-BEND-160-6K" },
      { size: "180 mm (6 KG)", price: 1780.00, mrp: 2370.00, stock: 5, unit: "Pcs", barcode: "LEO-BEND-180-6K" }
    ]
  },

  // 12. SOLVENTS & CLAMPS
  {
    name: "Leo Plast Solvent Cement (PVC, uPVC, cPVC)",
    category: "Plumbing",
    subcategory: "Solvents & Adhesives",
    brand: "Leo Plast",
    hsnCode: "3506",
    gstRate: 18,
    description: "Solvent weld adhesive in Tin Container with brush applicator",
    variants: [
      { size: "50 ml PVC", price: 56.00, mrp: 75.00, stock: 50, unit: "Tin", barcode: "LEO-SOLV-PVC-50" },
      { size: "100 ml PVC", price: 80.00, mrp: 110.00, stock: 40, unit: "Tin", barcode: "LEO-SOLV-PVC-100" },
      { size: "250 ml PVC", price: 155.00, mrp: 210.00, stock: 30, unit: "Tin", barcode: "LEO-SOLV-PVC-250" },
      { size: "500 ml PVC", price: 265.00, mrp: 355.00, stock: 20, unit: "Tin", barcode: "LEO-SOLV-PVC-500" },
      { size: "1000 ml PVC", price: 500.00, mrp: 665.00, stock: 15, unit: "Tin", barcode: "LEO-SOLV-PVC-1000" },
      { size: "50 ml uPVC", price: 70.00, mrp: 95.00, stock: 40, unit: "Tin", barcode: "LEO-SOLV-UPVC-50" },
      { size: "125 ml uPVC", price: 120.00, mrp: 160.00, stock: 30, unit: "Tin", barcode: "LEO-SOLV-UPVC-125" },
      { size: "250 ml uPVC", price: 210.00, mrp: 280.00, stock: 20, unit: "Tin", barcode: "LEO-SOLV-UPVC-250" },
      { size: "50 ml cPVC", price: 85.00, mrp: 115.00, stock: 40, unit: "Tin", barcode: "LEO-SOLV-CPVC-50" },
      { size: "125 ml cPVC", price: 150.00, mrp: 200.00, stock: 30, unit: "Tin", barcode: "LEO-SOLV-CPVC-125" },
      { size: "250 ml cPVC", price: 260.00, mrp: 350.00, stock: 20, unit: "Tin", barcode: "LEO-SOLV-CPVC-250" }
    ]
  },
  {
    name: "Leo Plast Pipe Clamps & Step Clamps",
    category: "Plumbing",
    subcategory: "Pipe Clamps",
    brand: "Leo Plast",
    hsnCode: "7326",
    gstRate: 18,
    description: "Stainless steel and heavy PVC pipe mounting clamps",
    variants: [
      { size: "25 mm PVC SS Clamp", price: 11.50, mrp: 16.00, stock: 100, unit: "Pcs", barcode: "LEO-SSCLAMP-25" },
      { size: "32 mm PVC SS Clamp", price: 12.00, mrp: 17.00, stock: 100, unit: "Pcs", barcode: "LEO-SSCLAMP-32" },
      { size: "40 mm PVC SS Clamp", price: 13.50, mrp: 19.00, stock: 80, unit: "Pcs", barcode: "LEO-SSCLAMP-40" },
      { size: "50 mm PVC SS Clamp", price: 16.00, mrp: 22.00, stock: 60, unit: "Pcs", barcode: "LEO-SSCLAMP-50" },
      { size: "63 mm PVC SS Clamp", price: 21.00, mrp: 29.00, stock: 50, unit: "Pcs", barcode: "LEO-SSCLAMP-63" },
      { size: "75 mm PVC SS Clamp", price: 25.00, mrp: 35.00, stock: 40, unit: "Pcs", barcode: "LEO-SSCLAMP-75" },
      { size: "90 mm PVC SS Clamp", price: 30.00, mrp: 42.00, stock: 30, unit: "Pcs", barcode: "LEO-SSCLAMP-90" },
      { size: "110 mm PVC SS Clamp", price: 34.00, mrp: 48.00, stock: 30, unit: "Pcs", barcode: "LEO-SSCLAMP-110" },
      { size: "4\" Step Clamp", price: 120.00, mrp: 160.00, stock: 20, unit: "Pcs", barcode: "LEO-STEP-4" },
      { size: "6\" Step Clamp", price: 145.00, mrp: 195.00, stock: 20, unit: "Pcs", barcode: "LEO-STEP-6" },
      { size: "8\" Step Clamp", price: 155.00, mrp: 210.00, stock: 20, unit: "Pcs", barcode: "LEO-STEP-8" },
      { size: "10\" Step Clamp", price: 180.00, mrp: 240.00, stock: 15, unit: "Pcs", barcode: "LEO-STEP-10" },
      { size: "12\" Step Clamp", price: 205.00, mrp: 275.00, stock: 15, unit: "Pcs", barcode: "LEO-STEP-12" }
    ]
  },

  // 13. BALL VALVES & SANITARY WARE
  {
    name: "Leo Plast PP Ball Valves (Long Handle)",
    category: "Plumbing",
    subcategory: "Valves",
    brand: "Leo Plast",
    hsnCode: "8481",
    gstRate: 18,
    description: "PP Ball valve with MS plate insert handle",
    variants: [
      { size: "3/4\"", price: 120.00, mrp: 160.00, stock: 30, unit: "Pcs", barcode: "LEO-PPBV-34" },
      { size: "1\"", price: 135.00, mrp: 180.00, stock: 30, unit: "Pcs", barcode: "LEO-PPBV-1" },
      { size: "1-1/4\"", price: 200.00, mrp: 270.00, stock: 20, unit: "Pcs", barcode: "LEO-PPBV-1.25" },
      { size: "1-1/2\"", price: 250.00, mrp: 335.00, stock: 20, unit: "Pcs", barcode: "LEO-PPBV-1.5" },
      { size: "2\"", price: 317.00, mrp: 425.00, stock: 15, unit: "Pcs", barcode: "LEO-PPBV-2" },
      { size: "2-1/2\"", price: 470.00, mrp: 630.00, stock: 10, unit: "Pcs", barcode: "LEO-PPBV-2.5" },
      { size: "3\"", price: 625.00, mrp: 835.00, stock: 8, unit: "Pcs", barcode: "LEO-PPBV-3" },
      { size: "4\"", price: 1150.00, mrp: 1530.00, stock: 5, unit: "Pcs", barcode: "LEO-PPBV-4" }
    ]
  },
  {
    name: "Leo Plast uPVC / cPVC Ball Valves (Single Handle)",
    category: "Plumbing",
    subcategory: "Valves",
    brand: "Leo Plast",
    hsnCode: "8481",
    gstRate: 18,
    description: "uPVC & cPVC solvent weld compact ball valves",
    variants: [
      { size: "3/4\" uPVC", price: 106.00, mrp: 145.00, stock: 25, unit: "Pcs", barcode: "LEO-UPVC-BV-34" },
      { size: "1\" uPVC", price: 144.00, mrp: 195.00, stock: 25, unit: "Pcs", barcode: "LEO-UPVC-BV-1" },
      { size: "1-1/4\" uPVC", price: 230.00, mrp: 310.00, stock: 15, unit: "Pcs", barcode: "LEO-UPVC-BV-1.25" },
      { size: "1-1/2\" uPVC", price: 300.00, mrp: 400.00, stock: 15, unit: "Pcs", barcode: "LEO-UPVC-BV-1.5" },
      { size: "2\" uPVC", price: 480.00, mrp: 640.00, stock: 10, unit: "Pcs", barcode: "LEO-UPVC-BV-2" },
      { size: "3/4\" cPVC", price: 168.00, mrp: 225.00, stock: 25, unit: "Pcs", barcode: "LEO-CPVC-BV-34" },
      { size: "1\" cPVC", price: 225.00, mrp: 300.00, stock: 25, unit: "Pcs", barcode: "LEO-CPVC-BV-1" },
      { size: "1-1/4\" cPVC", price: 480.00, mrp: 640.00, stock: 15, unit: "Pcs", barcode: "LEO-CPVC-BV-1.25" },
      { size: "1-1/2\" cPVC", price: 864.00, mrp: 1150.00, stock: 10, unit: "Pcs", barcode: "LEO-CPVC-BV-1.5" },
      { size: "2\" cPVC", price: 1440.00, mrp: 1920.00, stock: 8, unit: "Pcs", barcode: "LEO-CPVC-BV-2" }
    ]
  },
  {
    name: "Leo Plast Sanitary Ware & Manhole Cover",
    category: "Plumbing",
    subcategory: "Sanitary Ware",
    brand: "Leo Plast",
    hsnCode: "3922",
    gstRate: 18,
    description: "Bathroom sanitary ware, toilet fittings and FRP manhole covers",
    variants: [
      { size: "Flush Tank Classic", price: 900.00, mrp: 1200.00, stock: 15, unit: "Pcs", barcode: "LEO-FLUSH-TANK" },
      { size: "Seat Cover Classic (White/Ivory)", price: 430.00, mrp: 580.00, stock: 20, unit: "Pcs", barcode: "LEO-SEAT-COVER" },
      { size: "FRP Manhole Cover 12\"x12\"", price: 800.00, mrp: 1080.00, stock: 10, unit: "Pcs", barcode: "LEO-FRP-12" },
      { size: "FRP Manhole Cover 18\"x18\"", price: 1550.00, mrp: 2100.00, stock: 8, unit: "Pcs", barcode: "LEO-FRP-18" },
      { size: "FRP Manhole Cover 24\"x24\"", price: 2350.00, mrp: 3150.00, stock: 6, unit: "Pcs", barcode: "LEO-FRP-24" },
      { size: "FRP Manhole Cover 28\"x28\"", price: 4700.00, mrp: 6300.00, stock: 4, unit: "Pcs", barcode: "LEO-FRP-28" }
    ]
  },

  // 14. LEO PLAST M-SERIES PTMT TAPS & FAUCETS
  {
    name: "Leo Plast M-Series PTMT Bathroom Faucets",
    category: "Plumbing",
    subcategory: "Faucets & Taps",
    brand: "Leo Plast",
    hsnCode: "8481",
    gstRate: 18,
    description: "Durable high quality PTMT bathroom and sink cocks",
    variants: [
      { size: "Short Body Tap", price: 160.00, mrp: 220.00, stock: 50, unit: "Pcs", barcode: "LEO-M-SHORT" },
      { size: "Long Body Tap", price: 200.00, mrp: 275.00, stock: 50, unit: "Pcs", barcode: "LEO-M-LONG" },
      { size: "Angle Cock", price: 160.00, mrp: 220.00, stock: 50, unit: "Pcs", barcode: "LEO-M-ANGLE" },
      { size: "2 Way Cock", price: 350.00, mrp: 480.00, stock: 30, unit: "Pcs", barcode: "LEO-M-2WAY" },
      { size: "Pillar Cock", price: 240.00, mrp: 330.00, stock: 30, unit: "Pcs", barcode: "LEO-M-PILLAR" },
      { size: "Pillar Cock Long", price: 360.00, mrp: 490.00, stock: 25, unit: "Pcs", barcode: "LEO-M-PILLAR-LONG" },
      { size: "Garden Cock", price: 230.00, mrp: 315.00, stock: 30, unit: "Pcs", barcode: "LEO-M-GARDEN" },
      { size: "Washing Machine Cock", price: 230.00, mrp: 315.00, stock: 30, unit: "Pcs", barcode: "LEO-M-MACHINE" },
      { size: "Wall Sink Cock", price: 450.00, mrp: 615.00, stock: 20, unit: "Pcs", barcode: "LEO-M-WALL-SINK" },
      { size: "Pillar Sink Cock", price: 450.00, mrp: 615.00, stock: 20, unit: "Pcs", barcode: "LEO-M-PILL-SINK" },
      { size: "Wall Mixture Set", price: 1580.00, mrp: 2150.00, stock: 10, unit: "Pcs", barcode: "LEO-M-WALL-MIXTURE" },
      { size: "2 Way Angle Cock", price: 350.00, mrp: 480.00, stock: 25, unit: "Pcs", barcode: "LEO-M-2WAY-ANGLE" },
      { size: "Health Faucet Set", price: 430.00, mrp: 590.00, stock: 30, unit: "Pcs", barcode: "LEO-M-HEALTH-FAUCET" },
      { size: "Health Faucet Gun Only", price: 180.00, mrp: 250.00, stock: 40, unit: "Pcs", barcode: "LEO-M-HEALTH-GUN" },
      { size: "Shower Set (Overhead + Arm)", price: 380.00, mrp: 520.00, stock: 25, unit: "Pcs", barcode: "LEO-M-SHOWER" },
      { size: "Connection Tube 18\"", price: 85.00, mrp: 120.00, stock: 50, unit: "Pcs", barcode: "LEO-TUBE-18" },
      { size: "Connection Tube 24\"", price: 95.00, mrp: 135.00, stock: 50, unit: "Pcs", barcode: "LEO-TUBE-24" },
      { size: "Connection Tube 1 Mtr", price: 135.00, mrp: 185.00, stock: 30, unit: "Pcs", barcode: "LEO-TUBE-1M" },
      { size: "Connection Tube 1.5 Mtr", price: 170.00, mrp: 235.00, stock: 30, unit: "Pcs", barcode: "LEO-TUBE-1.5M" }
    ]
  },

  // 15. EDGE SERIES + ALFA SERIES DESIGNER TAPS
  {
    name: "Leo Plast Edge Series PTMT Faucets (Square Profile)",
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
    name: "Leo Plast Alfa Series PTMT Faucets (Economy)",
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

async function seedCleanCatalog() {
  console.log(`Starting clean batch seed of ${fullCatalog.length} complete products from user spec...`);
  
  // Write in batches of 20
  const batchSize = 20;
  for (let i = 0; i < fullCatalog.length; i += batchSize) {
    const chunk = fullCatalog.slice(i, i + batchSize);
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
    console.log(`Batch ${Math.floor(i / batchSize) + 1} committed (${chunk.length} products).`);
  }
  
  console.log("Successfully seeded all 15 sections directly into Firestore!");
  process.exit(0);
}

seedCleanCatalog().catch((err) => {
  console.error("Error seeding catalog:", err);
  process.exit(1);
});
