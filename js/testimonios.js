// testimonios.js: Carga y muestra testimonios dinámicamente en testimonios.html

// =========================================
// BLOQUE: Carga dinámica de testimonios
// Explicación: Este bloque obtiene los testimonios del backend y los muestra en la página de testimonios, gestionando errores y mostrando mensajes amigables si no hay datos.
// =========================================

// Espera a que el DOM esté completamente cargado antes de ejecutar el código
// para asegurar que los elementos estén disponibles
// Esto es importante para evitar errores si el script se carga en el <head>
document.addEventListener('DOMContentLoaded', function () {
    // Selecciona el contenedor donde se mostrarán los testimonios
    const container = document.getElementById('testimonial-slides-page');
    // Si no existe el contenedor, termina la función (previene errores en otras páginas)
    if (!container) return;

    // Realiza una petición GET al backend para obtener los testimonios
    fetch('http://localhost:4000/api/testimonials')
        // Si la respuesta es exitosa, convierte a JSON, si no, retorna un array vacío
        .then(res => res.ok ? res.json() : [])
        .then(testimonios => {
            // Si no hay testimonios, muestra un mensaje amigable
            if (!Array.isArray(testimonios) || testimonios.length === 0) {
                container.innerHTML = '<p>No hay testimonios disponibles aún.</p>';
                return;
            }
            // Si hay testimonios, los recorre y genera el HTML para cada uno
            // Muestra la imagen, el texto y el autor del testimonio
            container.innerHTML = testimonios.map(t => `
        <div class="testimonial">
          <img src="${t.image || 'fotos/perro_jugando.jpg'}" alt="Foto del cliente ${t.author || ''}" />
          <p>“${t.text || ''}”</p>
          <b class="client-info">- ${t.author || 'Cliente'}</b>
        </div>
      `).join('');
        })
        // Si ocurre un error en la petición, muestra un mensaje de error
        .catch(() => {
            container.innerHTML = '<p>No se pudieron cargar los testimonios.</p>';
        });
});
