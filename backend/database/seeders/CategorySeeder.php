<?php

namespace Database\Seeders;

use App\Models\CategoryModel;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CategoryModel::updateOrCreate(
            ['slug' => 'new-season'],
            [
                "name" => "New Season",
                "description" => "Latest arrivals and fresh trends for the season.",
                "image" => "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
                "status" => "active",
            ]
        );

        CategoryModel::updateOrCreate(
            ['slug' => 'outerwear'],
            [
                "name" => "Outerwear",
                "description" => "Tailored wool coats, classic trench coats, and layering essentials.",
                "image" => "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=80",
                "status" => "active",
            ]
        );

        CategoryModel::updateOrCreate(
            ['slug' => 'footwear'],
            [
                "name" => "Footwear",
                "description" => "Italian crafted leather boots, minimal sandals, and refined heels.",
                "image" => "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80",
                "status" => "active",
            ]
        );

        CategoryModel::updateOrCreate(
            ['slug' => 'accessories'],
            [
                "name" => "Accessories",
                "description" => "Structural bags, handcrafted jewelry, and signature accents.",
                "image" => "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80",
                "status" => "active",
            ]
        );
    }
}

