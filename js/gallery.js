// =========================================
// BLOQUE: Carga dinámica de galería desde el backend
// Explicación: Este bloque obtiene las imágenes de la galería desde la API y las muestra en el frontend, reflejando los cambios hechos en el admin.
// =========================================
import { supabase } from './supabase-client.js';
import { sanitizeText } from './security.js';

/**
 * Carga imágenes de la galería desde Supabase y las renderiza en un contenedor.
 * @param {string} containerId - El ID del elemento contenedor.
 * @returns {Promise<void>}
 */
export async function loadGallery(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.log('Contenedor de galería no encontrado:', containerId);
    return;
  }

  try {
    if (!supabase) {
      console.log('Supabase no disponible, cargando galería por defecto');
      loadDefaultGallery(container, containerId);
      return;
    }

    console.log('Cargando galería desde Supabase...');
    const { data: items, error } = await supabase.from('galeria').select('*').order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error de Supabase en galería:', error);
      loadDefaultGallery(container, containerId);
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      console.log('No hay imágenes en Supabase, cargando galería por defecto');
      loadDefaultGallery(container, containerId);
      return;
    }

    // Determinar si es la página de inicio (muestra 4) o la galería completa
    const isHomePage = (containerId === 'gallery-list-front');
    const itemsToRender = isHomePage ? items.slice(0, 4) : items;

    console.log('Renderizando', itemsToRender.length, 'imágenes de galería');
    container.innerHTML = itemsToRender.map(item => `
      <a href="galeria.html" class="gallery-item gallery-card">
        <img src="${sanitizeText(item.image_url) || 'fotos/4.jpg'}" alt="${sanitizeText(item.description) || 'Imagen galería'}" loading="lazy" crossorigin="anonymous" />
        <p class="gallery-desc">${sanitizeText(item.description) || ''}</p>
      </a>
    `).join('');
  } catch (err) {
    console.error('Error cargando la galería:', err);
    loadDefaultGallery(container, containerId);
  }
}

function loadDefaultGallery(container, containerId) {
  const defaultImages = [
    { image_url: 'fotos/gatos perro.png', description: 'Mascotas felices' },
    { image_url: 'fotos/4.jpg', description: 'Cuidado veterinario' },
    { image_url: 'fotos/3.jpg', description: 'Servicios premium' },
    { image_url: 'fotos/perro_jugando.jpg', description: 'Tiempo de juego' }
  ];

  const isHomePage = (containerId === 'gallery-list-front');
  const itemsToRender = isHomePage ? defaultImages.slice(0, 4) : defaultImages;

  container.innerHTML = itemsToRender.map(item => `
    <a href="galeria.html" class="gallery-item gallery-card">
      <img src="${item.image_url}" alt="${item.description}" loading="lazy" crossorigin="anonymous" />
      <p class="gallery-desc">${item.description}</p>
    </a>
  `).join('');
}
