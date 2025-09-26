// =========================================
// BLOQUE: Inclusión de componentes HTML reutilizables
// Explicación: Carga componentes comunes como header, footer, etc., de forma paralela y eficiente en toda la web.
// Esto evita la duplicación de código y mejora la velocidad de carga.
// =========================================

/**
 * Carga un componente HTML desde una URL en un elemento del DOM.
 * @param {string} elementId - El ID del elemento donde se insertará el HTML.
 * @param {string} url - La URL del archivo HTML a cargar.
 * @returns {Promise<void>}
 */
const includeHTML = (elementId, url) => {
    // Busca el elemento en el DOM. Si no existe, no hace nada.
    const element = document.getElementById(elementId);
    if (!element) {
        return Promise.resolve(); // Resuelve la promesa para no bloquear Promise.all
    }

    return fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`Fallo al cargar ${url}: ${response.statusText}`);
            return response.text();
        })
        .then(html => {
            element.innerHTML = html;
        })
        .catch(error => console.error(`Error incluyendo HTML desde ${url}:`, error));
};

// Exporta la función para que pueda ser importada en otros scripts.
export { includeHTML };