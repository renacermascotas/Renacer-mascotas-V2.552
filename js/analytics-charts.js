// =========================================
// BLOQUE: Gráficos de analítica (Chart.js)
// Explicación: Este bloque carga y muestra los gráficos de visitas y países en el panel admin usando datos del backend y Chart.js.
// =========================================
// analytics-charts.js - Gráficos para la sección de analítica
// Requiere Chart.js
import { supabase } from './supabase-client.js';

// Cargar y mostrar gráficos de analítica con datos reales
async function renderAnalyticsCharts() {
    const ctxVisits = document.getElementById('analytics-visits-chart')?.getContext('2d');
    const ctxCountries = document.getElementById('analytics-countries-chart')?.getContext('2d');

    if (!ctxVisits || !ctxCountries) return;

    try {
        const { data: analyticsData, error } = await supabase.functions.invoke('analytics-summary');
        if (error) throw error;

        // --- Gráfico de Visitas por día ---
        const visitsByDay = analyticsData.charts?.visitsByDay || [];
        const visitLabels = visitsByDay.map(d => new Date(d.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }));
        const visitValues = visitsByDay.map(d => d.users);

        new Chart(ctxVisits, {
            type: 'line',
            data: {
                labels: visitLabels,
                datasets: [{
                    label: 'Visitas',
                    data: visitValues,
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

        // --- Gráfico de Países principales ---
        const topCountries = analyticsData.charts?.topCountries || [];
        const countryLabels = topCountries.map(d => d.country);
        const countryData = topCountries.map(d => d.users);
        
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
    } catch (err) {
        console.error('Error al renderizar los gráficos de analítica:', err);
        // Opcional: Mostrar un mensaje de error en los canvas
        ctxVisits.font = "16px Arial";
        ctxVisits.fillText("Error al cargar datos.", 10, 50);
        ctxCountries.font = "16px Arial";
        ctxCountries.fillText("Error al cargar datos.", 10, 50);
    }
}

// Ejecutar cuando el DOM esté listo y el elemento exista
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('analytics-visits-chart')) {
        renderAnalyticsCharts();
    }
});