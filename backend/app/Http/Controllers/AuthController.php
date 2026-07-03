<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validamos que el usuario envíe el correo y la contraseña
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Buscamos al usuario en la tabla 'users' de la base de datos
        $user = User::where('email', $request->email)->first();

        // 3. Verificamos si existe y si la contraseña encriptada coincide
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Las credenciales introducidas son incorrectas.'
            ], 401);
        }

        // 4. Generamos el token de acceso seguro
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. Devolvemos el token y los datos del usuario a React
        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]
        ], 200);
    }

    public function register(Request $request)
    {
        // 1. Validamos que lleguen todos los campos y que el email no esté repetido
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ], [
            'email.unique' => 'Este correo electrónico ya está registrado en el sistema.'
        ]);

        // 2. Creamos y guardamos el nuevo registro en la tabla 'users' con la contraseña cifrada
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // 3. Devolvemos un mensaje de éxito y los datos esenciales del nuevo usuario a React
        return response()->json([
            'message' => 'Usuario registrado exitosamente en la base de datos.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]
        ], 201);
    }
}