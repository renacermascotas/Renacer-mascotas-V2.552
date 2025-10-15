// =========================================
// BLOQUE: Carga dinámica de galería desde el backend
// Explicación: Este bloque obtiene las imágenes de la galería desde la API y las muestra en el frontend, reflejando los cambios hechos en el admin.
// =========================================
import { supabase } from './supabase-client.js';

/**
 * Carga imágenes de la galería desde Supabase y las renderiza en un contenedor.
 * @param {string} containerId - El ID del elemento contenedor.
 * @returns {Promise<void>}
 */
export async function loadGallery(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const { data: items, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = '<p>No hay imágenes en la galería aún.</p>';
      return;
    }
    // Modificado para que cada item sea un enlace a galeria.html y sin botón de expandir.
    container.innerHTML = items.slice(0, 4).map(item => `
      <a href="galeria.html" class="gallery-item gallery-card">
        <img src="${item.image_url || 'fotos/default.jpg'}" alt="${item.description || 'Imagen galería'}" loading="lazy" crossorigin="anonymous" />
        <p class="gallery-desc">${item.description || ''}</p>
      </a>
    `).join('');
  } catch (err) {
    console.error('Error cargando la galería:', err);
    container.innerHTML = '<p>Error al cargar la galería.</p>';
  }
}

// Código para ejecutar solo en la página galeria.html
if (document.getElementById('galeria-cards')) {
  document.addEventListener('DOMContentLoaded', () => {
    loadGallery('galeria-cards');
  });
}
