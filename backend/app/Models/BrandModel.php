<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BrandModel extends Model
{
    protected $table="brands";
    protected $fillable = [
        'name',
        "slug",
        "logo",
        "status",
    ];

    public function products()
    {
        return $this->hasMany(ProductModel::class, 'brand_id');
    }
}
