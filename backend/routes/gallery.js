const express = require('express');
const Gallery = require('../models/Gallery');
const router = express.Router();

// Obtener todas las imágenes
router.get('/', async (req, res) => {
  const images = await Gallery.find().sort({ date: -1 });
  res.json(images);
});

// Agregar imagen
router.post('/', async (req, res) => {
  const image = new Gallery(req.body);
  await image.save();
  res.json(image);
});

// Editar imagen
router.put('/:id', async (req, res) => {
  const image = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(image);
});

// Eliminar imagen
router.delete('/:id', async (req, res) => {
  await Gallery.findByIdAndDelete(req.params.id);
  res.json({ message: 'Imagen eliminada' });
});

module.exports = router;
