<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_orders', function (Blueprint $table) {
            $table->timestamp('reservation_expires_at')->nullable()->after('arrival_time');

            $table->index(['arrival_date', 'arrival_time', 'status'], 'job_orders_arrival_slot_status_idx');
            $table->index('reservation_expires_at', 'job_orders_reservation_expires_at_idx');
        });
    }

    public function down(): void
    {
        Schema::table('job_orders', function (Blueprint $table) {
            $table->dropIndex('job_orders_arrival_slot_status_idx');
            $table->dropIndex('job_orders_reservation_expires_at_idx');
            $table->dropColumn('reservation_expires_at');
        });
    }
};
