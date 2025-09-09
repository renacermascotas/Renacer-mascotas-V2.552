// =========================================
// BLOQUE: Inicialización del hero carousel
// Explicación: Este bloque gestiona el slider principal de la portada, permitiendo navegación con botones y teclado, y autoplay con reinicio al interactuar.
// =========================================
export function initHeroCarousel() {
    const heroCarousel = document.querySelector('.hero-carousel');
    if (heroCarousel) {
        const carouselImgs = heroCarousel.querySelectorAll('.carousel-img');
        const prevBtn = heroCarousel.querySelector('.prev');
        const nextBtn = heroCarousel.querySelector('.next');
        let carouselIndex = 0;
        let carouselInterval;
        if (carouselImgs.length > 1) {
            const showCarouselImg = (idx) => {
                carouselImgs.forEach((img, i) => {
                    img.classList.toggle('active', i === idx);
                });
            };
            const nextCarousel = () => {
                carouselIndex = (carouselIndex + 1) % carouselImgs.length;
                showCarouselImg(carouselIndex);
            };
            const prevCarousel = () => {
                carouselIndex = (carouselIndex - 1 + carouselImgs.length) % carouselImgs.length;
                showCarouselImg(carouselIndex);
            };
            const resetCarouselInterval = () => {
                clearInterval(carouselInterval);
                carouselInterval = setInterval(nextCarousel, 4000);
            };
            showCarouselImg(carouselIndex);
            if (nextBtn && prevBtn) {
                nextBtn.addEventListener('click', () => {
                    nextCarousel();
                    resetCarouselInterval();
                });
                prevBtn.addEventListener('click', () => {
                    prevCarousel();
                    resetCarouselInterval();
                });
            }
            document.addEventListener('keydown', (e) => {
                if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
                if (e.key === "ArrowRight") {
                    nextCarousel();
                    resetCarouselInterval();
                } else if (e.key === "ArrowLeft") {
                    prevCarousel();
                    resetCarouselInterval();
                }
            });
            carouselInterval = setInterval(nextCarousel, 4000);
        }
    }
}
