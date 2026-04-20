<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->unsignedBigInteger('id_medecin_traitant')->nullable()->after('groupe_sanguin');
            $table->foreign('id_medecin_traitant')->references('id_utilisateur')->on('medecins')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropForeign(['id_medecin_traitant']);
            $table->dropColumn('id_medecin_traitant');
        });
    }
};