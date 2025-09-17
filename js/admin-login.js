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

  const successDiv = document.getElementById('login-success');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) throw error;

    // Si no hubo error, el login fue exitoso.
    errorDiv.style.display = 'none';
    successDiv.textContent = 'Ingreso exitoso. Redirigiendo...';
    successDiv.style.display = 'block';
    setTimeout(() => {
      window.location.href = 'admin-dashboard.html';
    }, 1500);
  } catch (err) {
    console.error('Supabase authentication error:', err); // Log the full error object
    successDiv.style.display = 'none';
    errorDiv.textContent = err.message || 'Error de conexión con el servidor.';
    errorDiv.style.display = 'block';
  }
});
