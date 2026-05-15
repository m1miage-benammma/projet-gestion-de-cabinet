<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medecins', function (Blueprint $table) {
            $table->unsignedBigInteger('id_utilisateur')->primary();
            $table->string('specialite');
            $table->string('numero_ordre')->unique();
            $table->foreign('id_utilisateur')
                  ->references('id_utilisateur')
                  ->on('utilisateurs')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medecins');
    }
};