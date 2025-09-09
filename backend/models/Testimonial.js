// =========================================
// MODELO: Testimonial (Testimonios de clientes)
// Explicación: Define el esquema de la colección de testimonios, incluyendo autor, texto, imagen y fecha de publicación.
// =========================================
const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  author: { type: String, required: true },
  text: { type: String, required: true },
  image: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
