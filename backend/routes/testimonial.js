const express = require('express');
const supabase = require('../supabase-client'); // Importa el cliente Supabase
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
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener testimonios' });
  }
});

// Crear testimonio
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .insert([req.body])
      .select();

    if (error) return res.status(500).json({ message: error.message });
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(400).json({ message: 'Error al crear testimonio' });
  }
});

// Editar testimonio
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('testimonials')
      .update(req.body)
      .eq('id', id)
      .select();

    if (error) return res.status(500).json({ message: error.message });
    res.json(data[0]);
  } catch (err) {
    res.status(400).json({ message: 'Error al editar testimonio' });
  }
});

// Eliminar testimonio
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ message: error.message });
    res.json({ message: 'Testimonio eliminado' });
  } catch (err) {
    res.status(400).json({ message: 'Error al eliminar testimonio' });
  }
});

module.exports = router;