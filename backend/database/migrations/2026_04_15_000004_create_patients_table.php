<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            // PK partagée avec utilisateurs (pas d'auto-increment séparé)
            $table->unsignedBigInteger('id_utilisateur')->primary();

            // Infos médicales — NULLABLE pour création initiale sans bloquer l'inscription
            $table->date('date_naissance')->nullable();
            $table->string('adresse')->nullable();

            // 'ND' comme valeur par défaut pour le groupe sanguin inconnu
            $table->enum('groupe_sanguin', ['A+','A-','B+','B-','AB+','AB-','O+','O-','ND'])
                  ->default('ND');

            // Champs médicaux complémentaires
            $table->string('numero_cni')->nullable();
            $table->string('wilaya')->nullable();
            $table->text('allergies')->nullable();
            $table->text('antecedents_medicaux')->nullable();
            $table->text('traitements_en_cours')->nullable();
            $table->string('assurance_maladie')->nullable();
            $table->string('numero_assurance')->nullable();

            // Contact d'urgence
            $table->string('urgence_nom')->nullable();
            $table->string('urgence_telephone')->nullable();

            // Médecin traitant
            $table->unsignedBigInteger('id_medecin_traitant')->nullable();

            $table->timestamps(); // Manquant dans l'original — cause des erreurs !

            $table->foreign('id_utilisateur')
                  ->references('id_utilisateur')
                  ->on('utilisateurs')
                  ->onDelete('cascade');

            $table->foreign('id_medecin_traitant')
                  ->references('id_utilisateur')
                  ->on('medecins')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};