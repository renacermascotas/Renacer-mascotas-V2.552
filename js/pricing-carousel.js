// js/pricing-carousel.js - Carrusel para la sección de planes

/**
 * Inicializa el carrusel de planes de precios (deshabilitado para escritorio)
 */
export function initPricingCarousel() {
    const container = document.querySelector('.pricing-slider-container');
    if (!container) {
        console.log('Contenedor de pricing no encontrado');
        return;
    }

    // Carrusel deshabilitado - los planes se muestran uno al lado del otro en escritorio
    console.log('Carrusel de planes deshabilitado - mostrando en grid');
    return;

    // Crear contenedor del carrusel si no existe
    let carouselContainer = container.querySelector('.pricing-carousel');
    if (!carouselContainer) {
        const pricingCards = container.querySelector('.pricing-cards');
        if (pricingCards) {
            pricingCards.classList.add('pricing-carousel');
            carouselContainer = pricingCards;
        }
    }

    if (!carouselContainer) {
        console.log('No se pudo crear el carrusel de pricing');
        return;
    }

    // Variables del carrusel
    let currentIndex = 0;
    const totalCards = cards.length;
    const cardsToShow = window.innerWidth >= 768 ? 3 : 1;
    const maxIndex = Math.max(0, totalCards - cardsToShow);

    // Crear botones de navegación
    createNavigationButtons();

    // Función para crear botones
    function createNavigationButtons() {
        // Verificar si ya existen
        if (container.querySelector('.pricing-nav')) {
            return;
        }

        const navContainer = document.createElement('div');
        navContainer.className = 'pricing-nav';
        navContainer.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 2rem;
        `;

        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.className = 'pricing-nav-btn prev';
        prevBtn.setAttribute('aria-label', 'Planes anteriores');

        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.className = 'pricing-nav-btn next';
        nextBtn.setAttribute('aria-label', 'Planes siguientes');

        // Estilos para los botones
        const buttonStyle = `
            width: 50px;
            height: 50px;
            border: 2px solid var(--primary);
            background: white;
            color: var(--primary);
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
        `;

        prevBtn.style.cssText = buttonStyle;
        nextBtn.style.cssText = buttonStyle;

        // Hover effects
        [prevBtn, nextBtn].forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'var(--primary)';
                btn.style.color = 'white';
                btn.style.transform = 'scale(1.1)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'white';
                btn.style.color = 'var(--primary)';
                btn.style.transform = 'scale(1)';
            });
        });

        // Event listeners
        prevBtn.addEventListener('click', () => moveTo(currentIndex - 1));
        nextBtn.addEventListener('click', () => moveTo(currentIndex + 1));

        navContainer.appendChild(prevBtn);
        navContainer.appendChild(nextBtn);
        container.appendChild(navContainer);

        // Actualizar estado inicial
        updateButtonStates();
    }

    // Función para mover el carrusel
    function moveTo(index) {
        if (index < 0 || index > maxIndex) {
            return;
        }

        currentIndex = index;
        const translateX = -(currentIndex * (100 / cardsToShow));
        
        carouselContainer.style.transform = `translateX(${translateX}%)`;
        carouselContainer.style.transition = 'transform 0.5s ease';

        updateButtonStates();
    }

    // Actualizar estado de los botones
    function updateButtonStates() {
        const prevBtn = container.querySelector('.pricing-nav-btn.prev');
        const nextBtn = container.querySelector('.pricing-nav-btn.next');

        if (prevBtn && nextBtn) {
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex === maxIndex;

            prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
            nextBtn.style.opacity = currentIndex === maxIndex ? '0.5' : '1';
        }
    }

    // Configurar estilos del carrusel
    carouselContainer.style.cssText = `
        display: flex;
        transition: transform 0.5s ease;
        gap: 2rem;
    `;

    cards.forEach(card => {
        card.style.cssText = `
            flex: 0 0 ${100 / cardsToShow}%;
            max-width: ${100 / cardsToShow}%;
        `;
    });

    // Responsive
    window.addEventListener('resize', () => {
        const newCardsToShow = window.innerWidth >= 768 ? 3 : 1;
        if (newCardsToShow !== cardsToShow) {
            // Reinicializar si cambia el número de cards a mostrar
            setTimeout(() => {
                location.reload(); // Solución simple para responsive
            }, 100);
        }
    });

    console.log('Carrusel de pricing inicializado');
}

// Auto-navegación opcional (deshabilitada por defecto)
export function enableAutoPricingCarousel(interval = 5000) {
    const container = document.querySelector('.pricing-slider-container');
    if (!container) return;

    setInterval(() => {
        const nextBtn = container.querySelector('.pricing-nav-btn.next');
        const prevBtn = container.querySelector('.pricing-nav-btn.prev');
        
        if (nextBtn && !nextBtn.disabled) {
            nextBtn.click();
        } else if (prevBtn) {
            // Volver al inicio cuando llegue al final
            const resetBtn = container.querySelector('.pricing-nav-btn.prev');
            while (resetBtn && !resetBtn.disabled) {
                resetBtn.click();
            }
        }
    }, interval);
}