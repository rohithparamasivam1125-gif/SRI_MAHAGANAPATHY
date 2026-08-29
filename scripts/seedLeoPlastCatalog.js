import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc, serverTimestamp } from "firebase/firestore";

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

// All extracted products from Leo Plast catalog
const LEO_PLAST_CATALOG = [
  // =========================================================================
  // PAGE 1: WATER STORAGE TANKS
  // =========================================================================
  {
    name: "Leo Plast Roto Moulded Water Storage Tank",
    category: "Plumbing",
    subcategory: "Water Tanks",
    brand: "Leo Plast",
    hsnCode: "3925",
    gstRate: 18,
    description: "Heavy duty Food Grade Roto Moulded Water Storage Tank (White, Yellow, Gold)",
    variants: [
      { size: "500 Ltr (41\" H x 35\" Dia)", price: 3400, mrp: 4200, stock: 15, unit: "Pcs", barcode: "LEO-ROTO-500" },
      { size: "750 Ltr (44\" H x 39\" Dia)", price: 4900, mrp: 5900, stock: 10, unit: "Pcs", barcode: "LEO-ROTO-750" },
      { size: "1000 Ltr (51\" H x 43\" Dia)", price: 6500, mrp: 7800, stock: 12, unit: "Pcs", barcode: "LEO-ROTO-1000" },
      { size: "1500 Ltr (52\" H x 50\" Dia)", price: 9800, mrp: 11800, stock: 8, unit: "Pcs", barcode: "LEO-ROTO-1500" },
      { size: "2000 Ltr (61\" H x 54\" Dia)", price: 13500, mrp: 16000, stock: 6, unit: "Pcs", barcode: "LEO-ROTO-2000" }
    ]
  },
  {
    name: "Leo Plast Blow Moulded Water Storage Tank",
    category: "Plumbing",
    subcategory: "Water Tanks",
    brand: "Leo Plast",
    hsnCode: "3925",
    gstRate: 18,
    description: "Blow Moulded Multi-Layer Water Tank (White, Yellow)",
    variants: [
      { size: "500 Ltr (41\" H x 34\" Dia)", price: 2900, mrp: 3600, stock: 20, unit: "Pcs", barcode: "LEO-BLOW-500" },
      { size: "750 Ltr (47\" H x 37\" Dia)", price: 4200, mrp: 5100, stock: 15, unit: "Pcs", barcode: "LEO-BLOW-750" },
      { size: "1000 Ltr (52\" H x 43\" Dia)", price: 5600, mrp: 6900, stock: 15, unit: "Pcs", barcode: "LEO-BLOW-1000" },
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
    description: "Insulated portable water camper with tap",
    variants: [
      { size: "50 Litre", price: 850, mrp: 1100, stock: 25, unit: "Pcs", barcode: "LEO-CAMP-50L" }
    ]
  },

  // =========================================================================
  // PAGE 2: PVC FITTINGS
  // =========================================================================
  {
    name: "Leo Plast PVC Elbow ISI Hy",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Heavy duty PVC 90 degree ISI certified solvent weld elbow",
    variants: [
      { size: "20 mm", price: 6.50, mrp: 9.00, stock: 100, unit: "Pcs", barcode: "LEO-ELB-20" },
      { size: "25 mm", price: 9.80, mrp: 14.00, stock: 100, unit: "Pcs", barcode: "LEO-ELB-25" },
      { size: "32 mm", price: 13.70, mrp: 19.00, stock: 80, unit: "Pcs", barcode: "LEO-ELB-32" },
      { size: "40 mm", price: 20.50, mrp: 28.00, stock: 60, unit: "Pcs", barcode: "LEO-ELB-40" },
      { size: "50 mm", price: 31.80, mrp: 42.00, stock: 50, unit: "Pcs", barcode: "LEO-ELB-50" },
      { size: "63 mm", price: 47.90, mrp: 65.00, stock: 40, unit: "Pcs", barcode: "LEO-ELB-63" },
      { size: "75 mm", price: 70.00, mrp: 95.00, stock: 30, unit: "Pcs", barcode: "LEO-ELB-75" },
      { size: "90 mm", price: 113.00, mrp: 150.00, stock: 25, unit: "Pcs", barcode: "LEO-ELB-90" },
      { size: "110 mm", price: 180.00, mrp: 240.00, stock: 20, unit: "Pcs", barcode: "LEO-ELB-110" }
    ]
  },
  {
    name: "Leo Plast PVC Equal Tee ISI Hy",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "ISI certified PVC 3-way equal branch tee fitting",
    variants: [
      { size: "20 mm", price: 8.60, mrp: 12.00, stock: 100, unit: "Pcs", barcode: "LEO-TEE-20" },
      { size: "25 mm", price: 13.70, mrp: 18.00, stock: 100, unit: "Pcs", barcode: "LEO-TEE-25" },
      { size: "32 mm", price: 18.00, mrp: 25.00, stock: 80, unit: "Pcs", barcode: "LEO-TEE-32" },
      { size: "40 mm", price: 27.50, mrp: 38.00, stock: 60, unit: "Pcs", barcode: "LEO-TEE-40" },
      { size: "50 mm", price: 46.00, mrp: 62.00, stock: 50, unit: "Pcs", barcode: "LEO-TEE-50" },
      { size: "63 mm", price: 65.00, mrp: 88.00, stock: 40, unit: "Pcs", barcode: "LEO-TEE-63" },
      { size: "75 mm", price: 97.00, mrp: 130.00, stock: 30, unit: "Pcs", barcode: "LEO-TEE-75" },
      { size: "90 mm", price: 156.00, mrp: 210.00, stock: 20, unit: "Pcs", barcode: "LEO-TEE-90" },
      { size: "110 mm", price: 244.00, mrp: 320.00, stock: 15, unit: "Pcs", barcode: "LEO-TEE-110" }
    ]
  },
  {
    name: "Leo Plast PVC Elbow Agri / LW",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Agricultural & light weight irrigation PVC elbow",
    variants: [
      { size: "63 mm Agri", price: 40.00, mrp: 55.00, stock: 50, unit: "Pcs", barcode: "LEO-ELBAG-63" },
      { size: "75 mm Agri", price: 50.00, mrp: 68.00, stock: 50, unit: "Pcs", barcode: "LEO-ELBAG-75" },
      { size: "90 mm Agri", price: 70.00, mrp: 95.00, stock: 35, unit: "Pcs", barcode: "LEO-ELBAG-90" },
      { size: "110 mm Agri", price: 120.00, mrp: 160.00, stock: 25, unit: "Pcs", barcode: "LEO-ELBAG-110" },
      { size: "63 mm LW", price: 34.20, mrp: 46.00, stock: 50, unit: "Pcs", barcode: "LEO-ELBLW-63" },
      { size: "75 mm LW", price: 42.80, mrp: 58.00, stock: 50, unit: "Pcs", barcode: "LEO-ELBLW-75" },
      { size: "90 mm LW", price: 64.00, mrp: 86.00, stock: 35, unit: "Pcs", barcode: "LEO-ELBLW-90" },
      { size: "110 mm LW", price: 103.00, mrp: 140.00, stock: 25, unit: "Pcs", barcode: "LEO-ELBLW-110" }
    ]
  },
  {
    name: "Leo Plast PVC Tee Agri / LW",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Agricultural & Light Weight irrigation PVC equal tee",
    variants: [
      { size: "63 mm Agri", price: 54.00, mrp: 72.00, stock: 40, unit: "Pcs", barcode: "LEO-TEEAG-63" },
      { size: "75 mm Agri", price: 65.00, mrp: 88.00, stock: 35, unit: "Pcs", barcode: "LEO-TEEAG-75" },
      { size: "90 mm Agri", price: 95.00, mrp: 128.00, stock: 25, unit: "Pcs", barcode: "LEO-TEEAG-90" },
      { size: "110 mm Agri", price: 160.00, mrp: 215.00, stock: 20, unit: "Pcs", barcode: "LEO-TEEAG-110" },
      { size: "63 mm LW", price: 46.20, mrp: 62.00, stock: 40, unit: "Pcs", barcode: "LEO-TEELW-63" },
      { size: "75 mm LW", price: 55.60, mrp: 75.00, stock: 35, unit: "Pcs", barcode: "LEO-TEELW-75" },
      { size: "90 mm LW", price: 88.00, mrp: 118.00, stock: 25, unit: "Pcs", barcode: "LEO-TEELW-90" },
      { size: "110 mm LW", price: 135.00, mrp: 180.00, stock: 20, unit: "Pcs", barcode: "LEO-TEELW-110" }
    ]
  },
  {
    name: "Leo Plast PVC Male Threaded Adaptor (MTA)",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "External thread PVC pipe adapter",
    variants: [
      { size: "20 mm", price: 4.40, mrp: 6.50, stock: 100, unit: "Pcs", barcode: "LEO-MTA-20" },
      { size: "25 mm", price: 5.80, mrp: 8.50, stock: 100, unit: "Pcs", barcode: "LEO-MTA-25" },
      { size: "32 mm", price: 9.00, mrp: 13.00, stock: 80, unit: "Pcs", barcode: "LEO-MTA-32" },
      { size: "40 mm", price: 13.70, mrp: 19.00, stock: 60, unit: "Pcs", barcode: "LEO-MTA-40" },
      { size: "50 mm", price: 21.00, mrp: 29.00, stock: 50, unit: "Pcs", barcode: "LEO-MTA-50" },
      { size: "63 mm", price: 33.00, mrp: 45.00, stock: 40, unit: "Pcs", barcode: "LEO-MTA-63" },
      { size: "75 mm", price: 42.80, mrp: 58.00, stock: 30, unit: "Pcs", barcode: "LEO-MTA-75" },
      { size: "90 mm", price: 66.00, mrp: 90.00, stock: 20, unit: "Pcs", barcode: "LEO-MTA-90" }
    ]
  },
  {
    name: "Leo Plast PVC Female Threaded Adaptor (FTA)",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Internal thread PVC adapter for faucets and pipe fittings",
    variants: [
      { size: "20 mm", price: 4.50, mrp: 6.50, stock: 100, unit: "Pcs", barcode: "LEO-FTA-20" },
      { size: "25 mm", price: 6.40, mrp: 9.00, stock: 100, unit: "Pcs", barcode: "LEO-FTA-25" },
      { size: "32 mm", price: 8.60, mrp: 12.00, stock: 80, unit: "Pcs", barcode: "LEO-FTA-32" },
      { size: "40 mm", price: 13.70, mrp: 19.00, stock: 60, unit: "Pcs", barcode: "LEO-FTA-40" },
      { size: "50 mm", price: 23.00, mrp: 32.00, stock: 50, unit: "Pcs", barcode: "LEO-FTA-50" },
      { size: "63 mm", price: 35.00, mrp: 48.00, stock: 40, unit: "Pcs", barcode: "LEO-FTA-63" },
      { size: "75 mm", price: 51.00, mrp: 70.00, stock: 30, unit: "Pcs", barcode: "LEO-FTA-75" },
      { size: "90 mm", price: 80.00, mrp: 110.00, stock: 20, unit: "Pcs", barcode: "LEO-FTA-90" },
      { size: "110 mm", price: 130.00, mrp: 175.00, stock: 15, unit: "Pcs", barcode: "LEO-FTA-110" }
    ]
  },

  // =========================================================================
  // PAGE 3: PIPES (RPVC, AGRI, CONDUIT)
  // =========================================================================
  {
    name: "Leo Plast RPVC Plumbing & Irrigation Pipes",
    category: "Plumbing",
    subcategory: "Pipes",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "ISI certified RPVC pressure pipes for plumbing & irrigation (6m length)",
    variants: [
      { size: "1/2\" (20mm)", price: 271.00, mrp: 350.00, stock: 50, unit: "Pcs", barcode: "LEO-RPVC-050" },
      { size: "3/4\" (25mm)", price: 352.00, mrp: 450.00, stock: 60, unit: "Pcs", barcode: "LEO-RPVC-075" },
      { size: "1\" (32mm)", price: 488.00, mrp: 620.00, stock: 60, unit: "Pcs", barcode: "LEO-RPVC-100" },
      { size: "1-1/4\" (40mm)", price: 684.00, mrp: 870.00, stock: 40, unit: "Pcs", barcode: "LEO-RPVC-125" },
      { size: "1-1/2\" (50mm)", price: 893.00, mrp: 1140.00, stock: 30, unit: "Pcs", barcode: "LEO-RPVC-150" },
      { size: "2\" (63mm)", price: 1368.00, mrp: 1740.00, stock: 25, unit: "Pcs", barcode: "LEO-RPVC-200" },
      { size: "2-1/2\" (75mm)", price: 1755.00, mrp: 2250.00, stock: 20, unit: "Pcs", barcode: "LEO-RPVC-250" },
      { size: "3\" (90mm)", price: 2051.00, mrp: 2600.00, stock: 15, unit: "Pcs", barcode: "LEO-RPVC-300" },
      { size: "4\" (110mm)", price: 2955.00, mrp: 3750.00, stock: 15, unit: "Pcs", barcode: "LEO-RPVC-400" },
      { size: "5\" (140mm)", price: 3907.00, mrp: 4950.00, stock: 10, unit: "Pcs", barcode: "LEO-RPVC-500" },
      { size: "6\" (160mm)", price: 4875.00, mrp: 6200.00, stock: 8, unit: "Pcs", barcode: "LEO-RPVC-600" },
      { size: "8\" (200mm)", price: 5910.00, mrp: 7500.00, stock: 5, unit: "Pcs", barcode: "LEO-RPVC-800" }
    ]
  },
  {
    name: "Leo Plast Electrical Conduit Pipes (3m)",
    category: "Electrical",
    subcategory: "Conduit & Pipes",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "FRLS PVC electrical conduit wiring pipes",
    variants: [
      { size: "19 mm Silver", price: 63.50, mrp: 82.00, stock: 100, unit: "Pcs", barcode: "LEO-CND-19S" },
      { size: "20 mm Silver", price: 63.50, mrp: 82.00, stock: 120, unit: "Pcs", barcode: "LEO-CND-20S" },
      { size: "25 mm Silver", price: 84.60, mrp: 110.00, stock: 80, unit: "Pcs", barcode: "LEO-CND-25S" },
      { size: "19 mm Gold Heavy", price: 73.50, mrp: 95.00, stock: 80, unit: "Pcs", barcode: "LEO-CND-19G" },
      { size: "20 mm Gold Heavy", price: 73.50, mrp: 95.00, stock: 100, unit: "Pcs", barcode: "LEO-CND-20G" },
      { size: "25 mm Gold Heavy", price: 106.00, mrp: 138.00, stock: 70, unit: "Pcs", barcode: "LEO-CND-25G" },
      { size: "25 mm Platinum Super", price: 126.50, mrp: 165.00, stock: 50, unit: "Pcs", barcode: "LEO-CND-25P" }
    ]
  },

  // =========================================================================
  // PAGE 4: END CAPS, REDUCERS & COUPLERS
  // =========================================================================
  {
    name: "Leo Plast PVC Coupler Fitting",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Straight pipe socket joint coupler",
    variants: [
      { size: "25 mm", price: 6.00, mrp: 8.50, stock: 150, unit: "Pcs", barcode: "LEO-CPL-25" },
      { size: "32 mm", price: 8.60, mrp: 12.00, stock: 120, unit: "Pcs", barcode: "LEO-CPL-32" },
      { size: "40 mm", price: 12.00, mrp: 17.00, stock: 90, unit: "Pcs", barcode: "LEO-CPL-40" },
      { size: "50 mm", price: 18.80, mrp: 26.00, stock: 75, unit: "Pcs", barcode: "LEO-CPL-50" },
      { size: "63 mm", price: 29.00, mrp: 40.00, stock: 60, unit: "Pcs", barcode: "LEO-CPL-63" },
      { size: "75 mm", price: 39.80, mrp: 55.00, stock: 45, unit: "Pcs", barcode: "LEO-CPL-75" },
      { size: "90 mm", price: 62.00, mrp: 85.00, stock: 35, unit: "Pcs", barcode: "LEO-CPL-90" },
      { size: "110 mm", price: 100.00, mrp: 135.00, stock: 25, unit: "Pcs", barcode: "LEO-CPL-110" }
    ]
  },
  {
    name: "Leo Plast PVC End Cap",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Plain solvent weld and threaded pipe end stop caps",
    variants: [
      { size: "25 mm", price: 4.70, mrp: 7.00, stock: 150, unit: "Pcs", barcode: "LEO-CAP-25" },
      { size: "32 mm", price: 6.50, mrp: 9.50, stock: 120, unit: "Pcs", barcode: "LEO-CAP-32" },
      { size: "40 mm", price: 11.00, mrp: 16.00, stock: 80, unit: "Pcs", barcode: "LEO-CAP-40" },
      { size: "50 mm", price: 15.40, mrp: 22.00, stock: 60, unit: "Pcs", barcode: "LEO-CAP-50" },
      { size: "63 mm", price: 24.00, mrp: 34.00, stock: 50, unit: "Pcs", barcode: "LEO-CAP-63" },
      { size: "75 mm", price: 32.00, mrp: 45.00, stock: 40, unit: "Pcs", barcode: "LEO-CAP-75" },
      { size: "90 mm", price: 47.00, mrp: 65.00, stock: 30, unit: "Pcs", barcode: "LEO-CAP-90" },
      { size: "110 mm", price: 64.00, mrp: 88.00, stock: 25, unit: "Pcs", barcode: "LEO-CAP-110" }
    ]
  },
  {
    name: "Leo Plast PVC Reducer & Bushing",
    category: "Plumbing",
    subcategory: "PVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "PVC pipe diameter step reducer and reducing bushes",
    variants: [
      { size: "32 x 25 mm Reducer", price: 8.50, mrp: 12.00, stock: 80, unit: "Pcs", barcode: "LEO-RED-3225" },
      { size: "40 x 32 mm Reducer", price: 13.70, mrp: 19.00, stock: 60, unit: "Pcs", barcode: "LEO-RED-4032" },
      { size: "50 x 40 mm Reducer", price: 19.70, mrp: 28.00, stock: 50, unit: "Pcs", barcode: "LEO-RED-5040" },
      { size: "63 x 50 mm Reducer", price: 29.00, mrp: 40.00, stock: 40, unit: "Pcs", barcode: "LEO-RED-6350" },
      { size: "75 x 63 mm Reducer", price: 37.60, mrp: 52.00, stock: 30, unit: "Pcs", barcode: "LEO-RED-7563" },
      { size: "90 x 75 mm Reducer", price: 54.70, mrp: 75.00, stock: 25, unit: "Pcs", barcode: "LEO-RED-9075" },
      { size: "110 x 90 mm Reducer", price: 92.00, mrp: 125.00, stock: 20, unit: "Pcs", barcode: "LEO-RED-11090" }
    ]
  },

  // =========================================================================
  // PAGE 8 & 7: CPVC PIPES & FITTINGS
  // =========================================================================
  {
    name: "Leo Plast CPVC Pipes (SDR 11 & SDR 13.5 - 3m / 5m)",
    category: "Plumbing",
    subcategory: "CPVC Pipes",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Chlorinated polyvinyl chloride SDR 11 & SDR 13.5 hot & cold water pipes",
    variants: [
      { size: "1/2\" (15mm) SDR 11", price: 125.00, mrp: 165.00, stock: 90, unit: "Pcs", barcode: "LEO-CPVC-050" },
      { size: "3/4\" (20mm) SDR 11", price: 208.00, mrp: 275.00, stock: 120, unit: "Pcs", barcode: "LEO-CPVC-075" },
      { size: "1\" (25mm) SDR 11", price: 375.00, mrp: 490.00, stock: 80, unit: "Pcs", barcode: "LEO-CPVC-100" },
      { size: "1-1/4\" (32mm) SDR 11", price: 600.00, mrp: 780.00, stock: 40, unit: "Pcs", barcode: "LEO-CPVC-125" },
      { size: "1-1/2\" (40mm) SDR 11", price: 900.00, mrp: 1170.00, stock: 30, unit: "Pcs", barcode: "LEO-CPVC-150" },
      { size: "2\" (50mm) SDR 11", price: 1450.00, mrp: 1890.00, stock: 20, unit: "Pcs", barcode: "LEO-CPVC-200" }
    ]
  },
  {
    name: "Leo Plast CPVC Elbow 90 Degree",
    category: "Plumbing",
    subcategory: "CPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "CPVC solvent weld 90 elbow fitting",
    variants: [
      { size: "1/2\"", price: 11.00, mrp: 16.00, stock: 200, unit: "Pcs", barcode: "LEO-CELB-050" },
      { size: "3/4\"", price: 18.00, mrp: 25.00, stock: 250, unit: "Pcs", barcode: "LEO-CELB-075" },
      { size: "1\"", price: 35.00, mrp: 48.00, stock: 180, unit: "Pcs", barcode: "LEO-CELB-100" },
      { size: "1-1/4\"", price: 75.00, mrp: 100.00, stock: 80, unit: "Pcs", barcode: "LEO-CELB-125" },
      { size: "1-1/2\"", price: 140.00, mrp: 185.00, stock: 50, unit: "Pcs", barcode: "LEO-CELB-150" }
    ]
  },
  {
    name: "Leo Plast CPVC Brass Fittings (Elbow, Tee, FTA, MTA)",
    category: "Plumbing",
    subcategory: "CPVC Fittings",
    brand: "Leo Plast",
    hsnCode: "3917",
    gstRate: 18,
    description: "Moulded brass insert fittings for mixer, tap, and shower connections",
    variants: [
      { size: "3/4\" x 1/2\" Brass Elbow", price: 80.00, mrp: 105.00, stock: 100, unit: "Pcs", barcode: "LEO-CBELB-075050" },
      { size: "1\" x 1/2\" Brass Elbow", price: 130.00, mrp: 170.00, stock: 60, unit: "Pcs", barcode: "LEO-CBELB-100050" },
      { size: "1\" x 3/4\" Brass Elbow", price: 182.00, mrp: 240.00, stock: 50, unit: "Pcs", barcode: "LEO-CBELB-100075" },
      { size: "3/4\" x 1/2\" Brass Tee", price: 80.00, mrp: 105.00, stock: 80, unit: "Pcs", barcode: "LEO-CBTEE-075050" },
      { size: "1\" x 1/2\" Brass Tee", price: 130.00, mrp: 170.00, stock: 50, unit: "Pcs", barcode: "LEO-CBTEE-100050" },
      { size: "3/4\" x 1/2\" Brass FTA", price: 80.00, mrp: 105.00, stock: 120, unit: "Pcs", barcode: "LEO-CBFTA-075050" },
      { size: "1\" x 1/2\" Brass FTA", price: 105.00, mrp: 140.00, stock: 80, unit: "Pcs", barcode: "LEO-CBFTA-100050" },
      { size: "1\" x 3/4\" Brass FTA", price: 125.00, mrp: 165.00, stock: 70, unit: "Pcs", barcode: "LEO-CBFTA-100075" },
      { size: "3/4\" x 1/2\" Brass MTA", price: 130.00, mrp: 175.00, stock: 60, unit: "Pcs", barcode: "LEO-CBMTA-075050" },
      { size: "1\" x 1/2\" Brass MTA", price: 150.00, mrp: 200.00, stock: 40, unit: "Pcs", barcode: "LEO-CBMTA-100050" }
    ]
  },
  {
    name: "Leo Plast Concealed Valve (Triangle & Round)",
    category: "Plumbing",
    subcategory: "Valves",
    brand: "Leo Plast",
    hsnCode: "8481",
    gstRate: 18,
    description: "Quarter-turn CPVC Concealed Flush Valve with chrome trim",
    variants: [
      { size: "3/4\"", price: 920.00, mrp: 1200.00, stock: 25, unit: "Pcs", barcode: "LEO-CONC-075" },
      { size: "1\"", price: 1100.00, mrp: 1450.00, stock: 20, unit: "Pcs", barcode: "LEO-CONC-100" }
    ]
  },

  // =========================================================================
  // PAGE 13: SOLVENT CEMENTS & CLAMPS
  // =========================================================================
  {
    name: "Leo Plast CPVC / UPVC / PVC Solvent Cement",
    category: "Plumbing",
    subcategory: "Solvents & Adhesives",
    brand: "Leo Plast",
    hsnCode: "3506",
    gstRate: 18,
    description: "Fast bonding heavy duty solvent cement with brush tin",
    variants: [
      { size: "50ml CPVC", price: 85.00, mrp: 110.00, stock: 80, unit: "Tin", barcode: "LEO-SOLV-C50" },
      { size: "125ml CPVC", price: 150.00, mrp: 195.00, stock: 80, unit: "Tin", barcode: "LEO-SOLV-C125" },
      { size: "250ml CPVC", price: 260.00, mrp: 340.00, stock: 60, unit: "Tin", barcode: "LEO-SOLV-C250" },
      { size: "50ml UPVC", price: 70.00, mrp: 95.00, stock: 80, unit: "Tin", barcode: "LEO-SOLV-U50" },
      { size: "125ml UPVC", price: 120.00, mrp: 160.00, stock: 60, unit: "Tin", barcode: "LEO-SOLV-U125" },
      { size: "250ml UPVC", price: 210.00, mrp: 280.00, stock: 50, unit: "Tin", barcode: "LEO-SOLV-U250" },
      { size: "500ml UPVC", price: 380.00, mrp: 490.00, stock: 30, unit: "Tin", barcode: "LEO-SOLV-U500" },
      { size: "50ml PVC", price: 56.00, mrp: 75.00, stock: 100, unit: "Tin", barcode: "LEO-SOLV-P50" },
      { size: "100ml PVC", price: 80.00, mrp: 105.00, stock: 100, unit: "Tin", barcode: "LEO-SOLV-P100" },
      { size: "250ml PVC", price: 155.00, mrp: 205.00, stock: 60, unit: "Tin", barcode: "LEO-SOLV-P250" },
      { size: "500ml PVC", price: 265.00, mrp: 350.00, stock: 40, unit: "Tin", barcode: "LEO-SOLV-P500" },
      { size: "1000ml (1 Ltr) PVC", price: 500.00, mrp: 650.00, stock: 25, unit: "Tin", barcode: "LEO-SOLV-P1000" }
    ]
  },

  // =========================================================================
  // PAGE 14: BALL VALVES & SANITARY WARE
  // =========================================================================
  {
    name: "Leo Plast PP & CPVC Ball Valves",
    category: "Plumbing",
    subcategory: "Valves",
    brand: "Leo Plast",
    hsnCode: "8481",
    gstRate: 18,
    description: "Solid long handle quarter turn water shutoff ball valve",
    variants: [
      { size: "3/4\" CPVC", price: 168.00, mrp: 225.00, stock: 60, unit: "Pcs", barcode: "LEO-BV-C075" },
      { size: "1\" CPVC", price: 225.00, mrp: 300.00, stock: 50, unit: "Pcs", barcode: "LEO-BV-C100" },
      { size: "1-1/4\" CPVC", price: 480.00, mrp: 640.00, stock: 30, unit: "Pcs", barcode: "LEO-BV-C125" },
      { size: "1-1/2\" CPVC", price: 864.00, mrp: 1150.00, stock: 25, unit: "Pcs", barcode: "LEO-BV-C150" },
      { size: "2\" CPVC", price: 1440.00, mrp: 1900.00, stock: 15, unit: "Pcs", barcode: "LEO-BV-C200" },
      { size: "3/4\" PP Valve", price: 120.00, mrp: 160.00, stock: 70, unit: "Pcs", barcode: "LEO-BV-PP075" },
      { size: "1\" PP Valve", price: 135.00, mrp: 180.00, stock: 60, unit: "Pcs", barcode: "LEO-BV-PP100" },
      { size: "1-1/4\" PP Valve", price: 200.00, mrp: 265.00, stock: 40, unit: "Pcs", barcode: "LEO-BV-PP125" },
      { size: "1-1/2\" PP Valve", price: 250.00, mrp: 330.00, stock: 30, unit: "Pcs", barcode: "LEO-BV-PP150" },
      { size: "2\" PP Valve", price: 317.00, mrp: 420.00, stock: 25, unit: "Pcs", barcode: "LEO-BV-PP200" }
    ]
  },
  {
    name: "Leo Plast Sanitary Ware & Covers",
    category: "Plumbing",
    subcategory: "Sanitary Ware",
    brand: "Leo Plast",
    hsnCode: "3922",
    gstRate: 18,
    description: "Bathroom flush tanks, toilet seat covers and FRP manhole covers",
    variants: [
      { size: "Flush Tank Classic", price: 900.00, mrp: 1200.00, stock: 20, unit: "Pcs", barcode: "LEO-FLUSH-01" },
      { size: "Seat Cover Classic (White/Ivory)", price: 430.00, mrp: 580.00, stock: 35, unit: "Pcs", barcode: "LEO-SEAT-01" },
      { size: "FRP Manhole Cover 12\" x 12\"", price: 800.00, mrp: 1050.00, stock: 15, unit: "Pcs", barcode: "LEO-MAN-1212" },
      { size: "FRP Manhole Cover 18\" x 18\"", price: 1550.00, mrp: 2050.00, stock: 10, unit: "Pcs", barcode: "LEO-MAN-1818" },
      { size: "FRP Manhole Cover 24\" x 24\"", price: 2350.00, mrp: 3100.00, stock: 8, unit: "Pcs", barcode: "LEO-MAN-2424" }
    ]
  },

  // =========================================================================
  // PAGE 15 & 16: BATHROOM TAPS & FAUCETS (M-SERIES, EDGE, ALFA)
  // =========================================================================
  {
    name: "Leo Plast M-Series PTMT Bathroom Taps & Cocks",
    category: "Plumbing",
    subcategory: "Faucets & Taps",
    brand: "Leo Plast",
    hsnCode: "8481",
    gstRate: 18,
    description: "Premium rust-free PTMT bathroom faucets and mixer sets",
    variants: [
      { size: "Short Body Tap", price: 160.00, mrp: 215.00, stock: 50, unit: "Pcs", barcode: "LEO-M-SB" },
      { size: "Long Body Tap", price: 200.00, mrp: 270.00, stock: 60, unit: "Pcs", barcode: "LEO-M-LB" },
      { size: "Angle Cock", price: 160.00, mrp: 215.00, stock: 60, unit: "Pcs", barcode: "LEO-M-AC" },
      { size: "2 Way Angle Cock", price: 350.00, mrp: 470.00, stock: 35, unit: "Pcs", barcode: "LEO-M-2WAC" },
      { size: "Pillar Cock (Wash Basin)", price: 240.00, mrp: 320.00, stock: 40, unit: "Pcs", barcode: "LEO-M-PC" },
      { size: "Pillar Cock Long", price: 360.00, mrp: 480.00, stock: 30, unit: "Pcs", barcode: "LEO-M-PCL" },
      { size: "Garden Cock with Nozzle", price: 230.00, mrp: 310.00, stock: 30, unit: "Pcs", barcode: "LEO-M-GC" },
      { size: "Washing Machine Cock", price: 230.00, mrp: 310.00, stock: 30, unit: "Pcs", barcode: "LEO-M-MC" },
      { size: "Wall Sink Cock (Swan Neck)", price: 450.00, mrp: 600.00, stock: 25, unit: "Pcs", barcode: "LEO-M-WSC" },
      { size: "Pillar Sink Cock", price: 450.00, mrp: 600.00, stock: 25, unit: "Pcs", barcode: "LEO-M-PSC" },
      { size: "Wall Mixture Set", price: 1580.00, mrp: 2100.00, stock: 12, unit: "Pcs", barcode: "LEO-M-WM" },
      { size: "Health Faucet with Hook & Tube", price: 430.00, mrp: 580.00, stock: 40, unit: "Pcs", barcode: "LEO-M-HF" },
      { size: "Shower Set (Overhead + Arm)", price: 380.00, mrp: 510.00, stock: 30, unit: "Pcs", barcode: "LEO-M-SS" }
    ]
  },
  {
    name: "Leo Plast Edge & Alfa Series Designer Taps",
    category: "Plumbing",
    subcategory: "Faucets & Taps",
    brand: "Leo Plast",
    hsnCode: "8481",
    gstRate: 18,
    description: "Modern square & round profile PTMT designer taps",
    variants: [
      { size: "Alfa Short Body", price: 111.00, mrp: 150.00, stock: 40, unit: "Pcs", barcode: "LEO-ALFA-SB" },
      { size: "Alfa Long Body", price: 123.00, mrp: 165.00, stock: 45, unit: "Pcs", barcode: "LEO-ALFA-LB" },
      { size: "Alfa Angle Cock", price: 111.00, mrp: 150.00, stock: 40, unit: "Pcs", barcode: "LEO-ALFA-AC" },
      { size: "Edge Short Body", price: 327.00, mrp: 440.00, stock: 25, unit: "Pcs", barcode: "LEO-EDGE-SB" },
      { size: "Edge Long Body", price: 380.00, mrp: 510.00, stock: 30, unit: "Pcs", barcode: "LEO-EDGE-LB" },
      { size: "Edge Angle Cock", price: 300.00, mrp: 400.00, stock: 30, unit: "Pcs", barcode: "LEO-EDGE-AC" },
      { size: "Edge 2 Way Cock", price: 630.00, mrp: 840.00, stock: 20, unit: "Pcs", barcode: "LEO-EDGE-2WC" },
      { size: "Edge Wall Sink Cock", price: 630.00, mrp: 840.00, stock: 15, unit: "Pcs", barcode: "LEO-EDGE-WSC" },
      { size: "Edge Wall Mixture", price: 2200.00, mrp: 2900.00, stock: 10, unit: "Pcs", barcode: "LEO-EDGE-WM" }
    ]
  }
];

async function seedLeoPlast() {
  console.log(`Starting to import ${LEO_PLAST_CATALOG.length} Leo Plast catalog products into Firebase Firestore...`);

  const chunkSize = 20;
  let total = 0;

  for (let i = 0; i < LEO_PLAST_CATALOG.length; i += chunkSize) {
    const chunk = LEO_PLAST_CATALOG.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    const colRef = collection(db, "products");

    chunk.forEach((item) => {
      const docRef = doc(colRef);
      batch.set(docRef, {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
    total += chunk.length;
  }

  console.log(`✅ SUCCESS: Uploaded ${total} Leo Plast catalog products and size specifications directly into Firebase Firestore!`);
  process.exit(0);
}

seedLeoPlast().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
