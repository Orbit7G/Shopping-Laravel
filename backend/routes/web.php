<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::get('/web', function () {
    return 'hello web';
});

Route::get('/', function () {
    return view('welcome');
});
