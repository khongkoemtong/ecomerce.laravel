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
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('discount_type')->default('percentage'); // percentage, fixed, shipping
            $table->decimal('discount_value', 10, 2)->default(0.00);
            $table->string('discount_text')->nullable(); // e.g. "20% OFF", "$1.50 OFF", "Free Delivery"
            $table->decimal('min_order_amount', 10, 2)->default(0.00);
            $table->integer('usage_limit')->nullable();
            $table->integer('usage_count')->default(0);
            $table->string('type')->default('Coupon'); // Coupon, Discount, Shipping, Flash Sale
            $table->string('status')->default('Active'); // Active, Expired, Disabled
            $table->date('valid_from')->nullable();
            $table->date('valid_till')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
