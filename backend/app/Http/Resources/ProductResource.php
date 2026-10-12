<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array // (Auto Complete) Like VsCode is more efficient when files names are relavent for example (Product Model , Product Resource) 
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'description' => $this->description,
            'price'       => (float) $this->price,
            'stock'       => (int) $this->stock,
            'is_active'   => (bool) $this->is_active,

            'image_url'   => $this->image ? asset('storage/' . $this->image) : null, // (if this request has an image), return the full URL to the image, otherwise return null

            'created_at'  => $this->created_at?->toDateTimeString(), // ( ?-> ) : Nullsafe operator (checks if (created_at) is not null before calling the method to prevent errors)
            'updated_at'  => $this->updated_at?->toDateTimeString(), // without ( toDateTimeString() ) Timestamp can be like this (2026-10-11T21:33:00.000000Z)
        ];
    }
}
