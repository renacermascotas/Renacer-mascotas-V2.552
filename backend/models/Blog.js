// =========================================
// MODELO: Blog
// Explicación: Define el esquema de la colección de entradas de blog, incluyendo título, contenido, imagen y fecha de publicación.
// =========================================
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blog', blogSchema);
