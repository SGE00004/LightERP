import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import SalesModule from './components/SalesModule';
import PurchaseModule from './components/PurchaseModule';
import Login from './components/Login';
import ProductEdit from './components/ProductEdit';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Menú lateral
  
  // 👤 Estado para controlar el menú desplegable del usuario
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Estado para la edición de productos
  const [editingProductId, setEditingProductId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Al montar, comprobamos si existe el token en el navegador
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setCheckingSession(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    setCurrentTab('dashboard');
    setIsMenuOpen(false);
    setIsUserMenuOpen(false); 
    setEditingProductId(null);
  };

  const handleNavigation = (tabName) => {
    setCurrentTab(tabName);
    setIsMenuOpen(false);
    setEditingProductId(null);
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <span className="text-sm text-gray-400">Cargando...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800 font-sans antialiased relative overflow-x-hidden">
      
      {/* Barra de Navegación Superior */}
      <header className="bg-slate-800 text-white shadow-sm flex-none sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-14">
          
          {/* LADO IZQUIERDO: Botón Hamburguesa + Título */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 border border-slate-600 rounded-md hover:bg-slate-700 text-white focus:outline-none transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">LightERP</span>
              <span className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">v1.2</span>
            </div>
          </div>

          {/* LADO DERECHO: Estado + Desplegable de Usuario */}
          <div className="flex items-center gap-4 relative">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Sistema Conectado</span>
            </div>

            {/* 👤 BOTÓN DEL PERFIL DE USUARIO */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-white border border-slate-600 hover:border-slate-500 rounded px-3 py-1.5 bg-slate-800/50 transition-colors focus:outline-none select-none"
              >
                <span className="bg-slate-600 text-slate-200 w-5 h-5 rounded-full flex items-center justify-center font-bold uppercase text-[10px]">
                  {(localStorage.getItem('userName') || 'U').charAt(0)}
                </span>
                <span>{localStorage.getItem('userName') || 'Usuario'}</span>
                <svg className={`w-3 h-3 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              {/* 📋 MENÚ DESPLEGABLE CON POSICIONAMIENTO FIXED (NUNCA SE TAPA) */}
              {isUserMenuOpen && (
                <>
                  {/* Capa invisible trasera (telón) con z-index máximo */}
                  <div className="fixed inset-0 z-[99998]" onClick={() => setIsUserMenuOpen(false)}></div>
                  
                  {/* Caja flotante fija a la pantalla para romper contextos de apilamiento dañados */}
                  <div className="fixed right-4 top-12 w-48 bg-white border border-gray-300 shadow-2xl rounded-md py-1 z-[99999] block text-gray-800">
                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/90 block">
                      <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Sesión activa</p>
                      <p className="text-xs font-bold text-gray-700 truncate block">
                        {localStorage.getItem('userName') || 'Usuario Registrado'}
                      </p>
                    </div>
                    
                    <div className="p-1 block">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-2 focus:outline-none cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5 flex-none text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Menú Lateral Desplegable (Sidebar) */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 bg-gray-50">
          <span className="text-xs font-black uppercase tracking-widest text-blue-600">Navegación</span>
          <button 
            onClick={() => setIsMenuOpen(false)} 
            className="p-1 border border-gray-200 rounded hover:bg-red-50 text-gray-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <nav className="p-4 space-y-1">
          <button 
            onClick={() => handleNavigation('dashboard')}
            className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-l-2 transition-all ${
              currentTab === 'dashboard' ? 'bg-blue-50 text-blue-700 border-blue-600' : 'text-gray-600 hover:bg-gray-50 border-transparent'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => handleNavigation('products')}
            className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-l-2 transition-all ${
              currentTab === 'products' ? 'bg-blue-50 text-blue-700 border-blue-600' : 'text-gray-600 hover:bg-gray-50 border-transparent'
            }`}
          >
            Inventario
          </button>
          <button 
            onClick={() => handleNavigation('sales')}
            className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-l-2 transition-all ${
              currentTab === 'sales' ? 'bg-blue-50 text-blue-700 border-blue-600' : 'text-gray-600 hover:bg-gray-50 border-transparent'
            }`}
          >
            Ventas
          </button>
          <button 
            onClick={() => handleNavigation('purchases')}
            className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-l-2 transition-all ${
              currentTab === 'purchases' ? 'bg-blue-50 text-blue-700 border-blue-600' : 'text-gray-600 hover:bg-gray-50 border-transparent'
            }`}
          >
            Compras
          </button>
        </nav>
      </div>

      {/* Capa traslúcida de fondo cuando el menú lateral está abierto */}
      {isMenuOpen && (
        <div 
          onClick={() => setIsMenuOpen(false)} 
          className="fixed inset-0 bg-black/20 z-30 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Área de Contenido Principal */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
        {currentTab === 'dashboard' && (
          <Dashboard currentView={currentTab} changeTab={setCurrentTab} />
        )}
        
        {currentTab === 'products' && (
          editingProductId ? (
            <ProductEdit 
              productId={editingProductId} 
              onVolver={() => setEditingProductId(null)}
              onUpdateSuccess={() => {
                setEditingProductId(null);
                setRefreshTrigger(prev => prev + 1);
              }}
            />
          ) : (
            <ProductList 
              key={refreshTrigger} 
              onEditProduct={(id) => setEditingProductId(id)} 
            />
          )
        )}
        
        {currentTab === 'sales' && <SalesModule />}
        {currentTab === 'purchases' && <PurchaseModule />}
      </main>

      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-200 bg-white flex-none">
        &copy; {new Date().getFullYear()} LightERP
      </footer>

    </div>
  );
}

export default App;