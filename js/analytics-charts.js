// =========================================
// BLOQUE: Gráficos de analítica (Chart.js)
// Explicación: Este bloque carga y muestra los gráficos de visitas y países en el panel admin usando datos del backend y Chart.js.
// =========================================
// analytics-charts.js - Gráficos para la sección de analítica
// Requiere Chart.js

// Cargar y mostrar gráficos de analítica con datos reales
async function renderAnalyticsCharts() {
        const ctxVisits = document.getElementById('analytics-visits-chart').getContext('2d');
        const ctxCountries = document.getElementById('analytics-countries-chart').getContext('2d');

        // Visitas por día
        let days = [];
        let visitsData = [];
            const data = await res.json();
        }

        // Ejecutar solo una vez cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                if (document.getElementById('analytics-visits-chart')) {
                    renderAnalyticsCharts();
                }
            });
        } else {
            if (document.getElementById('analytics-visits-chart')) {
                renderAnalyticsCharts();
            }
        }
            visitsData = [0, 0, 0, 0, 0, 0, 0];
        new Chart(ctxVisits, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Visitas',
                    data: visitsData,
                    borderColor: '#f9b233',
                    backgroundColor: 'rgba(249,178,51,0.15)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#2b3a4a',
                }]
            },
            options: {
                plugins: { legend: { display: false } },

                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, grid: { color: '#e5e9ef' } }
                }
            }
        });

        // Países principales
        let countryLabels = [];
        let countryData = [];
        try {
            const res = await fetch('http://localhost:4000/api/analytics-extended/top-countries');
            const data = await res.json();
            countryLabels = data.map(d => d.country);
            countryData = data.map(d => d.users);
        } catch {
            countryLabels = ['Sin datos'];
            countryData = [0];
        }

        new Chart(ctxCountries, {
            type: 'doughnut',
            data: {
                labels: countryLabels,
                datasets: [{
                    data: countryData,
                    backgroundColor: ['#f9b233', '#2b3a4a', '#e5e9ef', '#f4f7fa', '#888'],
                    borderWidth: 1
                }]
            },
            options: {
                plugins: { legend: { position: 'bottom' } }
            }
        });

    document.addEventListener('DOMContentLoaded', function () {
        if (document.getElementById('analytics-visits-chart')) {
            renderAnalyticsCharts();
        }
    });
    // Si el DOM ya está cargado, ejecutar inmediatamente
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            renderAnalyticsCharts();
        });
    } else {
        renderAnalyticsCharts();
    }