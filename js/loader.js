// =========================================
// BLOQUE: Loader general del sitio
// Explicación: Este bloque gestiona la animación de carga global, ocultando el loader solo cuando todos los includes y la página estén listos.
// =========================================
export function initLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;

    // IDs de los includes que deben estar cargados
    const includes = ["topbar", "header", "contactos", "contacto-extra", "footer"];
    let loaded = 0;

    function checkAllLoaded() {
        loaded++;
        if (loaded >= includes.length + 1) { // +1 por window.load
            loader.style.opacity = "0";
            setTimeout(() => loader.style.display = "none", 600);
        }
    }

    // Escucha cuando cada include se carga
    includes.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const observer = new MutationObserver(() => {
                if (el.innerHTML.trim().length > 0) {
                    observer.disconnect();
                    checkAllLoaded();
                }
            });
            observer.observe(el, { childList: true });
        } else {
            // Si no existe, igual cuenta como cargado
            checkAllLoaded();
        }
    });

    window.addEventListener("load", checkAllLoaded);
}
