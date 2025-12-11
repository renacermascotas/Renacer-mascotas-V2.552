// =========================================
// BLOQUE: Carga dinámica de testimonios para el index
// Explicación: Este bloque obtiene los testimonios desde la API y los muestra en el slider del index, reflejando los cambios hechos en el admin.
// =========================================
document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('testimonial-slides-front');
    if (!container) return;
    fetch('http://localhost:4000/api/testimonials')
        .then(res => res.ok ? res.json() : [])
        .then(testimonios => {
            if (!Array.isArray(testimonios) || testimonios.length === 0) {
                container.innerHTML = '<p>No hay testimonios disponibles aún.</p>';
                return;
            }
            container.innerHTML = testimonios.map(t => `
        <div class="testimonial">
          <img src="${t.imagen_url || 'fotos/perro_jugando.jpg'}" alt="Foto del cliente ${t.nombre || ''}" />
          <p>"${t.testimonio || ''}"</p>
          <b class="client-info">- ${t.nombre || 'Cliente'}</b>
        </div>
      `).join('');
        })
        .catch(() => {
            container.innerHTML = '<p>No se pudieron cargar los testimonios.</p>';
        });
});
