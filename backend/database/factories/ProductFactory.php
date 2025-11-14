<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<\Illuminate\Database\Eloquent\Model>
     */
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Use placeholder image service for seeded products
        // Using picsum.photos for random images (400x300 is a good product image size)
        $imageUrl = 'https://picsum.photos/400/300?random=' . $this->fake()->numberBetween(1, 1000);
        
        return [
            'name' => $this->fake()->words(3, true),
            'price' => $this->fake()->randomFloat(2, 9.99, 999.99),
            'category' => $this->fake()->randomElement(['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Food & Beverages', 'Health & Beauty']),
            'stock' => $this->fake()->numberBetween(0, 100),
            'description' => $this->fake()->optional()->paragraph(),
            'sku' => $this->fake()->unique()->bothify('SKU-####-???'),
            'image' => $imageUrl, // Store as URL for seeded products
        ];
    }
}

