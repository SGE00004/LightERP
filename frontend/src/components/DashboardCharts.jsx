import React from 'react';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend, 
    ArcElement 
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom'; 

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, zoomPlugin);

const DashboardCharts = ({ sales, products }) => {
    
    // --- DATOS GRÁFICA DE LÍNEAS ---
    const recentSales = [...sales].slice(-15); 
    const lineData = {
        labels: recentSales.map((s, index) => `Venta #${s.id || index + 1}`),
        datasets: [
            {
                label: 'Monto de la Venta ($)',
                data: recentSales.map(s => parseFloat(s.total || 0)),
                borderColor: 'rgb(79, 70, 229)',
                backgroundColor: 'rgba(79, 70, 229, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            zoom: {
                zoom: { wheel: { enabled: true }, mode: 'x' },
                pan: { enabled: true, mode: 'x' }
            }
        }
    };

    // --- DATOS GRÁFICA DE ROSQUILLA ---
    const topProducts = [...products].sort((a, b) => b.stock - a.stock).slice(0, 5);
    const doughnutData = {
        labels: topProducts.map(p => p.name),
        datasets: [
            {
                label: 'Unidades',
                data: topProducts.map(p => p.stock),
                backgroundColor: [
                    'rgba(79, 70, 229, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(6, 182, 212, 0.7)',
                ],
            },
        ],
    };

    // Opciones para agrandar la rosquilla y alinear la leyenda a la derecha
    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right', // 👈 Mueve la leyenda a la derecha
                labels: {
                    boxWidth: 15,  // Hace los cuadritos de color un poco más estéticos
                    font: {
                        size: 11,  // Tamaño óptimo para leer nombres de productos
                    }
                }
            }
        },
        layout: {
            padding: 0 // 👈 Elimina espacios muertos innecesarios para estirar el gráfico
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            
            {/* TARJETA 1: HISTORIAL DE INGRESOS */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-md font-bold text-gray-700">Historial de Ingresos</h3>
                    <span className="text-2xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold">VENTAS</span>
                </div>
                <div className="h-64 flex-1">
                    <Line data={lineData} options={lineOptions} />
                </div>
            </div>

            {/* TARJETA 2: DISTRIBUCIÓN DE INVENTARIO */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-md font-bold text-gray-700">Distribución de Inventario</h3>
                    <span className="text-2xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold">STOCK</span>
                </div>
                <div className="h-64 flex-1">
                    {/* Le pasamos las nuevas opciones configuradas arriba */}
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
            </div>

        </div>
    );
};

export default DashboardCharts;