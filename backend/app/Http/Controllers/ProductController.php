<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Resources\ProductResource;
use App\Http\Requests\StoreProductRequest;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated(); // Store Validated data in ($validated) To Make Hash Password

        if ($request->hasFile('image')) {
        $validated['image'] = $request->file('image')->store('products', 'public'); // (Files -> Controller) , (Validation -> Request)
    }
        $product = Product::create($validated); // Create (Validated Product) in Product table & Store Product info in ($product)

        return response()->json([
            'message' => 'Product created successfully',
            'data'    => new ProductResource($product), // send ($product) to (ProductResource) to format the data Then -> put the formatted data in the response
        ], 201);
    }

    public function index()
{
    $products = Product::all();
    return ProductResource::collection($products);
}

// Find a product by ID and return it as a resource

public function show(int $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'message' => 'Product not found'
            ], 404);
        }
        return new ProductResource($product);
    }

}