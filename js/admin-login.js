// =========================================
// BLOQUE: Lógica de login para empleados
// Explicación: Este bloque gestiona el envío del formulario de login, realiza la petición al backend, guarda el token y redirige o muestra errores según la respuesta.
// =========================================
import { supabase } from './supabase-client.js';

document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');
  errorDiv.textContent = '';

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) throw error;

    if (data.user) {
      window.location.href = 'admin-dashboard.html';
    } else {
      errorDiv.textContent = 'Credenciales incorrectas.';
    }
  } catch (err) {
    errorDiv.textContent = err.message || 'Error de conexión con el servidor';
  }
});
