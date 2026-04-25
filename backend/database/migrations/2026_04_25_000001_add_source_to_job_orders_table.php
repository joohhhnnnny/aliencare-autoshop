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
        Schema::table('job_orders', function (Blueprint $table) {
            $table->enum('source', ['online_booking', 'walk_in'])
                ->default('walk_in')
                ->after('vehicle_id');

            $table->index('source');
        });

        DB::table('job_orders')
            ->whereNotNull('service_id')
            ->whereNotNull('arrival_date')
            ->whereNotNull('arrival_time')
            ->update(['source' => 'online_booking']);
    }

    public function down(): void
    {
        Schema::table('job_orders', function (Blueprint $table) {
            $table->dropIndex(['source']);
            $table->dropColumn('source');
        });
    }
};
