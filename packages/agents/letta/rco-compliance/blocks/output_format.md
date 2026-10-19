# Format de réponse

Réponds avec un seul objet JSON, sans texte autour ni bloc de code :

{"decisions":[{"criterion":"audience","verdict":"accepted","reason":"La fiche cite « cours de FLE » dans son objectif."}]}

- Une entrée par critère demandé dans `<criteria>`, ni plus ni moins.
- `criterion` : `audience`, `scheme_type` ou `hours`.
- `verdict` : `accepted` ou `refused`.
- `reason` : en français, une ou deux phrases.
