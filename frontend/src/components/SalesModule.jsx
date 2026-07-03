import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SalesModule = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Cargar los productos al entrar para tener stock y precios actualizados
    const loadProducts = () => {
        api.get('/products')
            .then(res => setProducts(res.data))
            .catch(err => console.error("Error cargando productos:", err));
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const addToCart = (e) => {
        e.preventDefault();
        if (!selectedId) return;
        const product = products.find(p => p.id === parseInt(selectedId));
        if (!product) return;

        // Comprobar si hay stock suficiente antes de añadirlo siquiera al ticket visual
        const qtyToValidate = parseInt(qty);
        if (product.stock < qtyToValidate) {
            alert(`No puedes añadir esa cantidad. Solo quedan ${product.stock} unidades en almacén.`);
            return;
        }

        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            if (product.stock < (existing.qty + qtyToValidate)) {
                alert(`Límite excedido. Ya tienes ${existing.qty} en el ticket y solo hay ${product.stock} disponibles.`);
                return;
            }
            setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + qtyToValidate } : item));
        } else {
            setCart([...cart, { ...product, qty: qtyToValidate }]);
        }
        setSelectedId('');
        setQty(1);
    };

    // Petición real hacia la API de Laravel para descontar stock
    const handleCheckout = () => {
        setLoading(true);
        setMessage(null);

        // Mapeamos el carrito al formato exacto que espera nuestro SaleController de Laravel
        const payload = {
            items: cart.map(item => ({
                id: item.id,
                qty: item.qty
            }))
        };

        api.post('/sales', payload)
            .then(res => {
                setMessage({ type: 'success', text: 'VENTA PROCESADA: El inventario ha sido actualizado.' });
                setCart([]); // Vaciamos el carrito
                loadProducts(); // Recargamos el catálogo interno para refrescar los stocks del selector
            })
            .catch(err => {
                console.error(err);
                const errorMsg = err.response?.data?.error || 'No se pudo completar la venta.';
                setMessage({ type: 'error', text: `ERROR: ${errorMsg}` });
            })
            .finally(() => setLoading(false));
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Panel de Entrada de Datos */}
            <div className="md:col-span-1 border border-gray-200 rounded p-4 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200 uppercase tracking-wider">Añadir Artículo</h3>
                
                <form onSubmit={addToCart} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">PRODUCTO:</label>
                        <select 
                            value={selectedId} 
                            onChange={(e) => setSelectedId(e.target.value)}
                            className="w-full p-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                        >
                            <option value="">-- Seleccionar --</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                                    {p.name} ({p.price} €) | Stock: {p.stock}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">CANTIDAD:</label>
                        <input 
                            type="number" 
                            min="1" 
                            value={qty} 
                            onChange={(e) => setQty(e.target.value)}
                            className="w-full p-2 bg-white border border-gray-300 rounded text-sm font-semibold focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2 rounded text-sm transition-colors shadow-sm"
                    >
                        Agregar al Ticket
                    </button>
                </form>
            </div>

            {/* Panel del Ticket y Totales */}
            <div className="md:col-span-2 flex flex-col space-y-4">
                
                {message && (
                    <div className={`p-3 text-sm rounded border ${
                        message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-slate-800 text-white p-4 rounded flex justify-between items-center shadow-inner">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total a Cobrar</span>
                    <span className="text-2xl font-bold">{total.toFixed(2)} €</span>
                </div>

                <div className="border border-gray-200 rounded p-4 flex-1 min-h-[220px] flex flex-col justify-between bg-white shadow-sm">
                    <div>
                        <div className="text-gray-500 font-bold text-center border-b border-gray-100 pb-2 mb-3 text-xs tracking-wider uppercase">
                            Detalle del Comprobante
                        </div>
                        {cart.length === 0 ? (
                            <div className="text-gray-400 text-center py-12 text-sm">El ticket de venta está vacío</div>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto text-sm">
                                {cart.map(item => (
                                    <div key={item.id} className="flex justify-between items-center py-1 border-b border-gray-50">
                                        <span className="text-gray-800 font-medium">{item.qty}x {item.name}</span>
                                        <span className="font-semibold text-gray-900">{(item.price * item.qty).toFixed(2)} €</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div className="border-t border-gray-200 pt-3 mt-4 flex justify-between items-center font-bold text-sm">
                            <span className="text-gray-600">SUBTOTAL NETO:</span>
                            <span className="text-lg text-gray-900">{total.toFixed(2)} €</span>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white p-2.5 font-bold rounded text-sm transition-colors shadow-sm disabled:cursor-not-allowed"
                >
                    {loading ? 'PROCESANDO TRANSACCIÓN...' : 'Emitir Factura y Cerrar Caja'}
                </button>
            </div>

        </div>
    );
};

export default SalesModule;