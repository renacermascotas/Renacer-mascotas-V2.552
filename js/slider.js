// slider.js: Controla el slider/carousel de testimonios en la web

// =========================================
// BLOQUE: Slider/carousel de testimonios
// Explicación: Permite navegar entre testimonios con botones prev/next, mostrando uno a la vez. Solo se activa si hay más de un testimonio.
// =========================================
export function initTestimonialSlider() {
    const testimonialsContainer = document.querySelector("#testimonials .slider");
    if (testimonialsContainer) {
        const slides = testimonialsContainer.querySelector(".slides");
        const prevBtn = testimonialsContainer.querySelector("#testimonial-prev");
        const nextBtn = testimonialsContainer.querySelector("#testimonial-next");
        const testimonials = slides.querySelectorAll(".testimonial");
        if (testimonials.length > 1) {
            let testimonialIndex = 0;
            const showTestimonial = (index) => {
                slides.style.transform = `translateX(-${index * 100}%)`;
            };
            showTestimonial(testimonialIndex);
            nextBtn.addEventListener("click", () => {
                testimonialIndex = (testimonialIndex + 1) % testimonials.length;
                showTestimonial(testimonialIndex);
            });
            prevBtn.addEventListener("click", () => {
                testimonialIndex = (testimonialIndex - 1 + testimonials.length) % testimonials.length;
                showTestimonial(testimonialIndex);
            });
        }
    }
}
