<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\ProductModel;
use App\Traits\HandlesImageUploads;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    use HandlesImageUploads;

    public function store(ProductRequest $request)
    {
        $imageUrl = null;

        if ($request->hasFile('image')) {
            $imageUrl = $this->uploadImage($request->file('image'), 'products');
        } elseif ($request->filled('image')) {
            $imageUrl = $request->input('image');
        }

        $data = $request->validated();
        unset($data['image']);

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']) . '-' . Str::random(5);
        }

        if (empty($data['sku'])) {
            $data['sku'] = 'SKU-' . strtoupper(Str::random(6));
        }

        $product = ProductModel::create([
            ...$data,
            'image' => $imageUrl,
            'status' => $data['status'] ?? 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'product' => new ProductResource($product),
        ], 201);
    }

    public function index(Request $request)
    {
        $products = ProductModel::query()
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->input('search');

                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('category_id'), fn ($query) => $query->where('category_id', $request->category_id))
            ->when($request->filled('brand_id'), fn ($query) => $query->where('brand_id', $request->brand_id))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->status))
            ->when($request->filled('min_price'), fn ($query) => $query->where('price', '>=', $request->min_price))
            ->when($request->filled('max_price'), fn ($query) => $query->where('price', '<=', $request->max_price));

        $sort = $request->input('sort', 'newest');

        match ($sort) {
            'price_low' => $products->orderBy('price'),
            'price_high' => $products->orderByDesc('price'),
            'name' => $products->orderBy('name'),
            default => $products->latest(),
        };

        $perPage = $request->integer('per_page', 8);
        $paginated = $products->paginate($perPage);

        return response()->json([
            'message' => 'product found',
            'products' => ProductResource::collection($paginated)->response()->getData(true),
        ]);
    }

    public function show($id)
    {
        $findById = ProductModel::with(['images'])->find($id);

        if (!$findById) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found!',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Product found',
            'product' => new ProductResource($findById),
        ]);
    }

    public function update(ProductRequest $request, $id)
    {
        $find = ProductModel::find($id);

        if (!$find) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found!',
            ], 404);
        }

        $imageUrl = $find->image;

        if ($request->hasFile('image')) {
            // Delete previous local image if being replaced
            if ($find->image) {
                $this->deleteImage($find->image);
            }
            $imageUrl = $this->uploadImage($request->file('image'), 'products');
        } elseif ($request->filled('image')) {
            $imageUrl = $request->input('image');
        }

        $data = $request->validated();
        unset($data['image']);

        $find->update([
            ...$data,
            'image' => $imageUrl,
            'status' => $data['status'] ?? 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'product' => new ProductResource($find->fresh()),
        ]);
    }

    public function destroy($id)
    {
        $find = ProductModel::find($id);

        if (!$find) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found!',
            ], 404);
        }

        // Delete associated product main image from storage if local
        if ($find->image) {
            $this->deleteImage($find->image);
        }

        // Delete associated gallery images from storage if any
        if ($find->images) {
            foreach ($find->images as $img) {
                if ($img->image) {
                    $this->deleteImage($img->image);
                }
            }
        }

        $find->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully!',
            'delete' => $find,
        ]);
    }
}
