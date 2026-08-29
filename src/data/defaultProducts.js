export const DEFAULT_PRODUCTS = [
  // ==========================================
  // ELECTRICAL PRODUCTS
  // ==========================================
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
    name: "Philips Bright LED Batten Tube Light",
    category: "Electrical",
    subcategory: "Lighting & Fixtures",
    brand: "Philips",
    hsnCode: "9405",
    gstRate: 12,
    description: "Cool day white 6500K energy efficient LED Batten",
    variants: [
      { size: "10W (1 Foot / 300mm)", price: 190, mrp: 260, stock: 35, unit: "Pcs", barcode: "PHI-BAT-10W" },
      { size: "20W (4 Feet / 1200mm)", price: 280, mrp: 399, stock: 90, unit: "Pcs", barcode: "PHI-BAT-20W" },
      { size: "28W Super Bright (4 Feet)", price: 390, mrp: 550, stock: 40, unit: "Pcs", barcode: "PHI-BAT-28W" }
    ]
  },
  {
    name: "Legrand Single Pole (SP) MCB C-Curve",
    category: "Electrical",
    subcategory: "MCB & Distribution",
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
    name: "VIP Heavy Duty PVC Conduit Pipe (3 Meters)",
    category: "Electrical",
    subcategory: "Conduit & Pipes",
    brand: "VIP",
    hsnCode: "3917",
    gstRate: 18,
    description: "Rigid FRLS flame retardant electrical conduit pipe 3m length",
    variants: [
      { size: '19mm (3/4")', price: 68, mrp: 85, stock: 150, unit: "Pcs", barcode: "VIP-CND-19" },
      { size: '20mm Heavy (3/4")', price: 78, mrp: 98, stock: 200, unit: "Pcs", barcode: "VIP-CND-20" },
      { size: '25mm Heavy (1")', price: 110, mrp: 140, stock: 120, unit: "Pcs", barcode: "VIP-CND-25" },
      { size: '32mm Heavy (1.25")', price: 165, mrp: 210, stock: 60, unit: "Pcs", barcode: "VIP-CND-32" }
    ]
  },

  // ==========================================
  // PLUMBING PRODUCTS
  // ==========================================
  {
    name: "Supreme CPVC SDR-11 Hot & Cold Water Pipe (3 Meters)",
    category: "Plumbing",
    subcategory: "Pipes",
    brand: "Supreme",
    hsnCode: "3917",
    gstRate: 18,
    description: "Chlorinated polyvinyl chloride SDR 11 Class 1 pressure pipe 3m (10ft)",
    variants: [
      { size: '1/2" (15mm)', price: 185, mrp: 240, stock: 180, unit: "Pcs", barcode: "SUP-CPVC-050" },
      { size: '3/4" (20mm)', price: 275, mrp: 350, stock: 220, unit: "Pcs", barcode: "SUP-CPVC-075" },
      { size: '1" (25mm)', price: 410, mrp: 520, stock: 160, unit: "Pcs", barcode: "SUP-CPVC-100" },
      { size: '1.25" (32mm)', price: 620, mrp: 780, stock: 70, unit: "Pcs", barcode: "SUP-CPVC-125" },
      { size: '1.5" (40mm)', price: 890, mrp: 1120, stock: 45, unit: "Pcs", barcode: "SUP-CPVC-150" },
      { size: '2" (50mm)', price: 1450, mrp: 1820, stock: 30, unit: "Pcs", barcode: "SUP-CPVC-200" }
    ]
  },
  {
    name: "Supreme CPVC 90 Degree Elbow Fitting",
    category: "Plumbing",
    subcategory: "Fittings",
    brand: "Supreme",
    hsnCode: "3917",
    gstRate: 18,
    description: "Heavy duty leak-proof CPVC solvent weld 90 elbow",
    variants: [
      { size: '1/2" (15mm)', price: 14, mrp: 19, stock: 450, unit: "Pcs", barcode: "CPVC-ELB-050" },
      { size: '3/4" (20mm)', price: 22, mrp: 30, stock: 500, unit: "Pcs", barcode: "CPVC-ELB-075" },
      { size: '1" (25mm)', price: 38, mrp: 52, stock: 350, unit: "Pcs", barcode: "CPVC-ELB-100" },
      { size: '1.25" (32mm)', price: 68, mrp: 90, stock: 120, unit: "Pcs", barcode: "CPVC-ELB-125" },
      { size: '1.5" (40mm)', price: 115, mrp: 155, stock: 80, unit: "Pcs", barcode: "CPVC-ELB-150" },
      { size: '2" (50mm)', price: 210, mrp: 280, stock: 60, unit: "Pcs", barcode: "CPVC-ELB-200" }
    ]
  },
  {
    name: "Supreme CPVC Equal Tee Fitting",
    category: "Plumbing",
    subcategory: "Fittings",
    brand: "Supreme",
    hsnCode: "3917",
    gstRate: 18,
    description: "3-way equal branch CPVC fitting",
    variants: [
      { size: '1/2" (15mm)', price: 18, mrp: 25, stock: 300, unit: "Pcs", barcode: "CPVC-TEE-050" },
      { size: '3/4" (20mm)', price: 29, mrp: 39, stock: 350, unit: "Pcs", barcode: "CPVC-TEE-075" },
      { size: '1" (25mm)', price: 52, mrp: 70, stock: 240, unit: "Pcs", barcode: "CPVC-TEE-100" },
      { size: '1.25" (32mm)', price: 92, mrp: 125, stock: 90, unit: "Pcs", barcode: "CPVC-TEE-125" },
      { size: '1.5" (40mm)', price: 145, mrp: 195, stock: 60, unit: "Pcs", barcode: "CPVC-TEE-150" },
      { size: '2" (50mm)', price: 265, mrp: 355, stock: 45, unit: "Pcs", barcode: "CPVC-TEE-200" }
    ]
  },
  {
    name: "Supreme CPVC Brass Female Threaded Adaptor (FTA)",
    category: "Plumbing",
    subcategory: "Fittings",
    brand: "Supreme",
    hsnCode: "3917",
    gstRate: 18,
    description: "Moulded brass insert for tap & shower connections",
    variants: [
      { size: '1/2" x 1/2"', price: 82, mrp: 110, stock: 200, unit: "Pcs", barcode: "CPVC-BFTA-050" },
      { size: '3/4" x 1/2"', price: 95, mrp: 128, stock: 250, unit: "Pcs", barcode: "CPVC-BFTA-075050" },
      { size: '3/4" x 3/4"', price: 125, mrp: 165, stock: 180, unit: "Pcs", barcode: "CPVC-BFTA-075" },
      { size: '1" x 1/2"', price: 145, mrp: 195, stock: 100, unit: "Pcs", barcode: "CPVC-BFTA-100050" },
      { size: '1" x 1"', price: 195, mrp: 260, stock: 80, unit: "Pcs", barcode: "CPVC-BFTA-100" }
    ]
  },
  {
    name: "Finolex / Astral CPVC Heavy Duty Ball Valve",
    category: "Plumbing",
    subcategory: "Valves",
    brand: "Astral",
    hsnCode: "8481",
    gstRate: 18,
    description: "Quarter-turn smooth water shutoff handle valve",
    variants: [
      { size: '1/2" (15mm)', price: 135, mrp: 180, stock: 90, unit: "Pcs", barcode: "CPVC-BV-050" },
      { size: '3/4" (20mm)', price: 185, mrp: 245, stock: 110, unit: "Pcs", barcode: "CPVC-BV-075" },
      { size: '1" (25mm)', price: 260, mrp: 350, stock: 85, unit: "Pcs", barcode: "CPVC-BV-100" },
      { size: '1.25" (32mm)', price: 420, mrp: 560, stock: 40, unit: "Pcs", barcode: "CPVC-BV-125" },
      { size: '1.5" (40mm)', price: 650, mrp: 850, stock: 30, unit: "Pcs", barcode: "CPVC-BV-150" },
      { size: '2" (50mm)', price: 980, mrp: 1300, stock: 25, unit: "Pcs", barcode: "CPVC-BV-200" }
    ]
  },
  {
    name: "Weld-On / Astral CPVC Solvent Cement",
    category: "Plumbing",
    subcategory: "Solvents & Adhesives",
    brand: "Astral Weld-On",
    hsnCode: "3506",
    gstRate: 18,
    description: "Fast-curing high bond strength CPVC joint adhesive",
    variants: [
      { size: "50 ml Tin", price: 65, mrp: 85, stock: 120, unit: "Tin", barcode: "SOLV-50ML" },
      { size: "100 ml Tin", price: 115, mrp: 150, stock: 150, unit: "Tin", barcode: "SOLV-100ML" },
      { size: "250 ml Tin", price: 240, mrp: 310, stock: 80, unit: "Tin", barcode: "SOLV-250ML" },
      { size: "500 ml Tin", price: 440, mrp: 570, stock: 45, unit: "Tin", barcode: "SOLV-500ML" }
    ]
  },
  {
    name: "Supreme SWR PVC Drainage Pipe (10 Feet Ringfit)",
    category: "Plumbing",
    subcategory: "Drainage",
    brand: "Supreme",
    hsnCode: "3917",
    gstRate: 18,
    description: "Soil, Waste and Rainwater UV-stabilized drainage pipe",
    variants: [
      { size: '75mm (2.5" Type B)', price: 480, mrp: 620, stock: 50, unit: "Pcs", barcode: "SWR-75-B" },
      { size: '110mm (4" Type A)', price: 690, mrp: 880, stock: 75, unit: "Pcs", barcode: "SWR-110-A" },
      { size: '110mm (4" Type B Heavy)', price: 890, mrp: 1140, stock: 80, unit: "Pcs", barcode: "SWR-110-B" },
      { size: '160mm (6" Type B)', price: 1750, mrp: 2200, stock: 25, unit: "Pcs", barcode: "SWR-160-B" }
    ]
  }
];
