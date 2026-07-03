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
    Schema::create('products', function (Blueprint $table) {
        $table->id();
        $table->string('sku')->unique(); // Código único de inventario (Stock Keeping Unit)
        $table->string('name');
        $table->text('description')->nullable();
        $table->decimal('price', 10, 2); // Precio de venta al público
        $table->integer('stock')->default(0); // Cantidad disponible
        $table->integer('min_stock')->default(5); // Stock mínimo para alertas de reposición
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
