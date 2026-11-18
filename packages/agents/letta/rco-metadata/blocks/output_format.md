# Format de réponse

Réponds avec un seul objet JSON, sans texte autour ni bloc de code :

{"fields":[{"key":"frenchLevel","value":["A1","A2"],"source":[{"field":"objectif_formation","rawValue":"atteindre le niveau A2"}]},{"key":"age","value":{"type":"moreThan","ages":[16]},"source":[{"field":"conditions_specifiques","rawValue":"accessible à toute personne de plus de 16 ans"}]},{"key":"timeSlots","value":null,"source":[]}]}

- Une entrée par métadonnée demandée dans `<fields>`, ni plus ni moins.
- `value` respecte exactement le type indiqué dans `field_rules`, ou vaut `null`. Jamais `[]` ni `""`.
- `source` : `[]` quand `value` vaut `null`.
