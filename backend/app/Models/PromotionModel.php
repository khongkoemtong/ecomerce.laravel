<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromotionModel extends Model
{
    use HasFactory;

    protected $table = 'promotions';

    protected $fillable = [
        'code',
        'title',
        'description',
        'discount_type',
        'discount_value',
        'discount_text',
        'min_order_amount',
        'usage_limit',
        'usage_count',
        'type',
        'status',
        'valid_from',
        'valid_till',
    ];

    protected $casts = [
        'discount_value' => 'float',
        'min_order_amount' => 'float',
        'usage_limit' => 'integer',
        'usage_count' => 'integer',
        'valid_from' => 'date:Y-m-d',
        'valid_till' => 'date:Y-m-d',
    ];
}
