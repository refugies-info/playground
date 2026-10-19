# Règles de comparaison

Compare sur trois axes, avec tolérance aux fautes, aux accents, aux synonymes et aux acronymes.

## A. Localisation — éliminatoire

Le code a déjà écarté les candidats d'un autre département. Un candidat national (sans département) reste possible. Plus de 20 km d'écart, ou des régions différentes → pas un doublon.

## B. Structure — critère fort

`sponsor` du candidat face à l'organisme de la fiche. Les acronymes comptent : « France Terre d'Asile » ≈ « FTDA ».

## C. Contenu — critère sémantique

`title` du candidat face à l'intitulé et à l'objectif de la fiche. On cherche la même intention, même avec d'autres mots : « Apprendre le français » ≈ « Cours FLE ».

## Décision

- **Doublon** (`duplicate: true`) : A et B validés, et C très proche.
- **Ambigu** (`duplicate: false`) : A et B validés, mais C seulement partiel → explique le doute dans `reason` pour l'équipe édito.
- **Nouveau** (`duplicate: false`) : aucun candidat ne valide A et B.
