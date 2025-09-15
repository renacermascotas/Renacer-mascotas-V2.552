// =========================================
// BLOQUE: Cargador de testimonios reutilizable
// Explicación: Este módulo exporta una función para cargar testimonios desde la API y renderizarlos en cualquier contenedor.
// =========================================

import { supabase } from './supabase-client.js';

/**
 * Genera el HTML para un solo testimonio.
 * @param {object} t - Objeto de testimonio.
 * @returns {string} HTML del testimonio.
 */
function createTestimonialHTML(t) {
    const image = t.image_url || 'fotos/perro_jugando.jpg';
    const author = t.author || 'Cliente';
    const text = t.text || '';
    return `
        <div class="testimonial">
          <img src="${image}" alt="Foto del cliente ${author}" loading="lazy" crossorigin="anonymous" />
          <p>“${text}”</p>
          <b class="client-info">- ${author}</b>
        </div>
    `;
}

/**
 * Carga testimonios desde la API y los renderiza en un contenedor.
 * @param {string} containerId - El ID del elemento contenedor.
 * @returns {Promise<void>}
 */
export async function loadTestimonials(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const { data: testimonios, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        container.innerHTML = testimonios && testimonios.length ? testimonios.map(createTestimonialHTML).join('') : '<p>No hay testimonios disponibles aún.</p>';
    } catch (error) {
        console.error('Error al cargar los testimonios:', error);
        container.innerHTML = '<p>No se pudieron cargar los testimonios. Intente de nuevo más tarde.</p>';
    }
}