<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product') ?? $this->route('id');

        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'brand_id' => ['required', 'integer', 'exists:brands,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'discount_price' => ['nullable', 'numeric', 'min:0', 'lt:price'],
            'stock_qty' => ['required', 'integer', 'min:0'],
            'sku' => ['nullable', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($productId)],
            'image' => [
                'nullable',
                function ($attribute, $value, $fail) {
                    if (request()->hasFile('image')) {
                        $file = request()->file('image');
                        $validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'avif'];
                        if (!in_array(strtolower($file->getClientOriginalExtension()), $validExtensions)) {
                            $fail('The ' . $attribute . ' must be a valid image file (' . implode(', ', $validExtensions) . ').');
                        }
                    }
                },
            ],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ];
    }
}
