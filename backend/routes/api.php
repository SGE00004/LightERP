<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\PurchaseController; 
use App\Http\Controllers\AuthController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Ruta por defecto para obtener el usuario autenticado (se deja para cuando añadamos login)
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// CRUD completo de Clientes (index, store, show, update, destroy)
Route::apiResource('clients', ClientController::class);

// CRUD completo de Productos e Inventario (index, store, show, update, destroy)
Route::apiResource('products', ProductController::class);

// Rutas para el módulo de Ventas e Historial
Route::get('sales', [SaleController::class, 'index']);      // Historial de ventas
Route::post('sales', [SaleController::class, 'store']);    // Registrar una venta
Route::get('sales/{id}', [SaleController::class, 'show']); // Ver una venta específica
Route::post('purchases', [PurchaseController::class, 'store']); // Registrar una compra
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']); // 👈 Añade esta línea
