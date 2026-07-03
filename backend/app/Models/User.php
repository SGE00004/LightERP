<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
// 1. IMPORTA SANCTUM AQUÍ ABAJO:
use Laravel\Sanctum\HasApiTokens; 

class User extends Authenticatable
{
    // 2. AÑADE HasApiTokens DENTRO DE LOS TRAITS:
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}