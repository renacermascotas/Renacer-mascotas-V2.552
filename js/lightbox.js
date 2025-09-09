// =========================================
// BLOQUE: Inicialización de lightbox para galería
// Explicación: Este bloque permite ampliar imágenes de la galería en un modal (lightbox), gestionando la apertura, cierre y accesibilidad con teclado y mouse.
// =========================================
export function initLightbox() {
    const galleryLinks = document.querySelectorAll(".gallery a");
    galleryLinks.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            openLightbox(link.getAttribute("href"));
        });
    });
    function openLightbox(src) {
        const lightbox = document.createElement("div");
        lightbox.classList.add("lightbox");
        lightbox.innerHTML = `
      <div class="overlay"></div>
      <img src="${src}" alt="Imagen de la galería ampliada">
      <button class="close-lightbox" aria-label="Cerrar imagen">&times;</button>
    `;
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';
        const closeLightbox = () => {
            lightbox.remove();
            document.body.style.overflow = 'auto';
            document.removeEventListener("keydown", handleEsc);
        };
        const handleEsc = (e) => {
            if (e.key === "Escape") closeLightbox();
        };
        lightbox.querySelector(".overlay").addEventListener("click", closeLightbox);
        lightbox.querySelector(".close-lightbox").addEventListener("click", closeLightbox);
        document.addEventListener("keydown", handleEsc);
    }
}
