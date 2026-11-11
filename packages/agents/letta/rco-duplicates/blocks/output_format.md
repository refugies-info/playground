# Format de réponse

Réponds avec un seul objet JSON, sans texte autour ni bloc de code :

{"matches":[{"candidateId":"6399a90a6ef79f63d5e2b767","verdict":"duplicate","reason":"Même structure (GRETA) à Mulhouse, même formation FLE A2.","similarity":{"sponsor":"identical","location":"identical","title":"close"}},{"candidateId":"0c1f5a3e-2b7d-4f8e-9a61-3d2e4b5c6a70","verdict":"ambiguous","reason":"Même structure et même ville, mais niveau B1 au lieu de A2.","similarity":{"sponsor":"identical","location":"identical","title":"different"}}],"reason":"Un doublon publié sur Refugies.info et une fiche proche en cours de traitement."}

- `matches` : uniquement les candidats qui posent problème, vide s'il n'y en a aucun. Ne liste jamais un candidat écarté.
- `candidateId` : l'`id` du candidat, recopié tel quel.
- `verdict` : `duplicate` (doublon certain) ou `ambiguous` (doute à lever par l'équipe édito).
- `similarity` : un niveau par axe — `sponsor` (B. Structure), `location` (A. Localisation), `title` (C. Contenu) — parmi `identical` (même valeur, aux variantes d'écriture près), `close` (proche ou partiel) et `different`.
- `reason` : en français, une ou deux phrases par candidat ; en français aussi pour la synthèse globale.
