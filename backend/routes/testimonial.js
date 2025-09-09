const express = require('express');
const Testimonial = require('../models/Testimonial');
const router = express.Router();


// Permitir CORS para peticiones desde frontend
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});

// Obtener todos los testimonios
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ date: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener testimonios' });
  }
});

// Crear testimonio
router.post('/', async (req, res) => {
  try {
    const testimonial = new Testimonial(req.body);
    await testimonial.save();
    res.json(testimonial);
  } catch (err) {
    res.status(400).json({ message: 'Error al crear testimonio' });
  }
});

// Editar testimonio
router.put('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(testimonial);
  } catch (err) {
    res.status(400).json({ message: 'Error al editar testimonio' });
  }
});

// Eliminar testimonio
router.delete('/:id', async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Testimonio eliminado' });
  } catch (err) {
    res.status(400).json({ message: 'Error al eliminar testimonio' });
  }
});

module.exports = router;
