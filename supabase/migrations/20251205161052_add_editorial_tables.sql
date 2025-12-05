
  create table "public"."editorial_records" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "rco_ingestion_record_id" uuid not null,
    "markdown" text,
    "metadata" jsonb
      );


alter table "public"."editorial_records" enable row level security;


  create table "public"."editorial_reports" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp without time zone not null default now(),
    "record_id" uuid not null,
    "report_type" text not null,
    "markdown" text not null,
    "metadata" jsonb not null
      );


alter table "public"."editorial_reports" enable row level security;

alter table "public"."editorial_records" add constraint "editorial_records_rco_ingestion_record_id_fkey" FOREIGN KEY (rco_ingestion_record_id) REFERENCES public.rco_ingestion_records(id) not valid;

alter table "public"."editorial_records" validate constraint "editorial_records_rco_ingestion_record_id_fkey";

grant delete on table "public"."editorial_records" to "anon";

grant insert on table "public"."editorial_records" to "anon";

grant references on table "public"."editorial_records" to "anon";

grant select on table "public"."editorial_records" to "anon";

grant trigger on table "public"."editorial_records" to "anon";

grant truncate on table "public"."editorial_records" to "anon";

grant update on table "public"."editorial_records" to "anon";

grant delete on table "public"."editorial_records" to "authenticated";

grant insert on table "public"."editorial_records" to "authenticated";

grant references on table "public"."editorial_records" to "authenticated";

grant select on table "public"."editorial_records" to "authenticated";

grant trigger on table "public"."editorial_records" to "authenticated";

grant truncate on table "public"."editorial_records" to "authenticated";

grant update on table "public"."editorial_records" to "authenticated";

grant delete on table "public"."editorial_records" to "postgres";

grant insert on table "public"."editorial_records" to "postgres";

grant references on table "public"."editorial_records" to "postgres";

grant select on table "public"."editorial_records" to "postgres";

grant trigger on table "public"."editorial_records" to "postgres";

grant truncate on table "public"."editorial_records" to "postgres";

grant update on table "public"."editorial_records" to "postgres";

grant delete on table "public"."editorial_records" to "service_role";

grant insert on table "public"."editorial_records" to "service_role";

grant references on table "public"."editorial_records" to "service_role";

grant select on table "public"."editorial_records" to "service_role";

grant trigger on table "public"."editorial_records" to "service_role";

grant truncate on table "public"."editorial_records" to "service_role";

grant update on table "public"."editorial_records" to "service_role";

grant delete on table "public"."editorial_reports" to "anon";

grant insert on table "public"."editorial_reports" to "anon";

grant references on table "public"."editorial_reports" to "anon";

grant select on table "public"."editorial_reports" to "anon";

grant trigger on table "public"."editorial_reports" to "anon";

grant truncate on table "public"."editorial_reports" to "anon";

grant update on table "public"."editorial_reports" to "anon";

grant delete on table "public"."editorial_reports" to "authenticated";

grant insert on table "public"."editorial_reports" to "authenticated";

grant references on table "public"."editorial_reports" to "authenticated";

grant select on table "public"."editorial_reports" to "authenticated";

grant trigger on table "public"."editorial_reports" to "authenticated";

grant truncate on table "public"."editorial_reports" to "authenticated";

grant update on table "public"."editorial_reports" to "authenticated";

grant delete on table "public"."editorial_reports" to "postgres";

grant insert on table "public"."editorial_reports" to "postgres";

grant references on table "public"."editorial_reports" to "postgres";

grant select on table "public"."editorial_reports" to "postgres";

grant trigger on table "public"."editorial_reports" to "postgres";

grant truncate on table "public"."editorial_reports" to "postgres";

grant update on table "public"."editorial_reports" to "postgres";

grant delete on table "public"."editorial_reports" to "service_role";

grant insert on table "public"."editorial_reports" to "service_role";

grant references on table "public"."editorial_reports" to "service_role";

grant select on table "public"."editorial_reports" to "service_role";

grant trigger on table "public"."editorial_reports" to "service_role";

grant truncate on table "public"."editorial_reports" to "service_role";

grant update on table "public"."editorial_reports" to "service_role";


