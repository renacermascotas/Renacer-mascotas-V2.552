// ========================================================================================================
// RENACER MASCOTAS - scripts.js (VERSIÓN OPTIMIZADA)
// ========================================================================================================

document.addEventListener("DOMContentLoaded", () => {
    // ===== Loader =====
    const loader = document.getElementById("loader");
    if (loader) {
        window.addEventListener("load", () => {
            loader.style.opacity = "0";
            setTimeout(() => loader.style.display = "none", 600);
        });
    }

    // ===== Mobile Menu Toggle =====
    const navToggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".menu");

    if (navToggle && menu) {
        navToggle.addEventListener("click", () => {
            menu.classList.toggle("show");
            const isExpanded = menu.classList.contains("show");
            navToggle.setAttribute("aria-expanded", isExpanded);
        });

        // Cerrar menú al hacer clic en un enlace
        menu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                menu.classList.remove("show");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    // ===== Smooth Scroll for Anchor Links =====
    // Nota: El scroll-behavior: smooth; en CSS ya maneja esto.
    // Este script es un respaldo por si el CSS no es soportado.
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: "smooth"
                });
            }
        });
    });

    // ===== Testimonial Slider con botones de navegación =====
    const testimonialsContainer = document.querySelector("#testimonials .slider");
    if (testimonialsContainer) {
        const slides = testimonialsContainer.querySelector(".slides");
        const prevBtn = testimonialsContainer.querySelector(".prev");
        const nextBtn = testimonialsContainer.querySelector(".next");
        const testimonials = slides.querySelectorAll(".testimonial");

        if (testimonials.length > 1) {
            let testimonialIndex = 0;

            const showTestimonial = (index) => {
                slides.style.transform = `translateX(-${index * 100}%)`;
            };

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

    // ===== Gallery Lightbox =====
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
        document.body.style.overflow = 'hidden'; // Evita el scroll del fondo

        const closeLightbox = () => {
            lightbox.remove();
            document.body.style.overflow = 'auto';
            document.removeEventListener("keydown", handleEsc);
        };

        const handleEsc = (e) => {
            if (e.key === "Escape") {
                closeLightbox();
            }
        };

        lightbox.querySelector(".overlay").addEventListener("click", closeLightbox);
        lightbox.querySelector(".close-lightbox").addEventListener("click", closeLightbox);
        document.addEventListener("keydown", handleEsc);
    }

    // ===== Scroll Reveal Animations (OPTIMIZADO CON INTERSECTION OBSERVER) =====
    const revealElements = document.querySelectorAll(".reveal");
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    // Opcional: deja de observar el elemento una vez revelado
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1 // El elemento se revela cuando es visible al 10%
        });

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    }


    // ===== Formulario que envía a WhatsApp =====
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", e => {
            e.preventDefault();
            const nombre = contactForm.querySelector('input[name="nombre"]').value.trim();
            const email = contactForm.querySelector('input[name="email"]').value.trim();
            const mensaje = contactForm.querySelector('textarea[name="mensaje"]').value.trim();

            // Campos opcionales
            const asuntoInput = contactForm.querySelector('input[name="asunto"]');
            const telefonoInput = contactForm.querySelector('input[name="telefono"]');
            const asunto = asuntoInput ? asuntoInput.value.trim() : "";
            const telefono = telefonoInput ? telefonoInput.value.trim() : "";


            if (!nombre || !email || !mensaje) {
                alert("Por favor completa los campos obligatorios: nombre, correo y mensaje.");
                return;
            }

            // Construir el mensaje para WhatsApp
            let fullMessage = `Hola, soy ${nombre} (${email}).\n`;
            if (telefono) fullMessage += `Mi teléfono es: ${telefono}.\n`;
            if (asunto) fullMessage += `Asunto: ${asunto}.\n\n`;
            fullMessage += mensaje;

            const phoneNumber = "573207053536"; // Tu número de WhatsApp
            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(fullMessage)}`;
            window.open(url, "_blank");
        });
    }

    // ===== Hero Carousel con soporte de teclado =====
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
                // Solo activa con flechas si no se está escribiendo en un input
                if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

                if (e.key === "ArrowRight") {
                    nextCarousel();
                    resetCarouselInterval();
                } else if (e.key === "ArrowLeft") {
                    prevCarousel();
                    resetCarouselInterval();
                }
            });

            // Iniciar el intervalo automático
            carouselInterval = setInterval(nextCarousel, 4000);
        }
    }

    // ===== Analytics Tracking =====
    async function trackVisit() {
        // No rastrear en el dashboard de admin ni en páginas locales
        if (window.location.pathname.includes('admin-dashboard.html') || window.location.protocol === 'file:') {
            return;
        }

        try {
            // Importar el cliente de Supabase dinámicamente desde el CDN
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
            const supabase = createClient('https://obsshvmadmfmqigivjkb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ic3Nodm1hZG1mbXFpZ2l2amtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NjA1ODIsImV4cCI6MjA3MzUzNjU4Mn0.pRB9hUR80nqPuH-D7ojBxrUQM1Ax2x3LWV0p59few6U');

            // Obtener datos de geolocalización
            const geoResponse = await fetch('https://ipapi.co/json/');
            if (!geoResponse.ok) {
                console.warn('Analytics: Could not fetch geolocation data.');
                return; 
            }
            const geoData = await geoResponse.json();

            const visitData = {
                path: window.location.pathname,
                country: geoData.country_name,
                city: geoData.city,
                region: geoData.region
            };

            // Insertar la visita en la base de datos
            const { error } = await supabase.from('page_visits').insert(visitData);
            if (error) {
                throw error;
            }

        } catch (error) {
            console.error('Analytics Error:', error.message);
        }
    }

    // Ejecutar el seguimiento de la visita
    trackVisit();
});
