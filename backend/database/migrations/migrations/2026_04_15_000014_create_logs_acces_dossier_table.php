<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('logs_acces_dossier', function (Blueprint $table) {
            $table->id();
            $table->integer('id_medecin');
            $table->integer('id_patient')->nullable();
            $table->string('action');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('logs_acces_dossier');
    }
};