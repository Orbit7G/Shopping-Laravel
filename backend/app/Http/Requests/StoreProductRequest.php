<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'        => 'required|string|max:255',
            'price'       => 'required|numeric|min:0',
            'description' => 'nullable|string|max:1000',
            'stock'       => 'nullable|integer|min:0',
            'is_active'   => 'nullable|boolean',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ];
    }

    // Process the validated data after validation
    protected function passedValidation(): void // give me the validated data
    {
        // assign a default values to (stock , is_active) if they are not provided in the request
        $this->merge([
            'stock'     => $this->input('stock', 0),
            'is_active' => $this->boolean('is_active', true),
        ]);
    }
}