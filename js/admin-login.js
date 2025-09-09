// =========================================
// BLOQUE: Lógica de login para empleados
// Explicación: Este bloque gestiona el envío del formulario de login, realiza la petición al backend, guarda el token y redirige o muestra errores según la respuesta.
// =========================================
document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');
  errorDiv.textContent = '';

  try {
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem('adminToken', data.token);
      window.location.href = 'admin-dashboard.html';
    } else {
      errorDiv.textContent = data.message || 'Credenciales incorrectas';
    }
  } catch (err) {
    errorDiv.textContent = 'Error de conexión con el servidor';
  }
});
