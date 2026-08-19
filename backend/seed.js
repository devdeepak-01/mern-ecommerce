const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/user');
const Category = require('./models/category');
const Product = require('./models/product');
const Role = require('./models/role');
const Permission = require('./models/permission');
const { Order } = require('./models/order');
const { DEFAULT_PERMISSIONS, DEFAULT_ROLES } = require('./helpers/permissions');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const categoriesSeed = [
  { name: 'Electronics' },
  { name: 'Mobiles' },
  { name: 'Laptops' },
  { name: 'Headphones' },
  { name: 'Watches' },
  { name: "Men's Fashion" },
  { name: "Women's Fashion" },
  { name: 'Footwear' },
  { name: 'Home & Kitchen' },
  { name: 'Beauty' },
  { name: 'Books' },
  { name: 'Accessories' }
];

const superAdminSeed = {
  name: process.env.SUPERADMIN_NAME || 'Global SuperAdmin',
  email: process.env.SUPERADMIN_EMAIL || 'superadmin@cara.test',
  password: process.env.SUPERADMIN_PASSWORD || 'superadminPassword123',
  role: 'superadmin',
  isActive: true,
};

const adminsSeed = [
  {
    name: 'Seller Admin 1',
    email: 'admin1@cara.test',
    password: 'adminPassword123',
    role: 'admin',
    isActive: true,
  },
  {
    name: 'Seller Admin 2',
    email: 'admin2@cara.test',
    password: 'adminPassword123',
    role: 'admin',
    isActive: true,
  },
  {
    name: 'Seller Admin 3',
    email: 'admin3@cara.test',
    password: 'adminPassword123',
    role: 'admin',
    isActive: true,
  }
];

const sellersSeed = [
  {
    name: 'TechMart Seller',
    email: 'seller1@cara.test',
    password: 'sellerPassword123',
    role: 'seller',
    isActive: true,
  },
  {
    name: 'FashionHub Seller',
    email: 'seller2@cara.test',
    password: 'sellerPassword123',
    role: 'seller',
    isActive: true,
  }
];

const customersSeed = [
  {
    name: 'Customer One',
    email: 'customer1@cara.test',
    password: 'customerPassword123',
    role: 'customer',
    isActive: true,
  },
  {
    name: 'Customer Two',
    email: 'customer2@cara.test',
    password: 'customerPassword123',
    role: 'customer',
    isActive: true,
  },
  {
    name: 'Customer Three',
    email: 'customer3@cara.test',
    password: 'customerPassword123',
    role: 'customer',
    isActive: true,
  }
];

const productsSeedData = [
  // ELECTRONICS
  {
    name: 'Sony 4K Smart LED TV',
    description: 'Breathtaking 4K HDR picture quality with smart streaming features and dolby sound.',
    price: 49999,
    categoryName: 'Electronics',
    quantity: 15,
    sku: 'EL-SNY-4K',
    lowStockThreshold: 5,
    imageUrl: '/images/sony-4k-tv.jpg',
  },
  {
    name: 'JBL Bluetooth Speaker',
    description: 'Portable waterproof Bluetooth speaker with rich bass and long battery life.',
    price: 4999,
    categoryName: 'Electronics',
    quantity: 25,
    sku: 'EL-JBL-BT',
    lowStockThreshold: 5,
    imageUrl: '/images/jbl-speaker.jpg',
  },
  {
    name: 'Philips Air Purifier',
    description: 'High efficiency particulate air cleaning with real-time feedback indicator.',
    price: 12499,
    categoryName: 'Electronics',
    quantity: 3, // Low stock
    sku: 'EL-PHL-AP',
    lowStockThreshold: 5,
    imageUrl: '/images/philips-air-purifier.jpg',
  },
  // MOBILES
  {
    name: 'Samsung Galaxy A55',
    description: 'Stunning display, pro-grade triple cameras, and long-lasting 5G performance.',
    price: 34999,
    categoryName: 'Mobiles',
    quantity: 20,
    sku: 'MB-SAM-A55',
    lowStockThreshold: 5,
    imageUrl: '/images/samsung-galaxy-a55.jpg',
  },
  {
    name: 'OnePlus Nord',
    description: 'Smooth oxygen OS with fast charging and clear nightscape cameras.',
    price: 29999,
    categoryName: 'Mobiles',
    quantity: 0, // Out of stock
    sku: 'MB-1PL-ND',
    lowStockThreshold: 5,
    imageUrl: '/images/oneplus-nord.jpg',
  },
  {
    name: 'Redmi Note Series',
    description: 'Exceptional value phone featuring 108MP camera and turbo charging.',
    price: 19999,
    categoryName: 'Mobiles',
    quantity: 30,
    sku: 'MB-RDM-NT',
    lowStockThreshold: 5,
    imageUrl: '/images/redmi-note.jpg',
  },
  // LAPTOPS
  {
    name: 'HP Pavilion',
    description: 'Thin and light computing powerhouse with core i5 processor and fast SSD.',
    price: 64999,
    categoryName: 'Laptops',
    quantity: 12,
    sku: 'LP-HP-PV',
    lowStockThreshold: 5,
    imageUrl: '/images/hp-pavilion.jpg',
  },
  {
    name: 'Lenovo IdeaPad',
    description: 'Perfect daily productivity companion with responsive keyboard and long battery.',
    price: 59999,
    categoryName: 'Laptops',
    quantity: 15,
    sku: 'LP-LNV-IP',
    lowStockThreshold: 5,
    imageUrl: '/images/lenovo-ideapad.jpg',
  },
  {
    name: 'ASUS Vivobook',
    description: 'Beautiful OLED display with sleek metal lid and fast dynamic graphics.',
    price: 69999,
    categoryName: 'Laptops',
    quantity: 2, // Low stock
    sku: 'LP-ASU-VB',
    lowStockThreshold: 5,
    imageUrl: '/images/asus-vivobook.jpg',
  },
  // HEADPHONES
  {
    name: 'Sony Wireless Headphones',
    description: 'Industry-leading noise cancellation with supreme sound quality and clear calls.',
    price: 9999,
    categoryName: 'Headphones',
    quantity: 20,
    sku: 'HD-SNY-WH',
    lowStockThreshold: 5,
    imageUrl: '/images/sony-headphones.jpg',
  },
  {
    name: 'JBL Tune',
    description: 'On-ear wireless headphones with pure bass sound and comfortable fit.',
    price: 3499,
    categoryName: 'Headphones',
    quantity: 0, // Out of stock
    sku: 'HD-JBL-TN',
    lowStockThreshold: 5,
    imageUrl: '/images/jbl-tune.jpg',
  },
  {
    name: 'boAt Wireless Headphones',
    description: 'Ergonomic neckband style active headphones with dual pairing capabilities.',
    price: 2499,
    categoryName: 'Headphones',
    quantity: 50,
    sku: 'HD-BOT-WL',
    lowStockThreshold: 10,
    imageUrl: '/images/boat-headphones.jpg',
  },
  // MEN'S FASHION
  {
    name: 'Casual Cotton Shirt',
    description: 'Premium quality breathable cotton shirt ideal for casual daily use.',
    price: 1299,
    categoryName: "Men's Fashion",
    quantity: 40,
    sku: 'MN-CSH-SH',
    lowStockThreshold: 5,
    imageUrl: '/images/casual-cotton-shirt.jpg',
  },
  {
    name: "Men's Denim Jacket",
    description: 'Classic fit premium washed denim jacket with robust metal buttons.',
    price: 2499,
    categoryName: "Men's Fashion",
    quantity: 25,
    sku: 'MN-DNM-JK',
    lowStockThreshold: 5,
    imageUrl: '/images/mens-denim-jacket.jpg',
  },
  {
    name: "Men's Casual T-Shirt",
    description: 'Regular fit crew neck tee made from ultra-soft combed cotton.',
    price: 699,
    categoryName: "Men's Fashion",
    quantity: 60,
    sku: 'MN-TEE-CS',
    lowStockThreshold: 5,
    imageUrl: '/images/mens-tshirt.jpg',
  },
  // WOMEN'S FASHION
  {
    name: "Women's Kurti",
    description: 'Elegant designer printed ethnic wear kurti made with breathable rayon fabric.',
    price: 1499,
    categoryName: "Women's Fashion",
    quantity: 35,
    sku: 'WM-KRT-ET',
    lowStockThreshold: 5,
    imageUrl: '/images/womens-kurti.jpg',
  },
  {
    name: "Women's Casual Dress",
    description: 'Beautiful A-line knee length dress perfect for summer outings.',
    price: 1999,
    categoryName: "Women's Fashion",
    quantity: 25,
    sku: 'WM-CAS-DR',
    lowStockThreshold: 5,
    imageUrl: '/images/womens-dress.jpg',
  },
  {
    name: "Women's Handbag",
    description: 'Spacious faux-leather handbag with multiple pockets and durable zip straps.',
    price: 2299,
    categoryName: "Women's Fashion",
    quantity: 20,
    sku: 'WM-HBG-FL',
    lowStockThreshold: 5,
    imageUrl: '/images/womens-handbag.jpg',
  },
  // FOOTWEAR
  {
    name: 'Running Shoes',
    description: 'Lightweight cushioned athletic sneakers designed for running and gym workouts.',
    price: 2999,
    categoryName: 'Footwear',
    quantity: 30,
    sku: 'FT-RUN-SH',
    lowStockThreshold: 5,
    imageUrl: '/images/running-shoes.jpg',
  },
  {
    name: 'Casual Sneakers',
    description: 'Classic canvas low top sneakers suitable for unisex styling.',
    price: 2499,
    categoryName: 'Footwear',
    quantity: 0, // Out of stock
    sku: 'FT-CNV-SN',
    lowStockThreshold: 5,
    imageUrl: '/images/casual-sneakers.jpg',
  },
  {
    name: "Women's Walking Shoes",
    description: 'Slip-on comfortable mesh shoes with memory foam arch support sole.',
    price: 2199,
    categoryName: 'Footwear',
    quantity: 20,
    sku: 'FT-WMW-SH',
    lowStockThreshold: 5,
    imageUrl: '/images/womens-walking-shoes.jpg',
  },
  // HOME & KITCHEN
  {
    name: 'Electric Kettle',
    description: 'Fast boiling stainless steel cordless water kettle with auto shut-off safety.',
    price: 1499,
    categoryName: 'Home & Kitchen',
    quantity: 30,
    sku: 'HK-ELE-KT',
    lowStockThreshold: 5,
    imageUrl: '/images/electric-kettle.jpg',
  },
  {
    name: 'Mixer Grinder',
    description: 'Heavy duty grinding machine with 3 stainless steel interchangeable jars.',
    price: 3999,
    categoryName: 'Home & Kitchen',
    quantity: 15,
    sku: 'HK-MXR-GD',
    lowStockThreshold: 5,
    imageUrl: '/images/mixer-grinder.jpg',
  },
  {
    name: 'Non-Stick Cookware Set',
    description: 'Premium quality non-toxic coating kadhai and frying pan set with glass lids.',
    price: 2999,
    categoryName: 'Home & Kitchen',
    quantity: 3, // Low stock
    sku: 'HK-NST-CW',
    lowStockThreshold: 5,
    imageUrl: '/images/cookware-set.jpg',
  },
  // BEAUTY
  {
    name: 'Face Care Kit',
    description: 'Organic hydration face wash and dynamic vitamin C face serum combo kit.',
    price: 999,
    categoryName: 'Beauty',
    quantity: 30,
    sku: 'BT-FCK-OR',
    lowStockThreshold: 5,
    imageUrl: '/images/face-care-kit.jpg',
  },
  {
    name: 'Hair Dryer',
    description: 'Compact salon-grade blow dryer with multiple hot and cold speed modes.',
    price: 1799,
    categoryName: 'Beauty',
    quantity: 20,
    sku: 'BT-HDY-SL',
    lowStockThreshold: 5,
    imageUrl: '/images/hair-dryer.jpg',
  },
  // BOOKS
  {
    name: 'Programming Fundamentals Book',
    description: 'A comprehensive beginner friendly guide to learning C, Python, and JavaScript.',
    price: 799,
    categoryName: 'Books',
    quantity: 20,
    sku: 'BK-PRG-FN',
    lowStockThreshold: 5,
    imageUrl: '/images/programming-book.jpg',
  },
  {
    name: 'Computer Networks Book',
    description: 'Detailed analysis of routing protocols, secure sockets, and socket programming.',
    price: 899,
    categoryName: 'Books',
    quantity: 1, // Low stock
    sku: 'BK-NET-WK',
    lowStockThreshold: 5,
    imageUrl: '/images/networking-book.jpg',
  },
  // ACCESSORIES
  {
    name: 'Laptop Backpack',
    description: 'Water resistant multi-compartment bag with dedicated anti-theft laptop sleeve.',
    price: 1499,
    categoryName: 'Accessories',
    quantity: 40,
    sku: 'AC-LPT-BP',
    lowStockThreshold: 5,
    imageUrl: '/images/laptop-backpack.jpg',
  },
  {
    name: 'USB-C Hub',
    description: 'Multi-port hub containing HDMI, SD slot, and fast USB 3.0 data capture ports.',
    price: 1299,
    categoryName: 'Accessories',
    quantity: 30,
    sku: 'AC-USB-HB',
    lowStockThreshold: 5,
    imageUrl: '/images/usbc-hub.jpg',
  }
];

const runSeeder = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Error: MONGODB_URI environment variable is not defined in backend/.env!');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Successfully connected to database.');

    // 1. Seed Permissions
    console.log('Seeding system permissions...');
    for (const perm of DEFAULT_PERMISSIONS) {
      const existing = await Permission.findOne({ key: perm.key });
      if (!existing) {
        await new Permission(perm).save();
      }
    }

    // 2. Seed Roles
    console.log('Seeding default roles...');
    for (const roleDef of DEFAULT_ROLES) {
      const existing = await Role.findOne({ name: roleDef.name });
      if (!existing) {
        await new Role(roleDef).save();
        console.log(`Created Role: ${roleDef.displayName} (${roleDef.name})`);
      } else {
        console.log(`Role exists: ${roleDef.displayName}`);
      }
    }

    // 3. Seed Categories
    console.log('Seeding categories...');
    const categoriesMap = {};
    for (const cat of categoriesSeed) {
      let existing = await Category.findOne({ name: cat.name });
      if (!existing) {
        existing = await new Category(cat).save();
        console.log(`Created Category: ${cat.name}`);
      } else {
        console.log(`Category exists: ${cat.name}`);
      }
      categoriesMap[cat.name] = existing._id;
    }

    // 4. Seed SuperAdmin (Fresh recreate per strict user requirement)
    console.log('Processing SuperAdmin account...');
    const existingSuper = await User.findOne({
      $or: [{ email: superAdminSeed.email }, { role: 'superadmin' }],
    });
    if (existingSuper) {
      console.log(`Deleting existing SuperAdmin to create fresh SuperAdmin instance...`);
      await User.deleteMany({ role: 'superadmin' });
    }
    const freshSuper = new User({
      name: superAdminSeed.name,
      email: superAdminSeed.email,
      password: superAdminSeed.password,
      role: 'superadmin',
      permissions: DEFAULT_PERMISSIONS.map((p) => p.key),
      isActive: true,
    });
    await freshSuper.save();
    console.log(`Created fresh SuperAdmin: ${freshSuper.name} (${freshSuper.email})`);

    // 5. Seed Admins (Preserves existing Admin passwords untouched)
    console.log('Seeding administrative accounts...');
    for (const adminData of adminsSeed) {
      const existing = await User.findOne({ email: adminData.email });
      if (!existing) {
        await new User(adminData).save();
        console.log(`Created Admin: ${adminData.name} (${adminData.email})`);
      } else {
        // Enforce the admin role without altering existing credentials
        existing.role = 'admin';
        existing.isActive = true;
        await existing.save();
        console.log(`Admin exists: ${adminData.email} (Preserved existing Admin credentials)`);
      }
    }

    // 6. Seed Sellers
    console.log('Seeding seller accounts...');
    const sellersMap = {};
    for (const sellerData of sellersSeed) {
      let existing = await User.findOne({ email: sellerData.email });
      if (!existing) {
        existing = await new User(sellerData).save();
        console.log(`Created Seller: ${sellerData.name} (${sellerData.email})`);
      } else {
        existing.role = 'seller';
        existing.isActive = true;
        await existing.save();
        console.log(`Seller exists: ${sellerData.email}`);
      }
      sellersMap[sellerData.email] = existing._id;
    }

    // 7. Seed Customers
    console.log('Seeding customer accounts...');
    const customersMap = {};
    for (const customerData of customersSeed) {
      let existing = await User.findOne({ email: customerData.email });
      if (!existing) {
        existing = await new User(customerData).save();
        console.log(`Created Customer: ${customerData.name} (${customerData.email})`);
      } else {
        console.log(`Customer exists: ${customerData.email}`);
      }
      customersMap[customerData.email] = existing._id;
    }

    // 8. Seed Products with Image URLs and Seller Ownership
    console.log('Seeding catalog products with clean image URLs & seller ownership...');
    const createdProductList = [];
    for (const prodData of productsSeedData) {
      const catId = categoriesMap[prodData.categoryName];
      if (!catId) {
        console.error(`Skipping product ${prodData.name}: Category ${prodData.categoryName} ID not resolved.`);
        continue;
      }

      // Assign TechMart seller for tech, FashionHub for fashion/home
      const assignedSellerId = ['Electronics', 'Mobiles', 'Laptops', 'Headphones', 'Accessories'].includes(prodData.categoryName)
        ? sellersMap['seller1@cara.test']
        : sellersMap['seller2@cara.test'];

      let existing = await Product.findOne({ sku: prodData.sku });
      if (!existing) {
        existing = await Product.findOne({ name: prodData.name });
      }

      const productPayload = {
        name: prodData.name,
        description: prodData.description,
        price: prodData.price,
        category: catId,
        user: assignedSellerId,
        quantity: prodData.quantity,
        sku: prodData.sku,
        lowStockThreshold: prodData.lowStockThreshold,
        imageUrl: prodData.imageUrl,
        isActive: true,
        shipping: true
      };

      if (!existing) {
        const savedProd = await new Product(productPayload).save();
        createdProductList.push(savedProd);
        console.log(`Created Product: ${prodData.name} (SKU: ${prodData.sku}, Image: ${prodData.imageUrl})`);
      } else {
        existing.quantity = prodData.quantity;
        existing.price = prodData.price;
        existing.lowStockThreshold = prodData.lowStockThreshold;
        existing.imageUrl = prodData.imageUrl;
        existing.user = assignedSellerId;
        const savedProd = await existing.save();
        createdProductList.push(savedProd);
        console.log(`Product updated: ${prodData.name} (SKU: ${prodData.sku}, Image: ${prodData.imageUrl})`);
      }
    }

    // 9. Seed Sample Orders to support Seller -> Customer visibility testing
    console.log('Checking sample orders for seller customer testing...');
    const orderCount = await Order.countDocuments();
    if (orderCount === 0 && createdProductList.length > 2) {
      const techProduct = createdProductList.find((p) => p.sku === 'EL-SNY-4K') || createdProductList[0];
      const fashionProduct = createdProductList.find((p) => p.sku === 'MN-CSH-SH') || createdProductList[1];

      // Order 1: Customer One bought TechMart product
      await new Order({
        products: [{ product: techProduct._id, name: techProduct.name, price: techProduct.price, count: 1 }],
        transaction_id: 'TXN_TECH_001',
        amount: techProduct.price,
        address: '100 Silicon Way, Tech City',
        status: 'Delivered',
        user: customersMap['customer1@cara.test'],
      }).save();

      // Order 2: Customer Two bought FashionHub product
      await new Order({
        products: [{ product: fashionProduct._id, name: fashionProduct.name, price: fashionProduct.price, count: 2 }],
        transaction_id: 'TXN_FASH_002',
        amount: fashionProduct.price * 2,
        address: '200 Vogue Ave, Fashion District',
        status: 'Delivered',
        user: customersMap['customer2@cara.test'],
      }).save();

      console.log('Sample orders seeded for seller customer visibility verification.');
    }

    console.log('Database seeding process completed successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding process encountered an error:', error);
    if (mongoose.connection) {
      mongoose.connection.close();
    }
    process.exit(1);
  }
};

runSeeder();
