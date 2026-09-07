<?php

namespace App\Http\Controllers;

use App\Models\CategoryModel;
use App\Traits\HandlesImageUploads;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    use HandlesImageUploads;

    public function index(Request $request)
    {
        $query = CategoryModel::query()
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->input('search');
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            });

        if ($request->has('per_page')) {
            $perPage = $request->integer('per_page', 8);
            $paginated = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'categories' => $paginated->items(),
                'hasMore' => $paginated->hasMorePages(),
                'total' => $paginated->total(),
                'current_page' => $paginated->currentPage(),
            ]);
        }

        $categories = $query->get();
        return response()->json([
            'success' => true,
            'message' => 'get all data !',
            'categories' => $categories,
            'category' => $categories,
            'hasMore' => false,
            'total' => $categories->count(),
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error!',
                'error' => $validator->errors(),
            ], 422);
        }

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $imageUrl = $this->uploadImage($request->file('image'), 'categories');
        } elseif ($request->filled('image')) {
            $imageUrl = $request->input('image');
        }

        $slug = $request->slug;
        if (empty($slug)) {
            $slug = Str::slug($request->name);
        }

        $category = CategoryModel::create([
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'image' => $imageUrl,
            'status' => $request->status ?? 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully!',
            'category' => $category,
        ], 201);
    }

    public function show($id)
    {
        $find = CategoryModel::find($id);

        if (!$find) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found!',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Category found',
            'category' => $find,
        ]);
    }

    public function update(Request $request, $id)
    {
        $find = CategoryModel::find($id);

        if (!$find) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found!',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error!',
                'error' => $validator->errors(),
            ], 422);
        }

        $imageUrl = $find->image;
        if ($request->hasFile('image')) {
            if ($find->image) {
                $this->deleteImage($find->image);
            }
            $imageUrl = $this->uploadImage($request->file('image'), 'categories');
        } elseif ($request->filled('image')) {
            $imageUrl = $request->input('image');
        }

        $slug = $request->slug ?: Str::slug($request->name);

        $find->update([
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'image' => $imageUrl,
            'status' => $request->status ?? $find->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully!',
            'category' => $find->fresh(),
            'categories' => $find->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $find = CategoryModel::find($id);

        if (!$find) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found!',
            ], 404);
        }

        if ($find->image) {
            $this->deleteImage($find->image);
        }

        $find->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully!',
            'delete' => $find,
        ]);
    }
}
