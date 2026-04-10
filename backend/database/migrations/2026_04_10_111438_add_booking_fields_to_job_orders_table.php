<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('job_orders', function (Blueprint $table) {
            $table->foreignId('service_id')->nullable()->after('vehicle_id')->constrained('service_catalogs')->nullOnDelete();
            $table->date('arrival_date')->nullable()->after('service_id');
            $table->time('arrival_time')->nullable()->after('arrival_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_orders', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
            $table->dropColumn(['service_id', 'arrival_date', 'arrival_time']);
        });
    }
};
