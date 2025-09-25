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
    container.innerHTML = items.map((item, idx) => `
      <div class="gallery-item gallery-card" data-idx="${idx}">
        <img src="${item.image_url || 'fotos/default.jpg'}" alt="${item.description || 'Imagen galería'}" loading="lazy" crossorigin="anonymous" />
        <button class="expand-btn" aria-expanded="false">Ver más</button>
        <div class="gallery-desc" style="max-height:0;opacity:0;overflow:hidden;transition:max-height 0.4s,opacity 0.3s;">${item.description || ''}</div>
      </div>
    `).join('');
    // Lógica para expandir/cerrar la descripción
    const cards = container.querySelectorAll('.gallery-card');
    cards.forEach(card => {
      const btn = card.querySelector('.expand-btn');
      const desc = card.querySelector('.gallery-desc');
      btn.addEventListener('click', () => {
        const isActive = card.classList.contains('active');
        // Cierra todos los demás
        cards.forEach(c => {
          c.classList.remove('active');
          c.querySelector('.expand-btn').setAttribute('aria-expanded', 'false');
          c.querySelector('.gallery-desc').style.maxHeight = '0';
          c.querySelector('.gallery-desc').style.opacity = '0';
        });
        if (!isActive) {
          card.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
          desc.style.maxHeight = '200px';
          desc.style.opacity = '1';
        } else {
          card.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
          desc.style.maxHeight = '0';
          desc.style.opacity = '0';
        }
      });
    });
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
