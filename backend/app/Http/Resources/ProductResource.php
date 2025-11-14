<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'price' => (float) $this->price,
            'category' => $this->category,
            'stock' => $this->stock,
            'sku' => $this->sku,
            'description' => $this->description,
            'image' => $this->image 
                ? (filter_var($this->image, FILTER_VALIDATE_URL) 
                    ? $this->image 
                    : url('storage/' . $this->image))
                : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

