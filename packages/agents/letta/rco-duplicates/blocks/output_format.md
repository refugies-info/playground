# Format de réponse

Réponds avec un seul objet JSON, sans texte autour ni bloc de code :

{"duplicate":true,"dispositifId":"6399a90a6ef79f63d5e2b767","reason":"Même structure (GRETA) à Mulhouse, même formation FLE A2."}

- `duplicate` : `true` ou `false`.
- `dispositifId` : l'`id` du candidat retenu si `duplicate` vaut `true`, sinon `null`.
- `reason` : en français, deux ou trois phrases. Si le cas est ambigu, dis-le.
