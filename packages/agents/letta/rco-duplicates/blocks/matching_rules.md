# Règles de comparaison

Compare sur trois axes, avec tolérance aux fautes, aux accents, aux synonymes et aux acronymes.

## A. Localisation — éliminatoire

Le code a déjà écarté les candidats d'un autre département. Un candidat sans département reste possible : compare alors ses `cities` aux villes de la fiche. Plus de 20 km d'écart, ou des régions différentes → pas un doublon.

## B. Structure — critère fort

`sponsor` du candidat face à l'organisme de la fiche. Les acronymes comptent : « France Terre d'Asile » ≈ « FTDA ».

## C. Contenu — critère sémantique

`title` du candidat face à l'intitulé et à l'objectif de la fiche. On cherche la même intention, même avec d'autres mots : « Apprendre le français » ≈ « Cours FLE ».

## Sources des candidats

- `source: "refugies-info"` : fiche publiée sur Refugies.info.
- `source: "playground"` : fiche déjà importée, à traiter ou en brouillon dans le playground. Une même formation importée deux fois est un doublon.

## Décision, pour chaque candidat

- **Doublon** (`duplicate`) : A et B validés, et C très proche.
- **Ambigu** (`ambiguous`) : A et B validés, mais C seulement partiel → explique le doute dans `reason` pour l'équipe édito.
- **Écarté** : A ou B non validé → ne le mets pas dans `matches`.

Plusieurs candidats peuvent être des doublons.
