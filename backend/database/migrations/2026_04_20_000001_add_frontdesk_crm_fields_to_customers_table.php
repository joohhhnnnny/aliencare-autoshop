<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->boolean('is_active')->default(true);
            $table->string('tier_mode', 20)->default('auto');
            $table->json('tier_overrides')->nullable();

            $table->index('is_active');
            $table->index('tier_mode');
        });

        DB::table('customers')->update([
            'is_active' => true,
            'tier_mode' => 'auto',
        ]);
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
            $table->dropIndex(['tier_mode']);
            $table->dropColumn(['is_active', 'tier_mode', 'tier_overrides']);
        });
    }
};
