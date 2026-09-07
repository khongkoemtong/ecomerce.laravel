<?php

namespace App\Traits;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

trait HandlesImageUploads
{
    /**
     * Determine if Cloudinary is fully configured.
     */
    protected function isCloudinaryConfigured(): bool
    {
        return filled(config('cloudinary.cloud_url'))
            || (
                filled(env('CLOUDINARY_CLOUD_NAME'))
                && filled(env('CLOUDINARY_KEY'))
                && filled(env('CLOUDINARY_SECRET'))
            );
    }

    /**
     * Upload an image (file or string URL) and return its public URL.
     */
    public function uploadImage($fileOrUrl, string $folder = 'uploads'): ?string
    {
        if (empty($fileOrUrl)) {
            return null;
        }

        // If it's already a URL string or path
        if (is_string($fileOrUrl)) {
            return $fileOrUrl;
        }

        // If it's an UploadedFile
        if ($fileOrUrl instanceof UploadedFile) {
            // 1. Try Cloudinary if configured
            if ($this->isCloudinaryConfigured() && class_exists(Cloudinary::class)) {
                try {
                    $upload = Cloudinary::upload($fileOrUrl->getRealPath(), [
                        'folder' => $folder,
                        'resource_type' => 'image',
                    ]);

                    if (method_exists($upload, 'getSecurePath')) {
                        return $upload->getSecurePath();
                    }

                    $uploadData = method_exists($upload, 'getResponse') ? $upload->getResponse() : (array) $upload;
                    if (!empty($uploadData['secure_url'])) {
                        return $uploadData['secure_url'];
                    }
                } catch (Throwable $e) {
                    Log::warning('Cloudinary upload failed, falling back to local public storage: ' . $e->getMessage());
                }
            }

            // 2. Fallback to Laravel Public Storage
            $path = $fileOrUrl->store($folder, 'public');
            return url('storage/' . $path);
        }

        return null;
    }

    /**
     * Delete an image from local public storage if it was stored locally.
     */
    public function deleteImage(?string $url): bool
    {
        if (empty($url)) {
            return false;
        }

        try {
            // Check if URL points to local storage
            if (str_contains($url, '/storage/')) {
                $relativePath = substr($url, strpos($url, '/storage/') + 9);
                if (Storage::disk('public')->exists($relativePath)) {
                    return Storage::disk('public')->delete($relativePath);
                }
            } elseif (Storage::disk('public')->exists($url)) {
                return Storage::disk('public')->delete($url);
            }
        } catch (Throwable $e) {
            Log::warning('Failed to delete image from local storage: ' . $e->getMessage());
        }

        return false;
    }
}

