<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderModel extends Model
{
    public const PAYMENT_STATUS_PENDING = 'pending';
    public const PAYMENT_STATUS_PAID = 'paid';
    public const PAYMENT_STATUS_FAILED = 'failed';
    public const PAYMENT_STATUS_REFUNDED = 'refunded';

    public const ORDER_STATUS_PENDING = 'pending';
    public const ORDER_STATUS_PAID = 'paid';
    public const ORDER_STATUS_PROCESSING = 'processing';
    public const ORDER_STATUS_SHIPPED = 'shipped';
    public const ORDER_STATUS_DELIVERED = 'delivered';
    public const ORDER_STATUS_CANCELLED = 'cancelled';

    protected $table ='orders';
    protected $fillable = [ 
        'user_id',
        'address_id',
        'order_number',
        'subtotal',
        'discount',
        'shipping_fee',
        'total',
        'payment_status',
        'order_status',
        'payment_method',
        'stock_reduced_at',

    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'total' => 'decimal:2',
        'stock_reduced_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItemModel::class, 'order_id');
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(AddressesModel::class, 'address_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(PaymentModel::class, 'order_id');
    }
}
