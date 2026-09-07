<?php

namespace App\Http\Controllers;

use App\Models\BrandModel;
use App\Traits\HandlesImageUploads;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    use HandlesImageUploads;

    public function index(Request $request)
    {
        $query = BrandModel::query()
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->input('search');
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            });

        if ($request->has('per_page')) {
            $perPage = $request->integer('per_page', 8);
            $paginated = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'brands' => $paginated->items(),
                'hasMore' => $paginated->hasMorePages(),
                'total' => $paginated->total(),
                'current_page' => $paginated->currentPage(),
            ]);
        }

        $brands = $query->get();
        return response()->json([
            'success' => true,
            'message' => 'get all data ',
            'brands' => $brands,
            'brand' => $brands,
            'Brand ' => $brands,
            'hasMore' => false,
            'total' => $brands->count(),
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error!',
                'error' => $validator->errors(),
            ], 422);
        }

        $logoUrl = null;
        if ($request->hasFile('logo')) {
            $logoUrl = $this->uploadImage($request->file('logo'), 'brands');
        } elseif ($request->hasFile('image')) {
            $logoUrl = $this->uploadImage($request->file('image'), 'brands');
        } elseif ($request->filled('logo')) {
            $logoUrl = $request->input('logo');
        } elseif ($request->filled('image')) {
            $logoUrl = $request->input('image');
        }

        $slug = $request->slug;
        if (empty($slug)) {
            $slug = Str::slug($request->name);
        }

        $brand = BrandModel::create([
            'name' => $request->name,
            'slug' => $slug,
            'logo' => $logoUrl,
            'status' => $request->status ?? 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Brand created successfully',
            'brand' => $brand,
        ], 201);
    }

    public function show($id)
    {
        $find = BrandModel::find($id);

        if (!$find) {
            return response()->json([
                'success' => false,
                'message' => 'Brand not found!',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Brand found',
            'brand' => $find,
        ]);
    }

    public function update(Request $request, $id)
    {
        $find = BrandModel::find($id);

        if (!$find) {
            return response()->json([
                'success' => false,
                'message' => 'Brand not found!',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error!',
                'error' => $validator->errors(),
            ], 422);
        }

        $logoUrl = $find->logo;
        if ($request->hasFile('logo')) {
            if ($find->logo) {
                $this->deleteImage($find->logo);
            }
            $logoUrl = $this->uploadImage($request->file('logo'), 'brands');
        } elseif ($request->hasFile('image')) {
            if ($find->logo) {
                $this->deleteImage($find->logo);
            }
            $logoUrl = $this->uploadImage($request->file('image'), 'brands');
        } elseif ($request->filled('logo')) {
            $logoUrl = $request->input('logo');
        } elseif ($request->filled('image')) {
            $logoUrl = $request->input('image');
        }

        $slug = $request->slug ?: Str::slug($request->name);

        $find->update([
            'name' => $request->name,
            'slug' => $slug,
            'logo' => $logoUrl,
            'status' => $request->status ?? $find->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Brand updated successfully!',
            'brand' => $find->fresh(),
            'update' => $find->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $find = BrandModel::find($id);

        if (!$find) {
            return response()->json([
                'success' => false,
                'message' => 'Brand not found!',
            ], 404);
        }

        if ($find->logo) {
            $this->deleteImage($find->logo);
        }

        $find->delete();

        return response()->json([
            'success' => true,
            'message' => 'Brand deleted successfully!',
            'delete' => $find,
        ]);
    }
}
