<?php

namespace App\Http\Controllers;

use App\Models\ProductImageModel;
use App\Traits\HandlesImageUploads;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductImageController extends Controller
{
    use HandlesImageUploads;

    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'product images found',
            'product_images' => ProductImageModel::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|integer|exists:products,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'validator error',
                'error' => $validator->errors(),
            ], 422);
        }

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $imageUrl = $this->uploadImage($request->file('image'), 'product_images');
        } elseif ($request->filled('image')) {
            $imageUrl = $request->input('image');
        }

        if (!$imageUrl) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide an image file or URL.',
            ], 422);
        }

        $productImage = ProductImageModel::create([
            'product_id' => $request->product_id,
            'image' => $imageUrl,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'product image created successfully',
            'product_image' => $productImage,
        ], 201);
    }

    public function show($id)
    {
        $productImage = ProductImageModel::find($id);

        if (!$productImage) {
            return response()->json([
                'success' => false,
                'message' => 'product image not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'product image found',
            'product_image' => $productImage,
        ]);
    }

    public function update(Request $request, $id)
    {
        $productImage = ProductImageModel::find($id);

        if (!$productImage) {
            return response()->json([
                'success' => false,
                'message' => 'product image not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'product_id' => 'required|integer|exists:products,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'validator error',
                'error' => $validator->errors(),
            ], 422);
        }

        $imageUrl = $productImage->image;
        if ($request->hasFile('image')) {
            if ($productImage->image) {
                $this->deleteImage($productImage->image);
            }
            $imageUrl = $this->uploadImage($request->file('image'), 'product_images');
        } elseif ($request->filled('image')) {
            $imageUrl = $request->input('image');
        }

        $productImage->update([
            'product_id' => $request->product_id,
            'image' => $imageUrl,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'product image updated successfully',
            'product_image' => $productImage,
        ]);
    }

    public function destroy($id)
    {
        $productImage = ProductImageModel::find($id);

        if (!$productImage) {
            return response()->json([
                'success' => false,
                'message' => 'product image not found',
            ], 404);
        }

        if ($productImage->image) {
            $this->deleteImage($productImage->image);
        }

        $productImage->delete();

        return response()->json([
            'success' => true,
            'message' => 'product image deleted successfully',
            'delete' => $productImage,
        ]);
    }
}
