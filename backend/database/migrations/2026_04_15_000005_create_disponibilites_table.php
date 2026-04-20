<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disponibilites', function (Blueprint $table) {
            $table->id('id_disponibilite');
            $table->unsignedBigInteger('id_medecin');
            $table->enum('jour', ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']);
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->foreign('id_medecin')
                  ->references('id_utilisateur')
                  ->on('medecins')
                  ->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disponibilites');
    }
};