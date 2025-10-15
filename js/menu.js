// js/menu.js: Lógica para el menú de navegación y efectos de scroll.

export function initMenu() {
    // ===== Mobile Menu Toggle =====
    const navToggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".menu");

    if (navToggle && menu) {
        navToggle.addEventListener("click", () => {
            const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
            navToggle.setAttribute("aria-expanded", !isExpanded);
            menu.classList.toggle("show");
        });

        // Manejo del submenú en móvil
        const dropdowns = menu.querySelectorAll(".dropdown");
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector(".dropdown-toggle");
            const submenu = dropdown.querySelector(".submenu");

            if (toggle && submenu) {
                toggle.addEventListener("click", (e) => {
                    const href = toggle.getAttribute('href');
                    const isAnchor = href && href.startsWith('#');
                    const hasSubmenu = dropdown.classList.contains('has-submenu');

                    if (isAnchor || hasSubmenu) {
                        e.preventDefault();
                    }
                    submenu.style.display = submenu.style.display === "block" ? "none" : "block";
                });
            }
        });

        // Cerrar menú al hacer clic en un enlace que no abre un submenú
        menu.querySelectorAll("a:not(.dropdown-toggle)").forEach(link => {
            link.addEventListener("click", () => {
                menu.classList.remove("show");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    // ===== Navbar Scroll Effect =====
    const headerContainer = document.getElementById("header");
    if (headerContainer) {
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const headerElement = headerContainer.querySelector('header');

            // Lógica para el estilo visual (cristal/oscuro)
            if (currentScrollY > 50) {
                headerContainer.classList.add("scrolled");
                if (headerElement) headerElement.classList.add("scrolled-visual");
            } else {
                headerContainer.classList.remove("scrolled");
                if (headerElement) headerElement.classList.remove("scrolled-visual");
            }

            // Lógica para ocultar/mostrar al hacer scroll
            if (currentScrollY > lastScrollY && currentScrollY > 150) {
                // Hacia abajo
                headerContainer.classList.add('header-hidden');
            } else {
                // Hacia arriba
                headerContainer.classList.remove('header-hidden');
            }
            lastScrollY = currentScrollY;
        };
        window.addEventListener("scroll", handleScroll);
        handleScroll(); // Ejecutar al cargar
    }

    // ===== Scrollspy (Active link highlighting) =====
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-left a, .nav-right a");

    if (sections.length > 0 && navLinks.length > 0) {
        const onScroll = () => {
            const scrollY = window.pageYOffset;
            let currentSectionId = null;

            sections.forEach(current => {
                const sectionHeight = current.offsetHeight;
                const sectionTop = current.offsetTop - 150;
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    currentSectionId = current.getAttribute("id");
                }
            });

            navLinks.forEach(link => {
                link.classList.remove("active");
                const linkHref = link.getAttribute("href");
                if (linkHref && linkHref.includes(currentSectionId)) {
                    link.classList.add("active");
                }
            });

            if (scrollY < 100) {
                const homeLink = document.querySelector('.nav-left a[href*="#hero"]');
                if (homeLink) homeLink.classList.add('active');
            }
        };
        window.addEventListener("scroll", onScroll);
        onScroll(); // Ejecutar al cargar
    }
}