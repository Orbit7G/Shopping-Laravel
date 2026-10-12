<?php

use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/api', function () {
    return 'hello web';
});
// CRUD
// Create
Route::post('/product',[ProductController::class,'store']);
// Read
Route::get('/Home',[ProductController::class,'index']);
// Update
// Delete

// Product Details
Route::get('/product/{id}',[ProductController::class,'show']);

// No Token Required
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Require Active Token To Work
Route::group(['middleware' => 'auth:api'], function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/update-profile', [AuthController::class, 'updateProfile']);
});