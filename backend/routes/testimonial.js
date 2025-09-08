const express = require('express');
const Testimonial = require('../models/Testimonial');
const router = express.Router();

// Obtener todos los testimonios
router.get('/', async (req, res) => {
  const testimonials = await Testimonial.find().sort({ date: -1 });
  res.json(testimonials);
});

// Crear testimonio
router.post('/', async (req, res) => {
  const testimonial = new Testimonial(req.body);
  await testimonial.save();
  res.json(testimonial);
});

// Editar testimonio
router.put('/:id', async (req, res) => {
  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(testimonial);
});

// Eliminar testimonio
router.delete('/:id', async (req, res) => {
  await Testimonial.findByIdAndDelete(req.params.id);
  res.json({ message: 'Testimonio eliminado' });
});

module.exports = router;
