import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, set, remove } from "firebase/database";
import { app } from "../../firebase";

export default function Products() {
  const db = getDatabase(app);

  const [data, setData] = useState({
    categories: {},
    companies: {},
    brands: {},
    products: {}
  });
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterBrand, setFilterBrand] = useState("");

  // Forms
  const [categoryForm, setCategoryForm] = useState({
    key: "",
    name: "",
    description: "",
    image: ""
  });

  const [companyForm, setCompanyForm] = useState({
    key: "",
    name: "",
    logo: "",
    description: ""
  });

  const [brandForm, setBrandForm] = useState({
    key: "",
    name: "",
    companyId: "",
    description: "",
    image: ""
  });

  const [productForm, setProductForm] = useState({
    key: "",
    companyId: "",
    brandId: "",
    categoryId: "",
    name: "",
    image: "",
    hsn_code: "",
    origin: "",
    product_description: "",
    is_new: false,
    
    // All price fields
    price_min: "",
    price_max: "",
    price_unit: "",
    grades: [],
    
    // Packaging fields
    packaging_units_per_carton: "",
    packaging_unit_weight_g: "",
    packaging_unit_weight_ml: "",
    
    // Multiple price type fields
    price_usd_per_carton: "",
    price_per_unit: "",
    fob_price_usd: "",
    fob_price_per_unit: "",
    "Ex-Mill_usd": "",
    ex_mill_per_unit: "",
    wholesale_price: "",
    retail_price: "",
    
    // Additional fields
    shelf_life: "",
    pack_type: "",
    moq: "", // Minimum Order Quantity
    lead_time: ""
  });

  const [editingType, setEditingType] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  const [activeTab, setActiveTab] = useState("categories");

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    console.log("Starting to fetch data from Firebase...");
    setLoading(true);
    setError(null);
    
    const categoriesRef = ref(db, "categories");
    const companiesRef = ref(db, "companies");
    const brandsRef = ref(db, "brands");
    const productsRef = ref(db, "products");

    const fetchData = async () => {
      try {
        console.log("Fetching data from separate collections...");
        
        const [categoriesSnap, companiesSnap, brandsSnap, productsSnap] = await Promise.all([
          new Promise(resolve => onValue(categoriesRef, resolve, { onlyOnce: true })),
          new Promise(resolve => onValue(companiesRef, resolve, { onlyOnce: true })),
          new Promise(resolve => onValue(brandsRef, resolve, { onlyOnce: true })),
          new Promise(resolve => onValue(productsRef, resolve, { onlyOnce: true }))
        ]);

        const data = {
          categories: categoriesSnap.exists() ? categoriesSnap.val() : {},
          companies: companiesSnap.exists() ? companiesSnap.val() : {},
          brands: brandsSnap.exists() ? brandsSnap.val() : {},
          products: productsSnap.exists() ? productsSnap.val() : {}
        };

        console.log("Fetched data:", {
          categoriesCount: Object.keys(data.categories).length,
          companiesCount: Object.keys(data.companies).length,
          brandsCount: Object.keys(data.brands).length,
          productsCount: Object.keys(data.products).length
        });

        setData(data);
        
        // Extract categories
        const catList = [];
        if (data.categories) {
          Object.keys(data.categories).forEach(key => {
            catList.push({ 
              key, 
              ...data.categories[key]
            });
          });
        }
        setCategoriesList(catList);

        // Extract companies
        const compList = [];
        if (data.companies) {
          Object.keys(data.companies).forEach(key => {
            compList.push({ 
              key, 
              ...data.companies[key]
            });
          });
        }
        setCompaniesList(compList);

        // Extract brands
        const brList = [];
        if (data.brands) {
          Object.keys(data.brands).forEach(key => {
            brList.push({ 
              key, 
              ...data.brands[key],
              companyName: data.companies?.[data.brands[key].companyId]?.name || ""
            });
          });
        }
        setBrandsList(brList);

        // Extract products
        const prodList = [];
        if (data.products) {
          Object.keys(data.products).forEach(key => {
            const product = data.products[key];
            prodList.push({
              key,
              ...product,
              categoryName: data.categories?.[product.categoryId]?.name || "",
              companyName: data.companies?.[product.companyId]?.name || "",
              brandName: data.brands?.[product.brandId]?.name || ""
            });
          });
        }
        setProductsList(prodList);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(`Error fetching data: ${error.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ================= CATEGORY OPERATIONS ================= */
  const saveCategory = async () => {
    if (!categoryForm.name.trim()) {
      alert("Category name is required");
      return;
    }

    const catKey = categoryForm.key || categoryForm.name.toLowerCase().replace(/\s+/g, "_");
    const path = `categories/${catKey}`;

    try {
      await set(ref(db, path), {
        name: categoryForm.name,
        description: categoryForm.description || "",
        image: categoryForm.image || ""
      });
      alert("Category saved successfully!");
      resetCategoryForm();
    } catch (error) {
      alert(`Error saving category: ${error.message}`);
      console.error("Error saving category:", error);
    }
  };

  const deleteCategory = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"? This will delete all products under it.`)) return;
    
    try {
      await remove(ref(db, `categories/${category.key}`));
      alert("Category deleted successfully!");
    } catch (error) {
      alert(`Error deleting category: ${error.message}`);
      console.error("Error deleting category:", error);
    }
  };

  const editCategory = (category) => {
    setCategoryForm({
      key: category.key,
      name: category.name,
      description: category.description || "",
      image: category.image || ""
    });
    setEditingType("category");
    setEditingKey(category.key);
  };

  const resetCategoryForm = () => {
    setCategoryForm({ 
      key: "", 
      name: "", 
      description: "", 
      image: "" 
    });
    setEditingType(null);
    setEditingKey(null);
  };

  /* ================= COMPANY OPERATIONS ================= */
  const saveCompany = async () => {
    if (!companyForm.name.trim()) {
      alert("Company name is required");
      return;
    }

    const companyKey = companyForm.key || companyForm.name.toLowerCase().replace(/\s+/g, "_").replace(/&/g, "and");
    const path = `companies/${companyKey}`;

    try {
      await set(ref(db, path), {
        name: companyForm.name,
        logo: companyForm.logo || "",
        ...(companyForm.description && { description: companyForm.description })
      });
      alert("Company saved successfully!");
      resetCompanyForm();
    } catch (error) {
      alert(`Error saving company: ${error.message}`);
      console.error("Error saving company:", error);
    }
  };

  const deleteCompany = async (company) => {
    if (!window.confirm(`Delete company "${company.name}"? This will delete all brands and products under it.`)) return;
    
    try {
      await remove(ref(db, `companies/${company.key}`));
      alert("Company deleted successfully!");
    } catch (error) {
      alert(`Error deleting company: ${error.message}`);
      console.error("Error deleting company:", error);
    }
  };

  const editCompany = (company) => {
    setCompanyForm({
      key: company.key,
      name: company.name,
      logo: company.logo || "",
      description: company.description || ""
    });
    setEditingType("company");
    setEditingKey(company.key);
  };

  const resetCompanyForm = () => {
    setCompanyForm({ key: "", name: "", logo: "", description: "" });
    setEditingType(null);
    setEditingKey(null);
  };

  /* ================= BRAND OPERATIONS ================= */
  const saveBrand = async () => {
    if (!brandForm.name.trim() || !brandForm.companyId) {
      alert("Brand name and company are required");
      return;
    }

    const brandKey = brandForm.key || brandForm.name.toLowerCase().replace(/\s+/g, "_");
    const path = `brands/${brandKey}`;

    try {
      await set(ref(db, path), {
        name: brandForm.name,
        companyId: brandForm.companyId,
        ...(brandForm.description && { description: brandForm.description }),
        ...(brandForm.image && { image: brandForm.image })
      });
      alert("Brand saved successfully!");
      resetBrandForm();
    } catch (error) {
      alert(`Error saving brand: ${error.message}`);
      console.error("Error saving brand:", error);
    }
  };

  const deleteBrand = async (brand) => {
    if (!window.confirm(`Delete brand "${brand.name}"? This will delete all products under it.`)) return;
    
    try {
      await remove(ref(db, `brands/${brand.key}`));
      alert("Brand deleted successfully!");
    } catch (error) {
      alert(`Error deleting brand: ${error.message}`);
      console.error("Error deleting brand:", error);
    }
  };

  const editBrand = (brand) => {
    setBrandForm({
      key: brand.key,
      name: brand.name,
      companyId: brand.companyId,
      description: brand.description || "",
      image: brand.image || ""
    });
    setEditingType("brand");
    setEditingKey(brand.key);
  };

  const resetBrandForm = () => {
    setBrandForm({ key: "", name: "", companyId: "", description: "", image: "" });
    setEditingType(null);
    setEditingKey(null);
  };

  /* ================= PRODUCT OPERATIONS ================= */
  // Function to generate sequential product key
  const generateProductKey = (brandId, brandName) => {
    if (!brandId) return "";
    
    // Get existing products for this brand
    const brandProducts = productsList.filter(p => p.brandId === brandId);
    
    // Extract existing numbers for this brand
    const existingNumbers = brandProducts.map(p => {
      const match = p.key.match(new RegExp(`${brandName.toLowerCase()}_(\\d+)`));
      return match ? parseInt(match[1]) : 0;
    }).filter(num => num > 0);
    
    // Find the next available number
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    
    return `${brandName.toLowerCase()}_${nextNumber}`;
  };

  const saveProduct = async () => {
    // Basic validation
    if (!productForm.companyId || !productForm.categoryId || !productForm.name.trim()) {
      alert("Company, Category, and Product Name are required");
      return;
    }

    // Auto-generate key if not provided
    let productKey = productForm.key;
    if (!productKey && productForm.brandId) {
      const brand = brandsList.find(b => b.key === productForm.brandId);
      if (brand) {
        productKey = generateProductKey(productForm.brandId, brand.name.toLowerCase().replace(/\s+/g, "_"));
        setProductForm(prev => ({ ...prev, key: productKey }));
      }
    }

    if (!productKey) {
      alert("Product Key is required. Please select a brand to auto-generate or enter manually.");
      return;
    }

    const path = `products/${productKey}`;

    // Prepare product data with all fields
    const productData = {
      companyId: productForm.companyId,
      categoryId: productForm.categoryId,
      name: productForm.name,
      key: productKey,
      image: productForm.image || "",
      ...(productForm.brandId && { brandId: productForm.brandId }),
      ...(productForm.hsn_code && { hsn_code: productForm.hsn_code }),
      ...(productForm.origin && { origin: productForm.origin }),
      ...(productForm.product_description && { product_description: productForm.product_description }),
      ...(productForm.is_new && { is_new: true }),
      
      // Additional fields
      ...(productForm.moq && { moq: productForm.moq }),
      ...(productForm.lead_time && { lead_time: productForm.lead_time }),
      ...(productForm.shelf_life && { shelf_life: productForm.shelf_life }),
      ...(productForm.pack_type && { pack_type: productForm.pack_type })
    };

    // Add all price fields if they have values
    if (productForm.price_min || productForm.price_max) {
      productData.price = {
        ...(productForm.price_min && { min: parseFloat(productForm.price_min) }),
        ...(productForm.price_max && { max: parseFloat(productForm.price_max) }),
        ...(productForm.price_unit && { unit: productForm.price_unit })
      };
    }
    
    if (productForm.price_usd_per_carton) {
      productData.price_usd_per_carton = parseFloat(productForm.price_usd_per_carton);
    }
    
    if (productForm.price_per_unit) {
      productData.price_per_unit = parseFloat(productForm.price_per_unit);
    }
    
    if (productForm.fob_price_usd) {
      productData.fob_price_usd = parseFloat(productForm.fob_price_usd);
    }
    
    if (productForm.fob_price_per_unit) {
      productData.fob_price_per_unit = parseFloat(productForm.fob_price_per_unit);
    }
    
    if (productForm["Ex-Mill_usd"]) {
      productData["Ex-Mill_usd"] = parseFloat(productForm["Ex-Mill_usd"]);
    }
    
    if (productForm.ex_mill_per_unit) {
      productData.ex_mill_per_unit = parseFloat(productForm.ex_mill_per_unit);
    }
    
    if (productForm.wholesale_price) {
      productData.wholesale_price = parseFloat(productForm.wholesale_price);
    }
    
    if (productForm.retail_price) {
      productData.retail_price = parseFloat(productForm.retail_price);
    }

    // Packaging information
    if (productForm.packaging_units_per_carton || productForm.packaging_unit_weight_g || productForm.packaging_unit_weight_ml) {
      productData.packaging = {
        ...(productForm.packaging_units_per_carton && { units_per_carton: parseInt(productForm.packaging_units_per_carton) }),
        ...(productForm.packaging_unit_weight_g && { unit_weight_g: parseInt(productForm.packaging_unit_weight_g) }),
        ...(productForm.packaging_unit_weight_ml && { unit_weight_ml: parseInt(productForm.packaging_unit_weight_ml) })
      };
    }

    // Grades/Variants
    if (productForm.grades && productForm.grades.length > 0) {
      productData.grades = productForm.grades;
    }

    try {
      await set(ref(db, path), productData);
      alert(`Product saved successfully with key: ${productKey}`);
      resetProductForm();
    } catch (error) {
      alert(`Error saving product: ${error.message}`);
      console.error("Error saving product:", error);
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm("Delete this product?")) return;
    
    try {
      await remove(ref(db, `products/${product.key}`));
      alert("Product deleted successfully!");
    } catch (error) {
      alert(`Error deleting product: ${error.message}`);
      console.error("Error deleting product:", error);
    }
  };

  const editProduct = (product) => {
    setProductForm({
      key: product.key || "",
      companyId: product.companyId || "",
      brandId: product.brandId || "",
      categoryId: product.categoryId || "",
      name: product.name || "",
      image: product.image || "",
      hsn_code: product.hsn_code || "",
      origin: product.origin || "",
      product_description: product.product_description || "",
      is_new: product.is_new || false,
      
      // Price fields
      price_min: product.price?.min || "",
      price_max: product.price?.max || "",
      price_unit: product.price?.unit || "",
      grades: product.grades || [],
      
      // Packaging
      packaging_units_per_carton: product.packaging?.units_per_carton || "",
      packaging_unit_weight_g: product.packaging?.unit_weight_g || "",
      packaging_unit_weight_ml: product.packaging?.unit_weight_ml || "",
      
      // Multiple price types
      price_usd_per_carton: product.price_usd_per_carton || "",
      price_per_unit: product.price_per_unit || "",
      fob_price_usd: product.fob_price_usd || "",
      fob_price_per_unit: product.fob_price_per_unit || "",
      "Ex-Mill_usd": product["Ex-Mill_usd"] || "",
      ex_mill_per_unit: product.ex_mill_per_unit || "",
      wholesale_price: product.wholesale_price || "",
      retail_price: product.retail_price || "",
      
      // Additional fields
      shelf_life: product.shelf_life || "",
      pack_type: product.pack_type || "",
      moq: product.moq || "",
      lead_time: product.lead_time || ""
    });
    
    setEditingType("product");
    setEditingKey(product.key);
  };

  const resetProductForm = () => {
    setProductForm({
      key: "",
      companyId: "",
      brandId: "",
      categoryId: "",
      name: "",
      image: "",
      hsn_code: "",
      origin: "",
      product_description: "",
      is_new: false,
      
      // Price fields
      price_min: "",
      price_max: "",
      price_unit: "",
      grades: [],
      
      // Packaging
      packaging_units_per_carton: "",
      packaging_unit_weight_g: "",
      packaging_unit_weight_ml: "",
      
      // Multiple price types
      price_usd_per_carton: "",
      price_per_unit: "",
      fob_price_usd: "",
      fob_price_per_unit: "",
      "Ex-Mill_usd": "",
      ex_mill_per_unit: "",
      wholesale_price: "",
      retail_price: "",
      
      // Additional fields
      shelf_life: "",
      pack_type: "",
      moq: "",
      lead_time: ""
    });
    
    setEditingType(null);
    setEditingKey(null);
  };

  /* ================= GRADE MANAGEMENT ================= */
  const addGrade = () => {
    const newGrade = { grade: "", price_inr: "" };
    setProductForm({
      ...productForm,
      grades: [...productForm.grades, newGrade]
    });
  };

  const updateGrade = (index, field, value) => {
    const newGrades = [...productForm.grades];
    newGrades[index] = { ...newGrades[index], [field]: value };
    setProductForm({ ...productForm, grades: newGrades });
  };

  const removeGrade = (index) => {
    const newGrades = productForm.grades.filter((_, i) => i !== index);
    setProductForm({ ...productForm, grades: newGrades });
  };

  /* ================= FILTERS ================= */
  const filteredProducts = productsList.filter(p =>
    (!filterCategory || p.categoryId === filterCategory) &&
    (!filterCompany || p.companyId === filterCompany) &&
    (!filterBrand || p.brandId === filterBrand)
  );

  const filteredBrands = brandsList.filter(b =>
    !filterCompany || b.companyId === filterCompany
  );

  /* ================= DEBUG INFO ================= */
  const showDebugInfo = () => {
    console.log("Current Firebase Data:", data);
    console.log("Categories:", categoriesList);
    console.log("Companies:", companiesList);
    console.log("Brands:", brandsList);
    console.log("Products:", productsList);
    
    alert("Debug info logged to console.");
  };

  /* ================= INITIALIZE DATA FROM JSON ================= */
  const initializeSampleData = async () => {
    if (!window.confirm("This will initialize sample data from JSON. Continue?")) return;
    
    try {
      // Categories from your JSON
      await set(ref(db, "categories/rice"), {
        name: "Rice",
        description: "Premium quality rice varieties",
        image: "/img/All_Products/Rice.jpg"
      });
      
      await set(ref(db, "categories/dry_fruits"), {
        name: "Dry Fruits",
        description: "Premium quality dry fruits including nuts, dried berries, and snacks",
        image: "/img/All_Products/Dryfruits.jpg"
      });
      
      await set(ref(db, "categories/dried_fruits"), {
        name: "Dried Fruits",
        description: "High-quality dehydrated fruits and berries",
        image: "/img/All_Products/Dryfruits.jpg"
      });
      
      await set(ref(db, "categories/lentils"), {
        name: "Lentils",
        description: "Nutritious lentils",
        image: "/img/All_Products/Lentils.avif"
      });
      
      await set(ref(db, "categories/popcorn"), {
        name: "Popcorn",
        description: "Wonder Puff premium popcorn varieties",
        image: "/img/All_Products/Popcorn.jpg"
      });
      
      await set(ref(db, "categories/tea"), {
        name: "Tea",
        description: "Premium quality tea varieties and herbal infusions",
        image: "/img/All_Products/Tea.jpg"
      });
      
      await set(ref(db, "categories/beverages"), {
        name: "Beverages",
        description: "Premium Quality Beverages including soft drinks and energy drinks",
        image: "/img/All_Products/Beverages.jpg"
      });

      // Companies from your JSON
      await set(ref(db, "companies/siea"), {
        name: "Sai Import Export Agro",
        logo: "/img/Trusted/Siea.png"
      });
      
      await set(ref(db, "companies/heritage"), {
        name: "Heritage",
        logo: "/img/Trusted/Heritage.png",
        description: "Leading exporter of premium dry fruits, nuts, and tea products"
      });
      
      await set(ref(db, "companies/akil_drinks"), {
        name: "AKIL DRINKS",
        logo: "/img/Trusted/Akil.jpeg",
        description: "Premium beverage manufacturer offering fruit drinks, soft drinks, and energy drinks"
      });

      // Brands from your JSON
      await set(ref(db, "brands/natures_sensation"), {
        companyId: "heritage",
        name: "Nature's Sensation",
        description: "Premium dried fruits and berries, naturally delicious",
        image: "/img/Heritage_dryfruits/Brand_NS.jpg"
      });
      
      await set(ref(db, "brands/sunkist"), {
        companyId: "heritage",
        name: "Sunkist",
        description: "Premium nuts and dry fruits with exceptional quality",
        image: "/img/Heritage_sunkist/S_Brand.png"
      });
      
      await set(ref(db, "brands/Wonder_puff"), {
        companyId: "heritage",
        name: "Wonder Puff",
        description: "Delicious popcorn in various flavors",
        image: "/img/Heritage_popcorn/Brand_logo.jpeg"
      });
      
      await set(ref(db, "brands/hg_brand"), {
        companyId: "heritage",
        name: "HG Brand",
        description: "Organic herbal teas and infusions",
        image: "/img/Heritage_Tea/HG/HG_Logo.jpg"
      });
      
      await set(ref(db, "brands/la_chaya"), {
        companyId: "heritage",
        name: "LA CHAYA",
        description: "Premium organic tea blends",
        image: "/img/Heritage_Tea/La_Chaya/La-chaya.jpg"
      });
      
      await set(ref(db, "brands/le_root"), {
        companyId: "heritage",
        name: "LE ROOT",
        description: "Organic herbal tea infusions",
        image: "/img/Heritage_Tea/LE_ROOT/Le-Root.png"
      });
      
      await set(ref(db, "brands/nut_walker"), {
        companyId: "heritage",
        name: "NUT WALKER",
        description: "Premium dried nuts, seeds and variety of mixed nuts in aluminum foil packaging",
        image: "/img/Heritage_sunkist/S_Brand.png"
      });
      
      await set(ref(db, "brands/bixi"), {
        companyId: "akil_drinks",
        name: "Bixi",
        description: "Fruit flavored drinks in various flavors"
      });
      
      await set(ref(db, "brands/mirna"), {
        companyId: "akil_drinks",
        name: "Mirna",
        description: "Soft drinks in multiple flavors"
      });
      
      await set(ref(db, "brands/khazne"), {
        companyId: "akil_drinks",
        name: "Khazne",
        description: "Soft drink beverages",
        image: "/img/Akil_Beverages/Khazne/Logo_K.jpeg"
      });
      
      await set(ref(db, "brands/bixi_blue"), {
        companyId: "akil_drinks",
        name: "Bixi Blue",
        description: "Energy drink variants",
        image: "/img/Akil_Beverages/Bixi_Blue/Logo_B.jpeg"
      });
      
      await set(ref(db, "brands/well_power"), {
        companyId: "akil_drinks",
        name: "Well Power",
        description: "Energy drinks for active lifestyle",
        image: "/img/Akil_Beverages/Well_Power/Well_Power.png"
      });

      alert("Sample data initialized successfully! Please refresh the page.");
    } catch (error) {
      alert(`Error initializing data: ${error.message}`);
      console.error("Error initializing data:", error);
    }
  };

  return (
    <div className="products-page">
      <h1>Products Management</h1>
      <div className="subtitle">Manage Categories, Companies, Brands, and Products</div>
      
      {/* Debug buttons */}
      <div className="debug-buttons">
        <button 
          onClick={showDebugInfo}
          className="debug-btn"
        >
          Debug Info
        </button>
        <button 
          onClick={initializeSampleData}
          className="init-btn"
        >
          Initialize Sample Data
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading data from Firebase...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {/* TABS - Only show if not loading */}
      {!loading && !error && (
        <>
          {/* Responsive Tabs - Full text on all screens */}
          <div className="tabs-container">
            <div className="tabs">
              <button 
                className={`tab-btn ${activeTab === "categories" ? "active" : ""}`}
                onClick={() => setActiveTab("categories")}
              >
                <span className="tab-label">Categories</span>
                <span className="tab-count">({categoriesList.length})</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === "companies" ? "active" : ""}`}
                onClick={() => setActiveTab("companies")}
              >
                <span className="tab-label">Companies</span>
                <span className="tab-count">({companiesList.length})</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === "brands" ? "active" : ""}`}
                onClick={() => setActiveTab("brands")}
              >
                <span className="tab-label">Brands</span>
                <span className="tab-count">({brandsList.length})</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
                onClick={() => setActiveTab("products")}
              >
                <span className="tab-label">Products</span>
                <span className="tab-count">({productsList.length})</span>
              </button>
            </div>
          </div>

          {/* CATEGORIES TAB */}
          {activeTab === "categories" && (
            <div className="tab-content">
              <div className="form-section">
                <h2>{editingType === "category" ? "Edit Category" : "Add New Category"}</h2>
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Rice, Dry Fruits, Tea"
                    value={categoryForm.name}
                    onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Enter category description"
                    value={categoryForm.description}
                    onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="text"
                    placeholder="e.g., /img/All_Products/Rice.jpg"
                    value={categoryForm.image}
                    onChange={e => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  />
                  {categoryForm.image && (
                    <div className="image-preview small">
                      <img src={categoryForm.image} alt="Category Preview" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Key (auto-generated)</label>
                  <input
                    type="text"
                    value={categoryForm.key || categoryForm.name.toLowerCase().replace(/\s+/g, "_")}
                    readOnly
                    className="readonly-input"
                  />
                </div>
                
                <div className="form-actions">
                  <button className="primary-btn" onClick={saveCategory}>
                    {editingType === "category" ? "Update Category" : "Add Category"}
                  </button>
                  {editingType === "category" && (
                    <button className="secondary-btn" onClick={resetCategoryForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="list-section">
                <h2>All Categories</h2>
                {categoriesList.length === 0 ? (
                  <div className="empty-state">
                    <p>No categories found.</p>
                  </div>
                ) : (
                  <div className="categories-grid">
                    {categoriesList.map(cat => (
                      <div className="category-card" key={cat.key}>
                        {cat.image && (
                          <div className="category-image">
                            <img src={cat.image} alt={cat.name} onError={(e) => e.target.style.display = 'none'} />
                          </div>
                        )}
                        <div className="category-info">
                          <h3>{cat.name}</h3>
                          {cat.description && <p className="description">{cat.description}</p>}
                          <p className="key">Key: {cat.key}</p>
                          <div className="actions">
                            <button onClick={() => editCategory(cat)}>Edit</button>
                            <button className="delete-btn" onClick={() => deleteCategory(cat)}>Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* COMPANIES TAB */}
          {activeTab === "companies" && (
            <div className="tab-content">
              <div className="form-section">
                <h2>{editingType === "company" ? "Edit Company" : "Add New Company"}</h2>
                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Sai Import Export Agro"
                    value={companyForm.name}
                    onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea
                    placeholder="Enter company description"
                    value={companyForm.description}
                    onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })}
                    rows="2"
                  />
                </div>
                
                <div className="form-group">
                  <label>Logo URL</label>
                  <input
                    type="text"
                    placeholder="Enter logo URL"
                    value={companyForm.logo}
                    onChange={e => setCompanyForm({ ...companyForm, logo: e.target.value })}
                  />
                  {companyForm.logo && (
                    <div className="image-preview small">
                      <img src={companyForm.logo} alt="Logo Preview" />
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Key (auto-generated)</label>
                  <input
                    type="text"
                    value={companyForm.key || companyForm.name.toLowerCase().replace(/\s+/g, "_").replace(/&/g, "and")}
                    readOnly
                    className="readonly-input"
                  />
                </div>
                
                <div className="form-actions">
                  <button className="primary-btn" onClick={saveCompany}>
                    {editingType === "company" ? "Update Company" : "Add Company"}
                  </button>
                  {editingType === "company" && (
                    <button className="secondary-btn" onClick={resetCompanyForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="list-section">
                <h2>All Companies</h2>
                {companiesList.length === 0 ? (
                  <div className="empty-state">
                    <p>No companies found.</p>
                  </div>
                ) : (
                  <div className="brands-grid">
                    {companiesList.map(company => (
                      <div className="brand-card" key={company.key}>
                        {company.logo && (
                          <div className="brand-logo">
                            <img src={company.logo} alt={company.name} />
                          </div>
                        )}
                        <div className="brand-info">
                          <h3>{company.name}</h3>
                          {company.description && <p className="description">{company.description}</p>}
                          <p className="key">Key: {company.key}</p>
                          <div className="actions">
                            <button onClick={() => editCompany(company)}>Edit</button>
                            <button className="delete-btn" onClick={() => deleteCompany(company)}>Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BRANDS TAB */}
          {activeTab === "brands" && (
            <div className="tab-content">
              <div className="form-section">
                <h2>{editingType === "brand" ? "Edit Brand" : "Add New Brand"}</h2>
                <div className="form-group">
                  <label>Select Company *</label>
                  <select 
                    value={brandForm.companyId}
                    onChange={e => setBrandForm({ ...brandForm, companyId: e.target.value })}
                  >
                    <option value="">Select Company</option>
                    {companiesList.map(c => (
                      <option key={c.key} value={c.key}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Brand Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Nature's Sensation, Sunkist"
                    value={brandForm.name}
                    onChange={e => setBrandForm({ ...brandForm, name: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea
                    placeholder="Enter brand description"
                    value={brandForm.description}
                    onChange={e => setBrandForm({ ...brandForm, description: e.target.value })}
                    rows="2"
                  />
                </div>
                
                <div className="form-group">
                  <label>Logo/Image URL</label>
                  <input
                    type="text"
                    placeholder="Enter logo or image URL"
                    value={brandForm.image}
                    onChange={e => setBrandForm({ ...brandForm, image: e.target.value })}
                  />
                  {brandForm.image && (
                    <div className="image-preview small">
                      <img src={brandForm.image} alt="Logo Preview" />
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Key (auto-generated)</label>
                  <input
                    type="text"
                    value={brandForm.key || brandForm.name.toLowerCase().replace(/\s+/g, "_")}
                    readOnly
                    className="readonly-input"
                  />
                </div>
                
                <div className="form-actions">
                  <button className="primary-btn" onClick={saveBrand}>
                    {editingType === "brand" ? "Update Brand" : "Add Brand"}
                  </button>
                  {editingType === "brand" && (
                    <button className="secondary-btn" onClick={resetBrandForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="filters">
                <select onChange={e => setFilterCompany(e.target.value)} value={filterCompany}>
                  <option value="">All Companies</option>
                  {companiesList.map(c => (
                    <option key={c.key} value={c.key}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="list-section">
                <h2>All Brands</h2>
                {filteredBrands.length === 0 ? (
                  <div className="empty-state">
                    <p>No brands found.</p>
                  </div>
                ) : (
                  <div className="brands-grid">
                    {filteredBrands.map(brand => (
                      <div className="brand-card" key={brand.key}>
                        {brand.image && (
                          <div className="brand-logo">
                            <img src={brand.image} alt={brand.name} />
                          </div>
                        )}
                        <div className="brand-info">
                          <h3>{brand.name}</h3>
                          {brand.description && <p className="description">{brand.description}</p>}
                          <p className="category">Company: {brand.companyName}</p>
                          <p className="key">Key: {brand.key}</p>
                          <div className="actions">
                            <button onClick={() => editBrand(brand)}>Edit</button>
                            <button className="delete-btn" onClick={() => deleteBrand(brand)}>Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === "products" && (
            <div className="tab-content">
              <div className="form-section">
                <h2>{editingType === "product" ? "Edit Product" : "Add New Product"}</h2>
                
                {/* Basic Info */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Select Company *</label>
                    <select 
                      value={productForm.companyId}
                      onChange={e => setProductForm({ ...productForm, companyId: e.target.value, brandId: "" })}
                    >
                      <option value="">Select Company</option>
                      {companiesList.map(c => (
                        <option key={c.key} value={c.key}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Select Brand (Optional)</label>
                    <select 
                      value={productForm.brandId}
                      onChange={e => {
                        const selectedBrandId = e.target.value;
                        setProductForm({ ...productForm, brandId: selectedBrandId });
                        
                        // Auto-generate product key when brand is selected
                        if (selectedBrandId && !productForm.key) {
                          const brand = brandsList.find(b => b.key === selectedBrandId);
                          if (brand) {
                            const generatedKey = generateProductKey(selectedBrandId, brand.name.toLowerCase().replace(/\s+/g, "_"));
                            setProductForm(prev => ({ ...prev, key: generatedKey }));
                          }
                        }
                      }}
                    >
                      <option value="">Select Brand (Optional)</option>
                      {brandsList
                        .filter(b => b.companyId === productForm.companyId)
                        .map(b => (
                          <option key={b.key} value={b.key}>{b.name}</option>
                        ))
                      }
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Select Category *</label>
                    <select 
                      value={productForm.categoryId}
                      onChange={e => setProductForm({ ...productForm, categoryId: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categoriesList.map(c => (
                        <option key={c.key} value={c.key}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Product Key (Auto-generated) */}
                <div className="form-group">
                  <label>Product Key *</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="e.g., nut_walker_1, sunkist_1, bixi_1"
                      value={productForm.key}
                      onChange={e => setProductForm({ ...productForm, key: e.target.value })}
                      style={{ flex: 1 }}
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (productForm.brandId) {
                          const brand = brandsList.find(b => b.key === productForm.brandId);
                          if (brand) {
                            const generatedKey = generateProductKey(productForm.brandId, brand.name.toLowerCase().replace(/\s+/g, "_"));
                            setProductForm(prev => ({ ...prev, key: generatedKey }));
                          }
                        } else {
                          alert("Please select a brand first to generate key");
                        }
                      }}
                      className="secondary-btn"
                      style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}
                    >
                      Generate Key
                    </button>
                  </div>
                  <small className="help-text">
                    Format: brandname_number (e.g., nut_walker_1, sunkist_2, bixi_3)
                  </small>
                </div>
                
                {/* Product Basic Details */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., 1121 Basmati Rice, Dried Cranberries"
                      value={productForm.name}
                      onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>HSN Code</label>
                    <input
                      type="text"
                      placeholder="e.g., 10063030"
                      value={productForm.hsn_code}
                      onChange={e => setProductForm({ ...productForm, hsn_code: e.target.value })}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Origin</label>
                    <input
                      type="text"
                      placeholder="e.g., India, USA, Turkey"
                      value={productForm.origin}
                      onChange={e => setProductForm({ ...productForm, origin: e.target.value })}
                    />
                  </div>
                </div>
                
                {/* Product Description */}
                <div className="form-group">
                  <label>Product Description</label>
                  <textarea
                    placeholder="Enter product description"
                    value={productForm.product_description}
                    onChange={e => setProductForm({ ...productForm, product_description: e.target.value })}
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="text"
                    placeholder="Enter image URL"
                    value={productForm.image}
                    onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                  />
                  {productForm.image && (
                    <div className="image-preview small">
                      <img src={productForm.image} alt="Preview" />
                    </div>
                  )}
                </div>
                
                {/* ALL PRICE FIELDS SECTION */}
                <div className="price-section">
                  <h3>Price Information</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Price per Carton (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 25.80"
                        value={productForm.price_usd_per_carton}
                        onChange={e => setProductForm({ ...productForm, price_usd_per_carton: e.target.value })}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>FOB Price (USD per Carton)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 26.40"
                        value={productForm.fob_price_usd}
                        onChange={e => setProductForm({ ...productForm, fob_price_usd: e.target.value })}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Ex-Mill Price (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 49.95"
                        value={productForm["Ex-Mill_usd"]}
                        onChange={e => setProductForm({ ...productForm, "Ex-Mill_usd": e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Price per Unit (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 2.15"
                        value={productForm.price_per_unit}
                        onChange={e => setProductForm({ ...productForm, price_per_unit: e.target.value })}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>FOB Price per Unit (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 2.20"
                        value={productForm.fob_price_per_unit}
                        onChange={e => setProductForm({ ...productForm, fob_price_per_unit: e.target.value })}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Ex-Mill Price per Unit (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 1.85"
                        value={productForm.ex_mill_per_unit}
                        onChange={e => setProductForm({ ...productForm, ex_mill_per_unit: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Wholesale Price (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 45.00"
                        value={productForm.wholesale_price}
                        onChange={e => setProductForm({ ...productForm, wholesale_price: e.target.value })}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Retail Price (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 55.00"
                        value={productForm.retail_price}
                        onChange={e => setProductForm({ ...productForm, retail_price: e.target.value })}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Min Price (INR per 100 qtls) - For Rice</label>
                      <input
                        type="number"
                        placeholder="e.g., 9500"
                        value={productForm.price_min}
                        onChange={e => setProductForm({ ...productForm, price_min: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Max Price (INR per 100 qtls) - For Rice</label>
                      <input
                        type="number"
                        placeholder="e.g., 14400"
                        value={productForm.price_max}
                        onChange={e => setProductForm({ ...productForm, price_max: e.target.value })}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Price Unit</label>
                      <input
                        type="text"
                        placeholder="e.g., qtls, carton, piece"
                        value={productForm.price_unit}
                        onChange={e => setProductForm({ ...productForm, price_unit: e.target.value })}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Minimum Order Quantity (MOQ)</label>
                      <input
                        type="text"
                        placeholder="e.g., 100 cartons, 1 container"
                        value={productForm.moq}
                        onChange={e => setProductForm({ ...productForm, moq: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Packaging Information */}
                <div className="packaging-section">
                  <h3>Packaging Information</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Units per Carton</label>
                      <input
                        type="number"
                        placeholder="e.g., 12, 24, 48"
                        value={productForm.packaging_units_per_carton}
                        onChange={e => setProductForm({ ...productForm, packaging_units_per_carton: e.target.value })}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Unit Weight (grams)</label>
                      <input
                        type="number"
                        placeholder="e.g., 170, 200, 454"
                        value={productForm.packaging_unit_weight_g}
                        onChange={e => setProductForm({ ...productForm, packaging_unit_weight_g: e.target.value })}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Unit Volume (ml) - For Beverages</label>
                      <input
                        type="number"
                        placeholder="e.g., 200, 1000, 250"
                        value={productForm.packaging_unit_weight_ml}
                        onChange={e => setProductForm({ ...productForm, packaging_unit_weight_ml: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Shelf Life</label>
                      <input
                        type="text"
                        placeholder="e.g., 12 months, 18 months, 24 months"
                        value={productForm.shelf_life}
                        onChange={e => setProductForm({ ...productForm, shelf_life: e.target.value })}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Pack Type</label>
                      <input
                        type="text"
                        placeholder="e.g., Stand Up Zip Lock Pouch, Aluminum Foil, PET Bottle"
                        value={productForm.pack_type}
                        onChange={e => setProductForm({ ...productForm, pack_type: e.target.value })}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Lead Time</label>
                      <input
                        type="text"
                        placeholder="e.g., 15 days, 30 days, Ready Stock"
                        value={productForm.lead_time}
                        onChange={e => setProductForm({ ...productForm, lead_time: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Grades/Variants Section */}
                <div className="grades-section">
                  <h3>Product Variants/Grades</h3>
                  <div className="grades-list">
                    {productForm.grades.map((grade, index) => (
                      <div key={index} className="grade-item">
                        <div className="form-row">
                          <div className="form-group">
                            <input
                              type="text"
                              placeholder="Variant/Grade Name (e.g., 1121 Steam A+)"
                              value={grade.grade}
                              onChange={e => updateGrade(index, "grade", e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <input
                              type="number"
                              placeholder="Price (e.g., 95, 25.80)"
                              value={grade.price_inr}
                              onChange={e => updateGrade(index, "price_inr", e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <button 
                              type="button" 
                              onClick={() => removeGrade(index)}
                              className="remove-btn"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addGrade} className="add-grade-btn">
                      + Add Variant/Grade
                    </button>
                  </div>
                </div>
                
                {/* New Product Flag */}
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={productForm.is_new}
                      onChange={e => setProductForm({ ...productForm, is_new: e.target.checked })}
                    />
                    Mark as New Product
                  </label>
                </div>
                
                <div className="form-actions">
                  <button className="primary-btn" onClick={saveProduct}>
                    {editingType === "product" ? "Update Product" : "Add Product"}
                  </button>
                  {editingType === "product" && (
                    <button className="secondary-btn" onClick={resetProductForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="filters">
                <select onChange={e => setFilterCategory(e.target.value)} value={filterCategory}>
                  <option value="">All Categories</option>
                  {categoriesList.map(c => (
                    <option key={c.key} value={c.key}>{c.name}</option>
                  ))}
                </select>
                <select onChange={e => setFilterCompany(e.target.value)} value={filterCompany}>
                  <option value="">All Companies</option>
                  {companiesList.map(c => (
                    <option key={c.key} value={c.key}>{c.name}</option>
                  ))}
                </select>
                <select onChange={e => setFilterBrand(e.target.value)} value={filterBrand}>
                  <option value="">All Brands</option>
                  {brandsList.map(b => (
                    <option key={b.key} value={b.key}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Products List */}
              <div className="list-section">
                <h2>All Products ({filteredProducts.length})</h2>
                {filteredProducts.length === 0 ? (
                  <div className="empty-state">
                    <p>No products found.</p>
                  </div>
                ) : (
                  <div className="products-grid">
                    {filteredProducts.map(product => (
                      <div className="product-card" key={product.key}>
                        {product.image && (
                          <div className="product-image">
                            <img src={product.image} alt={product.name} />
                          </div>
                        )}
                        <div className="product-info">
                          <h3>{product.name}</h3>
                          <p className="key">Key: {product.key}</p>
                          <p className="category">Category: {product.categoryName}</p>
                          <p className="company">Company: {product.companyName}</p>
                          {product.brandName && <p className="brand">Brand: {product.brandName}</p>}
                          
                          {/* Display all possible price types */}
                          <div className="price-display">
                            {product.price && (
                              <p className="price-item">Price: ₹{product.price.min || 0} - ₹{product.price.max || 0} per {product.price.unit || 'unit'}</p>
                            )}
                            {product.price_usd_per_carton && (
                              <p className="price-item">Carton Price: ${product.price_usd_per_carton} USD</p>
                            )}
                            {product.price_per_unit && (
                              <p className="price-item">Unit Price: ${product.price_per_unit} USD</p>
                            )}
                            {product.fob_price_usd && (
                              <p className="price-item">FOB Price: ${product.fob_price_usd} USD</p>
                            )}
                            {product.fob_price_per_unit && (
                              <p className="price-item">FOB Unit: ${product.fob_price_per_unit} USD</p>
                            )}
                            {product["Ex-Mill_usd"] && (
                              <p className="price-item">Ex-Mill: ${product["Ex-Mill_usd"]} USD</p>
                            )}
                            {product.ex_mill_per_unit && (
                              <p className="price-item">Ex-Mill Unit: ${product.ex_mill_per_unit} USD</p>
                            )}
                            {product.wholesale_price && (
                              <p className="price-item">Wholesale: ${product.wholesale_price} USD</p>
                            )}
                            {product.retail_price && (
                              <p className="price-item">Retail: ${product.retail_price} USD</p>
                            )}
                          </div>
                          
                          {/* Display additional information */}
                          {product.moq && <p className="info-item">MOQ: {product.moq}</p>}
                          {product.lead_time && <p className="info-item">Lead Time: {product.lead_time}</p>}
                          {product.hsn_code && <p className="info-item">HSN: {product.hsn_code}</p>}
                          {product.origin && <p className="info-item">Origin: {product.origin}</p>}
                          {product.shelf_life && <p className="info-item">Shelf Life: {product.shelf_life}</p>}
                          {product.packaging && (
                            <p className="info-item">
                              Packaging: {product.packaging.units_per_carton} units
                              {product.packaging.unit_weight_g ? ` × ${product.packaging.unit_weight_g}g` : ''}
                              {product.packaging.unit_weight_ml ? ` × ${product.packaging.unit_weight_ml}ml` : ''}
                            </p>
                          )}
                          {product.pack_type && <p className="info-item">Pack Type: {product.pack_type}</p>}
                          {product.is_new && <span className="new-badge">NEW</span>}
                          
                          <div className="actions">
                            <button onClick={() => editProduct(product)}>Edit</button>
                            <button className="delete-btn" onClick={() => deleteProduct(product)}>Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* CSS */}
      <style>{`
/* ===== PAGE ===== */
.products-page {
  padding: 24px 20px;
  color: #e5e7eb;
  background: #0f172a;
  min-height: 100vh;
}

.products-page h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 6px;
  color: #f9fafb;
}

.subtitle {
  font-size: 15px;
  color: #94a3b8;
  margin-bottom: 24px;
  line-height: 1.5;
}

/* ===== DEBUG BUTTONS ===== */
.debug-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.debug-btn, .init-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-width: 150px;
}

.debug-btn {
  background: #475569;
  color: #f9fafb;
}

.debug-btn:hover {
  background: #64748b;
}

.init-btn {
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
}

.init-btn:hover {
  background: linear-gradient(135deg, #047857, #059669);
}

/* ===== LOADING & ERROR STATES ===== */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #334155;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  background: #7f1d1d;
  color: #fecaca;
  padding: 16px;
  border-radius: 8px;
  margin: 20px 0;
  text-align: center;
}

.error-state button {
  margin-top: 10px;
  padding: 8px 16px;
  background: #991b1b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 30px 20px;
  color: #94a3b8;
  background: #1e293b;
  border-radius: 8px;
  border: 2px dashed #475569;
}

.empty-state p {
  margin: 8px 0;
}

/* ===== TABS CONTAINER ===== */
.tabs-container {
  margin-bottom: 24px;
  width: 100%;
  overflow: hidden;
}

.tabs {
  display: flex;
  gap: 0;
  background: #1e293b;
  border-radius: 8px;
  border: 1px solid #334155;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 4px;
}

.tabs::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  flex: 1;
  min-width: 120px;
  padding: 14px 12px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
}

.tab-btn:hover {
  color: #f9fafb;
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.15);
  font-weight: 700;
}

.tab-label {
  font-size: 14px;
  text-align: center;
}

.tab-count {
  font-size: 11px;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.tab-btn.active .tab-count {
  background: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

/* ===== TAB CONTENT ===== */
.tab-content {
  background: #1e293b;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #334155;
}

/* ===== FORM SECTION ===== */
.form-section {
  background: #0f172a;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #334155;
}

.form-section h2 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #f9fafb;
  font-weight: 600;
}

/* ===== FORM SECTIONS ===== */
.price-section,
.packaging-section,
.grades-section {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.price-section h3,
.packaging-section h3,
.grades-section h3 {
  font-size: 16px;
  margin-bottom: 16px;
  color: #f9fafb;
  padding-bottom: 8px;
  border-bottom: 1px solid #334155;
}

/* ===== FORM GROUPS ===== */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #cbd5e1;
}

.form-group label.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-group label.checkbox-label input[type="checkbox"] {
  width: auto;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== INPUTS ===== */
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  background: #1e293b;
  color: #f9fafb;
  border: 1px solid #475569;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.readonly-input {
  background: #2d3748 !important;
  color: #94a3b8 !important;
  cursor: not-allowed;
}

/* ===== GRADES SECTION ===== */
.grades-list {
  background: #1e293b;
  border: 1px solid #475569;
  border-radius: 6px;
  padding: 12px;
}

.grade-item {
  background: #0f172a;
  border: 1px solid #475569;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}

.add-grade-btn {
  padding: 10px 16px;
  background: #14532d;
  color: #bbf7d0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  width: 100%;
  transition: all 0.2s;
  margin-top: 8px;
}

.add-grade-btn:hover {
  background: #166534;
}

.remove-btn {
  padding: 8px 16px;
  background: #7f1d1d;
  color: #fecaca;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #991b1b;
}

/* ===== HELP TEXT ===== */
.help-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #94a3b8;
  font-style: italic;
}

/* ===== IMAGE PREVIEW ===== */
.image-preview {
  margin-top: 10px;
  padding: 10px;
  background: #1e293b;
  border-radius: 6px;
  border: 1px solid #475569;
}

.image-preview.small {
  max-width: 100px;
}

.image-preview img {
  max-width: 100%;
  max-height: 150px;
  border-radius: 4px;
}

.image-preview.small img {
  max-height: 60px;
}

/* ===== FORM ACTIONS ===== */
.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #334155;
}

.primary-btn {
  flex: 1;
  padding: 12px 24px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
}

.primary-btn:hover {
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  transform: translateY(-1px);
}

.secondary-btn {
  flex: 1;
  padding: 12px 24px;
  background: #475569;
  color: #f9fafb;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
}

.secondary-btn:hover {
  background: #64748b;
}

/* ===== LIST SECTION ===== */
.list-section {
  margin-top: 24px;
}

.list-section h2 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #f9fafb;
  font-weight: 600;
}

/* ===== FILTERS ===== */
.filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.filters select {
  padding: 10px 12px;
  background: #1e293b;
  color: #f9fafb;
  border: 1px solid #475569;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
}

/* ===== CATEGORIES GRID ===== */
.categories-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.category-card {
  background: #0f172a;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #334155;
  transition: all 0.2s;
}

.category-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.category-image {
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-info {
  padding: 16px;
}

.category-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #f9fafb;
}

.category-info .description {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 8px;
  line-height: 1.4;
}

.category-info .key {
  font-size: 12px;
  color: #64748b;
  font-family: monospace;
  margin-bottom: 12px;
}

/* ===== BRANDS GRID ===== */
.brands-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.brand-card {
  background: #0f172a;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #334155;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
}

.brand-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.brand-logo {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  background: #1e293b;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid #475569;
}

.brand-logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.brand-info {
  flex: 1;
}

.brand-info h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #f9fafb;
}

.brand-info .description {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 6px;
  line-height: 1.4;
}

.brand-info .category {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.brand-info .key {
  font-size: 12px;
  color: #64748b;
  font-family: monospace;
  margin-bottom: 10px;
}

/* ===== PRODUCTS GRID ===== */
.products-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.product-card {
  background: #0f172a;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #334155;
  transition: all 0.2s;
  position: relative;
}

.product-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.product-image {
  height: 160px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-info {
  padding: 16px;
}

.product-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #f9fafb;
  line-height: 1.4;
}

.product-info .key {
  font-size: 13px;
  color: #94a3b8;
  font-family: monospace;
  margin-bottom: 6px;
  background: #1e293b;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.product-info .category,
.product-info .company,
.product-info .brand {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 4px;
}

/* ===== PRICE DISPLAY ===== */
.price-display {
  margin: 10px 0;
  padding: 10px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.price-item {
  font-size: 13px;
  color: #cbd5e1;
  margin: 3px 0;
  padding: 3px 6px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 4px;
}

.info-item {
  font-size: 13px;
  color: #cbd5e1;
  margin: 3px 0;
  padding: 3px 6px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 4px;
  display: inline-block;
  margin-right: 4px;
  margin-bottom: 4px;
}

/* New Product Badge */
.new-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
}

/* ===== ACTIONS ===== */
.actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.actions button {
  flex: 1;
  padding: 8px 12px;
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid #475569;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.actions button:hover {
  background: #334155;
}

.actions .delete-btn {
  color: #f87171;
  border-color: #7f1d1d;
}

.actions .delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* ===== MEDIA QUERIES FOR RESPONSIVE DESIGN ===== */

/* Small Mobile Devices (320px to 375px) */
@media (min-width: 320px) and (max-width: 374px) {
  .products-page {
    padding: 16px 12px;
  }
  
  .tab-btn {
    min-width: 100px;
    padding: 12px 8px;
  }
  
  .tab-label {
    font-size: 12px;
  }
}

/* Medium Mobile Devices (376px to 424px) */
@media (min-width: 376px) and (max-width: 424px) {
  .tab-btn {
    min-width: 110px;
  }
}

/* Large Mobile Devices (425px to 639px) */
@media (min-width: 425px) and (max-width: 639px) {
  .tabs {
    gap: 8px;
  }
  
  .tab-btn {
    min-width: auto;
    flex: 1;
    padding: 14px 10px;
  }
  
  .categories-grid,
  .brands-grid,
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filters {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .filters select {
    flex: 1;
    min-width: 150px;
  }
}

/* Tablets and Small iPads (640px to 767px) */
@media (min-width: 640px) and (max-width: 767px) {
  .products-page {
    padding: 24px;
  }
  
  .products-page h1 {
    font-size: 30px;
  }
  
  .tabs {
    justify-content: center;
  }
  
  .tab-btn {
    min-width: 140px;
    padding: 16px 12px;
  }
  
  .tab-label {
    font-size: 15px;
  }
  
  .form-row {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .form-row .form-group {
    flex: 1;
    min-width: 200px;
  }
  
  .categories-grid,
  .brands-grid,
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .filters {
    flex-direction: row;
  }
  
  .filters select {
    flex: 1;
  }
}

/* iPads and Small Desktops (768px to 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .products-page {
    padding: 28px 32px;
  }
  
  .products-page h1 {
    font-size: 32px;
  }
  
  .tabs {
    gap: 0;
  }
  
  .tab-btn {
    min-width: 160px;
    padding: 18px 16px;
  }
  
  .tab-label {
    font-size: 15px;
  }
  
  .tab-count {
    font-size: 12px;
  }
  
  .form-row {
    flex-direction: row;
  }
  
  .form-row .form-group {
    flex: 1;
  }
  
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
  
  .brands-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
  
  .filters {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .filters select {
    flex: 1;
    min-width: 180px;
  }
}

/* Large Desktops (1024px and above) */
@media (min-width: 1024px) {
  .products-page {
    padding: 32px 40px;
  }
  
  .tabs {
    gap: 0;
  }
  
  .tab-btn {
    min-width: 180px;
    padding: 20px 16px;
  }
  
  .tab-label {
    font-size: 16px;
  }
  
  .form-row {
    flex-direction: row;
  }
  
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  
  .brands-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  
  .filters {
    flex-direction: row;
  }
  
  .filters select {
    flex: 1;
    min-width: 200px;
  }
}

/* Ultra-wide screens (1400px and above) */
@media (min-width: 1400px) {
  .products-page {
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .categories-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Landscape orientation for tablets */
@media (min-width: 768px) and (max-width: 1023px) and (orientation: landscape) {
  .categories-grid,
  .brands-grid,
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* iPad Pro specific */
@media (min-width: 1024px) and (max-width: 1366px) and (orientation: portrait) {
  .tabs {
    padding: 6px;
  }
  
  .tab-btn {
    min-width: 150px;
    padding: 16px 12px;
  }
  
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .brands-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
`}</style>
    </div>
  );
}