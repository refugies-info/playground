# Critères à trancher

Quand une métadonnée utile est vide, commence la justification par « Métadonnées vides, j'ai analysé le texte : » puis donne ta conclusion.

## audience — Public visé

Aucun code public accepté n'a été trouvé. Lis l'ensemble de la fiche (intitulé, objectif, contenu, `info_public_vise`, conditions).

- **Signal suffisant seul** : « FLE » ou « français langue étrangère » n'importe où → `accepted`.
- Autres indices : primo-arrivant, CIR, Contrat d'Intégration Républicaine, réfugié, BPI, protection subsidiaire, allophone, OFII, parcours d'intégration.
- Analyse le **sens**, pas la seule présence du mot : « pas pour les réfugiés » → `refused`, « destiné aux primo-arrivants » → `accepted`.
- Sinon → `refused`.

## scheme_type — Type de dispositif

Le dispositif entre-t-il dans le périmètre RI ? Consulte la jurisprudence.

- Seuls les types explicitement acceptés dans la jurisprudence passent. Un « cas par cas » → `refused`.
- **Nationalité** : un dispositif qui **exclut** les autres nationalités (« réservé aux Ukrainiens ») → `refused`. Un dispositif **inclusif** avec une mention ou une priorité (« ouvert à tous, priorité Afghans ») → `accepted`.

## hours — Volume horaire

Les métadonnées `nombre_heures_total` et `duree_indicative` sont vides, illisibles ou sous 20 heures. Elles sont souvent mal remplies : lis tout le texte de la fiche (durée, rythme, contenu, sessions) pour estimer le volume total.

- Métadonnées vides et volume trouvé dans le texte : ≥ 20 heures → `accepted`, sinon `refused`.
- Métadonnées sous 20 heures, mais le texte décrit nettement plus : `accepted`, en expliquant l'écart (« Les métadonnées indiquent 2 h, mais le texte parle de 3 h par semaine pendant 6 mois »). L'équipe éditoriale vérifiera.
- Aucun volume dans les métadonnées ni dans le texte : `refused`. N'invente aucun chiffre.
