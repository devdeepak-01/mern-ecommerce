const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '.env') });

// import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const braintreeRoutes = require('./routes/braintree');
const orderRoutes = require('./routes/order');
const adminRoutes = require('./routes/admin');

// app
const app = express();

const User = require('./models/user');
const Role = require('./models/role');
const Permission = require('./models/permission');
const { DEFAULT_PERMISSIONS, DEFAULT_ROLES } = require('./helpers/permissions');

// Idempotent system seeding for Permissions, Roles, Admin, and SuperAdmin
const seedSystemDefaults = async () => {
  try {
    // 1. Seed Permissions if missing
    for (const perm of DEFAULT_PERMISSIONS) {
      const exists = await Permission.findOne({ key: perm.key });
      if (!exists) {
        await new Permission(perm).save();
      }
    }

    // 2. Seed Roles if missing
    for (const roleDef of DEFAULT_ROLES) {
      const roleExists = await Role.findOne({ name: roleDef.name });
      if (!roleExists) {
        await new Role(roleDef).save();
      }
    }

    // 3. Preserve and seed default Admin if no admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin1@cara.test';
      const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'adminPassword123';
      const adminName = process.env.INITIAL_ADMIN_NAME || 'Seller Admin 1';

      const emailExists = await User.findOne({ email: adminEmail });

      if (emailExists) {
        emailExists.role = 'admin';
        await emailExists.save();
        console.log(`Seeding: Set existing user ${adminEmail} to Admin role`);
      } else {
        const adminUser = new User({
          name: adminName,
          email: adminEmail,
          password: adminPassword,
          role: 'admin',
          isActive: true,
        });
        await adminUser.save();
        console.log(`Seeding: Created Admin account (${adminEmail})`);
      }
    }

    // 4. Seed SuperAdmin if not exists
    const superAdminExists = await User.findOne({ role: 'superadmin' });

    if (!superAdminExists) {
      const superEmail = process.env.SUPERADMIN_EMAIL || 'superadmin@cara.test';
      const superPassword = process.env.SUPERADMIN_PASSWORD || 'superadminPassword123';
      const superName = process.env.SUPERADMIN_NAME || 'Global SuperAdmin';

      const userByEmail = await User.findOne({ email: superEmail });

      if (userByEmail) {
        userByEmail.role = 'superadmin';
        userByEmail.isActive = true;
        await userByEmail.save();
        console.log(`Seeding: Upgraded existing user ${superEmail} to SuperAdmin`);
      } else {
        const superAdminUser = new User({
          name: superName,
          email: superEmail,
          password: superPassword,
          role: 'superadmin',
          isActive: true,
        });
        await superAdminUser.save();
        console.log(`Seeding: Created initial SuperAdmin account (${superEmail})`);
      }
    }
  } catch (error) {
    console.error('Seeding: Error seeding system defaults:', error.message);
  }
};

// db connection
const connectDB = async () => {
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
    await seedSystemDefaults();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
};
connectDB();

// middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

// Static file serving for uploads & local images
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

const frontendImagesDir = path.resolve(__dirname, '..', 'frontend', 'public', 'images');
if (fs.existsSync(frontendImagesDir)) {
  app.use('/images', express.static(frontendImagesDir));
}

// routes middleware
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', braintreeRoutes);
app.use('/api', orderRoutes);
app.use('/api', adminRoutes);

// Server static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '..', 'frontend', 'dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
