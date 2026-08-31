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

// Complete electrical & plumbing products to ensure ALL subcategories are populated in the DB
const ELECTRICAL_PRODUCTS_TO_SEED = [
  {
    name: "Finolex Flame Retardant (FR) Copper Wire Coil (90m)",
    category: "Electrical",
    subcategory: "Wires & Cables",
    brand: "Finolex",
    hsnCode: "8544",
    gstRate: 18,
    description: "Multistrand flexible single core PVC insulated copper wire coil 90 meters",
    variants: [
      { size: "0.75 sq mm", price: 920, mrp: 1150, stock: 25, unit: "Coil", barcode: "FIN-075" },
      { size: "1.0 sq mm", price: 1350, mrp: 1680, stock: 40, unit: "Coil", barcode: "FIN-100" },
      { size: "1.5 sq mm", price: 1980, mrp: 2450, stock: 50, unit: "Coil", barcode: "FIN-150" },
      { size: "2.5 sq mm", price: 3180, mrp: 3950, stock: 45, unit: "Coil", barcode: "FIN-250" },
      { size: "4.0 sq mm", price: 4850, mrp: 6100, stock: 20, unit: "Coil", barcode: "FIN-400" },
      { size: "6.0 sq mm", price: 7250, mrp: 9100, stock: 15, unit: "Coil", barcode: "FIN-600" }
    ]
  },
  {
    name: "Polycab Green Wire FR-LSH Single Core (90m)",
    category: "Electrical",
    subcategory: "Wires & Cables",
    brand: "Polycab",
    hsnCode: "8544",
    gstRate: 18,
    description: "Flame Retardant Low Smoke & Halogen House Wire 90m",
    variants: [
      { size: "1.0 sq mm", price: 1390, mrp: 1720, stock: 30, unit: "Coil", barcode: "POLY-100" },
      { size: "1.5 sq mm", price: 2040, mrp: 2520, stock: 40, unit: "Coil", barcode: "POLY-150" },
      { size: "2.5 sq mm", price: 3260, mrp: 4050, stock: 35, unit: "Coil", barcode: "POLY-250" },
      { size: "4.0 sq mm", price: 4980, mrp: 6200, stock: 20, unit: "Coil", barcode: "POLY-400" }
    ]
  },
  {
    name: "Anchor Roma Modular Switch",
    category: "Electrical",
    subcategory: "Switches & Sockets",
    brand: "Anchor by Panasonic",
    hsnCode: "8536",
    gstRate: 18,
    description: "High-grade polycarbonate smooth action modular switches",
    variants: [
      { size: "6A 1-Way (1M)", price: 32, mrp: 45, stock: 300, unit: "Pcs", barcode: "ANC-SW-6A1W" },
      { size: "6A 2-Way (1M)", price: 48, mrp: 65, stock: 120, unit: "Pcs", barcode: "ANC-SW-6A2W" },
      { size: "16A 1-Way (1M)", price: 85, mrp: 115, stock: 150, unit: "Pcs", barcode: "ANC-SW-16A1W" },
      { size: "20A 1-Way Heavy (1M)", price: 110, mrp: 145, stock: 80, unit: "Pcs", barcode: "ANC-SW-20A1W" },
      { size: "Bell Push with Indicator (1M)", price: 75, mrp: 99, stock: 50, unit: "Pcs", barcode: "ANC-SW-BELL" }
    ]
  },
  {
    name: "Anchor Roma Modular Socket",
    category: "Electrical",
    subcategory: "Switches & Sockets",
    brand: "Anchor by Panasonic",
    hsnCode: "8536",
    gstRate: 18,
    description: "Shuttered safety modular sockets",
    variants: [
      { size: "6A 2/3 Pin Universal (2M)", price: 78, mrp: 105, stock: 180, unit: "Pcs", barcode: "ANC-SK-6A" },
      { size: "6/16A Combined Power Socket (2M)", price: 145, mrp: 195, stock: 160, unit: "Pcs", barcode: "ANC-SK-16A" }
    ]
  },
  {
    name: "Legrand Single Pole (SP) MCB C-Curve",
    category: "Electrical",
    subcategory: "MCB & Distribution Boards",
    brand: "Legrand",
    hsnCode: "8536",
    gstRate: 18,
    description: "10kA breaking capacity miniature circuit breaker",
    variants: [
      { size: "6 Amp SP", price: 165, mrp: 220, stock: 50, unit: "Pcs", barcode: "LEG-MCB-6A" },
      { size: "10 Amp SP", price: 165, mrp: 220, stock: 60, unit: "Pcs", barcode: "LEG-MCB-10A" },
      { size: "16 Amp SP", price: 165, mrp: 220, stock: 80, unit: "Pcs", barcode: "LEG-MCB-16A" },
      { size: "20 Amp SP", price: 175, mrp: 235, stock: 55, unit: "Pcs", barcode: "LEG-MCB-20A" },
      { size: "25 Amp SP", price: 175, mrp: 235, stock: 40, unit: "Pcs", barcode: "LEG-MCB-25A" },
      { size: "32 Amp SP", price: 185, mrp: 250, stock: 50, unit: "Pcs", barcode: "LEG-MCB-32A" },
      { size: "40 Amp SP", price: 290, mrp: 380, stock: 25, unit: "Pcs", barcode: "LEG-MCB-40A" },
      { size: "63 Amp DP (Double Pole)", price: 580, mrp: 750, stock: 20, unit: "Pcs", barcode: "LEG-MCB-63DP" }
    ]
  },
  {
    name: "Havells SPN Metal Distribution Board",
    category: "Electrical",
    subcategory: "MCB & Distribution Boards",
    brand: "Havells",
    hsnCode: "8537",
    gstRate: 18,
    description: "Double door IP43 sheet steel enclosure distribution board",
    variants: [
      { size: "4 Way SPN Double Door", price: 780, mrp: 990, stock: 15, unit: "Pcs", barcode: "HAV-DB-4W" },
      { size: "8 Way SPN Double Door", price: 1150, mrp: 1480, stock: 20, unit: "Pcs", barcode: "HAV-DB-8W" },
      { size: "12 Way SPN Double Door", price: 1550, mrp: 1980, stock: 12, unit: "Pcs", barcode: "HAV-DB-12W" }
    ]
  },
  {
    name: "Philips Bright LED Batten Tube Light",
    category: "Electrical",
    subcategory: "LED Lighting & Fixtures",
    brand: "Philips",
    hsnCode: "8539",
    gstRate: 12,
    description: "Cool day white 6500K energy efficient LED Batten",
    variants: [
      { size: "10W (1 Foot / 300mm)", price: 190, mrp: 260, stock: 35, unit: "Pcs", barcode: "PHI-BAT-10W" },
      { size: "20W (4 Feet / 1200mm)", price: 280, mrp: 399, stock: 90, unit: "Pcs", barcode: "PHI-BAT-20W" },
      { size: "28W Super Bright (4 Feet)", price: 390, mrp: 550, stock: 40, unit: "Pcs", barcode: "PHI-BAT-28W" }
    ]
  },
  {
    name: "Havells Adore LED Bulb (B22)",
    category: "Electrical",
    subcategory: "LED Lighting & Fixtures",
    brand: "Havells",
    hsnCode: "8539",
    gstRate: 12,
    description: "High lumen glare-free energy saving LED bulb B22 pin type",
    variants: [
      { size: "9 Watt B22 (Cool White)", price: 85, mrp: 130, stock: 150, unit: "Pcs", barcode: "HAV-BLB-9W" },
      { size: "12 Watt B22 (Cool White)", price: 125, mrp: 180, stock: 100, unit: "Pcs", barcode: "HAV-BLB-12W" },
      { size: "15 Watt B22 (Cool White)", price: 175, mrp: 240, stock: 60, unit: "Pcs", barcode: "HAV-BLB-15W" }
    ]
  },
  {
    name: "Crompton High Breeze Ceiling Fan (1200mm)",
    category: "Electrical",
    subcategory: "Fans & Ventilation",
    brand: "Crompton",
    hsnCode: "8414",
    gstRate: 18,
    description: "High speed 380 RPM copper motor ceiling fan with aerodynamically designed blades",
    variants: [
      { size: "48 Inch (1200mm) - Brown", price: 1750, mrp: 2350, stock: 25, unit: "Pcs", barcode: "CRM-FAN-BRN" },
      { size: "48 Inch (1200mm) - White", price: 1750, mrp: 2350, stock: 30, unit: "Pcs", barcode: "CRM-FAN-WHT" },
      { size: "48 Inch (1200mm) - Ivory", price: 1790, mrp: 2400, stock: 20, unit: "Pcs", barcode: "CRM-FAN-IVR" }
    ]
  },
  {
    name: "Usha Turbo Heavy Duty Exhaust Fan",
    category: "Electrical",
    subcategory: "Fans & Ventilation",
    brand: "Usha",
    hsnCode: "8414",
    gstRate: 18,
    description: "High CFM ventilation exhaust fan for kitchens and bathrooms",
    variants: [
      { size: "150mm (6 Inch)", price: 950, mrp: 1350, stock: 20, unit: "Pcs", barcode: "USH-EXH-150" },
      { size: "200mm (8 Inch)", price: 1250, mrp: 1690, stock: 15, unit: "Pcs", barcode: "USH-EXH-200" }
    ]
  },
  {
    name: "Steelgrip PVC Electrical Insulation Tape",
    category: "Electrical",
    subcategory: "Electrical Accessories & Tape",
    brand: "Steelgrip",
    hsnCode: "8547",
    gstRate: 18,
    description: "Flame retardant self-extinguishing electrical insulation tape",
    variants: [
      { size: "Black (7.5m)", price: 12, mrp: 15, stock: 200, unit: "Roll", barcode: "STG-TP-BLK" },
      { size: "Red (7.5m)", price: 12, mrp: 15, stock: 100, unit: "Roll", barcode: "STG-TP-RED" },
      { size: "Blue (7.5m)", price: 12, mrp: 15, stock: 100, unit: "Roll", barcode: "STG-TP-BLU" },
      { size: "Yellow (7.5m)", price: 12, mrp: 15, stock: 100, unit: "Roll", barcode: "STG-TP-YEL" },
      { size: "Green (7.5m)", price: 12, mrp: 15, stock: 100, unit: "Roll", barcode: "STG-TP-GRN" }
    ]
  },
  {
    name: "Anchor Roma Modular Cover Plates (White)",
    category: "Electrical",
    subcategory: "Modular Plates & Boxes",
    brand: "Anchor by Panasonic",
    hsnCode: "8538",
    gstRate: 18,
    description: "Sleek gloss finish modular outer plates with inner mounting frame",
    variants: [
      { size: "1 Module Plate", price: 42, mrp: 58, stock: 80, unit: "Pcs", barcode: "ANC-PLT-1M" },
      { size: "2 Module Plate", price: 46, mrp: 62, stock: 100, unit: "Pcs", barcode: "ANC-PLT-2M" },
      { size: "3 Module Plate", price: 58, mrp: 78, stock: 90, unit: "Pcs", barcode: "ANC-PLT-3M" },
      { size: "4 Module Plate", price: 72, mrp: 98, stock: 70, unit: "Pcs", barcode: "ANC-PLT-4M" },
      { size: "6 Module Plate", price: 98, mrp: 135, stock: 60, unit: "Pcs", barcode: "ANC-PLT-6M" },
      { size: "8 Module Horizontal Plate", price: 128, mrp: 175, stock: 50, unit: "Pcs", barcode: "ANC-PLT-8M" },
      { size: "12 Module Plate", price: 185, mrp: 250, stock: 40, unit: "Pcs", barcode: "ANC-PLT-12M" }
    ]
  },
  {
    name: "L&T Submersible Pump Starter / Control Panel (Single Phase)",
    category: "Electrical",
    subcategory: "Meters & Starters",
    brand: "L&T",
    hsnCode: "8536",
    gstRate: 18,
    description: "Direct-On-Line DOL motor starter with thermal overload and voltmeter/ammeter",
    variants: [
      { size: "1.0 HP Single Phase", price: 1850, mrp: 2450, stock: 12, unit: "Pcs", barcode: "LNT-STR-10HP" },
      { size: "1.5 HP Single Phase", price: 2150, mrp: 2850, stock: 10, unit: "Pcs", barcode: "LNT-STR-15HP" },
      { size: "2.0 HP Single Phase", price: 2450, mrp: 3200, stock: 8, unit: "Pcs", barcode: "LNT-STR-20HP" }
    ]
  }
];

async function seedDatabaseSubcategories() {
  console.log("Checking existing products in Firestore...");
  const colRef = collection(db, "products");
  const snapshot = await getDocs(colRef);

  const existingNames = new Set();
  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.name) existingNames.add(data.name.trim().toLowerCase());
  });

  const productsToInsert = ELECTRICAL_PRODUCTS_TO_SEED.filter(
    (p) => !existingNames.has(p.name.trim().toLowerCase())
  );

  console.log(`Found ${productsToInsert.length} new electrical items to add to database.`);

  if (productsToInsert.length === 0) {
    console.log("All subcategory products already exist in database.");
    return;
  }

  const batch = writeBatch(db);
  for (const prod of productsToInsert) {
    const newDocRef = doc(colRef);
    batch.set(newDocRef, {
      ...prod,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(`Adding: ${prod.category} > ${prod.subcategory} > ${prod.name}`);
  }

  await batch.commit();
  console.log(`Successfully added ${productsToInsert.length} products to database!`);
}

seedDatabaseSubcategories().then(() => {
  console.log("Done seeding.");
  process.exit(0);
}).catch((err) => {
  console.error("Error seeding products:", err);
  process.exit(1);
});
