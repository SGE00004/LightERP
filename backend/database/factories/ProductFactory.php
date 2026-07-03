<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
   public function definition(): array
{
    return [
        'sku' => strtoupper($this->faker->unique()->lexify('???-')) . $this->faker->numberBetween(100, 999),
        'name' => $this->faker->randomElement(['Laptop', 'Teclado Mecánico', 'Monitor 4K', 'Mouse Inalámbrico', 'Auriculares Pro', 'Silla Ergonómica']),
        'description' => $this->faker->sentence(),
        'price' => $this->faker->randomFloat(2, 10, 1500),
        'stock' => $this->faker->numberBetween(1, 50),
        'min_stock' => 5,
    ];
}
}
