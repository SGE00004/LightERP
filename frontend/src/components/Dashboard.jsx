import React, { useState, useEffect } from 'react';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend, 
    ArcElement, 
    Filler,
    BarElement,
    RadialLinearScale 
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2'; 
import api from '../services/api';

ChartJS.register(
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    ArcElement, 
    BarElement, 
    RadialLinearScale,
    Title, 
    Tooltip, 
    Legend, 
    Filler
);

// CAMBIO 1: Recibimos 'changeTab' desde App.jsx (puedes mantener currentView o el que prefieras como prop de control)
const Dashboard = ({ currentView, changeTab }) => {
    const [products, setProducts] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false); 
    const [metrics, setMetrics] = useState({
        totalProducts: 0,
        totalStock: 0,
        lowStockAlerts: 0,
        totalSalesVolume: 0
    });

    useEffect(() => {
        api.get('/products')
            .then(res => {
                const data = res.data;
                setProducts(data);
                
                const totalProducts = data.length;
                const totalStock = data.reduce((acc, p) => acc + (p.stock || 0), 0);
                
                const criticalItems = data.filter(p => (p.stock || 0) <= 5);
                setLowStockItems(criticalItems);

                const lowStockAlerts = criticalItems.length;
                const totalSalesVolume = data.reduce((acc, p) => acc + ((p.stock || 0) * (p.price || 0) * 0.4), 0);

                setMetrics({ totalProducts, totalStock, lowStockAlerts, totalSalesVolume });
            })
            .catch(err => console.error("Error cargando dashboard:", err));
    }, []);

    const dynamicProducts = products.map(p => ({
        ...p,
        sales_volume: p.sales_count ?? Math.max(0, 150 - (p.stock || 0)) 
    }));

    // CAMBIO 2: Modificamos el manejador interno para usar la función de App.jsx
    const handleNavigation = (viewName) => {
        if (changeTab) changeTab(viewName);
        setIsMenuOpen(false); // Cierra automáticamente el menú lateral al cambiar de vista
    };

    // --- CONFIGURACIÓN DE GRÁFICAS ---
    const lineData = {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Ingresos Facturados (€)',
                data: [metrics.totalSalesVolume * 0.5, metrics.totalSalesVolume * 0.7, metrics.totalSalesVolume * 0.6, metrics.totalSalesVolume * 0.9, metrics.totalSalesVolume * 0.8, metrics.totalSalesVolume],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                tension: 0.1,
                fill: true,
            },
        ],
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { font: { family: 'sans-serif', size: 11 } } } }
    };

    const topStockProducts = [...dynamicProducts].sort((a, b) => b.stock - a.stock).slice(0, 5);
    const barStockData = {
        labels: topStockProducts.map(p => p.name),
        datasets: [
            {
                label: 'Unidades Disponibles',
                data: topStockProducts.map(p => p.stock),
                backgroundColor: ['#2563eb', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b'],
                borderColor: ['#1d4ed8', '#047857', '#6d28d9', '#b91c1c', '#b45309'],
                borderWidth: 1,
                borderRadius: 0,
            },
        ],
    };

    const barStockOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { size: 11 } } },
            x: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
    };

    const topPriceProducts = [...dynamicProducts].sort((a, b) => b.price - a.price).slice(0, 5);
    const barMarginData = {
        labels: topPriceProducts.map(p => p.name),
        datasets: [
            {
                label: 'Precio Venta (€)',
                data: topPriceProducts.map(p => p.price || 0),
                backgroundColor: '#10b981',
                borderColor: '#047857',
                borderWidth: 1,
                borderRadius: 0,
            },
            {
                label: 'Costo Catálogo (€)',
                data: topPriceProducts.map(p => p.costo || (p.price * 0.6)),
                backgroundColor: '#f59e0b',
                borderColor: '#b45309',
                borderWidth: 1,
                borderRadius: 0,
            }
        ]
    };

    const barMarginOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
        scales: {
            x: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { size: 11 } } },
            y: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
    };

    const topSalesProducts = [...dynamicProducts].sort((a, b) => b.sales_volume - a.sales_volume).slice(0, 5);
    const topSalesData = {
        labels: topSalesProducts.map(p => p.name),
        datasets: [
            {
                label: 'Unidades Vendidas',
                data: topSalesProducts.map(p => p.sales_volume),
                backgroundColor: '#8b5cf6',
                borderColor: '#6d28d9',
                borderWidth: 1,
                borderRadius: 0,
            }
        ]
    };

    const topSalesOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { size: 11 } } },
            y: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
    };

    const worstSalesProducts = [...dynamicProducts].sort((a, b) => a.sales_volume - b.sales_volume).slice(0, 5);
    const worstSalesData = {
        labels: worstSalesProducts.map(p => p.name),
        datasets: [
            {
                label: 'Unidades Vendidas',
                data: worstSalesProducts.map(p => p.sales_volume),
                backgroundColor: '#ef4444',
                borderColor: '#b91c1c',
                borderWidth: 1,
                borderRadius: 0,
            },
        ],
    };

    const worstSalesOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { size: 11 } } },
            x: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
    };

    const stockEfficiencyProducts = [...dynamicProducts].slice(0, 6);
    const efficiencyData = {
        labels: stockEfficiencyProducts.map(p => p.name),
        datasets: [
            {
                label: 'Stock en Almacén',
                data: stockEfficiencyProducts.map(p => p.stock),
                backgroundColor: '#3b82f6',
                borderColor: '#1d4ed8',
                borderWidth: 1,
                borderRadius: 0,
            },
            {
                label: 'Ritmo de Ventas',
                data: stockEfficiencyProducts.map(p => p.sales_volume),
                backgroundColor: '#f59e0b',
                borderColor: '#b45309',
                borderWidth: 1,
                borderRadius: 0,
            }
        ]
    };

    const efficiencyOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { 
                position: 'bottom',
                labels: { boxWidth: 12, font: { size: 11 } } 
            } 
        },
        scales: {
            y: { 
                beginAtZero: true, 
                grid: { color: '#f3f4f6' },
                ticks: { font: { size: 11 } }
            },
            x: { 
                grid: { display: false },
                ticks: { font: { size: 10 } }
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans relative overflow-x-hidden">
            
            {/* 🖥️ BARRA SUPERIOR */}
            <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 sticky top-0 z-40">
                <h1 className="text-sm font-bold uppercase tracking-wider text-blue-800">Dashboard</h1>
            </header>
            {/* Sombra de fondo */}
            {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/20 z-40 backdrop-blur-xs" />}

            {/* CONTENIDO PRINCIPAL */}
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                
                {/* Tarjetas de Métricas */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${metrics.lowStockAlerts > 0 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
                    <div className="bg-white border border-gray-200 p-4 rounded-none shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ventas Estimadas</div>
                        <div className="text-xl font-bold text-gray-900">{metrics.totalSalesVolume.toFixed(2)} €</div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-none shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Referencias Catálogo</div>
                        <div className="text-xl font-bold text-gray-900">{metrics.totalProducts} Ítems</div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-none shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Stock General</div>
                        <div className="text-xl font-bold text-gray-900">{metrics.totalStock} Unidades</div>
                    </div>
                    {metrics.lowStockAlerts > 0 && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-none shadow-sm">
                            <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Alertas Almacén</div>
                            <div className="text-xl font-bold text-red-600 font-black">{metrics.lowStockAlerts} Críticos</div>
                        </div>
                    )}
                </div>

                {/* Alertas urgentes */}
                {metrics.lowStockAlerts > 0 && (
                    <div className="border border-red-200 rounded-none bg-red-50/50 p-4 shadow-sm">
                        <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2">⚠️ Alertas urgentes de inventario</h4>
                        <div className="divide-y divide-red-100 max-h-36 overflow-y-auto text-xs">
                            {lowStockItems.map(item => {
                                const isAgotado = (item.stock || 0) <= 0;
                                return (
                                    <div key={item.id} className="flex justify-between py-2 font-medium items-center">
                                        <span className={isAgotado ? "text-red-700 line-through font-semibold" : "text-amber-700"}>
                                            {item.name} (SKU: {item.sku || 'N/A'}) {isAgotado && '— [AGOTADO]'}
                                        </span>
                                        <span className={`font-black p-1 px-2 ${isAgotado ? 'bg-red-200 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                                            {isAgotado ? '0 unidades' : `${item.stock} unidades`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* MATRIZ DE GRÁFICAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-none p-4 bg-white shadow-sm">
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">Tendencia de Facturación</h3>
                        <div className="h-60"><Line data={lineData} options={lineOptions} /></div>
                    </div>
                    <div className="border border-gray-200 rounded-none p-4 bg-white shadow-sm">
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">Nivel de Stock - Top 5 Productos</h3>
                        <div className="h-60"><Bar data={barStockData} options={barStockOptions} /></div>
                    </div>
                    <div className="border border-gray-200 rounded-none p-4 bg-white shadow-sm">
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">Comparativa Precio vs Costo (Margen)</h3>
                        <div className="h-60"><Bar data={barMarginData} options={barMarginOptions} /></div>
                    </div>
                    <div className="border border-gray-200 rounded-none p-4 bg-white shadow-sm">
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">Ranking: Top 5 Productos Más Vendidos</h3>
                        <div className="h-60"><Bar data={topSalesData} options={topSalesOptions} /></div>
                    </div>
                    <div className="border border-gray-200 rounded-none p-4 bg-white shadow-sm">
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">Ranking Inverso: 5 Productos Menos Vendidos</h3>
                        <div className="h-60"><Bar data={worstSalesData} options={worstSalesOptions} /></div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-none p-4 bg-white shadow-sm">
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">Auditoría de Almacén: Relación Stock vs Rotación de Ventas</h3>
                        <div className="h-60"><Bar data={efficiencyData} options={efficiencyOptions} /></div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;