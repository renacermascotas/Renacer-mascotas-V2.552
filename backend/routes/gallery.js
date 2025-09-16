const express = require('express');
const supabase = require('../supabase-client'); // Importa el cliente Supabase
const router = express.Router();

// Obtener todas las imágenes
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// Agregar imagen
router.post('/', async (req, res) => {
  const { data, error } = await supabase
    .from('gallery')
    .insert([req.body])
    .select();

  if (error) return res.status(500).json({ message: error.message });
  res.status(201).json(data[0]);
});

// Editar imagen
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('gallery')
    .update(req.body)
    .eq('id', id)
    .select();

  if (error) return res.status(500).json({ message: error.message });
  res.json(data[0]);
});

// Eliminar imagen
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('gallery')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ message: error.message });
  res.json({ message: 'Imagen eliminada' });
});

module.exports = router;