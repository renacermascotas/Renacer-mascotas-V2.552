const express = require('express');
const jwt = require('jsonwebtoken');
const supabase = require('../supabase-client'); // Importa el cliente Supabase

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body; // Supabase usa 'email' en lugar de 'username'

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    return res.status(401).json({ message: error.message });
  }

  if (!data.user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  // Generar un token JWT para la sesión del usuario
  // Puedes incluir información adicional del usuario si es necesario
  const token = jwt.sign(
    { id: data.user.id, email: data.user.email, role: data.user.user_metadata.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ token });
});

module.exports = router;