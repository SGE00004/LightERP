import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ProductEdit = ({ productId, onVolver, onUpdateSuccess }) => {
    const [product, setProduct] = useState({
        id: '',
        sku: '',
        name: '',
        price: '',
        cost: '',
        stock: 0
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Cargar los datos actuales del producto desde la base de datos
        api.get(`/products/${productId}`)
            .then(res => {
                const data = res.data;
                setProduct({
                    id: data.id,
                    sku: data.sku,
                    name: data.name || '',
                    // Si el costo viene nulo, le asignamos un valor por defecto inicial, pero almacenable y editable
                    price: data.price !== undefined && data.price !== null ? data.price : '',
                    cost: data.cost !== undefined && data.cost !== null ? data.cost : (data.price * 0.6 || ''),
                    stock: data.stock || 0
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar producto:", err);
                setError("No se pudo cargar la información del artículo.");
                setLoading(false);
            });
    }, [productId]);

    // 🔄 Manejador de cambios optimizado para permitir la libre escritura de textos y decimales
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            // Guardamos el "value" como texto puro en el estado para que deje escribir puntos y comas decimales libremente
            [name]: value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        // Preparamos los datos convirtiendo los textos de precio y costo a valores numéricos reales para MySQL
        const datosAEnviar = {
            ...product,
            price: parseFloat(product.price) || 0,
            cost: parseFloat(product.cost) || 0
        };

        try {
            // Guardar cambios directamente en la base de datos mediante la API de Laravel
            await api.put(`/products/${productId}`, datosAEnviar);
            onUpdateSuccess(); // Refrescar lista en el inventario y volver
        } catch (err) {
            console.error("Error al actualizar producto:", err);
            setError(err.response?.data?.message || "Ocurrió un error al guardar los cambios.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6 text-sm text-gray-500">Cargando datos de configuración...</div>;

    return (
        <div className="max-w-xl mx-auto bg-white border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">⚙️ Configuración del Artículo</h3>
                <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 font-bold">SKU: {product.sku}</span>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 mb-4 font-medium">
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">ID del Producto (Código Interno)</label>
                    <input 
                        type="number" 
                        name="id" 
                        value={product.id} 
                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 text-gray-500 focus:outline-none rounded cursor-not-allowed"
                        disabled 
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Descripción / Nombre</label>
                    <input 
                        type="text" 
                        name="name" 
                        required
                        value={product.name} 
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Precio Venta (€)</label>
                        <input 
                            type="number" 
                            name="price" 
                            step="0.01"
                            required
                            placeholder="0.00"
                            value={product.price} 
                            onChange={handleChange}
                            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Costo Catálogo (€)</label>
                        <input 
                            type="number" 
                            name="cost" 
                            step="0.01"
                            required
                            placeholder="0.00"
                            value={product.cost} 
                            onChange={handleChange}
                            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onVolver}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold uppercase tracking-wider text-xs py-2 rounded transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-xs py-2 rounded transition-colors shadow-sm disabled:opacity-50"
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductEdit;