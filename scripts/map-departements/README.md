# Carte des services Data Inclusion par département

Outil de visualisation de la distribution géographique des services Data Inclusion
via le champ `zone_eligibilite`, pour présentation (Sylvain, avril 2026).

## Fichiers

| Fichier | Rôle |
|---------|------|
| `colorize-map.ts` | Script de génération de la carte colorisée |
| `map-departements.svg` | SVG source (fond de carte France métropolitaine + DOM-TOM) |
| `map-departement-data.json` | Données de comptage par département (depuis prod) |
| `map-departements-colored.svg` | **Artefact généré** (gitignore — relancer le script) |

## Lancer le script

```bash
npx ts-node scripts/map-departements/colorize-map.ts
```

Ouvre `scripts/map-departements/map-departements-colored.svg` dans le navigateur.

## Mettre à jour les données

Relancer la requête suivante sur la **base de prod** et remplacer `map-departement-data.json` :

```sql
SELECT
  dept          AS departement,
  COUNT(*)      AS nb_services
FROM di_services,
  jsonb_array_elements_text(data->'zone_eligibilite') AS dept
WHERE jsonb_typeof(data->'zone_eligibilite') = 'array'
GROUP BY dept
ORDER BY
  CASE
    WHEN dept ~ '^\d+$' THEN LPAD(dept, 5, '0')
    ELSE dept
  END;
```

## Palette de couleurs (DSFR)

Progression **gris → bleu** sur 8 paliers, tokens officiels DSFR :

| Palier | Hex | Token | Régions |
|--------|-----|-------|---------|
| 500+ | `#000091` | blue-france-sun-113 | IDF (666 services) |
| 226–499 | `#313178` | blue-france-850 dark | PACA (226) |
| 155–225 | `#6a6af4` | blue-france-main-525 | Auvergne-RA, Grand Est |
| 100–154 | `#cacafb` | blue-france-850 | Centre-VdL, Nouvelle-Aquitaine… |
| 83–99 | `#e3e3fd` | blue-france-925 | Bretagne, Pays-de-la-Loire |
| 36–82 | `#cecece` | grey-200 | Normandie, Hauts-de-France |
| 6–35 | `#e5e5e5` | grey-925 | Corse, Guyane, Mayotte |
| 1–5 | `#f6f6f6` | grey-975 | Occitanie petits depts, DOM-TOM |

## Compatibilité Figma

Le SVG généré utilise des `fill` **inline** (pas de bloc `<style>`) — importable directement dans Figma.

## Contexte data

- **1 942 services** dans `di_services` (base prod, avril 2026)
- **102 départements** couverts (100 métropole + DOM-TOM)
- Source : champ `zone_eligibilite` (array de codes dept)
- 75% des fiches ingérées sont non conformes → **seules 518/2 076 fiches classifiées sont à traiter**
