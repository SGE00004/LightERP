<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('sale_items', function (Blueprint $table) {
        $table->id();
        // Relación con la cabecera de la venta
        $table->foreignId('sale_id')->constrained()->onDelete('cascade');
        // Relación con el producto. Usamos RESTRICT para evitar que borren un producto que ya se vendió
        $table->foreignId('product_id')->constrained()->onRestrict();
        $table->integer('quantity');
        // Guardamos el precio unitario del momento de la venta por si el producto cambia de precio en el futuro
        $table->decimal('price', 10, 2); 
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_items');
    }
};
