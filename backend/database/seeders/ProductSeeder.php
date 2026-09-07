<?php

namespace Database\Seeders;

use App\Models\ProductModel;
use App\Models\CategoryModel;
use App\Models\BrandModel;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = CategoryModel::pluck('id', 'name')->toArray();
        $brands = BrandModel::pluck('id', 'name')->toArray();

        $products = [
            [
                'name' => 'Ivory Slip Dress',
                'brand' => 'Atelier',
                'category' => 'New Season',
                'price' => 140.00,
                'discount_price' => null,
                'slug' => 'ivory-slip-dress',
                'image' => '/images/testing/f8109b0ba53596059df9dfba8c5063f7.jpg',
                'description' => 'An elegant bias-cut slip dress crafted from a lustrous silk-satin blend. Features a delicate drape neck and adjustable crossover shoulder straps for a custom fit.',
                'sku' => 'AT-ISD-01',
                'stock_qty' => 15,
            ],
            [
                'name' => 'Sculptural Wool Overcoat',
                'brand' => 'Atelier',
                'category' => 'Outerwear',
                'price' => 240.00,
                'discount_price' => null,
                'slug' => 'sculptural-wool-overcoat',
                'image' => '/images/testing/7e1d81466872753064268a950d220150.jpg',
                'description' => 'Sculpted from 100% heavy-weight virgin wool, this overcoat balances structure and movement. Features accentuated shoulders, custom horn buttons, and mid-calf length.',
                'sku' => 'AT-SWO-02',
                'stock_qty' => 10,
            ],
            [
                'name' => 'Polished Leather Boots',
                'brand' => 'Prada',
                'category' => 'Footwear',
                'price' => 180.00,
                'discount_price' => null,
                'slug' => 'polished-leather-boots',
                'image' => '/images/testing/006ffbde41d9503730c219fd4d6dc168.jpg',
                'description' => 'Refined ankle boots crafted in premium calfskin leather with a subtle sheen, elasticated side panels, and a stacked leather block heel.',
                'sku' => 'PR-PLB-03',
                'stock_qty' => 12,
            ],
            [
                'name' => 'Minimal Accent Heel',
                'brand' => 'Celine',
                'category' => 'Accessories',
                'price' => 160.00,
                'discount_price' => null,
                'slug' => 'minimal-accent-heel',
                'image' => '/images/testing/5ccfa0078c7ba17c1a7cb80ea3e6383b.jpg',
                'description' => 'Elegant square-toe sandals featuring asymmetric straps and an architectural sculptural heel for a quiet but confident statement.',
                'sku' => 'CE-MAH-04',
                'stock_qty' => 8,
            ],
            [
                'name' => 'Tailored Wool Trousers',
                'brand' => 'Toteme',
                'category' => 'New Season',
                'price' => 160.00,
                'discount_price' => null,
                'slug' => 'tailored-wool-trousers',
                'image' => '/images/testing/c646ea606567d389ffd27f0efbde2185.jpg',
                'description' => 'High-waisted tailored trousers with front pleats, cut in a soft wool-blend flannel with a fluid drape and straight-leg silhouette.',
                'sku' => 'TO-TWT-05',
                'stock_qty' => 20,
            ],
            [
                'name' => 'Cashmere Turtleneck',
                'brand' => 'Jil Sander',
                'category' => 'New Season',
                'price' => 210.00,
                'discount_price' => null,
                'slug' => 'cashmere-turtleneck',
                'image' => '/images/testing/c24a6b0f33cbdf4eb815c8ec0d90061e.jpg',
                'description' => 'An exceptionally soft rib-knit turtleneck sweater spun from pure, ethically sourced Mongolian cashmere. Finished with split cuffs.',
                'sku' => 'JS-CT-06',
                'stock_qty' => 14,
            ],
            [
                'name' => 'Structured Leather Bag',
                'brand' => 'Loewe',
                'category' => 'Accessories',
                'price' => 310.00,
                'discount_price' => null,
                'slug' => 'structured-leather-bag',
                'image' => '/images/testing/4dddc40a4bfd08371d0ad039cfd87018.jpg',
                'description' => 'A structural top-handle bag in box-calf leather with clean geometric lines, polished silver-tone clasp hardware, and a suede-lined interior.',
                'sku' => 'LO-SLB-07',
                'stock_qty' => 6,
            ],
            [
                'name' => 'Classic Trench Coat',
                'brand' => 'Burberry',
                'category' => 'Outerwear',
                'price' => 280.00,
                'discount_price' => null,
                'slug' => 'classic-trench-coat',
                'image' => '/images/testing/d14ca26b116c19b5afd10a86f4f92cc7.jpg',
                'description' => 'Double-breasted trench coat in water-resistant gabardine, featuring structured epaulets and a belted waist for a classic yet contemporary profile.',
                'sku' => 'BU-CTC-08',
                'stock_qty' => 9,
            ],
            [
                'name' => 'Silk Tailored Blazer',
                'brand' => 'Prada',
                'category' => 'New Season',
                'price' => 240.00,
                'discount_price' => null,
                'slug' => 'silk-tailored-blazer',
                'image' => '/images/testing/99c5920a13f500d5e7507f1ed880e03d.jpg',
                'description' => 'A sharp, single-breasted blazer woven in a mid-weight silk-wool blend, featuring peak lapels and a subtly nipped waist.',
                'sku' => 'PR-STB-09',
                'stock_qty' => 11,
            ],
            [
                'name' => 'Suede Chelsea Boots',
                'brand' => 'Bottega',
                'category' => 'Footwear',
                'price' => 190.00,
                'discount_price' => null,
                'slug' => 'suede-chelsea-boots',
                'image' => '/images/testing/blackicon.jpg',
                'description' => 'Italian suede leather boots with elasticated side panels, a pull tab, and a slim profile suitable for both tailoring and premium denim.',
                'sku' => 'BO-SCB-10',
                'stock_qty' => 13,
            ],
            [
                'name' => 'Gold Hoop Earrings',
                'brand' => 'Celine',
                'category' => 'Accessories',
                'price' => 95.00,
                'discount_price' => 75.00,
                'slug' => 'gold-hoop-earrings',
                'image' => 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
                'description' => 'Thick, structural hoop earrings cast in recycled sterling silver and plated in 18-karat gold with a polished mirror finish.',
                'sku' => 'CE-GHE-11',
                'stock_qty' => 4, // Low stock for AI Restock
            ],
            [
                'name' => 'Knit Polo Shirt',
                'brand' => 'Jil Sander',
                'category' => 'New Season',
                'price' => 130.00,
                'discount_price' => 110.00,
                'slug' => 'knit-polo-shirt',
                'image' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80',
                'description' => 'Finely knit polo shirt in organic cotton-silk blend yarn, featuring an open camp collar and ribbed hems.',
                'sku' => 'JS-KPS-12',
                'stock_qty' => 18,
            ],
            [
                'name' => 'Pleated Midi Skirt',
                'brand' => 'Toteme',
                'category' => 'New Season',
                'price' => 175.00,
                'discount_price' => 145.00,
                'slug' => 'pleated-midi-skirt',
                'image' => 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&auto=format&fit=crop&q=80',
                'description' => 'Fluid sunray pleated midi skirt featuring a concealed zip fastening and an elasticated grosgrain waistband.',
                'sku' => 'TO-PMS-13',
                'stock_qty' => 3, // Low stock for AI Restock
            ],
            [
                'name' => 'Leather Cardholder Wallet',
                'brand' => 'Bottega',
                'category' => 'Accessories',
                'price' => 85.00,
                'discount_price' => null,
                'slug' => 'leather-cardholder-wallet',
                'image' => 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
                'description' => 'Intrecciato woven calfskin cardholder with four exterior card slots and a central receipt pocket.',
                'sku' => 'BO-LCW-14',
                'stock_qty' => 5, // Low stock for AI Restock
            ],
            [
                'name' => 'Chunky Knit Cardigan',
                'brand' => 'Atelier',
                'category' => 'Outerwear',
                'price' => 195.00,
                'discount_price' => 165.00,
                'slug' => 'chunky-knit-cardigan',
                'image' => 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop&q=80',
                'description' => 'Heavy-gauge ribbed cardigan knit in pure alpaca-wool blend with oversized tortoiseshell buttons.',
                'sku' => 'AT-CKC-15',
                'stock_qty' => 8, // Low stock for AI Restock
            ],
            [
                'name' => 'Minimalist Leather Slides',
                'brand' => 'Prada',
                'category' => 'Footwear',
                'price' => 150.00,
                'discount_price' => null,
                'slug' => 'minimalist-leather-slides',
                'image' => 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
                'description' => 'Supple nappa leather flat slides with an understated crossover band and padded footbed.',
                'sku' => 'PR-MLS-16',
                'stock_qty' => 22,
            ],
        ];

        foreach ($products as $p) {
            ProductModel::updateOrCreate(
                ['slug' => $p['slug']],
                [
                    'category_id' => $categories[$p['category']] ?? 1,
                    'brand_id' => $brands[$p['brand']] ?? 1,
                    'name' => $p['name'],
                    'description' => $p['description'],
                    'price' => $p['price'],
                    'discount_price' => $p['discount_price'],
                    'stock_qty' => $p['stock_qty'],
                    'sku' => $p['sku'],
                    'image' => $p['image'],
                    'status' => 'active',
                ]
            );
        }
    }
}


