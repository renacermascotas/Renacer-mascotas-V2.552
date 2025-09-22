// reveal.js: Animaciones reveal para elementos al hacer scroll (Intersection Observer)

// =========================================
// BLOQUE: Animaciones reveal al hacer scroll
// Explicación: Usa IntersectionObserver para activar animaciones cuando los elementos con clase .reveal entran en pantalla.
// =========================================
export function initReveal() {
    const revealElements = document.querySelectorAll(".reveal, .section-title");
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    }
}
