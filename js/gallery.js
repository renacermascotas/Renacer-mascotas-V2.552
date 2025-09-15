// =========================================
// BLOQUE: Carga dinámica de galería desde el backend
// Explicación: Este bloque obtiene las imágenes de la galería desde la API y las muestra en el frontend, reflejando los cambios hechos en el admin.
// =========================================
import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', function () {
  const galleryContainer = document.getElementById('gallery-list-front');
  if (!galleryContainer) return;

  async function loadGallery() {
    try {
      const { data: items, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      if (!Array.isArray(items) || items.length === 0) {
        galleryContainer.innerHTML = '<p>No hay imágenes en la galería aún.</p>';
        return;
      }
      galleryContainer.innerHTML = items.map(item => `
          <div class="gallery-item">
            <img src="${item.image_url || 'fotos/default.jpg'}" alt="Imagen galería" loading="lazy" crossorigin="anonymous" />
            <div class="gallery-desc">${item.description || ''}</div>
          </div>
        `).join('');
    } catch (err) {
      console.error('Error cargando la galería:', err);
      galleryContainer.innerHTML = '<p>Error al cargar la galería.</p>';
    }
  }
  loadGallery();
  setInterval(loadGallery, 10000); // Recarga cada 10 segundos
});
