// Modelo de usuario para autenticación de empleados
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hasheada
  role: { type: String, default: 'empleado' }
});

module.exports = mongoose.model('User', userSchema);
