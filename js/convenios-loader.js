// convenios-loader.js
// Carga dinámica de convenios desde Supabase

import { supabase } from './supabase-client.js';

async function loadConvenios() {
    try {
        console.log('Cargando convenios desde Supabase...');
        
        const { data: convenios, error } = await supabase
            .from('convenios')
            .select('*')
            .order('departamento', { ascending: true })
            .order('ciudad', { ascending: true })
            .order('nombre', { ascending: true });

        if (error) {
            console.error('Error al cargar convenios:', error);
            return;
        }

        console.log(`✅ ${convenios.length} convenios cargados`);

        // Agrupar por departamento y luego por ciudad
        const conveniosPorDepartamento = {};
        convenios.forEach(convenio => {
            const departamento = convenio.departamento;
            const ciudad = convenio.ciudad;
            
            if (!conveniosPorDepartamento[departamento]) {
                conveniosPorDepartamento[departamento] = {};
            }
            if (!conveniosPorDepartamento[departamento][ciudad]) {
                conveniosPorDepartamento[departamento][ciudad] = [];
            }
            conveniosPorDepartamento[departamento][ciudad].push(convenio);
        });

        // Renderizar en el DOM
        const container = document.querySelector('.convenios-grid') || document.querySelector('#convenios .cards');
        if (!container) {
            console.warn('No se encontró contenedor para convenios');
            return;
        }

        container.innerHTML = '';

        // Crear secciones por departamento (usando las clases CSS originales)
        Object.keys(conveniosPorDepartamento).sort().forEach(departamento => {
            const departamentoSection = document.createElement('div');
            departamentoSection.id = departamento.toLowerCase().replace(/\s+/g, '-');
            
            const ciudades = conveniosPorDepartamento[departamento];
            
            // Agrupar ciudades en el título si hay múltiples
            const listaCiudades = Object.keys(ciudades).sort().join(', ');
            
            const departamentoTitle = document.createElement('div');
            departamentoTitle.className = 'section-title category-title';
            departamentoTitle.innerHTML = `<h2>${departamento} - ${listaCiudades}</h2>`;
            container.appendChild(departamentoTitle);

            // Grid de cards para todos los convenios del departamento
            const grid = document.createElement('div');
            grid.className = 'cards pricing-cards';

            // Agregar todos los convenios de todas las ciudades
            Object.keys(ciudades).sort().forEach(ciudad => {
                ciudades[ciudad].forEach(convenio => {
                    const card = document.createElement('div');
                    card.className = 'plan-block';
                    
                    const whatsappMsg = `Hola,%20serás%20dirigido%20a%20nuestros%20asesores%20para%20contratar%20el%20servicio%20de%20${encodeURIComponent(convenio.nombre)}`;
                    
                    let discountBadge = '';
                    if (convenio.horario && convenio.horario.includes('24')) {
                        discountBadge = '<span class="plan-discount">24H</span>';
                    }
                    
                    card.innerHTML = `
                        <a href="https://wa.me/573207053536?text=${whatsappMsg}" target="_blank" class="plan-img-top plan-hover-link">
                            <img src="${convenio.logo_url}" alt="${convenio.nombre}" class="plan-image" loading="lazy" />
                            ${discountBadge}
                        </a>
                        <span class="aliados-label">${convenio.nombre}<br><small style="color: #666; font-size: 0.85em;">${ciudad}</small></span>
                    `;

                    grid.appendChild(card);
                });
            });

            container.appendChild(grid);
        });

    } catch (error) {
        console.error('Error general al cargar convenios:', error);
    }
}

// Cargar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadConvenios);
} else {
    loadConvenios();
}

export { loadConvenios };
