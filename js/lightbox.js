// js/lightbox.js: Lógica para mostrar imágenes en un visor modal (lightbox).

export function initLightbox() {
    const galleryContainer = document.querySelector('.gallery, #gallery-list-front');
    if (!galleryContainer) return;

    let lightboxElement = null;

    function showLightbox(imgSrc, altText) {
        // Crear el HTML del lightbox si no existe
        if (!lightboxElement) {
            lightboxElement = document.createElement('div');
            lightboxElement.className = 'lightbox-overlay';
            lightboxElement.innerHTML = `
                <div class="lightbox-content">
                    <img src="" alt="" class="lightbox-image">
                    <button class="lightbox-close" aria-label="Cerrar">&times;</button>
                    <p class="lightbox-caption"></p>
                    <a href="galeria.html" class="lightbox-gallery-btn">Ir a Galería</a>
                </div>
            `;
            document.body.appendChild(lightboxElement);

            // Añadir eventos para cerrar
            const closeBtn = lightboxElement.querySelector('.lightbox-close');
            closeBtn.addEventListener('click', hideLightbox);
            lightboxElement.addEventListener('click', (e) => {
                if (e.target === lightboxElement) { // Cerrar solo si se hace clic en el fondo
                    hideLightbox();
                }
            });
        }

        // Actualizar contenido y mostrar
        const lightboxImage = lightboxElement.querySelector('.lightbox-image');
        const lightboxCaption = lightboxElement.querySelector('.lightbox-caption');

        lightboxImage.src = imgSrc;
        lightboxImage.alt = altText;
        lightboxCaption.textContent = altText;

        document.body.classList.add('lightbox-active');
        lightboxElement.classList.add('active');
    }

    function hideLightbox() {
        if (lightboxElement) {
            lightboxElement.classList.remove('active');
            document.body.classList.remove('lightbox-active');
        }
    }

    // Usar delegación de eventos para manejar clics en las imágenes de la galería
    galleryContainer.addEventListener('click', (e) => {
        const galleryItem = e.target.closest('a.gallery-item');
        if (galleryItem) {
            e.preventDefault(); // Prevenir la navegación si es un enlace
            const img = galleryItem.querySelector('img');
            const desc = galleryItem.querySelector('.gallery-desc');
            if (img) {
                showLightbox(img.src, desc ? desc.textContent : img.alt);
            }
        }
    });

    // Cerrar con la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideLightbox();
        }
    });
}