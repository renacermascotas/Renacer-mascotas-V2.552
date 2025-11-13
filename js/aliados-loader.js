// aliados-loader.js
// Carga dinámica de aliados desde Supabase

import { supabase } from './supabase-client.js';

async function loadAliados() {
    try {
        console.log('Cargando aliados desde Supabase...');
        
        const { data: aliados, error } = await supabase
            .from('aliados')
            .select('*')
            .order('departamento', { ascending: true })
            .order('ciudad', { ascending: true })
            .order('nombre', { ascending: true });

        if (error) {
            console.error('Error al cargar aliados:', error);
            return;
        }

        console.log(`✅ ${aliados.length} aliados cargados`);

        // Agrupar por departamento y luego por ciudad
        const aliadosPorDepartamento = {};
        aliados.forEach(aliado => {
            const departamento = aliado.departamento;
            const ciudad = aliado.ciudad;
            
            if (!aliadosPorDepartamento[departamento]) {
                aliadosPorDepartamento[departamento] = {};
            }
            if (!aliadosPorDepartamento[departamento][ciudad]) {
                aliadosPorDepartamento[departamento][ciudad] = [];
            }
            aliadosPorDepartamento[departamento][ciudad].push(aliado);
        });

        // Renderizar en el DOM
        const container = document.querySelector('.aliados-grid') || document.querySelector('#aliados .aliados-grupos');
        if (!container) {
            console.warn('No se encontró contenedor para aliados');
            return;
        }

        container.innerHTML = '';

        // Crear secciones por departamento (usando las clases CSS originales)
        Object.keys(aliadosPorDepartamento).sort().forEach(departamento => {
            const ciudades = aliadosPorDepartamento[departamento];
            
            // Título del departamento
            const departamentoTitle = document.createElement('div');
            departamentoTitle.className = 'section-title category-title';
            departamentoTitle.innerHTML = `<h2>${departamento}</h2>`;
            container.appendChild(departamentoTitle);
            
            // Grid de cards para todos los aliados del departamento
            const grid = document.createElement('div');
            grid.className = 'cards pricing-cards';

            // Agregar todos los aliados de todas las ciudades
            Object.keys(ciudades).sort().forEach(ciudad => {
                ciudades[ciudad].forEach(aliado => {
                    const card = document.createElement('div');
                    card.className = 'plan-block';
                    
                    const whatsappMsg = `Hola,%20necesito%20más%20información%20de%20${encodeURIComponent(aliado.nombre)}%20para%20servicio`;
                    const link = aliado.website || `https://wa.me/573207053536?text=${whatsappMsg}`;
                    
                    card.innerHTML = `
                        <a href="${link}" target="_blank" class="plan-img-top plan-hover-link">
                            <img src="${aliado.logo_url}" alt="${aliado.nombre}" class="plan-image" loading="lazy" />
                        </a>
                        <span class="aliados-label">${aliado.nombre}<br><small style="color: #666; font-size: 0.85em;">${ciudad}</small></span>
                    `;

                    grid.appendChild(card);
                });
            });

            container.appendChild(grid);
        });

    } catch (error) {
        console.error('Error general al cargar aliados:', error);
    }
}

// Cargar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAliados);
} else {
    loadAliados();
}

export { loadAliados };
