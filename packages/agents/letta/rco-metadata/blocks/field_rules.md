# Règles par métadonnée

Les identifiants et valeurs autorisées sont dans le bloc `knowledge_base`.

## titreMarque — Titre marque (texte)
Un nom court, tiré du titre (`nom`). Facultatif : si aucune règle ci-dessous ne s'applique, `null`.

Ce que l'équipe édito a publié pour ces débuts de `nom` :

| Le `nom` contient | Titre marque |
| --- | --- |
| `PREPA Clés Avenir …` | Le nom recopié, sans les guillemets « » et sans les listes de métiers ou les précisions en fin de nom (« orientation alternance ») |
| `PRÉPA Clés – Je progresse en français` | Recopié |
| `ASL` ou `Actions socio-linguistiques complémentaires du CIR`, suivi d'un nom de programme | Le nom du programme seul : « Cap sur l'avenir », « Passeport vers l'intégration », « DU FLaViC » |
| `ASL` ou `Actions socio-linguistiques complémentaires du CIR`, sans nom de programme | « Action socio-linguistique (ASL) » |
| `Dispositif formation linguistique - DFL - Action FLE - Lot n° …` | « Dispositif formation linguistique (DFL) - Action FLE » |
| `Diplôme d'études en langue française …` | « Cours de français et préparation DELF » |
| `ALPHA : Parler, lire et écrire en français` | « Alpha : parler, lire et écrire en français » |
| `… à visée professionnelle` | « FLE à visée professionnelle » |
| `Français Langue d'Intégration` | « Français langue d'intégration » |

Autres cas :
- Un nom de programme reconnaissable (« Pro'Langue SIAE », « NumériLangue », « Clé Intégration »…) : recopie-le tel qu'il est écrit.
- Un sigle de discipline suivi d'une description (« FLE : Progresser en français », « Français : se perfectionner ») n'est pas un nom de programme : ne le recopie pas, applique la règle suivante.
- Le `nom` décrit seulement la formation, sans programme : un libellé court de la forme « Cours de français et <ce qui s'y ajoute> » (« Cours de français et accompagnement pour le travail »), seulement si le texte le justifie clairement. Sinon `null`.
- Retire toujours le niveau (`A1`, `B1/B2`), le numéro de lot, la ville et les codes internes (`SSDIC26`, `[HSP Socle]`).
- 7 mots au plus. N'invente jamais un nom de programme.

## abstract — En bref (texte)
Une phrase en français simple, 200 caractères maximum, qui dit ce que la personne va faire ou obtenir. Pas de sigle non expliqué.

## theme — Thème principal (un `ID_theme`)
Le thème qui correspond le mieux à l'objectif de la fiche. Une formation de français → « Apprendre le français ».

## secondaryThemes — Thèmes secondaires (liste d'`ID_theme`)
Seulement s'ils sont clairement présents. Jamais le thème principal. Sinon `null`.

## needs — Besoins (liste d'`ID_need`)
Un à trois besoins, choisis **uniquement parmi ceux du thème principal ou des thèmes secondaires** retenus (colonne `ID_theme`).

## publicStatus — Public visé (liste)
Valeurs : `asile`, `refugie`, `subsidiaire`, `temporaire`, `apatride`, `french`.
Ne t'appuie que sur le texte (`info_public_vise`, conditions, objectif). « Tout public » → les six valeurs. Si `conditions` contient `cir`, ne mets jamais `asile`.

## public — Public spécifique (liste)
Valeurs : `family`, `women`, `youths`, `senior`, `gender`. Seulement si la fiche cible explicitement ce public. Sinon `null`.

## frenchLevel — Niveau de français (liste)
Valeurs : `alpha`, `A1`, `A2`, `B1`, `B2`, `C1`, `C2`. Les niveaux **visés ou requis** cités dans la fiche (« A1 à B1 » → `["A1","A2","B1"]`). « Alphabétisation » → `alpha`. Sinon `null`.

## age — Âge (objet)
`{"type":"lessThan"|"moreThan"|"between","ages":[...]}`. « plus de 16 ans » → `{"type":"moreThan","ages":[16]}`, « 16 à 25 ans » → `{"type":"between","ages":[16,25]}`. « Majeur » → `moreThan` 18. Sinon `null`.

## frequency — Fréquence (objet)
`{"amountDetails":"minimum"|"maximum"|"approximately"|"exactly","hours":<nombre>,"frequencyUnit":"session"|"day"|"week"|"month"|"trimester"|"semester"|"year"}`. `hours` est un nombre, pas une liste. « 12 h par semaine » → `{"amountDetails":"exactly","hours":12,"frequencyUnit":"week"}`. Sinon `null`.

## commitment — Durée totale (objet)
Demandé seulement quand `nombre_heures_total` est absent. `{"amountDetails":"minimum"|"maximum"|"approximately"|"exactly"|"between","hours":[<nombre>],"timeUnit":"sessions"|"hours"|"half-days"|"days"|"weeks"|"months"|"trimesters"|"semesters"|"years"}`. « 6 mois » → `{"amountDetails":"approximately","hours":[6],"timeUnit":"months"}`.

## price — Prix (objet)
Demandé seulement quand `frais_restants` est un texte sans montant. `{"values":[<nombre>]}`, `0` = gratuit, avec `"details"` (`once`, `eachTime`, `hour`, `day`, `week`, `month`, `trimester`, `semester`, `year`) si le texte le précise. Montant inconnu → `null`.

## timeSlots — Jours de présence (liste)
Valeurs : `monday` … `sunday`. Seulement les jours cités explicitement. Sinon `null`.

## conditions — Conditions d'accès (liste)
Valeurs, et **aucune autre** : `acte naissance`, `titre sejour`, `cir`, `bank account`, `pole emploi`, `driver license`, `school`.
- `school` : niveau d'études, diplôme ou niveau de français **requis** pour entrer.
- `cir` : seulement si avoir signé le CIR est une condition obligatoire d'accès. « primo-arrivants, signataires du CIR » décrit un public, ce n'est pas une condition.
- Une condition hors liste (« être majeur », « habiter le département ») est ignorée. Aucune → `null`.

## location — Départements
Demandé seulement si aucun lieu n'a de département. `"online"` si la formation est entièrement à distance, sinon `null`.

## mainSponsor, periode, map
Demandés seulement si l'API ne les fournit pas : réponds `null`.
