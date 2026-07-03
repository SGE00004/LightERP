import React, { useState, useEffect } from 'react';
import api from '../services/api';

// 🔄 Modificado: Recibimos la prop onEditProduct para comunicar el ID seleccionado
const ProductList = ({ onEditProduct }) => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // 🔄 Estados para controlar la ordenación
    const [sortKey, setSortKey] = useState('id'); // Campo activo por defecto
    const [sortDirection, setSortDirection] = useState('asc'); // Dirección por defecto ('asc' o 'desc')

    useEffect(() => {
        api.get('/products')
            .then(res => setProducts(res.data))
            .catch(err => console.error("Error cargando inventario:", err));
    }, []);

    // 🛠️ Función encargada de alternar los estados de ordenación
    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    // 1. Filtrado original de productos
    const filteredProducts = products.filter(p => {
        const term = searchTerm.toLowerCase();
        const nameMatch = p.name ? p.name.toLowerCase().includes(term) : false;
        const skuMatch = p.sku ? p.sku.toLowerCase().includes(term) : false;
        return nameMatch || skuMatch;
    });

    // 2. 🔄 Ordenación dinámica sobre el resultado filtrado
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        // Lógica especial si es el costo (ya que el objeto puede calcularlo dinámicamente)
        if (sortKey === 'cost') {
            valA = a.cost || (a.price || 0) * 0.6;
            valB = b.cost || (b.price || 0) * 0.6;
        }

        // Si es texto, pasamos a minúsculas para un orden alfabético preciso
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // 🏷️ Función auxiliar para pintar las flechas indicadoras en la cabecera
    const renderSortIndicator = (key) => {
        if (sortKey !== key) return <span className="text-gray-300 ml-1 text-xs">↕</span>;
        return sortDirection === 'asc' ? <span className="text-blue-600 ml-1 text-xs">▲</span> : <span className="text-blue-600 ml-1 text-xs">▼</span>;
    };

    return (
        <div className="space-y-4">
            {/* Barra de Herramientas y Búsqueda */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span> Total registros: {filteredProducts.length}</span>
                </div>

                {/* Buscador equilibrado */}
                <div className="relative max-w-xs w-full">
                    <input 
                        type="text"
                        placeholder="Buscar por nombre o SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-3 pr-8 py-1.5 text-sm bg-white border border-gray-300 rounded shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Tabla Estilizada Profesional */}
            <div className="border border-gray-200 rounded overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 select-none">
                                <th onClick={() => handleSort('id')} className="p-3 cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center">ID {renderSortIndicator('id')}</div>
                                </th>
                                <th onClick={() => handleSort('sku')} className="p-3 cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center">SKU / Código {renderSortIndicator('sku')}</div>
                                </th>
                                <th onClick={() => handleSort('name')} className="p-3 cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center">Descripción {renderSortIndicator('name')}</div>
                                </th>
                                <th onClick={() => handleSort('price')} className="p-3 text-right cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center justify-end">Precio Venta {renderSortIndicator('price')}</div>
                                </th>
                                <th onClick={() => handleSort('cost')} className="p-3 text-right cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center justify-end">Costo Catálogo {renderSortIndicator('cost')}</div>
                                </th>
                                <th onClick={() => handleSort('stock')} className="p-3 text-right cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center justify-end">Stock {renderSortIndicator('stock')}</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {sortedProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400 font-medium">
                                        No se encontraron artículos en el catálogo.
                                    </td>
                                </tr>
                            ) : (
                                /* Mapeo de la lista ordenada final */
                                sortedProducts.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 font-semibold text-gray-600">{p.id}</td>
                                        <td className="p-3 font-mono text-xs text-blue-700">{p.sku}</td>
                                        
                                        {/* 🔗 Celda de Descripción modificada como Botón Interactivo */}
                                        <td className="p-3 font-medium text-gray-900">
                                            <button
                                                type="button"
                                                onClick={() => onEditProduct(p.id)}
                                                className="text-left font-medium text-blue-600 hover:text-blue-800 hover:underline focus:outline-none transition-colors"
                                                title="Configurar producto"
                                            >
                                                {p.name}
                                            </button>
                                        </td>

                                        <td className="p-3 text-right text-gray-900">{(p.price || 0).toFixed(2)} €</td>
                                        <td className="p-3 text-right text-gray-500">{(p.cost || p.price * 0.6).toFixed(2)} €</td>
                                        <td className="p-3 text-right">
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                                                p.stock <= 5 
                                                    ? 'bg-red-100 text-red-700' 
                                                    : 'bg-green-100 text-green-700'
                                            }`}>
                                                {p.stock} U.
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductList;