<?php

namespace Database\Seeders;

use App\Models\PromotionModel;
use Illuminate\Database\Seeder;

class PromotionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $promotions = [
            [
                'code' => 'WELCOME20',
                'title' => 'New Customer Welcome Deal',
                'description' => 'Get 20% off on your first order across all luxury collections.',
                'discount_type' => 'percentage',
                'discount_value' => 20.00,
                'discount_text' => '20% OFF',
                'min_order_amount' => 50.00,
                'usage_limit' => 500,
                'usage_count' => 142,
                'type' => 'Coupon',
                'status' => 'Active',
                'valid_from' => '2026-01-01',
                'valid_till' => '2026-12-31',
            ],
            [
                'code' => 'COFFEETIME',
                'title' => 'Morning Coffee Special',
                'description' => 'Flat $1.50 off during morning promotion hours.',
                'discount_type' => 'fixed',
                'discount_value' => 1.50,
                'discount_text' => '$1.50 OFF',
                'min_order_amount' => 10.00,
                'usage_limit' => 200,
                'usage_count' => 89,
                'type' => 'Discount',
                'status' => 'Active',
                'valid_from' => '2026-06-01',
                'valid_till' => '2026-09-30',
            ],
            [
                'code' => 'FREESHIP',
                'title' => 'Free Home Delivery over $15',
                'description' => 'Free standard home delivery anywhere in Phnom Penh & Siem Reap.',
                'discount_type' => 'shipping',
                'discount_value' => 0.00,
                'discount_text' => 'Free Delivery',
                'min_order_amount' => 15.00,
                'usage_limit' => 1000,
                'usage_count' => 310,
                'type' => 'Shipping',
                'status' => 'Active',
                'valid_from' => '2026-01-01',
                'valid_till' => '2026-12-31',
            ],
            [
                'code' => 'SUMMER50',
                'title' => 'Mid-Summer Flash Sale',
                'description' => 'Exclusive 50% discount on summer apparel and selected footwear.',
                'discount_type' => 'percentage',
                'discount_value' => 50.00,
                'discount_text' => '50% OFF',
                'min_order_amount' => 100.00,
                'usage_limit' => 600,
                'usage_count' => 520,
                'type' => 'Flash Sale',
                'status' => 'Expired',
                'valid_from' => '2026-07-01',
                'valid_till' => '2026-08-10',
            ],
            [
                'code' => 'VIPLUXURY',
                'title' => 'VIP Member Privilege',
                'description' => 'Exclusive $50 off for VIP orders exceeding $250.',
                'discount_type' => 'fixed',
                'discount_value' => 50.00,
                'discount_text' => '$50.00 OFF',
                'min_order_amount' => 250.00,
                'usage_limit' => 300,
                'usage_count' => 74,
                'type' => 'Coupon',
                'status' => 'Active',
                'valid_from' => '2026-03-01',
                'valid_till' => '2026-11-30',
            ],
            [
                'code' => 'AUTUMN15',
                'title' => 'Autumn Season Preview',
                'description' => '15% off new arrivals for the upcoming autumn collection.',
                'discount_type' => 'percentage',
                'discount_value' => 15.00,
                'discount_text' => '15% OFF',
                'min_order_amount' => 60.00,
                'usage_limit' => 400,
                'usage_count' => 28,
                'type' => 'Coupon',
                'status' => 'Active',
                'valid_from' => '2026-08-15',
                'valid_till' => '2026-10-31',
            ],
            [
                'code' => 'FLASH30',
                'title' => 'Weekend Flash Deal',
                'description' => 'Limited 48h flash sale on outerwear and accessories.',
                'discount_type' => 'percentage',
                'discount_value' => 30.00,
                'discount_text' => '30% OFF',
                'min_order_amount' => 80.00,
                'usage_limit' => 150,
                'usage_count' => 112,
                'type' => 'Flash Sale',
                'status' => 'Active',
                'valid_from' => '2026-08-25',
                'valid_till' => '2026-09-05',
            ],
            [
                'code' => 'FIRSTBUY',
                'title' => 'First Order Discount',
                'description' => 'Special introductory voucher for newly registered app users.',
                'discount_type' => 'fixed',
                'discount_value' => 10.00,
                'discount_text' => '$10.00 OFF',
                'min_order_amount' => 40.00,
                'usage_limit' => 800,
                'usage_count' => 205,
                'type' => 'Discount',
                'status' => 'Active',
                'valid_from' => '2026-01-01',
                'valid_till' => '2026-12-31',
            ],
            [
                'code' => 'BOTTEGAVIP',
                'title' => 'Bottega & Prada Special',
                'description' => 'Special collection voucher for luxury leather goods.',
                'discount_type' => 'percentage',
                'discount_value' => 25.00,
                'discount_text' => '25% OFF',
                'min_order_amount' => 300.00,
                'usage_limit' => 100,
                'usage_count' => 45,
                'type' => 'Coupon',
                'status' => 'Active',
                'valid_from' => '2026-08-01',
                'valid_till' => '2026-12-31',
            ],
        ];

        foreach ($promotions as $promo) {
            PromotionModel::updateOrCreate(
                ['code' => $promo['code']],
                $promo
            );
        }
    }
}
