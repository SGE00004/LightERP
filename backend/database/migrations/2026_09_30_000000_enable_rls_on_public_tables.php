<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Activa RLS en todas las tablas de "public" para que la API pública de
     * Supabase (roles anon/authenticated) no tenga acceso. El backend se conecta
     * como "postgres", dueño de las tablas, así que no le afecta.
     */
    public function up(): void
    {
        // Tablas existentes (cubre también un migrate:fresh)
        DB::unprepared(<<<'SQL'
            DO $$
            DECLARE t record;
            BEGIN
                FOR t IN
                    SELECT c.relname
                    FROM pg_class c
                    JOIN pg_namespace n ON n.oid = c.relnamespace
                    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND NOT c.relrowsecurity
                LOOP
                    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.relname);
                END LOOP;
            END $$;
        SQL);

        // Tablas futuras: se activa RLS automáticamente al crearlas
        DB::unprepared(<<<'SQL'
            CREATE OR REPLACE FUNCTION public.rls_auto_enable()
            RETURNS event_trigger
            LANGUAGE plpgsql
            SET search_path = ''
            AS $$
            DECLARE cmd record;
            BEGIN
                FOR cmd IN
                    SELECT * FROM pg_event_trigger_ddl_commands()
                    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
                      AND object_type = 'table'
                      AND schema_name = 'public'
                LOOP
                    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', cmd.object_identity);
                END LOOP;
            END;
            $$;

            DROP EVENT TRIGGER IF EXISTS rls_auto_enable;
            CREATE EVENT TRIGGER rls_auto_enable
                ON ddl_command_end
                WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
                EXECUTE FUNCTION public.rls_auto_enable();
        SQL);
    }

    /**
     * Reverse the migrations.
     *
     * Solo elimina la activación automática; no desactiva RLS en las tablas.
     */
    public function down(): void
    {
        DB::unprepared(<<<'SQL'
            DROP EVENT TRIGGER IF EXISTS rls_auto_enable;
            DROP FUNCTION IF EXISTS public.rls_auto_enable();
        SQL);
    }
};
