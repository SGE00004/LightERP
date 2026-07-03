<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Purchase;

class PurchaseController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0'
        ]);

        $product = Product::findOrFail($request->product_id);
        $product->stock += $request->quantity;
        $product->save();

        return response()->json([
            'message' => 'Reabastecimiento exitoso. Stock actualizado.',
            'product' => $product
        ], 201);
    }
}