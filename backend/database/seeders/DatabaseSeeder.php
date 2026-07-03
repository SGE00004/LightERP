<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Client;
use App\Models\Product;
use App\Models\Sale;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Crear un usuario administrador por defecto para el ERP
        User::factory()->create([
            'name' => 'Admin ERP',
            'email' => 'admin@erp.com',
            'password' => bcrypt('admin123'),
        ]);

        // 2. Crear 15 clientes y 30 productos usando los Factories
        Client::factory(15)->create();
        $products = Product::factory(30)->create();

        // 3. Crear 10 ventas aleatorias para tener historial en el Dashboard
        $clients = Client::all();

        for ($i = 0; $i < 10; $i++) {
            $sale = Sale::create([
                'client_id' => $clients->random()->id,
                'total' => 0 // Se calculará sumando los ítems
            ]);

            $totalVenta = 0;
            // Cada venta tendrá entre 1 y 3 productos distintos
            $productosVenta = $products->random(rand(1, 3));

            foreach ($productosVenta as $product) {
                $quantity = rand(1, 2);
                $subtotal = $product->price * $quantity;
                $totalVenta += $subtotal;

                $sale->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'price' => $product->price
                ]);
            }

            // Actualizamos el total real de la venta
            $sale->update(['total' => $totalVenta]);
        }
    }
}
