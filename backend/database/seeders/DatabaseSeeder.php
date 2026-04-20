<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Créer compte admin si mkaynach
        if (! DB::table('admins')->where('login', 'admin@cabinet.dz')->exists()) {
            DB::table('admins')->insert([
                'login'        => 'admin@cabinet.dz',
                'mot_de_passe' => Hash::make('Admin@2025'),
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
        }
    }
}