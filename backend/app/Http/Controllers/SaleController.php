<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validamos los datos de entrada
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer',
            'items.*.qty' => 'required|integer|min:1',
        ]);

        // 2. Procesamos cada artículo de manera segura
        foreach ($request->items as $item) {
            $product = Product::find($item['id']);

            // Si por algún motivo no encuentra el ID, continuamos para no colgar el ERP
            if (!$product) {
                return response()->json([
                    'error' => "El artículo con ID {$item['id']} no está registrado."
                ], 404);
            }

            // Comprobamos la propiedad del stock disponible (soporta stock o cantidad)
            $currentStock = $product->stock ?? $product->cantidad ?? 0;

            if ($currentStock < $item['qty']) {
                return response()->json([
                    'error' => "Stock insuficiente para {$product->name}. Disponibles: {$currentStock} u."
                ], 400);
            }

            // ⚡ DESCUENTO DIRECTO EN INVENTARIO
            if (isset($product->stock)) {
                $product->stock -= $item['qty'];
            } elseif (isset($product->cantidad)) {
                $product->cantidad -= $item['qty'];
            } else {
                // Si no tiene ninguno de los dos campos definidos en la migración
                return response()->json([
                    'error' => "No se encontró el campo de inventario en el modelo de productos."
                ], 500);
            }

            $product->save();
        }

        // 3. Retornamos la respuesta de éxito
        return response()->json([
            'status' => 'SUCCESS',
            'message' => 'Unidades descontadas del almacén correctamente.'
        ], 200);
    }
}