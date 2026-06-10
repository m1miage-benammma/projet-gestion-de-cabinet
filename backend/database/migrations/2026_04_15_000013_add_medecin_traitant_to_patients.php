<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'medecin_traitant_id')) {
                $table->unsignedBigInteger('medecin_traitant_id')->nullable()->after('id_utilisateur');
            }
        });
    }

    public function down(): void {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn('medecin_traitant_id');
        });
    }
};