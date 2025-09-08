// admin-login.js: Lógica de login para empleados

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
