<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rendez_vous', function (Blueprint $table) {
            $table->id('id_rdv');
            $table->unsignedBigInteger('id_patient');
            $table->unsignedBigInteger('id_disponibilite');
            $table->date('date_rdv');
            $table->time('heure_rdv');
            $table->string('motif');
            $table->enum('statut', ['en_attente','confirme','annule','termine'])
                  ->default('en_attente');
            $table->foreign('id_patient')
                  ->references('id_utilisateur')
                  ->on('patients')
                  ->onDelete('cascade');
            $table->foreign('id_disponibilite')
                  ->references('id_disponibilite')
                  ->on('disponibilites')
                  ->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rendez_vous');
    }
};