<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('utilisateurs', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('prenom');
            $table->string('email')->unique();
            $table->string('telephone')->nullable();
            $table->string('sexe');
            $table->string('mot_de_passe');
            $table->string('type');
            // Médecin
            $table->string('specialite')->nullable();
            $table->string('numero_ordre')->nullable();
            // Patient
            $table->date('date_de_naissance')->nullable();
            $table->string('adresse')->nullable();
            $table->string('groupe_sanguin')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('utilisateurs');
    }
};