// ProductData.js - Centralized data for grades, packing, quantities, and transport

// Grade Data for all product types
export const varietyGrades = {
  "1121 Basmati": [
    "1121 Steam A+",
    "1121 Steam A",
    "1121 Golden Sella A",
    "1121 Golden Sella A+",
    "1121 White Sella A+",
    "1121 White Sella A"
  ],
  "1509 Basmati": [
    "1509 Steam A+",
    "1509 Steam A",
    "1509 Golden Sella A+",
    "1509 Golden Sella A",
    "1509 White Sella A+",
    "1509 White Sella A"
  ],
  "1401 Basmati": [
    "1401 Steam A+",
    "1401 Steam A",
    "1401 white Sella A+",
    "1401 white Sella A",
    "1401 Golden Sella A+",
    "1401 Golden Sella A"
  ],
  "Pusa Basmati": [
    "Pusa Golden Sella A",
    "Pusa Golden Sella A+",
    "Pusa White Sella A+",
    "Pusa White Sella A",
    "Pusa Steam A",
    "Pusa Steam A+"
  ],
  "Traditional Basmati": [
    "Traditional Golden Sella A",
    "Traditional Golden Sella A+",
    "Traditional White Sella A+",
    "Traditional White Sella A",
    "Traditional Steam A",
    "Traditional Steam A+"
  ],
  "1885 Basmati": [
    "1885 Golden Sella A",
    "1885 Golden Sella A+",
    "1885 White Sella A+",
    "1885 White Sella A",
    "1885 Steam A",
    "1885 Steam A+"
  ],
  "1718 Basmati": [
    "1718 White Sella A+",
    "1718 White Sella A",
    "1718 Golden Sella A+",
    "1718 Golden Sella A",
    "1718 Steam A+",
    "1718 Steam A"
  ],
  "Sugandha (Non-Basmati)": [
    "Sugandha Creamy Parboiled",
    "Sugandha Golden",
    "Sugandha Steam",
    "Sugandha Sella"
  ],
  "Sharbati (Non-Basmati)": [
    "Sharbati Creamy Parboiled",
    "Sharbati Golden",
    "Sharbati Steam",
    "Sharbati Sella"
  ],
  "PR-11/14 (Non-Basmati)": [
    "PR-11/14 Creamy Parboiled",
    "PR-11/14 Golden",
    "PR-11/14 Steam",
    "PR-11/14 Sella"
  ],
  "PR-06/47 (Non-Basmati)": [
    "PR-06/47 Creamy Parboiled",
    "PR-06/47 Golden",
    "PR-06/47 Steam",
    "PR-06/47 Sella"
  ],
  "RH-10 (Non-Basmati)": [
    "Creamy Parboiled",
    "RH-10 Golden",
    "RH-10 Steam",
    "RH-10 Sella"
  ],
  "Sona Masoori (Non-Basmati)": [
    "Sona Masoori Steam",
    "Sona Masoori Sella",
    "Sona Masoori Creamy Parboiled",
    "Sona Masoori Golden"
  ],
  "Long Grain (Non-Basmati)": [
    "Long Grain Parboiled",
    "Long Grain Creamy Parboiled",
    "Long Grain Sella",
    "Long Grain Golden",
    "Long Grain Steam"
  ],
  "IR-8 (Non-Basmati)": [
    "IR-8 Parboiled",
    "IR-8 Creamy Parboiled",
    "IR-8 Sella",
    "IR-8 Golden",
    "IR-8 Steam"
  ],
  "GR-11 (Non-Basmati)": [
    "GR-11 Creamy Parboiled",
    "GR-11 Parboiled",
    "GR-11 Sella",
    "GR-11 Steam",
    "GR-11 Golden"
  ],
  "Swarna (Non-Basmati)": [
    "Swarna Steam",
    "Swarna sella",
    "Swarna Creamy Parboiled",
    "Swarna Parboiled",
    "Swarna Golden"
  ],
  "Kalizeera (Non-Basmati)": [
    "Kalizeera steam",
    "Kalizeera Golden",
    "Kalizeera Creamy Parboiled",
    "Kalizeera Parboiled",
    "Kalizeera Sella"
  ],
  "Ponni Rice (Non-Basmati)": [
    "Pooni Rice Steam",
    "Ponni Rice Sella",
    "Ponni Rice Golden",
    "Ponni Rice Creamy Parboiled",
    "Ponni Rice Parboiled"
  ]
};

export const gradePrices = {
  // Rice Grades
  "1121 Steam A+": "1.10", "1121 Steam A": "1.00", "1121 Golden Sella A": "1.05",
  "1121 Golden Sella A+": "1.15", "1121 White Sella A+": "1.08", "1121 White Sella A": "0.98",
  "1509 Steam A+": "0.95", "1509 Steam A": "0.85", "1509 Golden Sella A+": "1.00",
  "1509 Golden Sella A": "0.90", "1509 White Sella A+": "0.92", "1509 White Sella A": "0.82",
  "1401 Steam A+": "0.85", "1401 Steam A": "0.75", "1401 white Sella A+": "0.82",
  "1401 white Sella A": "0.72", "1401 Golden Sella A+": "0.84", "1401 Golden Sella A": "0.74",
  "Pusa Golden Sella A": "0.82", "Pusa Golden Sella A+": "0.92", "Pusa White Sella A+": "0.88",
  "Pusa White Sella A": "0.78", "Pusa Steam A": "0.80", "Pusa Steam A+": "0.90",
  "Traditional Golden Sella A": "0.78", "Traditional Golden Sella A+": "0.88",
  "Traditional White Sella A+": "0.84", "Traditional White Sella A": "0.74",
  "Traditional Steam A": "0.76", "Traditional Steam A+": "0.86",
  "1885 Golden Sella A": "0.80", "1885 Golden Sella A+": "0.90", "1885 White Sella A+": "0.86",
  "1885 White Sella A": "0.76", "1885 Steam A": "0.78", "1885 Steam A+": "0.88",
  "1718 White Sella A+": "0.86", "1718 White Sella A": "0.76", "1718 Golden Sella A+": "0.88",
  "1718 Golden Sella A": "0.78", "1718 Steam A+": "0.84", "1718 Steam A": "0.74",
  
  // Non-Basmati Rice Grades
  "Sugandha Creamy Parboiled": "0.55", "Sugandha Golden": "0.50", "Sugandha Steam": "0.52", "Sugandha Sella": "0.50",
  "Sharbati Creamy Parboiled": "0.52", "Sharbati Golden": "0.48", "Sharbati Steam": "0.50", "Sharbati Sella": "0.48",
  "PR-11/14 Creamy Parboiled": "0.50", "PR-11/14 Golden": "0.45", "PR-11/14 Steam": "0.48", "PR-11/14 Sella": "0.45",
  "PR-06/47 Creamy Parboiled": "0.48", "PR-06/47 Golden": "0.43", "PR-06/47 Steam": "0.46", "PR-06/47 Sella": "0.43",
  "Creamy Parboiled": "0.46", "RH-10 Golden": "0.41", "RH-10 Steam": "0.44", "RH-10 Sella": "0.41",
  "Sona Masoori Steam": "0.58", "Sona Masoori Sella": "0.55", "Sona Masoori Creamy Parboiled": "0.60", "Sona Masoori Golden": "0.52",
  "Long Grain Parboiled": "0.44", "Long Grain Creamy Parboiled": "0.48", "Long Grain Sella": "0.42",
  "Long Grain Golden": "0.40", "Long Grain Steam": "0.46",
  "IR-8 Parboiled": "0.38", "IR-8 Creamy Parboiled": "0.42", "IR-8 Sella": "0.36",
  "IR-8 Golden": "0.34", "IR-8 Steam": "0.40",
  "GR-11 Creamy Parboiled": "0.43", "GR-11 Parboiled": "0.38", "GR-11 Sella": "0.36",
  "GR-11 Steam": "0.41", "GR-11 Golden": "0.34",
  "Swarna Steam": "0.42", "Swarna sella": "0.40", "Swarna Creamy Parboiled": "0.46",
  "Swarna Parboiled": "0.38", "Swarna Golden": "0.36",
  "Kalizeera steam": "0.48", "Kalizeera Golden": "0.44", "Kalizeera Creamy Parboiled": "0.52",
  "Kalizeera Parboiled": "0.44", "Kalizeera Sella": "0.42",
  "Pooni Rice Steam": "0.50", "Ponni Rice Sella": "0.48", "Ponni Rice Golden": "0.46",
  "Ponni Rice Creamy Parboiled": "0.54", "Ponni Rice Parboiled": "0.46"
};

// Get available grades for any product type
export const getAvailableGrades = (productType, productData) => {
  // Rice products
  if (productType === 'rice' && productData) {
    const productVariety = productData.variety || '';
    const productName = productData.name || '';
    
    let matchedVariety = null;
    
    if (productVariety && varietyGrades[productVariety]) {
      matchedVariety = productVariety;
    } else if (productVariety) {
      for (const varietyKey in varietyGrades) {
        const cleanVariety = productVariety.replace('Rice', '').replace('rice', '').trim();
        const cleanKey = varietyKey.replace('Rice', '').replace('rice', '').trim();
        if (cleanVariety.includes(cleanKey) || cleanKey.includes(cleanVariety)) {
          matchedVariety = varietyKey;
          break;
        }
      }
    } else if (productName) {
      for (const varietyKey in varietyGrades) {
        const cleanName = productName.replace('Rice', '').replace('rice', '').trim();
        const cleanKey = varietyKey.replace('Rice', '').replace('rice', '').trim();
        if (cleanName.includes(cleanKey) || cleanKey.includes(cleanName)) {
          matchedVariety = varietyKey;
          break;
        }
      }
    }

    if (matchedVariety && varietyGrades[matchedVariety]) {
      return varietyGrades[matchedVariety].map(grade => ({
        value: grade,
        price: gradePrices[grade] || "1.00"
      }));
    }

    const allRiceGrades = Object.values(varietyGrades).flat();
    const uniqueGrades = [...new Set(allRiceGrades)];
    return uniqueGrades.map(grade => ({
      value: grade,
      price: gradePrices[grade] || "1.00"
    }));
  }

  // Other product types
  const gradeOptions = {
    oil: [
      { value: "Extra Virgin", price: "1.20" }, { value: "Virgin", price: "1.10" },
      { value: "Pure", price: "1.00" }, { value: "Refined", price: "0.95" },
      { value: "Cold Pressed", price: "1.25" }, { value: "Organic", price: "1.30" },
      { value: "Premium Quality", price: "1.35" }, { value: "Export Quality", price: "1.28" }
    ],
    construction: [
      { value: "Grade A", price: "1.15" }, { value: "Grade B", price: "1.00" },
      { value: "Industrial Grade", price: "0.90" }, { value: "Commercial Grade", price: "1.05" },
      { value: "Premium Quality", price: "1.25" }, { value: "Standard Quality", price: "0.95" },
      { value: "Structural Grade", price: "1.10" }, { value: "Reinforcement Grade", price: "1.08" },
      { value: "Waterproof Grade", price: "1.20" }, { value: "Weather Resistant", price: "1.18" },
      { value: "Fire Resistant", price: "1.25" }, { value: "Load Bearing", price: "1.12" },
      { value: "High Strength", price: "1.22" }, { value: "Corrosion Resistant", price: "1.15" }
    ],
    fruits: [
      { value: "Grade A", price: "1.10" }, { value: "Grade B", price: "0.95" },
      { value: "Export Quality", price: "1.20" }, { value: "Premium", price: "1.15" },
      { value: "Standard", price: "0.85" }, { value: "Organic", price: "1.25" },
      { value: "Fresh Harvest", price: "1.18" }, { value: "First Quality", price: "1.12" }
    ],
    vegetables: [
      { value: "Grade A", price: "1.05" }, { value: "Grade B", price: "0.90" },
      { value: "Fresh", price: "1.10" }, { value: "Organic", price: "1.15" },
      { value: "Premium", price: "1.08" }, { value: "Standard", price: "0.85" },
      { value: "Farm Fresh", price: "1.06" }, { value: "First Quality", price: "1.03" }
    ],
    pulses: [
      { value: "Premium Grade", price: "1.10" }, { value: "Standard Grade", price: "1.00" },
      { value: "Export Quality", price: "1.15" }, { value: "First Quality", price: "1.05" },
      { value: "Commercial Grade", price: "0.95" }, { value: "Top Quality", price: "1.12" },
      { value: "Superior Quality", price: "1.08" }, { value: "Regular Quality", price: "0.90" },
      { value: "Organic", price: "1.20" }, { value: "Cleaned & Sorted", price: "1.06" }
    ],
    spices: [
      { value: "Premium Grade", price: "1.20" }, { value: "Standard Grade", price: "1.05" },
      { value: "Export Quality", price: "1.25" }, { value: "First Quality", price: "1.15" },
      { value: "Commercial Grade", price: "1.00" }, { value: "A Grade", price: "1.18" },
      { value: "B Grade", price: "1.08" }, { value: "C Grade", price: "0.95" },
      { value: "Top Quality", price: "1.22" }, { value: "Superior Quality", price: "1.12" },
      { value: "Regular Quality", price: "0.98" }, { value: "Organic", price: "1.30" }
    ],
    tea: [
      { value: "Premium Grade", price: "1.25" }, { value: "First Flush", price: "1.35" },
      { value: "Second Flush", price: "1.30" }, { value: "Orthodox", price: "1.40" },
      { value: "CTC", price: "1.15" }, { value: "Green Tea", price: "1.28" },
      { value: "White Tea", price: "1.45" }, { value: "Oolong Tea", price: "1.32" },
      { value: "Darjeeling Tea", price: "1.50" }, { value: "Assam Tea", price: "1.20" },
      { value: "Organic Tea", price: "1.30" }, { value: "Commercial Grade", price: "1.10" }
    ],
    clothing: [
      { value: "Premium Quality", price: "1.30" }, { value: "Export Quality", price: "1.25" },
      { value: "First Quality", price: "1.20" }, { value: "Commercial Grade", price: "1.10" },
      { value: "Standard Quality", price: "1.15" }, { value: "Luxury Grade", price: "1.40" },
      { value: "Boutique Quality", price: "1.35" }, { value: "Mass Market", price: "1.05" },
      { value: "Designer Grade", price: "1.45" }, { value: "Economy Grade", price: "1.00" }
    ],
    chocolate: [
      { value: "Premium Grade", price: "1.25" }, { value: "Belgian Chocolate", price: "1.35" },
      { value: "Swiss Chocolate", price: "1.32" }, { value: "Dark Chocolate", price: "1.20" },
      { value: "Milk Chocolate", price: "1.15" }, { value: "White Chocolate", price: "1.18" },
      { value: "Organic Chocolate", price: "1.28" }, { value: "Sugar-Free", price: "1.22" },
      { value: "Commercial Grade", price: "1.10" }, { value: "Artisanal", price: "1.40" },
      { value: "Couverture", price: "1.38" }, { value: "Compound", price: "1.08" }
    ],
    beverages: [
      { value: "Premium Grade", price: "1.15" }, { value: "Natural", price: "1.18" },
      { value: "Organic", price: "1.22" }, { value: "Sugar-Free", price: "1.20" },
      { value: "Concentrate", price: "1.10" }, { value: "Ready-to-Drink", price: "1.25" },
      { value: "Commercial Grade", price: "1.05" }, { value: "Export Quality", price: "1.23" },
      { value: "First Quality", price: "1.12" }, { value: "Standard Quality", price: "1.08" }
    ],
    perfume: [
      { value: "Premium Grade", price: "1.35" }, { value: "Luxury", price: "1.45" },
      { value: "Designer", price: "1.40" }, { value: "Niche", price: "1.50" },
      { value: "Export Quality", price: "1.32" }, { value: "Commercial Grade", price: "1.20" },
      { value: "First Quality", price: "1.28" }, { value: "Standard Quality", price: "1.25" },
      { value: "Organic", price: "1.38" }, { value: "Natural", price: "1.42" }
    ],
    flowers: [
      { value: "Premium Grade", price: "1.10" }, { value: "Export Quality", price: "1.15" },
      { value: "First Quality", price: "1.08" }, { value: "Commercial Grade", price: "1.00" },
      { value: "Standard Quality", price: "1.05" }, { value: "Luxury Grade", price: "1.20" },
      { value: "Organic", price: "1.12" }, { value: "Fresh Cut", price: "1.06" },
      { value: "Bouquet Quality", price: "1.18" }, { value: "Event Grade", price: "0.95" }
    ],
    dryfruits: [
      { value: "Premium Grade", price: "1.25" }, { value: "Export Quality", price: "1.30" },
      { value: "First Quality", price: "1.22" }, { value: "Commercial Grade", price: "1.10" },
      { value: "Standard Quality", price: "1.15" }, { value: "Organic", price: "1.35" },
      { value: "Natural", price: "1.28" }, { value: "Roasted", price: "1.20" },
      { value: "Raw", price: "1.18" }, { value: "Salted", price: "1.23" },
      { value: "Unsalted", price: "1.22" }, { value: "Blanched", price: "1.26" }
    ],
    gadgets: [
      { value: "Premium Grade", price: "1.30" }, { value: "Brand New", price: "1.35" },
      { value: "Refurbished", price: "1.20" }, { value: "Original", price: "1.32" },
      { value: "Standard Quality", price: "1.25" }, { value: "Export Quality", price: "1.38" },
      { value: "First Quality", price: "1.28" }
    ],
    default: [
      { value: "Premium Grade", price: "1.10" }, { value: "Standard Grade", price: "1.00" },
      { value: "Export Quality", price: "1.15" }, { value: "First Quality", price: "1.05" },
      { value: "Commercial Grade", price: "0.95" }, { value: "Grade A", price: "1.08" },
      { value: "Grade B", price: "0.98" }
    ]
  };

  return gradeOptions[productType] || gradeOptions.default;
};

// Packing Data
export const getPackingOptions = (productType, productName = '') => {
  // Construction material specific packing options
  if (productType === 'construction') {
    // Cement specific packing
    if (productName.includes('cement')) {
      return [
        { value: "PP Bags (50kg)", price: "12" },
        { value: "HDPE Bags (50kg)", price: "14" },
        { value: "Paper Bags (50kg)", price: "10" },
        { value: "Jumbo Bags (1 ton)", price: "25" },
        { value: "Bulk Tanker", price: "8" },
        { value: "Loose Bulk", price: "5" },
        { value: "Export Packaging", price: "35" },
        { value: "Custom Packaging", price: "50" }
      ];
    }
    
    // Steel bars specific packing
    if (productName.includes('steel') || productName.includes('rod') || productName.includes('tmt')) {
      return [
        { value: "Steel Bundles", price: "35" },
        { value: "Wire Rod Bundles", price: "25" },
        { value: "Corrugated Boxes", price: "15" },
        { value: "Wooden Crates", price: "30" },
        { value: "Plastic Wrapping", price: "12" },
        { value: "Waterproof Cover", price: "18" },
        { value: "Export Packaging", price: "40" },
        { value: "Custom Packaging", price: "45" }
      ];
    }
    
    // Bricks specific packing
    if (productName.includes('brick')) {
      return [
        { value: "Wooden Pallets", price: "40" },
        { value: "Plastic Pallets", price: "35" },
        { value: "Corrugated Boxes", price: "15" },
        { value: "Brick Pallets", price: "45" },
        { value: "Loose Packing", price: "8" },
        { value: "Weatherproof Cover", price: "20" },
        { value: "Export Packaging", price: "38" },
        { value: "Custom Packaging", price: "42" }
      ];
    }
    
    // Sand, gravel, aggregate specific packing
    if (productName.includes('sand') || productName.includes('gravel') || productName.includes('aggregate')) {
      return [
        { value: "Jumbo Bags", price: "22" },
        { value: "PP Bags", price: "10" },
        { value: "Bulk Truck", price: "15" },
        { value: "Loose Bulk", price: "5" },
        { value: "Container Load", price: "30" },
        { value: "Weatherproof Cover", price: "18" },
        { value: "Export Packaging", price: "32" },
        { value: "Custom Packaging", price: "40" }
      ];
    }
    
    // Concrete blocks specific packing
    if (productName.includes('concrete') && productName.includes('block')) {
      return [
        { value: "Wooden Pallets", price: "38" },
        { value: "Plastic Pallets", price: "32" },
        { value: "Corrugated Boxes", price: "16" },
        { value: "Block Pallets", price: "42" },
        { value: "Loose Packing", price: "10" },
        { value: "Weatherproof Cover", price: "22" },
        { value: "Export Packaging", price: "36" },
        { value: "Custom Packaging", price: "44" }
      ];
    }
    
    // Wood/timber specific packing
    if (productName.includes('wood') || productName.includes('timber') || productName.includes('plywood')) {
      return [
        { value: "Wooden Crates", price: "32" },
        { value: "Plastic Wrapping", price: "14" },
        { value: "Corrugated Boxes", price: "18" },
        { value: "Waterproof Cover", price: "20" },
        { value: "Bundle Packing", price: "16" },
        { value: "Export Packaging", price: "34" },
        { value: "Custom Packaging", price: "38" }
      ];
    }
    
    // Pipes specific packing
    if (productName.includes('pipe')) {
      return [
        { value: "Pipe Bundles", price: "22" },
        { value: "Wooden Crates", price: "28" },
        { value: "Plastic Wrapping", price: "15" },
        { value: "Corrugated Boxes", price: "18" },
        { value: "Waterproof Cover", price: "20" },
        { value: "Export Packaging", price: "32" },
        { value: "Custom Packaging", price: "36" }
      ];
    }
    
    // Tiles specific packing
    if (productName.includes('tile')) {
      return [
        { value: "Tile Boxes", price: "18" },
        { value: "Corrugated Boxes", price: "16" },
        { value: "Wooden Crates", price: "26" },
        { value: "Plastic Wrapping", price: "12" },
        { value: "Protective Corner", price: "14" },
        { value: "Export Packaging", price: "30" },
        { value: "Custom Packaging", price: "34" }
      ];
    }
    
    // Wires specific packing
    if (productName.includes('wire')) {
      return [
        { value: "Wire Coils", price: "20" },
        { value: "Plastic Spools", price: "16" },
        { value: "Corrugated Boxes", price: "14" },
        { value: "Wooden Crates", price: "24" },
        { value: "Waterproof Cover", price: "18" },
        { value: "Export Packaging", price: "28" },
        { value: "Custom Packaging", price: "32" }
      ];
    }
    
    // Marble slabs specific packing
    if (productName.includes('marble') || productName.includes('slab')) {
      return [
        { value: "Glass Crates", price: "28" },
        { value: "Wooden Crates", price: "32" },
        { value: "Protective Corner", price: "22" },
        { value: "Foam Wrapping", price: "18" },
        { value: "Waterproof Cover", price: "24" },
        { value: "Export Packaging", price: "36" },
        { value: "Custom Packaging", price: "40" }
      ];
    }
    
    // Paints specific packing
    if (productName.includes('paint')) {
      return [
        { value: "Paint Cans", price: "15" },
        { value: "Plastic Buckets", price: "12" },
        { value: "Corrugated Boxes", price: "14" },
        { value: "Wooden Crates", price: "22" },
        { value: "Protective Wrapping", price: "16" },
        { value: "Export Packaging", price: "26" },
        { value: "Custom Packaging", price: "30" }
      ];
    }
    
    // Windows glass specific packing
    if (productName.includes('window') || productName.includes('glass')) {
      return [
        { value: "Glass Crates", price: "28" },
        { value: "Wooden Crates", price: "30" },
        { value: "Protective Corner", price: "20" },
        { value: "Foam Wrapping", price: "16" },
        { value: "Waterproof Cover", price: "22" },
        { value: "Export Packaging", price: "34" },
        { value: "Custom Packaging", price: "38" }
      ];
    }
    
    // Default construction packing
    return [
      { value: "Wooden Crates", price: "30" },
      { value: "Plastic Crates", price: "20" },
      { value: "Corrugated Boxes", price: "15" },
      { value: "Steel Boxes", price: "35" },
      { value: "Wooden Pallets", price: "40" },
      { value: "Plastic Pallets", price: "35" },
      { value: "Bulk Packaging", price: "8" },
      { value: "Export Packaging", price: "35" },
      { value: "Custom Packaging", price: "50" }
    ];
  }
  
  const packingOptionsByType = {
    oil: [
      { value: "PET Bottles", price: "8" },
      { value: "Glass Bottles", price: "12" },
      { value: "Plastic Cans", price: "10" },
      { value: "Tin Cans", price: "15" },
      { value: "Flexi Pouches", price: "6" },
      { value: "Drum Packaging", price: "25" },
      { value: "Bulk Tankers", price: "5" },
      { value: "Aseptic Packaging", price: "18" }
    ],
    
    rice: [
      { value: "PP Bags", price: "10" },
      { value: "Non-Woven Bags", price: "15" },
      { value: "Jute Bags", price: "20" },
      { value: "BOPP Bags", price: "16" },
      { value: "LDPE Bags", price: "12" },
      { value: "HDPE Bags", price: "11" },
      { value: "Vacuum Packed", price: "24" },
      { value: "Paper Bags", price: "9" },
      { value: "Bulk Packaging", price: "6" },
      { value: "Custom Packaging", price: "30" }
    ],
    
    pulses: [
      { value: "PP Bags", price: "8" },
      { value: "Jute Bags", price: "18" },
      { value: "LDPE Bags", price: "10" },
      { value: "HDPE Bags", price: "9" },
      { value: "Vacuum Packed", price: "22" },
      { value: "Paper Bags", price: "7" },
      { value: "Bulk Packaging", price: "5" },
      { value: "Retail Pouches", price: "12" }
    ],
    
    spices: [
      { value: "PP Pouches", price: "6" },
      { value: "Aluminum Pouches", price: "15" },
      { value: "Glass Jars", price: "18" },
      { value: "Plastic Jars", price: "12" },
      { value: "Vacuum Packed", price: "20" },
      { value: "Stand-up Pouches", price: "10" },
      { value: "Bulk Bags", price: "8" },
      { value: "Retail Boxes", price: "14" }
    ],
    
    dryfruits: [
      { value: "Vacuum Packed", price: "22" },
      { value: "PP Pouches", price: "8" },
      { value: "Aluminum Foil Bags", price: "16" },
      { value: "Glass Jars", price: "20" },
      { value: "Tin Cans", price: "18" },
      { value: "Stand-up Pouches", price: "12" },
      { value: "Bulk Bags", price: "10" },
      { value: "Gift Boxes", price: "25" }
    ],
    
    tea: [
      { value: "Tea Bags", price: "15" },
      { value: "Aluminum Pouches", price: "12" },
      { value: "Paper Bags", price: "8" },
      { value: "Tin Cans", price: "20" },
      { value: "Glass Jars", price: "18" },
      { value: "Vacuum Packed", price: "16" },
      { value: "Gift Boxes", price: "22" },
      { value: "Bulk Packaging", price: "6" }
    ],
    
    fruits: [
      { value: "Corrugated Boxes", price: "15" },
      { value: "Wooden Crates", price: "25" },
      { value: "Plastic Crates", price: "18" },
      { value: "Mesh Bags", price: "8" },
      { value: "Bulk Packaging", price: "6" },
      { value: "Gift Boxes", price: "22" },
      { value: "Vacuum Packed", price: "20" },
      { value: "Modified Atmosphere", price: "28" }
    ],
    
    vegetables: [
      { value: "Mesh Bags", price: "7" },
      { value: "Corrugated Boxes", price: "12" },
      { value: "Plastic Crates", price: "15" },
      { value: "Jute Bags", price: "10" },
      { value: "Bulk Packaging", price: "5" },
      { value: "Vacuum Packed", price: "18" },
      { value: "Modified Atmosphere", price: "25" },
      { value: "Retail Trays", price: "14" }
    ],
    
    beverages: [
      { value: "Glass Bottles", price: "12" },
      { value: "PET Bottles", price: "8" },
      { value: "Aluminum Cans", price: "10" },
      { value: "Tetra Packs", price: "9" },
      { value: "Plastic Jugs", price: "11" },
      { value: "Bulk Drums", price: "15" },
      { value: "Multi-packs", price: "14" },
      { value: "Gift Packs", price: "20" }
    ],
    
    chocolate: [
      { value: "Foil Wrapping", price: "8" },
      { value: "Paper Boxes", price: "12" },
      { value: "Plastic Boxes", price: "10" },
      { value: "Gift Boxes", price: "18" },
      { value: "Bulk Packaging", price: "6" },
      { value: "Retail Bars", price: "9" },
      { value: "Truffle Boxes", price: "22" },
      { value: "Seasonal Packaging", price: "25" }
    ],
    
    perfume: [
      { value: "Glass Bottles", price: "25" },
      { value: "Premium Boxes", price: "30" },
      { value: "Gift Sets", price: "35" },
      { value: "Travel Packs", price: "20" },
      { value: "Luxury Packaging", price: "40" },
      { value: "Sample Vials", price: "15" },
      { value: "Custom Bottles", price: "45" },
      { value: "Display Boxes", price: "28" }
    ],
    
    flowers: [
      { value: "Bouquet Wrapping", price: "12" },
      { value: "Vase Packaging", price: "18" },
      { value: "Gift Boxes", price: "15" },
      { value: "Floral Foam", price: "10" },
      { value: "Cellophane Wrap", price: "8" },
      { value: "Premium Boxes", price: "22" },
      { value: "Custom Arrangements", price: "25" },
      { value: "Event Packaging", price: "30" }
    ],
    
    clothing: [
      { value: "Poly Bags", price: "6" },
      { value: "Cardboard Boxes", price: "12" },
      { value: "Hanger Packs", price: "15" },
      { value: "Gift Boxes", price: "18" },
      { value: "Vacuum Packed", price: "10" },
      { value: "Bulk Cartons", price: "8" },
      { value: "Premium Packaging", price: "22" },
      { value: "Retail Ready", price: "14" }
    ],
    
    gadgets: [
      { value: "Retail Boxes", price: "25" },
      { value: "Blister Packs", price: "18" },
      { value: "Clamshell Packaging", price: "20" },
      { value: "Gift Boxes", price: "30" },
      { value: "Bulk Cartons", price: "15" },
      { value: "Premium Packaging", price: "35" },
      { value: "Display Boxes", price: "28" },
      { value: "Security Packaging", price: "22" }
    ],
    
    default: [
      { value: "Standard Packaging", price: "10" },
      { value: "Bulk Packaging", price: "6" },
      { value: "Custom Packaging", price: "25" },
      { value: "Retail Packaging", price: "12" },
      { value: "Export Packaging", price: "18" }
    ]
  };
  
  return packingOptionsByType[productType] || packingOptionsByType.default;
};

// Quantity Data
export const getQuantityOptions = (productType, productName = '') => {
  // Construction material specific quantity options
  if (productType === 'construction') {
    // Cement specific quantities
    if (productName.includes('cement')) {
      return [
        { value: "1", label: "1 Bag (50kg)", multiplier: 50, unit: "bags", actualQuantity: 50, actualUnit: "kg" },
        { value: "5", label: "5 Bags (250kg)", multiplier: 250, unit: "bags", actualQuantity: 250, actualUnit: "kg" },
        { value: "10", label: "10 Bags (500kg)", multiplier: 500, unit: "bags", actualQuantity: 500, actualUnit: "kg" },
        { value: "20", label: "20 Bags (1 ton)", multiplier: 1000, unit: "bags", actualQuantity: 1000, actualUnit: "kg" },
        { value: "50", label: "50 Bags (2.5 tons)", multiplier: 2500, unit: "bags", actualQuantity: 2505, actualUnit: "kg" },
        { value: "100", label: "100 Bags (5 tons)", multiplier: 5000, unit: "bags", actualQuantity: 5000, actualUnit: "kg" },
        { value: "200", label: "200 Bags (10 tons)", multiplier: 10000, unit: "bags", actualQuantity: 10000, actualUnit: "kg" },
        { value: "500", label: "500 Bags (25 tons)", multiplier: 25000, unit: "bags", actualQuantity: 25000, actualUnit: "kg" },
        { value: "1000", label: "1,000 Bags (50 tons)", multiplier: 50000, unit: "bags", actualQuantity: 50000, actualUnit: "kg" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "bags", actualQuantity: 0, actualUnit: "kg" }
      ];
    }
    
    // Steel bars specific quantities
    if (productName.includes('steel') || productName.includes('rod') || productName.includes('tmt')) {
      return [
        { value: "100", label: "100 Kg", multiplier: 100, unit: "kg", actualQuantity: 100, actualUnit: "kg" },
        { value: "500", label: "500 Kg", multiplier: 500, unit: "kg", actualQuantity: 500, actualUnit: "kg" },
        { value: "1000", label: "1 Ton", multiplier: 1000, unit: "kg", actualQuantity: 1000, actualUnit: "kg" },
        { value: "2000", label: "2 Tons", multiplier: 2000, unit: "kg", actualQuantity: 2000, actualUnit: "kg" },
        { value: "5000", label: "5 Tons", multiplier: 5000, unit: "kg", actualQuantity: 5000, actualUnit: "kg" },
        { value: "10000", label: "10 Tons", multiplier: 10000, unit: "kg", actualQuantity: 10000, actualUnit: "kg" },
        { value: "1", label: "1 Bundle", multiplier: 2000, unit: "bundles", actualQuantity: 2000, actualUnit: "kg" },
        { value: "2", label: "2 Bundles", multiplier: 4000, unit: "bundles", actualQuantity: 4000, actualUnit: "kg" },
        { value: "5", label: "5 Bundles", multiplier: 10000, unit: "bundles", actualQuantity: 10000, actualUnit: "kg" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg", actualQuantity: 0, actualUnit: "kg" }
      ];
    }
    
    // Bricks specific quantities
    if (productName.includes('brick')) {
      return [
        { value: "100", label: "100 Bricks", multiplier: 100, unit: "pieces", actualQuantity: 100, actualUnit: "pieces" },
        { value: "500", label: "500 Bricks", multiplier: 500, unit: "pieces", actualQuantity: 500, actualUnit: "pieces" },
        { value: "1000", label: "1,000 Bricks", multiplier: 1000, unit: "pieces", actualQuantity: 1000, actualUnit: "pieces" },
        { value: "5000", label: "5,000 Bricks", multiplier: 5000, unit: "pieces", actualQuantity: 5000, actualUnit: "pieces" },
        { value: "10000", label: "10,000 Bricks", multiplier: 10000, unit: "pieces", actualQuantity: 10000, actualUnit: "pieces" },
        { value: "50000", label: "50,000 Bricks", multiplier: 50000, unit: "pieces", actualQuantity: 50000, actualUnit: "pieces" },
        { value: "100000", label: "100,000 Bricks", multiplier: 100000, unit: "pieces", actualQuantity: 100000, actualUnit: "pieces" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "pieces", actualQuantity: 0, actualUnit: "pieces" }
      ];
    }
    
    // Sand, gravel, aggregate specific quantities
    if (productName.includes('sand') || productName.includes('gravel') || productName.includes('aggregate')) {
      return [
        { value: "100", label: "100 Kg", multiplier: 100, unit: "kg", actualQuantity: 100, actualUnit: "kg" },
        { value: "500", label: "500 Kg", multiplier: 500, unit: "kg", actualQuantity: 500, actualUnit: "kg" },
        { value: "1000", label: "1 Ton", multiplier: 1000, unit: "kg", actualQuantity: 1000, actualUnit: "kg" },
        { value: "5000", label: "5 Tons", multiplier: 5000, unit: "kg", actualQuantity: 5000, actualUnit: "kg" },
        { value: "10000", label: "10 Tons", multiplier: 10000, unit: "kg", actualQuantity: 10000, actualUnit: "kg" },
        { value: "25000", label: "25 Tons", multiplier: 25000, unit: "kg", actualQuantity: 25000, actualUnit: "kg" },
        { value: "50000", label: "50 Tons", multiplier: 50000, unit: "kg", actualQuantity: 50000, actualUnit: "kg" },
        { value: "1", label: "1 Truck Load", multiplier: 5000, unit: "trucks", actualQuantity: 5000, actualUnit: "kg" },
        { value: "2", label: "2 Truck Loads", multiplier: 10000, unit: "trucks", actualQuantity: 10000, actualUnit: "kg" },
        { value: "5", label: "5 Truck Loads", multiplier: 25000, unit: "trucks", actualQuantity: 25000, actualUnit: "kg" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg", actualQuantity: 0, actualUnit: "kg" }
      ];
    }
    
    // Concrete blocks specific quantities
    if (productName.includes('concrete') && productName.includes('block')) {
      return [
        { value: "50", label: "50 Blocks", multiplier: 50, unit: "pieces", actualQuantity: 50, actualUnit: "pieces" },
        { value: "100", label: "100 Blocks", multiplier: 100, unit: "pieces", actualQuantity: 100, actualUnit: "pieces" },
        { value: "500", label: "500 Blocks", multiplier: 500, unit: "pieces", actualQuantity: 500, actualUnit: "pieces" },
        { value: "1000", label: "1,000 Blocks", multiplier: 1000, unit: "pieces", actualQuantity: 1000, actualUnit: "pieces" },
        { value: "5000", label: "5,000 Blocks", multiplier: 5000, unit: "pieces", actualQuantity: 5000, actualUnit: "pieces" },
        { value: "10000", label: "10,000 Blocks", multiplier: 10000, unit: "pieces", actualQuantity: 10000, actualUnit: "pieces" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "pieces", actualQuantity: 0, actualUnit: "pieces" }
      ];
    }
    
    // Wood/timber specific quantities
    if (productName.includes('wood') || productName.includes('timber') || productName.includes('plywood')) {
      return [
        { value: "10", label: "10 Sq Ft", multiplier: 10, unit: "sqft", actualQuantity: 10, actualUnit: "sqft" },
        { value: "50", label: "50 Sq Ft", multiplier: 50, unit: "sqft", actualQuantity: 50, actualUnit: "sqft" },
        { value: "100", label: "100 Sq Ft", multiplier: 100, unit: "sqft", actualQuantity: 100, actualUnit: "sqft" },
        { value: "500", label: "500 Sq Ft", multiplier: 500, unit: "sqft", actualQuantity: 500, actualUnit: "sqft" },
        { value: "1000", label: "1,000 Sq Ft", multiplier: 1000, unit: "sqft", actualQuantity: 1000, actualUnit: "sqft" },
        { value: "1", label: "1 Cubic Foot", multiplier: 1, unit: "cubic_feet", actualQuantity: 1, actualUnit: "cubic_feet" },
        { value: "5", label: "5 Cubic Feet", multiplier: 5, unit: "cubic_feet", actualQuantity: 5, actualUnit: "cubic_feet" },
        { value: "10", label: "10 Cubic Feet", multiplier: 10, unit: "cubic_feet", actualQuantity: 10, actualUnit: "cubic_feet" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "sqft", actualQuantity: 0, actualUnit: "sqft" }
      ];
    }
    
    // Pipes specific quantities
    if (productName.includes('pipe')) {
      return [
        { value: "10", label: "10 Meters", multiplier: 10, unit: "meters", actualQuantity: 10, actualUnit: "meters" },
        { value: "50", label: "50 Meters", multiplier: 50, unit: "meters", actualQuantity: 50, actualUnit: "meters" },
        { value: "100", label: "100 Meters", multiplier: 100, unit: "meters", actualQuantity: 100, actualUnit: "meters" },
        { value: "500", label: "500 Meters", multiplier: 500, unit: "meters", actualQuantity: 500, actualUnit: "meters" },
        { value: "1000", label: "1,000 Meters", multiplier: 1000, unit: "meters", actualQuantity: 1000, actualUnit: "meters" },
        { value: "1", label: "1 Piece", multiplier: 1, unit: "pieces", actualQuantity: 1, actualUnit: "pieces" },
        { value: "5", label: "5 Pieces", multiplier: 5, unit: "pieces", actualQuantity: 5, actualUnit: "pieces" },
        { value: "10", label: "10 Pieces", multiplier: 10, unit: "pieces", actualQuantity: 10, actualUnit: "pieces" },
        { value: "50", label: "50 Pieces", multiplier: 50, unit: "pieces", actualQuantity: 50, actualUnit: "pieces" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "meters", actualQuantity: 0, actualUnit: "meters" }
      ];
    }
    
    // Tiles specific quantities
    if (productName.includes('tile')) {
      return [
        { value: "10", label: "10 Sq Ft", multiplier: 10, unit: "sqft", actualQuantity: 10, actualUnit: "sqft" },
        { value: "50", label: "50 Sq Ft", multiplier: 50, unit: "sqft", actualQuantity: 50, actualUnit: "sqft" },
        { value: "100", label: "100 Sq Ft", multiplier: 100, unit: "sqft", actualQuantity: 100, actualUnit: "sqft" },
        { value: "500", label: "500 Sq Ft", multiplier: 500, unit: "sqft", actualQuantity: 500, actualUnit: "sqft" },
        { value: "1000", label: "1,000 Sq Ft", multiplier: 1000, unit: "sqft", actualQuantity: 1000, actualUnit: "sqft" },
        { value: "1", label: "1 Box", multiplier: 10, unit: "boxes", actualQuantity: 10, actualUnit: "sqft" },
        { value: "5", label: "5 Boxes", multiplier: 50, unit: "boxes", actualQuantity: 50, actualUnit: "sqft" },
        { value: "10", label: "10 Boxes", multiplier: 100, unit: "boxes", actualQuantity: 100, actualUnit: "sqft" },
        { value: "50", label: "50 Boxes", multiplier: 500, unit: "boxes", actualQuantity: 500, actualUnit: "sqft" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "sqft", actualQuantity: 0, actualUnit: "sqft" }
      ];
    }
    
    // Wires specific quantities
    if (productName.includes('wire')) {
      return [
        { value: "50", label: "50 Meters", multiplier: 50, unit: "meters", actualQuantity: 50, actualUnit: "meters" },
        { value: "100", label: "100 Meters", multiplier: 100, unit: "meters", actualQuantity: 100, actualUnit: "meters" },
        { value: "500", label: "500 Meters", multiplier: 500, unit: "meters", actualQuantity: 500, actualUnit: "meters" },
        { value: "1000", label: "1,000 Meters", multiplier: 1000, unit: "meters", actualQuantity: 1000, actualUnit: "meters" },
        { value: "1", label: "1 Coil", multiplier: 50, unit: "coils", actualQuantity: 50, actualUnit: "meters" },
        { value: "2", label: "2 Coils", multiplier: 100, unit: "coils", actualQuantity: 100, actualUnit: "meters" },
        { value: "5", label: "5 Coils", multiplier: 250, unit: "coils", actualQuantity: 250, actualUnit: "meters" },
        { value: "10", label: "10 Coils", multiplier: 500, unit: "coils", actualQuantity: 500, actualUnit: "meters" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "meters", actualQuantity: 0, actualUnit: "meters" }
      ];
    }
    
    // Marble slabs specific quantities
    if (productName.includes('marble') || productName.includes('slab')) {
      return [
        { value: "1", label: "1 Slab", multiplier: 1, unit: "pieces", actualQuantity: 1, actualUnit: "pieces" },
        { value: "5", label: "5 Slabs", multiplier: 5, unit: "pieces", actualQuantity: 5, actualUnit: "pieces" },
        { value: "10", label: "10 Slabs", multiplier: 10, unit: "pieces", actualQuantity: 10, actualUnit: "pieces" },
        { value: "20", label: "20 Slabs", multiplier: 20, unit: "pieces", actualQuantity: 20, actualUnit: "pieces" },
        { value: "50", label: "50 Slabs", multiplier: 50, unit: "pieces", actualQuantity: 50, actualUnit: "pieces" },
        { value: "10", label: "10 Sq Ft", multiplier: 10, unit: "sqft", actualQuantity: 10, actualUnit: "sqft" },
        { value: "50", label: "50 Sq Ft", multiplier: 50, unit: "sqft", actualQuantity: 50, actualUnit: "sqft" },
        { value: "100", label: "100 Sq Ft", multiplier: 100, unit: "sqft", actualQuantity: 100, actualUnit: "sqft" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "pieces", actualQuantity: 0, actualUnit: "pieces" }
      ];
    }
    
    // Paints specific quantities
    if (productName.includes('paint')) {
      return [
        { value: "1", label: "1 Liter", multiplier: 1, unit: "liters", actualQuantity: 1, actualUnit: "liters" },
        { value: "5", label: "5 Liters", multiplier: 5, unit: "liters", actualQuantity: 5, actualUnit: "liters" },
        { value: "10", label: "10 Liters", multiplier: 10, unit: "liters", actualQuantity: 10, actualUnit: "liters" },
        { value: "20", label: "20 Liters", multiplier: 20, unit: "liters", actualQuantity: 20, actualUnit: "liters" },
        { value: "50", label: "50 Liters", multiplier: 50, unit: "liters", actualQuantity: 50, actualUnit: "liters" },
        { value: "100", label: "100 Liters", multiplier: 100, unit: "liters", actualQuantity: 100, actualUnit: "liters" },
        { value: "1", label: "1 Bucket", multiplier: 20, unit: "buckets", actualQuantity: 20, actualUnit: "liters" },
        { value: "2", label: "2 Buckets", multiplier: 40, unit: "buckets", actualQuantity: 40, actualUnit: "liters" },
        { value: "5", label: "5 Buckets", multiplier: 100, unit: "buckets", actualQuantity: 100, actualUnit: "liters" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "liters", actualQuantity: 0, actualUnit: "liters" }
      ];
    }
    
    // Windows glass specific quantities
    if (productName.includes('window') || productName.includes('glass')) {
      return [
        { value: "1", label: "1 Piece", multiplier: 1, unit: "pieces", actualQuantity: 1, actualUnit: "pieces" },
        { value: "5", label: "5 Pieces", multiplier: 5, unit: "pieces", actualQuantity: 5, actualUnit: "pieces" },
        { value: "10", label: "10 Pieces", multiplier: 10, unit: "pieces", actualQuantity: 10, actualUnit: "pieces" },
        { value: "20", label: "20 Pieces", multiplier: 20, unit: "pieces", actualQuantity: 20, actualUnit: "pieces" },
        { value: "50", label: "50 Pieces", multiplier: 50, unit: "pieces", actualQuantity: 50, actualUnit: "pieces" },
        { value: "10", label: "10 Sq Ft", multiplier: 10, unit: "sqft", actualQuantity: 10, actualUnit: "sqft" },
        { value: "50", label: "50 Sq Ft", multiplier: 50, unit: "sqft", actualQuantity: 50, actualUnit: "sqft" },
        { value: "100", label: "100 Sq Ft", multiplier: 100, unit: "sqft", actualQuantity: 100, actualUnit: "sqft" },
        { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "pieces", actualQuantity: 0, actualUnit: "pieces" }
      ];
    }
    
    // Default construction quantities
    return [
      { value: "100", label: "100 Kg", multiplier: 100, unit: "kg", actualQuantity: 100, actualUnit: "kg" },
      { value: "500", label: "500 Kg", multiplier: 500, unit: "kg", actualQuantity: 500, actualUnit: "kg" },
      { value: "1000", label: "1 Ton", multiplier: 1000, unit: "kg", actualQuantity: 1000, actualUnit: "kg" },
      { value: "5000", label: "5 Tons", multiplier: 5000, unit: "kg", actualQuantity: 5000, actualUnit: "kg" },
      { value: "10000", label: "10 Tons", multiplier: 10000, unit: "kg", actualQuantity: 10000, actualUnit: "kg" },
      { value: "1", label: "1 Unit", multiplier: 1, unit: "units", actualQuantity: 1, actualUnit: "units" },
      { value: "5", label: "5 Units", multiplier: 5, unit: "units", actualQuantity: 5, actualUnit: "units" },
      { value: "10", label: "10 Units", multiplier: 10, unit: "units", actualQuantity: 10, actualUnit: "units" },
      { value: "50", label: "50 Units", multiplier: 50, unit: "units", actualQuantity: 50, actualUnit: "units" },
      { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "units", actualQuantity: 0, actualUnit: "units" }
    ];
  }
  
  const quantityOptionsByType = {
    oil: [
      { value: "5", label: "5 Liters", multiplier: 5, unit: "liters", actualQuantity: 5, actualUnit: "liters" },
      { value: "10", label: "10 Liters", multiplier: 10, unit: "liters", actualQuantity: 10, actualUnit: "liters" },
      { value: "25", label: "25 Liters", multiplier: 25, unit: "liters", actualQuantity: 25, actualUnit: "liters" },
      { value: "50", label: "50 Liters", multiplier: 50, unit: "liters", actualQuantity: 50, actualUnit: "liters" },
      { value: "100", label: "100 Liters", multiplier: 100, unit: "liters", actualQuantity: 100, actualUnit: "liters" },
      { value: "500", label: "500 Liters", multiplier: 500, unit: "liters", actualQuantity: 500, actualUnit: "liters" },
      { value: "1000", label: "1,000 Liters", multiplier: 1000, unit: "liters", actualQuantity: 1000, actualUnit: "liters" },
      { value: "5000", label: "5,000 Liters", multiplier: 5000, unit: "liters", actualQuantity: 5000, actualUnit: "liters" },
      { value: "10000", label: "10,000 Liters", multiplier: 10000, unit: "liters", actualQuantity: 10000, actualUnit: "liters" },
      { value: "25000", label: "25,000 Liters", multiplier: 25000, unit: "liters", actualQuantity: 25000, actualUnit: "liters" },
      { value: "50000", label: "50,000 Liters", multiplier: 50000, unit: "liters", actualQuantity: 50000, actualUnit: "liters" },
      { value: "100000", label: "100,000 Liters", multiplier: 100000, unit: "liters", actualQuantity: 100000, actualUnit: "liters" },
      { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "liters", actualQuantity: 0, actualUnit: "liters" }
    ],
    
    rice: [
      { value: "5", label: "5 Kg", multiplier: 5, unit: "kg", actualQuantity: 5, actualUnit: "kg" },
      { value: "10", label: "10 Kg", multiplier: 10, unit: "kg", actualQuantity: 10, actualUnit: "kg" },
      { value: "25", label: "25 Kg", multiplier: 25, unit: "kg", actualQuantity: 25, actualUnit: "kg" },
      { value: "50", label: "50 Kg", multiplier: 50, unit: "kg", actualQuantity: 50, actualUnit: "kg" },
      { value: "100", label: "100 Kg", multiplier: 100, unit: "kg", actualQuantity: 100, actualUnit: "kg" },
      { value: "500", label: "500 Kg", multiplier: 500, unit: "kg", actualQuantity: 500, actualUnit: "kg" },
      { value: "1000", label: "1 Ton", multiplier: 1000, unit: "kg", actualQuantity: 1000, actualUnit: "kg" },
      { value: "5000", label: "5 Tons", multiplier: 5000, unit: "kg", actualQuantity: 5000, actualUnit: "kg" },
      { value: "10000", label: "10 Tons", multiplier: 10000, unit: "kg", actualQuantity: 10000, actualUnit: "kg" },
      { value: "25000", label: "25 Tons", multiplier: 25000, unit: "kg", actualQuantity: 25000, actualUnit: "kg" },
      { value: "50000", label: "50 Tons", multiplier: 50000, unit: "kg", actualQuantity: 50000, actualUnit: "kg" },
      { value: "100000", label: "100 Tons", multiplier: 100000, unit: "kg", actualQuantity: 100000, actualUnit: "kg" },
      { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg", actualQuantity: 0, actualUnit: "kg" }
    ],
    
    pulses: [
      { value: "5", label: "5 Kg", multiplier: 5, unit: "kg", actualQuantity: 5, actualUnit: "kg" },
      { value: "10", label: "10 Kg", multiplier: 10, unit: "kg", actualQuantity: 10, actualUnit: "kg" },
      { value: "25", label: "25 Kg", multiplier: 25, unit: "kg", actualQuantity: 25, actualUnit: "kg" },
      { value: "50", label: "50 Kg", multiplier: 50, unit: "kg", actualQuantity: 50, actualUnit: "kg" },
      { value: "100", label: "100 Kg", multiplier: 100, unit: "kg", actualQuantity: 100, actualUnit: "kg" },
      { value: "500", label: "500 Kg", multiplier: 500, unit: "kg", actualQuantity: 500, actualUnit: "kg" },
      { value: "1000", label: "1 Ton", multiplier: 1000, unit: "kg", actualQuantity: 1000, actualUnit: "kg" },
      { value: "5000", label: "5 Tons", multiplier: 5000, unit: "kg", actualQuantity: 5000, actualUnit: "kg" },
      { value: "10000", label: "10 Tons", multiplier: 10000, unit: "kg", actualQuantity: 10000, actualUnit: "kg" },
      { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg", actualQuantity: 0, actualUnit: "kg" }
    ],
    
    spices: [
      { value: "1", label: "1 Kg", multiplier: 1, unit: "kg", actualQuantity: 1, actualUnit: "kg" },
      { value: "5", label: "5 Kg", multiplier: 5, unit: "kg", actualQuantity: 5, actualUnit: "kg" },
      { value: "10", label: "10 Kg", multiplier: 10, unit: "kg", actualQuantity: 10, actualUnit: "kg" },
      { value: "25", label: "25 Kg", multiplier: 25, unit: "kg", actualQuantity: 25, actualUnit: "kg" },
      { value: "50", label: "50 Kg", multiplier: 50, unit: "kg", actualQuantity: 50, actualUnit: "kg" },
      { value: "100", label: "100 Kg", multiplier: 100, unit: "kg", actualQuantity: 100, actualUnit: "kg" },
      { value: "500", label: "500 Kg", multiplier: 500, unit: "kg", actualQuantity: 500, actualUnit: "kg" },
      { value: "1000", label: "1 Ton", multiplier: 1000, unit: "kg", actualQuantity: 1000, actualUnit: "kg" },
      { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg", actualQuantity: 0, actualUnit: "kg" }
    ],
    
    dryfruits: [
      { value: "1", label: "1 Kg", multiplier: 1, unit: "kg", actualQuantity: 1, actualUnit: "kg" },
      { value: "5", label: "5 Kg", multiplier: 5, unit: "kg", actualQuantity: 5, actualUnit: "kg" },
      { value: "10", label: "10 Kg", multiplier: 10, unit: "kg", actualQuantity: 10, actualUnit: "kg" },
      { value: "25", label: "25 Kg", multiplier: 25, unit: "kg", actualQuantity: 25, actualUnit: "kg" },
      { value: "50", label: "50 Kg", multiplier: 50, unit: "kg", actualQuantity: 50, actualUnit: "kg" },
      { value: "100", label: "100 Kg", multiplier: 100, unit: "kg", actualQuantity: 100, actualUnit: "kg" },
      { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg", actualQuantity: 0, actualUnit: "kg" }
    ],
    
    tea: [
      { value: "1", label: "1 Kg", multiplier: 1, unit: "kg", actualQuantity: 1, actualUnit: "kg" },
      { value: "5", label: "5 Kg", multiplier: 5, unit: "kg", actualQuantity: 5, actualUnit: "kg" },
      { value: "10", label: "10 Kg", multiplier: 10, unit: "kg", actualQuantity: 10, actualUnit: "kg" },
      { value: "25", label: "25 Kg", multiplier: 25, unit: "kg", actualQuantity: 25, actualUnit: "kg" },
      { value: "50", label: "50 Kg", multiplier: 50, unit: "kg", actualQuantity: 50, actualUnit: "kg" },
      { value: "100", label: "100 Kg", multiplier: 100, unit: "kg", actualQuantity: 100, actualUnit: "kg" },
      { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg", actualQuantity: 0, actualUnit: "kg" }
    ],
    
    fruits: [
      { value: "5", label: "5 Kg", multiplier: 5, unit: "kg", actualQuantity: 5, actualUnit: "kg" },
      { value: "10", label: "10 Kg", multiplier: 10, unit: "kg", actualQuantity: 10, actualUnit: "kg" },
      { value: "25", label: "25 Kg", multiplier: 25, unit: "kg", actualQuantity: 25, actualUnit: "kg" },
      { value: "50", label: "50 Kg", multiplier: 50, unit: "kg", actualQuantity: 50, actualUnit: "kg" },
      { value: "100", label: "100 Kg", multiplier: 100, unit: "kg", actualQuantity: 100, actualUnit: "kg" },
      { value: "1", label: "1 Box", multiplier: 1, unit: "boxes", actualQuantity: 10, actualUnit: "kg" },
      { value: "5", label: "5 Boxes", multiplier: 5, unit: "boxes", actualQuantity: 50, actualUnit: "kg" },
      { value: "10", label: "10 Boxes", multiplier: 10, unit: "boxes", actualQuantity: 100, actualUnit: "kg" },
      { value: "25", label: "25 Boxes", multiplier: 25, unit: "boxes", actualQuantity: 250, actualUnit: "kg" },
      { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg", actualQuantity: 0, actualUnit: "kg" }
    ],
    
    vegetables: [
      { value: "5", label: "5 Kg", multiplier: 5, unit: "kg", actualQuantity: 5, actualUnit: "kg" },
      { value: "10", label: "10 Kg", multiplier: 10, unit: "kg", actualQuantity: 10, actualUnit: "kg" },
      { value: "25", label: "25 Kg", multiplier: 25, unit: "kg", actualQuantity: 25, actualUnit: "kg" },
      { value: "50", label: "50 Kg", multiplier: 50, unit: "kg", actualQuantity: 50, actualUnit: "kg" },
      { value: "100", label: "100 Kg", multiplier: 100, unit: "kg", actualQuantity: 100, actualUnit: "kg" },
      { value: "1", label: "1 Crate", multiplier: 1, unit: "crates", actualQuantity: 15, actualUnit: "kg" },
      { value: "5", label: "5 Crates", multiplier: 5, unit: "crates", actualQuantity: 75, actualUnit: "kg" },
      { value: "10", label: "10 Crates", multiplier: 10, unit: "crates", actualQuantity: 150, actualUnit: "kg" },
      { value: "25", label: "25 Crates", multiplier: 25, unit: "crates", actualQuantity: 375, actualUnit: "kg" },
      { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg", actualQuantity: 0, actualUnit: "kg" }
    ],
    
    beverages: [
      { value: "12", label: "12 Bottles", multiplier: 12, unit: "bottles", actualQuantity: 12, actualUnit: "pieces" },
      { value: "24", label: "24 Bottles", multiplier: 24, unit: "bottles", actualQuantity: 24, actualUnit: "pieces" },
      { value: "50", label: "50 Bottles", multiplier: 50, unit: "bottles", actualQuantity: 50, actualUnit: "pieces" },
      { value: "100", label: "100 Bottles", multiplier: 100, unit: "bottles", actualQuantity: 100, actualUnit: "pieces" },
      { value: "500", label: "500 Bottles", multiplier: 500, unit: "bottles", actualQuantity: 500, actualUnit: "pieces" },
      { value: "10", label: "10 Liters", multiplier: 10, unit: "liters", actualQuantity: 10, actualUnit: "liters" },
      { value: "25", label: "25 Liters", multiplier: 25, unit: "liters", actualQuantity: 25, actualUnit: "liters" },
      { value: "50", label: "50 Liters", multiplier: 50, unit: "liters", actualQuantity: 50, actualUnit: "liters" },
      { value: "100", label: "100 Liters", multiplier: 100, unit: "liters", actualQuantity: 100, actualUnit: "liters" },
      { value: "500", label: "500 Liters", multiplier: 500, unit: "liters", actualQuantity: 500, actualUnit: "liters" },
      { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "bottles", actualQuantity: 0, actualUnit: "pieces" }
    ],
    
    gadgets: [
      { value: "1", label: "1 Piece", multiplier: 1, unit: "pieces", actualQuantity: 1, actualUnit: "pieces" },
      { value: "5", label: "5 Pieces", multiplier: 5, unit: "pieces", actualQuantity: 5, actualUnit: "pieces" },
      { value: "10", label: "10 Pieces", multiplier: 10, unit: "pieces", actualQuantity: 10, actualUnit: "pieces" },
      { value: "25", label: "25 Pieces", multiplier: 25, unit: "pieces", actualQuantity: 25, actualUnit: "pieces" },
      { value: "50", label: "50 Pieces", multiplier: 50, unit: "pieces", actualQuantity: 50, actualUnit: "pieces" },
      { value: "100", label: "100 Pieces", multiplier: 100, unit: "pieces", actualQuantity: 100, actualUnit: "pieces" },
      { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "pieces", actualQuantity: 0, actualUnit: "pieces" }
    ],
    
    clothing: [
      { value: "1", label: "1 Piece", multiplier: 1, unit: "pieces", actualQuantity: 1, actualUnit: "pieces" },
      { value: "5", label: "5 Pieces", multiplier: 5, unit: "pieces", actualQuantity: 5, actualUnit: "pieces" },
      { value: "10", label: "10 Pieces", multiplier: 10, unit: "pieces", actualQuantity: 10, actualUnit: "pieces" },
      { value: "25", label: "25 Pieces", multiplier: 25, unit: "pieces", actualQuantity: 25, actualUnit: "pieces" },
      { value: "50", label: "50 Pieces", multiplier: 50, unit: "pieces", actualQuantity: 50, actualUnit: "pieces" },
      { value: "100", label: "100 Pieces", multiplier: 100, unit: "pieces", actualQuantity: 100, actualUnit: "pieces" },
      { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "pieces", actualQuantity: 0, actualUnit: "pieces" }
    ],
    
    chocolate: [
      { value: "1", label: "1 Kg", multiplier: 1, unit: "kg", actualQuantity: 1, actualUnit: "kg" },
      { value: "5", label: "5 Kg", multiplier: 5, unit: "kg", actualQuantity: 5, actualUnit: "kg" },
      { value: "10", label: "10 Kg", multiplier: 10, unit: "kg", actualQuantity: 10, actualUnit: "kg" },
      { value: "25", label: "25 Kg", multiplier: 25, unit: "kg", actualQuantity: 25, actualUnit: "kg" },
      { value: "50", label: "50 Kg", multiplier: 50, unit: "kg", actualQuantity: 50, actualUnit: "kg" },
      { value: "100", label: "100 Pieces", multiplier: 100, unit: "pieces", actualQuantity: 100, actualUnit: "pieces" },
      { value: "500", label: "500 Pieces", multiplier: 500, unit: "pieces", actualQuantity: 500, actualUnit: "pieces" },
      { value: "1000", label: "1,000 Pieces", multiplier: 1000, unit: "pieces", actualQuantity: 1000, actualUnit: "pieces" },
      { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg", actualQuantity: 0, actualUnit: "kg" }
    ],
    
    perfume: [
      { value: "1", label: "1 Bottle", multiplier: 1, unit: "bottles", actualQuantity: 1, actualUnit: "pieces" },
      { value: "5", label: "5 Bottles", multiplier: 5, unit: "bottles", actualQuantity: 5, actualUnit: "pieces" },
      { value: "10", label: "10 Bottles", multiplier: 10, unit: "bottles", actualQuantity: 10, actualUnit: "pieces" },
      { value: "25", label: "25 Bottles", multiplier: 25, unit: "bottles", actualQuantity: 25, actualUnit: "pieces" },
      { value: "50", label: "50 Bottles", multiplier: 50, unit: "bottles", actualQuantity: 50, actualUnit: "pieces" },
      { value: "100", label: "100 Bottles", multiplier: 100, unit: "bottles", actualQuantity: 100, actualUnit: "pieces" },
      { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "bottles", actualQuantity: 0, actualUnit: "pieces" }
    ],
    
    flowers: [
      { value: "12", label: "12 Stems", multiplier: 12, unit: "stems", actualQuantity: 12, actualUnit: "pieces" },
      { value: "24", label: "24 Stems", multiplier: 24, unit: "stems", actualQuantity: 24, actualUnit: "pieces" },
      { value: "50", label: "50 Stems", multiplier: 50, unit: "stems", actualQuantity: 50, actualUnit: "pieces" },
      { value: "100", label: "100 Stems", multiplier: 100, unit: "stems", actualQuantity: 100, actualUnit: "pieces" },
      { value: "500", label: "500 Stems", multiplier: 500, unit: "stems", actualQuantity: 500, actualUnit: "pieces" },
      { value: "1", label: "1 Bouquet", multiplier: 1, unit: "bouquets", actualQuantity: 12, actualUnit: "pieces" },
      { value: "5", label: "5 Bouquets", multiplier: 5, unit: "bouquets", actualQuantity: 60, actualUnit: "pieces" },
      { value: "10", label: "10 Bouquets", multiplier: 10, unit: "bouquets", actualQuantity: 120, actualUnit: "pieces" },
      { value: "25", label: "25 Bouquets", multiplier: 25, unit: "bouquets", actualQuantity: 300, actualUnit: "pieces" },
      { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "stems", actualQuantity: 0, actualUnit: "pieces" }
    ],
    
    default: [
      { value: "1", label: "1 Unit", multiplier: 1, unit: "units", actualQuantity: 1, actualUnit: "units" },
      { value: "5", label: "5 Units", multiplier: 5, unit: "units", actualQuantity: 5, actualUnit: "units" },
      { value: "10", label: "10 Units", multiplier: 10, unit: "units", actualQuantity: 10, actualUnit: "units" },
      { value: "25", label: "25 Units", multiplier: 25, unit: "units", actualQuantity: 25, actualUnit: "units" },
      { value: "50", label: "50 Units", multiplier: 50, unit: "units", actualQuantity: 50, actualUnit: "units" },
      { value: "100", label: "100 Units", multiplier: 100, unit: "units", actualQuantity: 100, actualUnit: "units" },
      { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "units", actualQuantity: 0, actualUnit: "units" }
    ]
  };
  
  return quantityOptionsByType[productType] || quantityOptionsByType.default;
};

// State and Port Selection Data - Sorted alphabetically
export const stateOptions = [
  { value: "andhraPradesh", label: "Andhra Pradesh" },
  { value: "gujarat", label: "Gujarat" },
  { value: "haryana", label: "Haryana" },
  { value: "karnataka", label: "Karnataka" },
  { value: "kerala", label: "Kerala" },
  { value: "madhyaPradesh", label: "Madhya Pradesh" },
  { value: "maharashtra", label: "Maharashtra" },
  { value: "punjab", label: "Punjab" },
  { value: "rajasthan", label: "Rajasthan" },
  { value: "tamilnadu", label: "Tamil Nadu" },
  { value: "uttarPradesh", label: "Uttar Pradesh" },
  { value: "westBengal", label: "West Bengal" }
];

// Get port options based on selected state - Sorted alphabetically
export const getPortOptions = (selectedState) => {
  if (!selectedState || !transportData[selectedState]) {
    return [];
  }
  
  const ports = transportData[selectedState].destinations.map(destination => ({
    value: destination.port || destination.location,
    label: destination.port || destination.location,
    prices: destination.prices
  }));
  
  // Sort ports alphabetically by label
  return ports.sort((a, b) => a.label.localeCompare(b.label));
};

// Get transport price based on state, port, and unit type
export const getTransportPrice = (state, port, unitType) => {
  // If port is provided as text, you might need to handle it differently
  // For now, let's assume it returns a default price or handles text ports
  const stateData = transportData.find(t => t.state === state);
  if (!stateData) return "0-0";
  
  // If port is provided, try to find exact match
  if (port && stateData.ports) {
    const portData = stateData.ports.find(p => 
      p.port.toLowerCase() === port.toLowerCase() || 
      p.label.toLowerCase() === port.toLowerCase()
    );
    if (portData) {
      return `${portData.price_min}-${portData.price_max}`;
    }
  }
  
  // Return default state price if no port match
  return `${stateData.default_min}-${stateData.default_max}`;
};

// Transport Data - Original order maintained for TransportPage.js
export const transportData = {
  punjab: {
    name: 'Punjab',
    icon: 'img/Transport/Punjab.avif',
    destinations: [
      { 
        port: 'Kandla Port', 
        prices: {
          kg: '28-32',
          liter: '25-29',
          piece: '35-40'
        }
      },
      { 
        port: 'Mundra Port', 
        prices: {
          kg: '30-35',
          liter: '27-32',
          piece: '38-43'
        }
      },
      { 
        port: 'Nhava Sheva Port', 
        prices: {
          kg: '32-38',
          liter: '29-35',
          piece: '40-46'
        }
      }
    ]
  },
  haryana: {
    name: 'Haryana',
    icon: 'img/Transport/haryana.jpg',
    destinations: [
      { 
        location: 'Cheeka - Kandla Port', 
        prices: {
          kg: '25-29',
          liter: '22-26',
          piece: '32-37'
        }
      },
      { 
        location: 'Cheeka - Mundra Port', 
        prices: {
          kg: '27-32',
          liter: '24-29',
          piece: '34-40'
        }
      },
      { 
        location: 'Sonipat/Kamal - Mundra Port', 
        prices: {
          kg: '28-33',
          liter: '25-30',
          piece: '35-41'
        }
      },
      { 
        location: 'Tohana/Sirsa - Kandla Port', 
        prices: {
          kg: '26-30',
          liter: '23-27',
          piece: '33-38'
        }
      },
      { 
        location: 'Tohana/Sirsa - Mundra Port', 
        prices: {
          kg: '28-33',
          liter: '25-30',
          piece: '35-41'
        }
      }
    ]
  },
  rajasthan: {
    name: 'Rajasthan',
    icon: 'img/Transport/Rajasthan.jpg',
    destinations: [
      { 
        location: 'Bundi - Kandla Port', 
        prices: {
          kg: '22-26',
          liter: '19-23',
          piece: '29-34'
        }
      },
      { 
        location: 'Bundi - Mundra Port', 
        prices: {
          kg: '25-29',
          liter: '22-26',
          piece: '32-37'
        }
      },
      { 
        location: 'Kota - Kandla Port', 
        prices: {
          kg: '23-27',
          liter: '20-24',
          piece: '30-35'
        }
      },
      { 
        location: 'Kota - Mundra Port', 
        prices: {
          kg: '26-30',
          liter: '23-27',
          piece: '33-38'
        }
      }
    ]
  },
  madhyaPradesh: {
    name: 'Madhya Pradesh',
    icon: 'img/Transport/Madhya_Pradesh.jpg',
    destinations: [
      { 
        location: 'Mandideep - Kandla Port', 
        prices: {
          kg: '20-24',
          liter: '17-21',
          piece: '27-32'
        }
      },
      { 
        location: 'Mandideep - Mundra Port', 
        prices: {
          kg: '22-26',
          liter: '19-23',
          piece: '29-34'
        }
      },
      { 
        location: 'Mandideep - Nhava Sheva', 
        prices: {
          kg: '24-28',
          liter: '21-25',
          piece: '31-36'
        }
      },
      { 
        location: 'Pipariya - Kandla Port', 
        prices: {
          kg: '21-25',
          liter: '18-22',
          piece: '28-33'
        }
      },
      { 
        location: 'Pipariya - Mundra Port', 
        prices: {
          kg: '23-27',
          liter: '20-24',
          piece: '30-35'
        }
      },
      { 
        location: 'Pipariya - Nhava Sheva', 
        prices: {
          kg: '25-29',
          liter: '22-26',
          piece: '32-37'
        }
      }
    ]
  },
  uttarPradesh: {
    name: 'Uttar Pradesh',
    icon: 'img/Transport/Uttar_Pradesh.jpeg',
    destinations: [
      { 
        location: 'Agra - Kandla Port', 
        prices: {
          kg: '23-27',
          liter: '20-24',
          piece: '30-35'
        }
      },
      { 
        location: 'Agra - Mundra Port', 
        prices: {
          kg: '25-30',
          liter: '22-27',
          piece: '32-38'
        }
      },
      { 
        location: 'Agra - Nhava Sheva', 
        prices: {
          kg: '27-32',
          liter: '24-29',
          piece: '34-40'
        }
      },
      { 
        location: 'Ghaziabad - Kandla Port', 
        prices: {
          kg: '25-29',
          liter: '22-26',
          piece: '32-37'
        }
      },
      { 
        location: 'Ghaziabad - Mundra Port', 
        prices: {
          kg: '27-32',
          liter: '24-29',
          piece: '34-40'
        }
      },
      { 
        location: 'Ghaziabad - Nhava Sheva', 
        prices: {
          kg: '29-34',
          liter: '26-31',
          piece: '36-42'
        }
      },
      { 
        location: 'Kanpur - Kandla Port', 
        prices: {
          kg: '24-28',
          liter: '21-25',
          piece: '31-36'
        }
      },
      { 
        location: 'Kanpur - Mundra Port', 
        prices: {
          kg: '26-31',
          liter: '23-28',
          piece: '33-39'
        }
      },
      { 
        location: 'Kanpur - Nhava Sheva', 
        prices: {
          kg: '28-33',
          liter: '25-30',
          piece: '35-41'
        }
      }
    ]
  },
  gujarat: {
    name: 'Gujarat',
    icon: 'img/Transport/Gujarat.jpg',
    destinations: [
      { 
        port: 'Kandla Port(Deendayal Port)', 
        prices: {
          kg: '18-22',
          liter: '15-19',
          piece: '25-30'
        }
      },
      { 
        port: 'Mundra Port', 
        prices: {
          kg: '20-24',
          liter: '17-21',
          piece: '27-32'
        }
      }
    ]
  },
  westBengal: {
    name: 'West Bengal',
    icon: 'img/Transport/West_Bengal.jpg',
    destinations: [
      { 
        port: 'Haldia Port', 
        prices: {
          kg: '16-20',
          liter: '13-17',
          piece: '23-28'
        }
      },
      { 
        port: 'Syamaprasad Mookerjee Port(Kolkata)', 
        prices: {
          kg: '15-18',
          liter: '12-15',
          piece: '22-26'
        }
      }
    ]
  },
  andhraPradesh: {
    name: 'Andhra Pradesh',
    icon: 'img/Transport/Andhra_Pradesh.jpg',
    destinations: [
      { 
        port: 'Gangavaram Port', 
        prices: {
          kg: '17-21',
          liter: '14-18',
          piece: '24-29'
        }
      },
      { 
        port: 'Kakinada Port', 
        prices: {
          kg: '15-19',
          liter: '12-16',
          piece: '22-27'
        }
      },
      { 
        port: 'Krishnapatnam Port', 
        prices: {
          kg: '18-22',
          liter: '15-19',
          piece: '25-30'
        }
      },
      { 
        port: 'Viskapatanam Port', 
        prices: {
          kg: '16-20',
          liter: '13-17',
          piece: '23-28'
        }
      }
    ]
  },
  tamilnadu: {
    name: 'Tamil Nadu',
    icon: 'img/Transport/chennai.jpg',
    destinations: [
      { 
        port: 'Chennai Port', 
        prices: {
          kg: '18-22',
          liter: '15-19',
          piece: '25-30'
        }
      },
      { 
        port: 'Kamarajar Port', 
        prices: {
          kg: '19-23',
          liter: '16-20',
          piece: '26-31'
        }
      },
      { 
        port: 'Thoothukudi Port', 
        prices: {
          kg: '20-24',
          liter: '17-21',
          piece: '27-32'
        }
      }
    ]
  },
  karnataka: {
    name: 'Karnataka',
    icon: 'img/Transport/Mangalore.jpg',
    destinations: [
      { 
        port: 'New Mangalore Port', 
        prices: {
          kg: '20-24',
          liter: '17-21',
          piece: '27-32'
        }
      }
    ]
  },
  maharashtra: {
    name: 'Maharashtra',
    icon: 'img/Transport/JNPT.jpg',
    destinations: [
      { 
        port: 'Jawaharlal Nehru Port Trust (JNPT)', 
        prices: {
          kg: '17-21',
          liter: '14-18',
          piece: '24-29'
        }
      },
      { 
        port: 'Mumbai Port', 
        prices: {
          kg: '18-22',
          liter: '15-19',
          piece: '25-30'
        }
      },
      { 
        port: 'Vadhavan Port', 
        prices: {
          kg: '19-23',
          liter: '16-20',
          piece: '26-31'
        }
      }
    ]
  },
  kerala: {
    name: 'Kerala',
    icon: 'img/Transport/cochin.jpg',
    destinations: [
      { 
        port: 'Cochin Port (Kochi)', 
        prices: {
          kg: '19-23',
          liter: '16-20',
          piece: '26-31'
        }
      },
      { 
        port: 'Vizhinjam International Seaport (Thiruvananthapuram)', 
        prices: {
          kg: '20-24',
          liter: '17-21',
          piece: '27-32'
        }
      }
    ]
  }
};

// Helper function to get packing unit for display
export const getPackingUnit = (packingValue) => {
  if (!packingValue) return "unit";
  
  const packingLower = packingValue.toLowerCase();
  
  // Boxes and cases
  if (packingLower.includes('box') || packingLower.includes('case') || 
      packingLower.includes('gift') || packingLower.includes('display')) {
    return "box";
  }
  
  // Bags
  if (packingLower.includes('bag') || packingLower.includes('pouch') || 
      packingLower.includes('sack')) {
    return "bag";
  }
  
  // Bottles
  if (packingLower.includes('bottle') || packingLower.includes('jar') || 
      packingLower.includes('vial')) {
    return "bottle";
  }
  
  // Cans and containers
  if (packingLower.includes('can') || packingLower.includes('tin') || 
      packingLower.includes('drum') || packingLower.includes('container')) {
    return "can";
  }
  
  // Crates
  if (packingLower.includes('crate') || packingLower.includes('pallet')) {
    return "crate";
  }
  
  // Wrapping
  if (packingLower.includes('wrap') || packingLower.includes('foil') || 
      packingLower.includes('cellophane')) {
    return "wrap";
  }
  
  // Sets and packs
  if (packingLower.includes('set') || packingLower.includes('pack') || 
      packingLower.includes('multi-pack')) {
    return "set";
  }
  
  // Construction specific
  if (packingLower.includes('bundle') || packingLower.includes('coil')) {
    return "bundle";
  }
  
  if (packingLower.includes('silo') || packingLower.includes('tanker')) {
    return "unit";
  }
  
  // Default to unit
  return "unit";
};

// Helper function to get unit type for transport pricing
export const getUnitType = (productType, productName = '') => {
  if (productType === 'construction') {
    if (productName.includes('cement') || productName.includes('steel') || 
        productName.includes('sand') || productName.includes('gravel') || 
        productName.includes('aggregate')) {
      return 'kg';
    } else if (productName.includes('brick') || productName.includes('block') || 
               productName.includes('tile') || productName.includes('slab')) {
      return 'piece';
    }
  }
  
  const unitTypeMap = {
    oil: 'liter',
    rice: 'kg',
    pulses: 'kg',
    spices: 'kg',
    dryfruits: 'kg',
    tea: 'kg',
    fruits: 'kg',
    vegetables: 'kg',
    chocolate: 'kg',
    beverages: 'liter',
    gadgets: 'piece',
    clothing: 'piece',
    perfume: 'piece',
    flowers: 'piece',
    default: 'kg'
  };
  
  return unitTypeMap[productType] || 'kg';
};