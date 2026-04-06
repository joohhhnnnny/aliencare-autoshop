<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class FrontDeskAccountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $accounts = User::where('role', UserRole::FrontDesk->value)
            ->orderBy('created_at', 'desc')
            ->get(['id', 'name', 'email', 'created_at', 'updated_at']);

        return response()->json($accounts);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => UserRole::FrontDesk->value,
            'email_verified_at' => now(),
        ]);

        return response()->json($user, 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $user = User::where('role', UserRole::FrontDesk->value)->findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Front desk account deleted successfully.']);
    }
}
