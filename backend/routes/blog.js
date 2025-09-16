const express = require('express');
const supabase = require('../supabase-client'); // Importa el cliente Supabase
const router = express.Router();

// Obtener todos los blogs
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// Crear blog
router.post('/', async (req, res) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert([req.body])
    .select();

  if (error) return res.status(500).json({ message: error.message });
  res.status(201).json(data[0]);
});

// Editar blog
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('blog_posts')
    .update(req.body)
    .eq('id', id)
    .select();

  if (error) return res.status(500).json({ message: error.message });
  res.json(data[0]);
});

// Eliminar blog
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ message: error.message });
  res.json({ message: 'Blog eliminado' });
});

module.exports = router;