# Dumper une DB Supabase remote en local

## Prérequis

- Supabase CLI installé (`supabase start` fonctionne)
- Le password de la DB remote (Settings > Database > Database Password dans le dashboard)

## Procédure

### 1. Dump des données (tables spécifiques)

```bash
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require" \
  --data-only \
  --no-owner \
  --no-acl \
  --disable-triggers \
  -t public.di_services \
  -t public.di_structures \
  -t public.ingestion_records \
  -t public.workflows \
  -t public.editorial_records \
  -t public.letta_reports \
  -t public.ingestion_runs \
  -f staging-data.sql
```

**Notes :**
- `--data-only` : pas de schema (on garde les migrations locales)
- `--disable-triggers` : évite les effets de bord dans le dump
- `-t public.XXX` : sélection des tables (ajouter/retirer selon besoin)
- `?sslmode=require` : obligatoire pour Supabase Cloud

### 2. Nettoyer le dump

Le dump contient des commandes `DISABLE/ENABLE TRIGGER ALL` que le user `postgres` local n'a pas le droit d'exécuter (system triggers). Il faut les retirer :

```bash
grep -v 'DISABLE TRIGGER\|ENABLE TRIGGER' staging-data.sql > staging-data-clean.sql
```

### 3. Reset la DB locale

```bash
supabase db reset
```

⚠️ Si le projet est linké à un remote (`supabase link`), faire `supabase unlink` avant pour éviter de reset le remote.

### 4. Vider les tables cibles

Les seed data du `supabase db reset` créent des conflits. Vider les tables avant l'import :

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c "TRUNCATE public.letta_reports, public.editorial_records, public.publication_records, public.workflows, public.ingestion_records, public.ingestion_runs, public.di_services, public.di_structures CASCADE;"
```

### 5. Importer les données

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" <<'EOF'
SET session_replication_role = 'replica';
\i staging-data-clean.sql
SET session_replication_role = 'origin';
EOF
```

**`session_replication_role = 'replica'`** désactive tous les triggers et FK pendant l'import. C'est la méthode standard pour les dumps avec dépendances circulaires.

### 6. Vérifier

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "
SELECT 'di_services' as t, count(*) FROM di_services
UNION ALL SELECT 'di_structures', count(*) FROM di_structures
UNION ALL SELECT 'ingestion_records', count(*) FROM ingestion_records
UNION ALL SELECT 'workflows', count(*) FROM workflows
UNION ALL SELECT 'editorial_records', count(*) FROM editorial_records
UNION ALL SELECT 'letta_reports', count(*) FROM letta_reports
ORDER BY 1;"
```

## Troubleshooting

### `could not translate host name` (IPv6)
Les projets Supabase récents sont IPv6-only. `pg_dump` peut ne pas résoudre le hostname.
- **Fix** : utiliser l'URL du pooler (IPv4) si disponible
- **Alternative** : `psql` gère l'IPv6, seul `pg_dump` pose problème sur certaines versions

### `permission denied: system trigger`
Le user `postgres` local n'a pas les droits superuser. Utiliser `session_replication_role = 'replica'` au lieu de `--disable-triggers` côté psql.

### `duplicate key value violates unique constraint`
Les seed data de `supabase db reset` sont en conflit. Truncate les tables avant l'import (étape 4).

### Password DB perdu
Dashboard Supabase > Settings > Database > Reset database password.
⚠️ Casse les connexions Postgres directes existantes (pas les connexions API JS).
