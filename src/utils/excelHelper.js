import * as XLSX from 'xlsx';
import { generateUniqueBarcode } from './barcodeHelper';

/**
 * Reads an uploaded Excel/CSV file and parses it into product records
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Read first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('The Excel sheet appears to be empty.');
        }

        // Map and normalize product columns
        const groupedProductsMap = new Map();

        rawJson.forEach((row) => {
          // Normalize column headers to lowercase trimmed strings
          const normalizedRow = {};
          Object.keys(row).forEach((key) => {
            normalizedRow[key.trim().toLowerCase().replace(/[\s_-]+/g, '')] = row[key];
          });

          // Extract fields
          const name = 
            normalizedRow['productname'] || 
            normalizedRow['product'] || 
            normalizedRow['itemname'] || 
            normalizedRow['item'] || 
            normalizedRow['name'] || 
            '';

          if (!name.trim()) return; // skip rows without a product name

          let category = 
            normalizedRow['category'] || 
            normalizedRow['department'] || 
            normalizedRow['cat'] || 
            'General';

          // Categorize as Electrical or Plumbing
          if (/elect|wire|cable|switch|light|socket|mcb|fan|bulb|conduit/i.test(category + ' ' + name)) {
            category = 'Electrical';
          } else if (/plumb|pipe|elbow|tee|valve|cock|faucet|tap|tank|cpvc|upvc|pvc|solvent|drain/i.test(category + ' ' + name)) {
            category = 'Plumbing';
          }

          const subcategory = 
            normalizedRow['subcategory'] || 
            normalizedRow['type'] || 
            normalizedRow['group'] || 
            'General';

          const brand = 
            normalizedRow['brand'] || 
            normalizedRow['company'] || 
            normalizedRow['make'] || 
            '';

          const hsnCode = 
            String(normalizedRow['hsn'] || normalizedRow['hsncode'] || '');

          const gstRate = 
            Number(normalizedRow['gst'] || normalizedRow['gstrate'] || normalizedRow['tax'] || 18);

          // Variant specs
          const size = 
            String(normalizedRow['size'] || normalizedRow['dimension'] || normalizedRow['variant'] || 'Standard').trim();

          const price = 
            Number(normalizedRow['price'] || normalizedRow['sellingprice'] || normalizedRow['rate'] || normalizedRow['sp'] || 0);

          const mrp = 
            Number(normalizedRow['mrp'] || normalizedRow['listprice'] || normalizedRow['retailprice'] || price * 1.2 || 0);

          const stock = 
            Number(normalizedRow['stock'] || normalizedRow['qty'] || normalizedRow['quantity'] || normalizedRow['stockqty'] || 50);

          const unit = 
            String(normalizedRow['unit'] || normalizedRow['uom'] || 'Pcs').trim();

          const rawBarcode = 
            String(normalizedRow['barcode'] || normalizedRow['sku'] || normalizedRow['itemcode'] || '').trim();

          const barcode = rawBarcode || generateUniqueBarcode(category);

          // Group by product name + brand + category
          const productKey = `${name.toLowerCase()}___${brand.toLowerCase()}___${category.toLowerCase()}`;

          const variantObj = {
            size: size || 'Standard',
            price: Number(price),
            mrp: Number(mrp) || Number(price),
            stock: Number(stock),
            unit: unit || 'Pcs',
            barcode: barcode
          };

          if (groupedProductsMap.has(productKey)) {
            const existingProd = groupedProductsMap.get(productKey);
            existingProd.variants.push(variantObj);
          } else {
            groupedProductsMap.set(productKey, {
              name: name.trim(),
              category,
              subcategory,
              brand: brand.trim(),
              hsnCode,
              gstRate,
              description: normalizedRow['description'] || '',
              variants: [variantObj]
            });
          }
        });

        const parsedProducts = Array.from(groupedProductsMap.values());
        resolve(parsedProducts);
      } catch (err) {
        console.error('Error parsing Excel file:', err);
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Generates and downloads a sample Excel Template for the user
 */
export const downloadSampleExcelTemplate = () => {
  const sampleData = [
    {
      "Product Name": "Finolex 100% Copper Wire Coil",
      "Category": "Electrical",
      "Subcategory": "Wires & Cables",
      "Brand": "Finolex",
      "Size": "1.5 sq mm",
      "Unit": "Coil",
      "Selling Price": 1980,
      "MRP": 2450,
      "Stock": 50,
      "HSN Code": "8544",
      "GST Rate": 18
    },
    {
      "Product Name": "Finolex 100% Copper Wire Coil",
      "Category": "Electrical",
      "Subcategory": "Wires & Cables",
      "Brand": "Finolex",
      "Size": "2.5 sq mm",
      "Unit": "Coil",
      "Selling Price": 3180,
      "MRP": 3950,
      "Stock": 40,
      "HSN Code": "8544",
      "GST Rate": 18
    },
    {
      "Product Name": "Supreme CPVC SDR-11 Pipe (3m)",
      "Category": "Plumbing",
      "Subcategory": "Pipes",
      "Brand": "Supreme",
      "Size": "3/4\" (20mm)",
      "Unit": "Pcs",
      "Selling Price": 275,
      "MRP": 350,
      "Stock": 100,
      "HSN Code": "3917",
      "GST Rate": 18
    },
    {
      "Product Name": "Supreme CPVC 90 Deg Elbow",
      "Category": "Plumbing",
      "Subcategory": "Fittings",
      "Brand": "Supreme",
      "Size": "3/4\" (20mm)",
      "Unit": "Pcs",
      "Selling Price": 22,
      "MRP": 30,
      "Stock": 300,
      "HSN Code": "3917",
      "GST Rate": 18
    },
    {
      "Product Name": "Anchor Roma 1-Way Switch",
      "Category": "Electrical",
      "Subcategory": "Switches & Sockets",
      "Brand": "Anchor",
      "Size": "6A (1M)",
      "Unit": "Pcs",
      "Selling Price": 32,
      "MRP": 45,
      "Stock": 200,
      "HSN Code": "8536",
      "GST Rate": 18
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  // Adjust column widths
  worksheet['!cols'] = [
    { wch: 32 }, // Product Name
    { wch: 15 }, // Category
    { wch: 18 }, // Subcategory
    { wch: 15 }, // Brand
    { wch: 15 }, // Size
    { wch: 10 }, // Unit
    { wch: 14 }, // Selling Price
    { wch: 12 }, // MRP
    { wch: 10 }, // Stock
    { wch: 12 }, // HSN Code
    { wch: 10 }  // GST Rate
  ];

  XLSX.writeFile(workbook, "Mahaganapathy_Product_Import_Template.xlsx");
};

/**
 * Export full catalog to Excel
 */
export const exportProductsToExcel = (products) => {
  const rows = [];
  products.forEach((prod) => {
    if (prod.variants && prod.variants.length > 0) {
      prod.variants.forEach((v) => {
        rows.push({
          "Product Name": prod.name,
          "Category": prod.category,
          "Subcategory": prod.subcategory || '',
          "Brand": prod.brand || '',
          "Size / Variant": v.size,
          "Unit": v.unit || 'Pcs',
          "Selling Price (₹)": v.price,
          "MRP (₹)": v.mrp || v.price,
          "Stock Quantity": v.stock || 0,
          "Barcode / SKU": v.barcode || '',
          "HSN Code": prod.hsnCode || '',
          "GST %": prod.gstRate || 18
        });
      });
    }
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
  XLSX.writeFile(workbook, `Mahaganapathy_Products_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
