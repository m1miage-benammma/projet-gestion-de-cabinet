<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('soins', function (Blueprint $table) {
            $table->id('id_soin');
            $table->unsignedBigInteger('id_infirmiere');
            $table->unsignedBigInteger('id_patient');
            $table->unsignedBigInteger('id_ordonnance')->nullable();
            $table->string('type_soin');
            $table->text('fiche_soin');
            $table->date('date');
            $table->text('observation')->nullable();
            $table->foreign('id_infirmiere')
                  ->references('id_utilisateur')
                  ->on('infirmieres')
                  ->onDelete('cascade');
            $table->foreign('id_patient')
                  ->references('id_utilisateur')
                  ->on('patients')
                  ->onDelete('cascade');
            $table->foreign('id_ordonnance')
                  ->references('id_ordonnance')
                  ->on('ordonnances')
                  ->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('soins');
    }
};