// =========================================
// BLOQUE: Gráficos de analítica (Chart.js)
// Explicación: Este bloque carga y muestra los gráficos de visitas y países en el panel admin usando datos del backend y Chart.js.
// =========================================
// analytics-charts.js - Gráficos para la sección de analítica
// Requiere Chart.js
import { supabase } from './supabase-client.js';

async function renderAnalyticsCharts() {
    const ctxVisits = document.getElementById('analytics-visits-chart')?.getContext('2d');
    const ctxCountries = document.getElementById('analytics-countries-chart')?.getContext('2d');

    // Destruir gráficos existentes para evitar errores de reutilización de canvas
    if (ctxVisits) {
        const existingChart = Chart.getChart(ctxVisits.canvas);
        if (existingChart) {
            existingChart.destroy();
        }
    }
    if (ctxCountries) {
        const existingChart = Chart.getChart(ctxCountries.canvas);
        if (existingChart) {
            existingChart.destroy();
        }
    }

    // Determinar colores basados en el tema actual
    const isDarkMode = document.body.classList.contains('dark-mode');
    const chartTextColor = isDarkMode ? '#A0A0A0' : '#6C757D';
    const chartGridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const chartPointBgColor = '#6366F1';
    const chartPointBorderColor = isDarkMode ? '#1A1A1A' : '#FFFFFF';
    const doughnutBorderColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';

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
                    borderColor: '#6366F1', // Accent blue
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0, // Optimización para el rendimiento
                    fill: false, // Optimización para el rendimiento
                    pointRadius: 4,
                    pointBackgroundColor: chartPointBgColor,
                    pointBorderColor: chartPointBorderColor,
                    pointHoverRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { 
                        grid: { display: false },
                        ticks: { color: chartTextColor }
                    },
                    y: { 
                        beginAtZero: true, 
                        grid: { color: chartGridColor },
                        ticks: { color: chartTextColor }
                    }
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
                    backgroundColor: ['#3ECF8E', '#6366F1', '#8B5CF6', '#F9B233', '#6C757D'],
                    borderWidth: 3,
                    borderColor: doughnutBorderColor
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: chartTextColor } } }
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

// Exponer la función globalmente para que pueda ser llamada desde otros scripts
window.renderAnalyticsCharts = renderAnalyticsCharts;

