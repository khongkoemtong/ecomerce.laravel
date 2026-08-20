<?php

namespace Database\Seeders;

use App\Models\OrderModel;
use App\Models\User;
use App\Models\AddressesModel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        // ទាញយក ID ដែលមានស្រាប់ក្នុង Database
        $userIds = User::pluck('id')->toArray();
        $addressIds = AddressesModel::pluck('id')->toArray();

        // ប្រើតែ Value ណាដែល ENUM ក្នុង orders migration របស់អ្នក Support
        $paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
        $orderStatuses   = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        $paymentMethods  = ['cash_on_delivery', 'aba', 'credit_card']; // លុប bakong/wing ចេញ

        for ($i = 1; $i <= 20; $i++) {
            $subtotal     = round(rand(1500, 75000) / 100, 2);
            $discountRate = rand(0, 3) === 0 ? rand(5, 20) / 100 : 0;
            $discount     = round($subtotal * $discountRate, 2);
            $shippingFee  = rand(0, 1) === 1 ? rand(2, 10) : 0.00;
            $total        = round($subtotal - $discount + $shippingFee, 2);

            OrderModel::create([
                'user_id'        => $userIds[array_rand($userIds)],
                'address_id'     => $addressIds[array_rand($addressIds)],
                'order_number'   => 'ORD-' . strtoupper(Str::random(8)),
                'subtotal'       => $subtotal,
                'discount'       => $discount,
                'shipping_fee'   => $shippingFee,
                'total'          => $total,
                'payment_status' => $paymentStatuses[array_rand($paymentStatuses)],
                'order_status'   => $orderStatuses[array_rand($orderStatuses)],
                'payment_method' => $paymentMethods[array_rand($paymentMethods)],
            ]);
        }
    }
}