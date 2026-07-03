import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PurchaseModule = () => {
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [costPrice, setCostPrice] = useState('');
    const [total, setTotal] = useState(0); 
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        api.get('/products').then(res => setProducts(res.data));
    }, []);

    useEffect(() => {
        const qty = parseInt(quantity) || 0;
        const price = parseFloat(costPrice) || 0;
        setTotal(qty * price);
    }, [quantity, costPrice]); 

    const handleProductChange = (e) => {
        const productId = e.target.value;
        setSelectedProductId(productId);
        if (productId === '') { setCostPrice(''); return; }
        const product = products.find(p => p.id === parseInt(productId));
        if (product) {
            setCostPrice(product.cost || product.cost_price || product.price || 0);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedProductId || quantity <= 0 || costPrice === '') return;
        setLoading(true);
        setMessage(null);

        api.post('/purchases', {
            product_id: parseInt(selectedProductId),
            quantity: parseInt(quantity),
            price: parseFloat(costPrice)
        })
        .then(res => {
            setMessage({ type: 'success', text: `Ingreso Exitoso. Stock actualizado a ${res.data.product?.stock ?? 'N/A'} u.` });
            setSelectedProductId(''); setQuantity(1); setCostPrice('');
        })
        .catch(() => setMessage({ type: 'error', text: 'Error del Servidor: No se pudo registrar la entrada.' }))
        .finally(() => setLoading(false));
    };

    return (
        <div className="max-w-xl mx-auto border border-gray-200 rounded p-6 bg-white shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200 uppercase tracking-wider">
                Registrar Entrada de Mercancía
            </h3>

            {message && (
                <div className={`p-3 mb-4 text-sm rounded border ${
                    message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Artículo a Reabastecer:</label>
                    <select 
                        value={selectedProductId} onChange={handleProductChange} required
                        className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    >
                        <option value="">-- Seleccionar --</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} | Almacén: {p.stock} u.</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Cantidad (U):</label>
                        <input 
                            type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Costo Catálogo Unitario:</label>
                        <input 
                            type="number" value={costPrice} readOnly required
                            className="w-full p-2 bg-gray-50 text-gray-500 border border-gray-200 rounded focus:outline-none"
                        />
                    </div>
                </div>

                <div className="p-3 bg-gray-50 rounded border border-gray-100 flex justify-between font-bold text-sm">
                    <span className="text-gray-500">IMPORTE TOTAL ESTIMADO:</span>
                    <span className="text-gray-900">{total.toFixed(2)} €</span>
                </div>

                <button 
                    type="submit" disabled={loading || !selectedProductId}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold p-2.5 rounded transition-colors shadow-sm"
                >
                    {loading ? 'Procesando...' : 'Confirmar Orden de Compra'}
                </button>
            </form>
        </div>
    );
};

export default PurchaseModule;