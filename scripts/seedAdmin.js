require('dotenv').config({ path: '.env.' + (process.env.NODE_ENV || 'development') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const existe = await User.findOne({ email: 'admin@tiendamoda.com' });
  if (!existe) {
    await User.create({ name: 'Administrador', email: 'admin@tiendamoda.com', password: 'Admin2026*', role: 'admin' });
    console.log('Admin creado');
  } else {
    console.log('El admin ya existe');
  }
  await mongoose.disconnect();
})();
