import React, { useState } from 'react';
import api from '../services/api';

const Login = ({ onLoginSuccess }) => {
    // 🔄 Estado para alternar entre "Iniciar Sesión" y "Registrarse"
    const [isRegistering, setIsRegistering] = useState(false);
    
    // Campos del formulario
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Estados auxiliares
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // 🔑 Manejador del formulario (Login o Registro)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            if (isRegistering) {
                // 📝 FLUJO DE REGISTRO: Guardar en Base de Datos
                await api.post('/register', { name, email, password });
                
                // Si el registro es exitoso, informamos al usuario y lo pasamos al login
                setSuccessMessage('¡Cuenta creada correctamente! Ya puedes iniciar sesión.');
                setIsRegistering(false);
                setPassword(''); // Limpiamos la clave por seguridad
            } else {
                // 🔑 FLUJO DE LOGIN TRADICIONAL
                const res = await api.post('/login', { email, password });
                
                if (res.data.token) {
                    localStorage.setItem('token', res.data.token);
                    // 👤 Guardamos el nombre del usuario para el dropdown de App.jsx
                    localStorage.setItem('userName', res.data.user.name);
                }
                onLoginSuccess();
            }
        } catch (err) {
            console.error("Error en la autenticación:", err);
            setError(err.response?.data?.message || 'Ocurrió un error. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Alternar modo limpiando errores anteriores
    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        setError('');
        setSuccessMessage('');
        setName('');
        setPassword('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 font-sans p-4">
            <div className="max-w-md w-full bg-white border border-gray-200 p-8 shadow-sm">
                
                <div className="text-center mb-8">
                    <span className="text-xs font-black uppercase tracking-widest text-blue-600 block mb-2">LightERP v1.2</span>
                    <h2 className="text-xl font-bold uppercase tracking-wider text-gray-800">
                        {isRegistering ? 'Registro de Usuario' : 'Control Comercial'}
                    </h2>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 mb-4 font-medium">
                        ⚠️ {error}
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-3 mb-4 font-medium">
                        ✅ {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Campo Nombre: Solo se muestra si está registrándose */}
                    {isRegistering && (
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                                Nombre Completo
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded shadow-sm focus:outline-none focus:border-blue-500"
                                placeholder="Ej. Alejandro Gómez"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded shadow-sm focus:outline-none focus:border-blue-500"
                            placeholder="admin@erp.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded shadow-sm focus:outline-none focus:border-blue-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-xs py-2.5 rounded shadow-sm transition-colors disabled:opacity-50 mt-2"
                    >
                        {loading 
                            ? 'Procesando...' 
                            : (isRegistering ? 'Registrar nueva cuenta' : 'Entrar al Sistema')
                        }
                    </button>
                </form>

                {/* 🔄 Enlace inferior para alternar de vista */}
                <div className="text-center mt-6 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={toggleMode}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                    >
                        {isRegistering 
                            ? '¿Ya tienes una cuenta? Inicia sesión aquí' 
                            : '¿No tienes cuenta? Crea una cuenta nueva aquí'
                        }
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Login;