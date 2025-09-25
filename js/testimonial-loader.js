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
function createTestimonialHTML(t, idx) {
        const image = t.image_url || 'fotos/perro_jugando.jpg';
        const author = t.author || 'Cliente';
        const text = t.text || '';
        return `
            <div class="testimonial-card" data-idx="${idx}">
                <img src="${image}" alt="Foto del cliente ${author}" loading="lazy" crossorigin="anonymous" />
                <b class="client-info">- ${author}</b>
                <button class="expand-btn" aria-expanded="false">Ver testimonio</button>
                <div class="testimonial-text">“${text}”</div>
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
        if (testimonios && testimonios.length) {
            container.innerHTML = testimonios.map((t, idx) => createTestimonialHTML(t, idx)).join('');
            // Lógica para expandir/cerrar el texto
            const cards = container.querySelectorAll('.testimonial-card');
            cards.forEach(card => {
                const btn = card.querySelector('.expand-btn');
                const text = card.querySelector('.testimonial-text');
                btn.addEventListener('click', () => {
                    const isActive = card.classList.contains('active');
                    // Cierra todos los demás
                    cards.forEach(c => {
                        c.classList.remove('active');
                        c.querySelector('.expand-btn').setAttribute('aria-expanded', 'false');
                    });
                    if (!isActive) {
                        card.classList.add('active');
                        btn.setAttribute('aria-expanded', 'true');
                    } else {
                        card.classList.remove('active');
                        btn.setAttribute('aria-expanded', 'false');
                    }
                });
            });
        } else {
            container.innerHTML = '<p>No hay testimonios disponibles aún.</p>';
        }
    } catch (error) {
        console.error('Error al cargar los testimonios:', error);
        container.innerHTML = '<p>No se pudieron cargar los testimonios. Intente de nuevo más tarde.</p>';
    }
}