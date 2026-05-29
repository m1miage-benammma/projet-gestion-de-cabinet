<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ordonnances', function (Blueprint $table) {
            $table->id('id_ordonnance');
            $table->unsignedBigInteger('id_consultation');
            $table->date('date_emission');
            $table->text('instructions')->nullable();
            $table->foreign('id_consultation')
                  ->references('id_consultation')
                  ->on('consultations')
                  ->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ordonnances');
    }
};