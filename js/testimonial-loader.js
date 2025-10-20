// =========================================
// BLOQUE: Cargador de testimonios reutilizable
// Explicación: Este módulo exporta una función para cargar testimonios desde la API y renderizarlos en cualquier contenedor.
// =========================================

import { supabase } from './supabase-client.js';
import { sanitizeText, sanitizeHTML } from './security.js';

/**
 * Genera el HTML para un solo testimonio de forma segura.
 * @param {object} t - Objeto de testimonio.
 * @param {number} idx - Índice del testimonio.
 * @param {boolean} isMainPage - Si está en la página principal o en testimonios.html.
 * @returns {string} HTML del testimonio.
 */
function createTestimonialHTML(t, idx, isMainPage = false) {
        const image = sanitizeText(t.image_url || 'fotos/perro_jugando.jpg');
        const author = sanitizeText(t.author || 'Cliente');
        const text = sanitizeHTML(t.text || '');
        
        // En página principal: botón redirige a testimonios.html
        // En página testimonios: botón despliega el contenido
        const buttonAction = isMainPage 
            ? `onclick="window.location.href='testimonios.html'" style="cursor: pointer;"` 
            : `aria-expanded="false"`;
            
        return `
            <div class="testimonial-card" data-idx="${idx}">
                <img src="${image}" alt="Foto del cliente ${author}" loading="lazy" crossorigin="anonymous" />
                <b class="client-info">- ${author}</b>
                <button class="expand-btn" ${buttonAction}>Ver testimonio</button>
                <div class="testimonial-text">"${text}"</div>
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
    if (!container) {
        console.log('Contenedor de testimonios no encontrado:', containerId);
        return;
    }

    // Detectar si estamos en la página principal o en testimonios.html
    const isMainPage = !window.location.pathname.includes('testimonios.html') && 
                      (window.location.pathname === '/' || window.location.pathname.includes('index.html') || window.location.pathname === '');

    try {
        if (!supabase) {
            console.log('Supabase no disponible, cargando testimonios por defecto');
            loadDefaultTestimonials(container, isMainPage);
            return;
        }

        console.log('Cargando testimonios desde Supabase...');
        const { data: testimonios, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error de Supabase:', error);
            // Cargar testimonios por defecto si no hay conexión a Supabase
            loadDefaultTestimonials(container, isMainPage);
            return;
        }
        
        if (testimonios && testimonios.length) {
            console.log('Testimonios cargados:', testimonios.length);
            container.innerHTML = testimonios.map((t, idx) => createTestimonialHTML(t, idx, isMainPage)).join('');
            if (!isMainPage) {
                initTestimonialInteractions(container);
            }
        } else {
            console.log('No hay testimonios en Supabase, cargando por defecto');
            loadDefaultTestimonials(container, isMainPage);
        }
    } catch (error) {
        console.error('Error al cargar los testimonios:', error);
        loadDefaultTestimonials(container, isMainPage);
    }
}

function loadDefaultTestimonials(container, isMainPage = false) {
    const defaultTestimonials = [
        {
            author: "María González",
            text: "Excelente servicio veterinario. Mi perro se sintió como en casa y el personal fue muy amable durante todo el proceso. Recomiendo totalmente sus servicios.",
            image_url: "fotos/perro_jugando.jpg"
        },
        {
            author: "Carlos Rodríguez", 
            text: "El mejor cuidado para mi gata. Personal muy profesional y dedicado. Las instalaciones son modernas y mi mascota se sintió cómoda en todo momento.",
            image_url: "fotos/3.jpg"
        },
        {
            author: "Ana Martínez",
            text: "Servicios de calidad premium. Totalmente recomendado para cualquier dueño de mascota que busque atención especializada y un trato excepcional.",
            image_url: "fotos/4.jpg"
        }
    ];
    
    container.innerHTML = defaultTestimonials.map((t, idx) => createTestimonialHTML(t, idx, isMainPage)).join('');
    if (!isMainPage) {
        initTestimonialInteractions(container);
    }
}

function initTestimonialInteractions(container) {
    const cards = container.querySelectorAll('.testimonial-card');
    
    cards.forEach(card => {
        const btn = card.querySelector('.expand-btn');
        const text = card.querySelector('.testimonial-text');
        
        if (btn && !btn.onclick) { // Solo en página de testimonios
            btn.addEventListener('click', () => {
                const isActive = card.classList.contains('active');
                
                // Cerrar todos los demás testimonios (comportamiento accordion)
                cards.forEach(c => {
                    c.classList.remove('active');
                    const expandBtn = c.querySelector('.expand-btn');
                    const testimonialText = c.querySelector('.testimonial-text');
                    if (expandBtn) {
                        expandBtn.setAttribute('aria-expanded', 'false');
                        expandBtn.textContent = 'Ver testimonio';
                    }
                    if (testimonialText) {
                        testimonialText.style.maxHeight = '0';
                        testimonialText.style.opacity = '0';
                    }
                });
                
                // Si no estaba activo, abrir este testimonio
                if (!isActive) {
                    card.classList.add('active');
                    btn.setAttribute('aria-expanded', 'true');
                    btn.textContent = 'Ocultar testimonio';
                    
                    if (text) {
                        text.style.maxHeight = '200px';
                        text.style.opacity = '1';
                    }
                    
                    // Auto-scroll para centrar el testimonio expandido
                    setTimeout(() => {
                        const cardRect = card.getBoundingClientRect();
                        const windowHeight = window.innerHeight;
                        const scrollTop = window.pageYOffset;
                        const cardTop = cardRect.top + scrollTop;
                        const cardHeight = cardRect.height;
                        
                        // Calcular posición para centrar la tarjeta
                        const targetScrollTop = cardTop - (windowHeight / 2) + (cardHeight / 2);
                        
                        window.scrollTo({
                            top: Math.max(0, targetScrollTop),
                            behavior: 'smooth'
                        });
                    }, 300); // Esperar a que se complete la animación de expansión
                }
            });
        }
    });
}