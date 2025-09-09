// =========================================
// MODELO: Gallery (Galería de imágenes)
// Explicación: Define el esquema de la colección de imágenes de la galería, incluyendo la ruta de la imagen, descripción y fecha de subida.
// =========================================
const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  image: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gallery', gallerySchema);
