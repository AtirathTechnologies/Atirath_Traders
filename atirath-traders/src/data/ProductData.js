// ProductData.js - Centralized data for transport and rice packing only
// All other data comes from Firebase

// ============================================
// RICE PACKING OPTIONS ONLY - KEEP THIS
// ============================================
export const ricePackingOptions = [
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
];

// ============================================
// QUANTITY OPTIONS - CENTRALIZED
// ============================================

// Standard quantity options for products in kg
export const kgQuantityOptions = [
  { value: "1", label: "1 kg", multiplier: 1, unit: "kg", actualQuantity: 1, actualUnit: "kg" },
  { value: "5", label: "5 kg", multiplier: 5, unit: "kg", actualQuantity: 5, actualUnit: "kg" },
  { value: "10", label: "10 kg", multiplier: 10, unit: "kg", actualQuantity: 10, actualUnit: "kg" },
  { value: "25", label: "25 kg", multiplier: 25, unit: "kg", actualQuantity: 25, actualUnit: "kg" },
  { value: "50", label: "50 kg", multiplier: 50, unit: "kg", actualQuantity: 50, actualUnit: "kg" },
  { value: "100", label: "100 kg (1 Quintal)", multiplier: 100, unit: "kg", actualQuantity: 100, actualUnit: "kg" },
  { value: "500", label: "500 kg (5 Quintals)", multiplier: 500, unit: "kg", actualQuantity: 500, actualUnit: "kg" },
  { value: "1000", label: "1000 kg (1 Ton)", multiplier: 1000, unit: "kg", actualQuantity: 1000, actualUnit: "kg" },
  { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "kg", actualQuantity: 0, actualUnit: "kg" }
];

// Standard quantity options for carton-based products
export const cartonQuantityOptions = (unitsPerCarton = 48) => [
  { value: "1", label: `1 Carton (${unitsPerCarton} units)`, multiplier: 1, unit: "cartons", actualQuantity: 1, actualUnit: "cartons" },
  { value: "5", label: `5 Cartons (${unitsPerCarton * 5} units)`, multiplier: 5, unit: "cartons", actualQuantity: 5, actualUnit: "cartons" },
  { value: "10", label: `10 Cartons (${unitsPerCarton * 10} units)`, multiplier: 10, unit: "cartons", actualQuantity: 10, actualUnit: "cartons" },
  { value: "20", label: `20 Cartons (${unitsPerCarton * 20} units)`, multiplier: 20, unit: "cartons", actualQuantity: 20, actualUnit: "cartons" },
  { value: "50", label: `50 Cartons (${unitsPerCarton * 50} units)`, multiplier: 50, unit: "cartons", actualQuantity: 50, actualUnit: "cartons" },
  { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "cartons", actualQuantity: 0, actualUnit: "cartons" }
];

// Default quantity options for other products
export const defaultQuantityOptions = [
  { value: "custom", label: "Custom Quantity", multiplier: 1, unit: "units", actualQuantity: 0, actualUnit: "units" }
];

// Helper function to get quantity options based on product type
export const getQuantityOptionsForProduct = (product) => {
  if (!product) return defaultQuantityOptions;
  
  const isCartonBased = product?.price_usd_per_carton ||
    product?.fob_price_usd ||
    product?.["Ex-Mill_usd"] ||
    (product?.packaging && product.packaging.units_per_carton);

  const isRice = product?.companyName?.toLowerCase().includes('siea') ||
                 product?.name?.toLowerCase().includes('rice') ||
                 (product?.price?.min !== undefined && product?.price?.max !== undefined);

  if (isCartonBased) {
    const unitsPerCarton = product?.packaging?.units_per_carton || 48;
    return cartonQuantityOptions(unitsPerCarton);
  }

  if (isRice || product?.price?.min !== undefined) {
    return kgQuantityOptions;
  }
  
  return defaultQuantityOptions;
};

// Helper function to get quantity unit based on product
export const getQuantityUnit = (product) => {
  if (!product) return 'units';
  
  const isCartonBased = product?.price_usd_per_carton ||
    product?.fob_price_usd ||
    product?.["Ex-Mill_usd"] ||
    (product?.packaging && product.packaging.units_per_carton);

  if (isCartonBased) {
    return "cartons";
  }

  const isRice = product?.companyName?.toLowerCase().includes('siea') ||
                 product?.name?.toLowerCase().includes('rice') ||
                 (product?.price?.min !== undefined && product?.price?.max !== undefined);

  if (isRice) {
    return 'kg';
  }

  const productType = product?.category?.toLowerCase() || '';
  
  switch (productType) {
    case 'rice': return 'kg';
    case 'oil': return 'liters';
    case 'beverages': return 'bottles';
    case 'dryfruits': return 'kg';
    case 'spices': return 'kg';
    case 'tea': return 'kg';
    case 'pulses': return 'kg';
    default: return 'units';
  }
};

// ============================================
// TRANSPORT DATA - KEEP THIS
// ============================================

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

// Get port options based on selected state
export const getPortOptions = (selectedState) => {
  if (!selectedState || !transportData[selectedState]) {
    return [];
  }
  
  const ports = transportData[selectedState].destinations.map(destination => ({
    value: destination.port || destination.location,
    label: destination.port || destination.location,
    prices: destination.prices
  }));
  
  return ports.sort((a, b) => a.label.localeCompare(b.label));
};

// Get transport price based on state, port, and unit type
export const getTransportPrice = (state, port, unitType) => {
  const stateData = transportData[state];
  if (!stateData) return "0-0";
  
  if (port) {
    const destination = stateData.destinations.find(d => 
      (d.port && d.port.toLowerCase() === port.toLowerCase()) || 
      (d.location && d.location.toLowerCase() === port.toLowerCase())
    );
    if (destination && destination.prices) {
      return destination.prices[unitType] || `${stateData.default_min || 20}-${stateData.default_max || 30}`;
    }
  }
  
  return `${stateData.default_min || 20}-${stateData.default_max || 30}`;
};

// Transport Data
export const transportData = {
  punjab: {
    name: 'Punjab',
    icon: 'img/Transport/Punjab.webp',
    default_min: 28,
    default_max: 38,
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
    icon: 'img/Transport/haryana.webp',
    default_min: 25,
    default_max: 33,
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
    icon: 'img/Transport/Rajasthan.webp',
    default_min: 22,
    default_max: 30,
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
    icon: 'img/Transport/Madhya_Pradesh.webp',
    default_min: 20,
    default_max: 29,
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
    icon: 'img/Transport/Uttar_Pradesh.webp',
    default_min: 23,
    default_max: 34,
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
    icon: 'img/Transport/Gujarat.webp',
    default_min: 18,
    default_max: 24,
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
    icon: 'img/Transport/West_Bengal.webp',
    default_min: 15,
    default_max: 20,
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
    icon: 'img/Transport/Andhra_Pradesh.webp',
    default_min: 15,
    default_max: 22,
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
    icon: 'img/Transport/chennai.webp',
    default_min: 18,
    default_max: 24,
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
    icon: 'img/Transport/Mangalore.webp',
    default_min: 20,
    default_max: 24,
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
    icon: 'img/Transport/JNPT.webp',
    default_min: 17,
    default_max: 23,
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
    icon: 'img/Transport/cochin.webp',
    default_min: 19,
    default_max: 24,
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
  
  if (packingLower.includes('box') || packingLower.includes('case')) {
    return "box";
  }
  if (packingLower.includes('bag') || packingLower.includes('pouch') || packingLower.includes('sack')) {
    return "bag";
  }
  if (packingLower.includes('bottle') || packingLower.includes('jar') || packingLower.includes('vial')) {
    return "bottle";
  }
  if (packingLower.includes('can') || packingLower.includes('tin') || packingLower.includes('drum')) {
    return "can";
  }
  if (packingLower.includes('crate') || packingLower.includes('pallet')) {
    return "crate";
  }
  if (packingLower.includes('wrap') || packingLower.includes('foil') || packingLower.includes('cellophane')) {
    return "wrap";
  }
  if (packingLower.includes('set') || packingLower.includes('pack') || packingLower.includes('multi-pack')) {
    return "set";
  }
  if (packingLower.includes('bundle') || packingLower.includes('coil')) {
    return "bundle";
  }
  
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