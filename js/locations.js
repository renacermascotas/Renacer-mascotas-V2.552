// js/locations.js - Manejo de múltiples ubicaciones en el mapa

/**
 * Datos de las ubicaciones de Renacer Mascotas
 */
const locations = {
    pereira: {
        name: "Renacer Mascotas - Pereira",
        address: "Calle 46 #10-47, Centro, Pereira",
        phone: "+57 320 705 3536",
        schedule: "Lun-Vie: 8:00 AM - 6:00 PM",
        whatsapp: "573207053536",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.222383204944!2d-75.71960142512128!3d4.778844895180153!2m3!1f0!2f0!3f0!3m2!i1024!2i768!4f13.1!3m3!1m2!1s0x8e3532f518e38d73%3A0x6a19f96b29d47c49!2sCl.%2046%20%2310-47%2C%20Pereira%2C%20Risaralda!5e0!3m2!1ses-419!2sco!4v1693754877478!5m2!1ses-419!2sco"
    },
    dosquebradas: {
        name: "Renacer Mascotas - Dosquebradas",
        address: "Carrera 15 #25-30, Centro Comercial, Dosquebradas",
        phone: "+57 320 705 3537",
        schedule: "Lun-Sab: 8:00 AM - 5:00 PM",
        whatsapp: "573207053537",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3975.8234567890123!2d-75.6789!3d4.8123!2m3!1f0!2f0!3f0!3m2!i1024!2i768!4f13.1!3m3!1m2!1s0x8e123456789abcde%3A0x123456789abcdef0!2sCarrera%2015%20%2325-30%2C%20Dosquebradas%2C%20Risaralda!5e0!3m2!1ses-419!2sco!4v1693754877479!5m2!1ses-419!2sco"
    },
    manizales: {
        name: "Renacer Mascotas - Manizales",
        address: "Avenida 12 de Octubre #20-15, Zona Rosa, Manizales",
        phone: "+57 320 705 3538",
        schedule: "Lun-Vie: 9:00 AM - 5:00 PM",
        whatsapp: "573207053538",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.1234567890123!2d-75.5123!3d5.0678!2m3!1f0!2f0!3f0!3m2!i1024!2i768!4f13.1!3m3!1m2!1s0x8e456789abcdef01%3A0x456789abcdef0123!2sAv.%2012%20de%20Octubre%20%2320-15%2C%20Manizales%2C%20Caldas!5e0!3m2!1ses-419!2sco!4v1693754877480!5m2!1ses-419!2sco"
    }
};

/**
 * Cambia la ubicación mostrada en el mapa
 * @param {string} locationKey - Clave de la ubicación (pereira, dosquebradas, manizales)
 */
function changeLocation(locationKey) {
    if (!locations[locationKey]) {
        console.error('Ubicación no encontrada:', locationKey);
        return;
    }

    const location = locations[locationKey];
    
    // Actualizar botones activos
    document.querySelectorAll('.location-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-location="${locationKey}"]`).classList.add('active');
    
    // Actualizar iframe del mapa
    const mapIframe = document.getElementById('map-iframe');
    if (mapIframe) {
        mapIframe.src = location.mapUrl;
    }
    
    // Actualizar información de la ubicación
    const locationInfo = document.getElementById('location-info');
    if (locationInfo) {
        locationInfo.innerHTML = `
            <div class="location-details">
                <h4>🏢 ${location.name}</h4>
                <p><i class="fas fa-map-marker-alt"></i> ${location.address}</p>
                <p><i class="fas fa-phone"></i> ${location.phone}</p>
                <p><i class="fas fa-clock"></i> ${location.schedule}</p>
                <div style="margin-top: 0.5rem;">
                    <a href="https://wa.me/${location.whatsapp}?text=Hola, quiero información sobre sus servicios en ${location.name.split(' - ')[1]}" 
                       target="_blank" class="btn btn-sm" style="background: #25D366; color: white; padding: 0.5rem 1rem; border-radius: 5px; text-decoration: none;">
                        <i class="fab fa-whatsapp"></i> Contactar ${location.name.split(' - ')[1]}
                    </a>
                </div>
            </div>
        `;
    }
}

/**
 * Inicializa el sistema de ubicaciones
 */
function initLocations() {
    // Verificar si estamos en la página que tiene el mapa
    if (!document.getElementById('map-iframe')) {
        return;
    }

    // Agregar event listeners a los botones
    document.querySelectorAll('.location-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const location = this.getAttribute('data-location');
            changeLocation(location);
        });
    });

    console.log('Sistema de ubicaciones inicializado');
}

// Hacer la función global para el onclick en HTML
window.changeLocation = changeLocation;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initLocations);

export { initLocations, changeLocation };