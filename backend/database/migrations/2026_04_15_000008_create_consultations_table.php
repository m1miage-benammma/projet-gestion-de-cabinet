<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultations', function (Blueprint $table) {
            $table->id('id_consultation');
            $table->unsignedBigInteger('id_dossier');
            $table->unsignedBigInteger('id_medecin');
            $table->date('date');
            $table->text('diagnostic');
            $table->text('traitement');
            $table->text('note')->nullable();
            $table->foreign('id_dossier')
                  ->references('id_dossier')
                  ->on('dossiers_medicaux')
                  ->onDelete('cascade');
            $table->foreign('id_medecin')
                  ->references('id_utilisateur')
                  ->on('medecins')
                  ->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};