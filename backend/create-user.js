// Script para crear un usuario empleado en MongoDB
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

async function createUser() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const username = 'admin';
  const password = 'admin123';
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed, role: 'empleado' });
  await user.save();
  console.log('Usuario creado:', username);
  mongoose.disconnect();
}

createUser();
