// =========================================
// BLOQUE: Lógica de login para administradores
// Explicación: Gestiona el login usando la tabla admin_users de Supabase con contraseñas encriptadas
// =========================================
import { supabase } from './supabase-client.js';

document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('email').value; // Usamos el campo email para username
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');
  errorDiv.textContent = '';

  const successDiv = document.getElementById('login-success');

  try {
    // Validar que el usuario existe y la contraseña es correcta
    const { data: users, error: queryError } = await supabase
      .rpc('verify_admin_login', {
        p_username: username,
        p_password: password
      });

    if (queryError) {
      // Si la función no existe, intentar método alternativo
      console.warn('RPC verify_admin_login no disponible, usando método alternativo');
      
      // Buscar el usuario por username
      const { data: user, error: userError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('activo', true)
        .single();

      if (userError || !user) {
        throw new Error('Usuario o contraseña incorrectos');
      }

      // Verificar contraseña usando la función crypt de PostgreSQL
      const { data: passwordCheck, error: passError } = await supabase
        .rpc('verify_password', {
          p_user_id: user.id,
          p_password: password
        });

      if (passError || !passwordCheck) {
        throw new Error('Usuario o contraseña incorrectos');
      }

      // Guardar datos de sesión
      sessionStorage.setItem('admin_user', JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        nombre_completo: user.nombre_completo,
        rol: user.rol
      }));

      // Actualizar último acceso
      await supabase
        .from('admin_users')
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('id', user.id);

      // Redirigir al dashboard
      errorDiv.style.display = 'none';
      successDiv.textContent = 'Ingreso exitoso. Redirigiendo...';
      successDiv.style.display = 'block';
      setTimeout(() => {
        sessionStorage.setItem('justLoggedIn', 'true');
        window.location.href = 'admin-dashboard.html';
      }, 1500);
    } else if (users && users.length > 0) {
      // Login exitoso con RPC
      const user = users[0];
      
      sessionStorage.setItem('admin_user', JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        nombre_completo: user.nombre_completo,
        rol: user.rol
      }));

      errorDiv.style.display = 'none';
      successDiv.textContent = 'Ingreso exitoso. Redirigiendo...';
      successDiv.style.display = 'block';
      setTimeout(() => {
        sessionStorage.setItem('justLoggedIn', 'true');
        window.location.href = 'admin-dashboard.html';
      }, 1500);
    } else {
      throw new Error('Usuario o contraseña incorrectos');
    }
  } catch (err) {
    console.error('Error de autenticación:', err);
    successDiv.style.display = 'none';
    errorDiv.textContent = err.message || 'Error de conexión con el servidor.';
    errorDiv.style.display = 'block';
  }
});

