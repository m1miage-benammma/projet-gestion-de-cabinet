<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('infirmieres', function (Blueprint $table) {
            $table->unsignedBigInteger('id_utilisateur')->primary();
            $table->string('numero_employe')->unique();
            $table->date('date_embauche');
            $table->foreign('id_utilisateur')
                  ->references('id_utilisateur')
                  ->on('utilisateurs')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('infirmieres');
    }
};