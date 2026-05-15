<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medicaments', function (Blueprint $table) {
            $table->id('id_medicament');
            $table->unsignedBigInteger('id_ordonnance');
            $table->string('nom');
            $table->string('dosage');
            $table->string('duree');
            $table->foreign('id_ordonnance')
                  ->references('id_ordonnance')
                  ->on('ordonnances')
                  ->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medicaments');
    }
};