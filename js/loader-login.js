// loader-login.js: Animación de carga para el login de Renacer Mascotas

// =========================================
// BLOQUE: Loader animado para login
// Explicación: Este bloque muestra un loader animado al cargar la página de login, lo oculta automáticamente o al detectar error, y lo vuelve a mostrar al enviar el formulario.
// =========================================
window.addEventListener('DOMContentLoaded', function() {
  const loader = document.createElement('div');
  loader.className = 'loader-bg';
  loader.innerHTML = '<div class="loader-logo"><img src="../fotos/nuevo-logo-Rm-300x195.webp" alt="Renacer Mascotas"></div>';
  document.body.appendChild(loader);

  // --- Ocultar loader automáticamente tras 800ms ---
  function hideLoader() {
    loader.classList.add('hide');
    setTimeout(() => loader.remove(), 500);
  }

  setTimeout(hideLoader, 800);

  // --- Mostrar loader mientras se envía el formulario de login ---
  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', function() {
      loader.classList.remove('hide');
      loader.style.opacity = '1';
    });
  }

  // --- Observar cambios en el div de error para ocultar loader si hay error ---
  const errorDiv = document.getElementById('login-error');
  if (errorDiv) {
    const observer = new MutationObserver(() => {
      if (errorDiv.textContent.trim()) hideLoader();
    });
    observer.observe(errorDiv, { childList: true });
  }
});
