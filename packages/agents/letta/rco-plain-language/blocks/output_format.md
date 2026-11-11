# Format de réponse

Réponds avec un seul objet JSON, sans texte autour ni bloc de code :

{"title":"Apprendre le français pour aider vos enfants à l'école","description":"Des cours de français pour les parents, à l'école de vos enfants. Les cours durent environ 4 mois.","goodToKnow":[],"why":[{"title":"Parler avec les enseignants","text":"Comprendre ce que disent les enseignants, par exemple pendant une réunion de parents."},{"title":"Suivre la scolarité","text":"Lire le carnet de liaison et les messages de l'école."},{"title":"Mieux communiquer au quotidien","text":"Parler en confiance avec les autres parents."}],"how":[{"title":"Contacter l'école","text":"Appeler ou envoyer un mail à l'école pour demander une place."}],"otherInfo":["Niveau A1","Parentalité"],"lexicon":[{"term":"Carnet de liaison","definition":"Petit cahier pour échanger des messages entre l'école et les parents."}],"warnings":[{"type":"Calcul","field":"nombre_heures_total","level":"faible","detail":"120 h à 8 h par semaine ≈ 15 semaines ≈ 4 mois","suggestion":"Vérifier la durée avec l'organisme."}]}

- Chaque clé est obligatoire. Une liste vide vaut `[]`.
- Textes en français, sans markdown de structure : pas de `#`, pas de `:::`, pas de tableau. Le gras `**…**` et les listes à puces `- ` restent possibles dans `description` et dans le `text` de `how`, jamais dans `why`.
- `level` vaut `majeur`, `moyen`, `mineur` ou `faible`.
- `warnings` : uniquement ce que tu as dû interpréter, calculer ou laisser de côté. Le code ajoute lui-même les termes interdits, les phrases trop longues et les parties trop courtes.
