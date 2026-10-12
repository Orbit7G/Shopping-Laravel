<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Http\Requests\RegisterUserRequest;
use app\Http\Requests\UpdateProfileUserRequest;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    // Register a new user
    public function register(RegisterUserRequest $request)
    {
        $validated = $request->validated(); // Store Validated data in ($validated) To Make Hash Password

        $validated['password'] = Hash::make($validated['password']); // Hash the password form validated data
        $user = User::create($validated);

        return response()->json([
            'message' => 'User registered successfully',
            'user'    => $user,
        ], 201);
    }

    // Login and return a JWT token
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) { // Perform authentication and generate a token if successful based on (Type Juggling) principle (if the user is authenticated, it will return a (String)token, otherwise it will return (Boolean)false)
            return response()->json(['error' => 'Unauthorized / بيانات الدخول غير صحيحة'], 401);
        }

        return response()->json([
            'message' => 'Login successful',
            'token'   => $token,
            'user'    => auth('api')->user(),
        ]);
    }

    // Logout the user (invalidate the token)
    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());

        return response()->json(['message' => 'Successfully logged out']);
    }

    // function for getting the authenticated user
    public function me()
    {
        return response()->json(auth('api')->user());
    }

    public function profile()
{
    $user = auth('api')->user();
    return response()->json($user);
}

// Update User Profile
public function updateProfile(UpdateProfileUserRequest $request)
{
    // Get the authenticated user
    $authUser = auth('api')->user();
    $user = User::findOrFail($authUser->id);

    $validated = $request->validated();

    if ($request->hasFile('avatar')) {
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }
        $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
    }

    // update the user with the validated data
    $user->update($validated);

    return response()->json([
        'message' => 'تم تحديث الملف الشخصي بنجاح',
        'user'    => $user
    ]);
}
}