// =========================================
// BLOQUE: Carrusel de Testimonios
// Explicación: Inicializa un carrusel automático e infinito para la sección de testimonios.
// Clona los elementos para crear un bucle suave y maneja la animación.
// =========================================

/**
 * Inicializa un carrusel infinito y automático.
 * @param {string} containerSelector - El selector del contenedor de los slides (ej: '.pricing-cards').
 * @param {string} wrapperSelector - El selector del 'viewport' del carrusel (ej: '.pricing-slider-container').
 * @param {object} options - Opciones de configuración.
 * @param {boolean} options.mobileOnly - Si el carrusel solo debe activarse en móvil.
 */
function initInfiniteCarousel(containerSelector, wrapperSelector, options = {}) {
    const slidesContainer = document.querySelector(containerSelector);
    const sliderWrapper = document.querySelector(wrapperSelector);
    if (!slidesContainer || !sliderWrapper) return;

    if (options.mobileOnly && window.innerWidth > 900) {
        return; // No inicializar en escritorio si es solo para móvil
    }

    let isInitialized = false;
    let currentIndex = 0;
    let intervalId;

    function setupSlider() {
        const slides = Array.from(slidesContainer.children);
        if (slides.length <= 1) {
            return;
        }

        // Clonar slides para el efecto infinito
        slides.forEach(slide => {
            const clone = slide.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            slidesContainer.appendChild(clone);
        });

        const allSlides = Array.from(slidesContainer.children);
        const gap = parseFloat(getComputedStyle(slidesContainer).gap) || 32; // 32px (2rem) como fallback
        const slideWidth = slides[0].offsetWidth + gap;

        function goToSlide(index) {
            slidesContainer.style.transition = 'transform 0.5s ease-in-out';
            slidesContainer.style.transform = `translateX(-${index * slideWidth}px)`;
            currentIndex = index;
        }

        function advanceSlide() {
            currentIndex++;
            goToSlide(currentIndex);

            // Cuando llega al final de los clones, resetea al principio sin transición
            if (currentIndex >= slides.length) {
                setTimeout(() => {
                    slidesContainer.style.transition = 'none';
                    slidesContainer.style.transform = 'translateX(0px)';
                    currentIndex = 0;
                }, 500); // Debe coincidir con la duración de la transición
            }
        }

        function startAutoplay() {
            intervalId = setInterval(advanceSlide, 4000); // Cambia de slide cada 4 segundos
        }

        function stopAutoplay() {
            clearInterval(intervalId);
        }

        sliderWrapper.addEventListener('mouseenter', stopAutoplay);
        sliderWrapper.addEventListener('mouseleave', startAutoplay);

        isInitialized = true;
        startAutoplay();
    }

    const images = slidesContainer.querySelectorAll('img');
    if (images.length > 0) {
        let imagesLoaded = 0;
        images.forEach(img => {
            if (img.complete) {
                imagesLoaded++;
            } else {
                img.onload = () => {
                    imagesLoaded++;
                    if (imagesLoaded === images.length) {
                        setupSlider();
                    }
                };
            }
        });
        if (imagesLoaded === images.length) {
            setupSlider();
        }
    } else {
        setupSlider();
    }
}

export function initTestimonialSlider() {
    initInfiniteCarousel(
        '#testimonial-slides-front', 
        '#testimonials .slider'
    );
}