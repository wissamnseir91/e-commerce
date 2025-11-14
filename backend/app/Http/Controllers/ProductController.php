<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Traits\ResponseFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    use ResponseFormatter;
    /**
     * Display a listing of the products.
     */
    public function index(): JsonResponse|AnonymousResourceCollection
    {
        try {
            $products = Product::paginate(15);
            $resourceCollection = ProductResource::collection($products);

            return $this->successWithPagination($resourceCollection, 'Products retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve products', $e->getMessage(), 500);
        }
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(ProductRequest $request): JsonResponse|ProductResource
    {
        try {
            $data = $request->validated();

            // Handle image upload
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('products', $imageName, 'public');
                $data['image'] = $imagePath;
            }

            $product = Product::create($data);

            return $this->successResponse((new ProductResource($product))->resolve(), 'Product created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create product', $e->getMessage(), 500);
        }
    }

}

