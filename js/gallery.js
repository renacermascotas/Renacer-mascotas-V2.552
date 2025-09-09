// =========================================
// BLOQUE: Carga dinámica de galería desde el backend
// Explicación: Este bloque obtiene las imágenes de la galería desde la API y las muestra en el frontend, reflejando los cambios hechos en el admin.
// =========================================
document.addEventListener('DOMContentLoaded', function () {
  const galleryContainer = document.getElementById('gallery-list-front');
  if (!galleryContainer) return;
  fetch('http://localhost:4000/api/gallery')
    .then(res => res.ok ? res.json() : [])
    .then(items => {
      if (!Array.isArray(items) || items.length === 0) {
        galleryContainer.innerHTML = '<p>No hay imágenes en la galería aún.</p>';
        return;
      }
      galleryContainer.innerHTML = items.map(item => `
        <div class="gallery-item">
          <img src="${item.image || 'fotos/default.jpg'}" alt="Imagen galería" loading="lazy" />
          <div class="gallery-desc">${item.description || ''}</div>
        </div>
      `).join('');
    })
    .catch(() => {
      galleryContainer.innerHTML = '<p>Error al cargar la galería.</p>';
    });
});
