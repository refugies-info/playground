-- Seed ingestion_records
-- ingestion_report_id set to NULL here, backfilled in 99_backfill_fks.sql

ALTER TABLE ingestion_records DISABLE TRIGGER on_new_ingestion_record;
ALTER TABLE ingestion_records DISABLE TRIGGER tr_ingestion_records_version;

INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$64be85c4-0e9f-4578-aa75-d72b78353ee6$seed$, $seed$2026-02-16 09:55:46.840481+00$seed$, $seed$2026-02-16 09:55:46.840481+00$seed$, $seed$---
id: carif-oref--01_GE2030516
nom: Atelier sociolinguistique - Formation en français - Alphabétisation niveau
  A1.1 - Groupe 2 (ASL)
type: formation
extra:
  action:
    session:
      - "@ref": "15651"
        "@numero": GE2030516
        periode:
          fin: "20260630"
          debut: "20250915"
        recrutement:
          - "@numero": 01_GE896174
            adresse:
              ligne:
                - 3 rue Georges Risler
              ville: Mulhouse
              codepostal: "68100"
              departement: "68"
              denomination: CDAFAL 68 Association
              code-INSEE-commune: "68224"
            periode:
              fin: "20260121"
              debut: "20260121"
            heure-fin: 12h00
            nb-places: 12
            a-distance: "0"
            commentaire: Compter 30mn par rendez-vous
            heure-debut: 09h00
            modalite-recrutement: "8"
            code-perimetre-recrutement: "2"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: AHMANE
              prenom: Malika
              telfixe:
                numtel:
                  - "0787069017"
              courriel: cdafal68.asl@hotmail.fr
            type-contact: "3"
          - coordonnees:
              nom: KOBEL
              prenom: Christiane
              telfixe:
                numtel:
                  - "0608056497"
              courriel: cdafal68.asl@hotmail.fr
            type-contact: "5"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            ligne:
              - 3 Rue Georges Risler
            ville: Mulhouse
            codepostal: "68100"
            denomination: Carré des Associations - Mulhouse
            code-INSEE-commune: "68224"
        periode-inscription:
          periode:
            fin: "20260630"
            debut: "20250901"
        modalites-inscription: |-
          Inscription tous les mercredis matin
          Nous contacter sur : https://formation.cdafal68.eu/
          03 89 42 85 20
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: null
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81021"
                "@ref": V14
                "@info": code-public-vise
              - $: "81022"
                "@ref": V14
                "@info": code-public-vise
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "81042"
                "@ref": V14
                "@info": code-public-vise
              - $: ASL
                "@info": programme-financeur
              - $: BOP 104
                "@info": ref-action-marche-financeur
        code-financeur: "19"
        nb-places-financees: 12
    modalites-recrutement: |-
      - Test de positionnement de départ
      - Évaluation préalable
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "11"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 100 Avenue de Colmar
commune: Mulhouse
publics:
  - personnes-exilees
courriel: cdafal68.asl@hotmail.fr
date_maj: 2026-01-20
latitude: 47.756287
longitude: 7.336421
telephone: "+33787069017"
code_insee: "68224"
code_postal: "68200"
description: >-
  ### Objectif de la formation


  - Se présenter et présenter sa famille.- Ecrire son nom et son prénom.-
  Discriminer les sons des voyelles et des consonnes.- Remplir un formulaire
  simple avec leurs éléments d'identité de base.


  ### Contenu de la formation


  - Acquisition de la lecture- Production orale, activités d'expression-
  Production écrite- Réception écrite
lien_source: https://www.intercariforef.org/formations/formations-intitule-formation/formation-01_GE245976_GE2030516.html
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
structure_id: carif-oref--01_GE305449
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Pas de prerequis
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: |-
  - Test de positionnement de départ
  - Évaluation préalable
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--01_GE305449
  nom: Conseil Départemental des Associations des Familles Laïques du Haut Rhin
    Association
  siret: "43751505900032"
  source: carif-oref
  adresse: 100 Avenue de Colmar
  commune: Mulhouse
  courriel: cdafal68.asl@hotmail.fr
  date_maj: 2026-01-20
  doublons: []
  latitude: 47.756287
  site_web: http://cdafal68.eu/
  longitude: 7.336421
  telephone: "+33787069017"
  code_insee: "68224"
  code_postal: "68200"
  description: null
  lien_source: https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-01_GE305449.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  accessibilite_lieu: null
  complement_adresse: null
---

# Atelier sociolinguistique - Formation en français - Alphabétisation niveau A1.1 - Groupe 2 (ASL)

### Objectif de la formation

- Se présenter et présenter sa famille.- Ecrire son nom et son prénom.- Discriminer les sons des voyelles et des consonnes.- Remplir un formulaire simple avec leurs éléments d'identité de base.

### Contenu de la formation

- Acquisition de la lecture- Production orale, activités d'expression- Production écrite- Réception écrite

## Conditions d'accès

Pas de prerequis$seed$, $seed${"id": "carif-oref--01_GE2030516", "nom": "Atelier sociolinguistique - Formation en français - Alphabétisation niveau A1.1 - Groupe 2 (ASL)", "type": "formation", "extra": {"action": {"session": [{"@ref": "15651", "@numero": "GE2030516", "periode": {"fin": "20260630", "debut": "20250915"}, "recrutement": [{"@numero": "01_GE896174", "adresse": {"ligne": ["3 rue Georges Risler"], "ville": "Mulhouse", "codepostal": "68100", "departement": "68", "denomination": "CDAFAL 68 Association", "code-INSEE-commune": "68224"}, "periode": {"fin": "20260121", "debut": "20260121"}, "heure-fin": "12h00", "nb-places": 12, "a-distance": "0", "commentaire": "Compter 30mn par rendez-vous", "heure-debut": "09h00", "modalite-recrutement": "8", "code-perimetre-recrutement": "2"}], "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "AHMANE", "prenom": "Malika", "telfixe": {"numtel": ["0787069017"]}, "courriel": "cdafal68.asl@hotmail.fr"}, "type-contact": "3"}, {"coordonnees": {"nom": "KOBEL", "prenom": "Christiane", "telfixe": {"numtel": ["0608056497"]}, "courriel": "cdafal68.asl@hotmail.fr"}, "type-contact": "5"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"ligne": ["3 Rue Georges Risler"], "ville": "Mulhouse", "codepostal": "68100", "denomination": "Carré des Associations - Mulhouse", "code-INSEE-commune": "68224"}}, "periode-inscription": {"periode": {"fin": "20260630", "debut": "20250901"}}, "modalites-inscription": "Inscription tous les mercredis matin\nNous contacter sur : https://formation.cdafal68.eu/\n03 89 42 85 20", "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": null, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81021", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81022", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81042", "@ref": "V14", "@info": "code-public-vise"}, {"$": "ASL", "@info": "programme-financeur"}, {"$": "BOP 104", "@info": "ref-action-marche-financeur"}]}], "code-financeur": "19", "nb-places-financees": 12}], "modalites-recrutement": "- Test de positionnement de départ\n- Évaluation préalable", "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "11", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "100 Avenue de Colmar", "commune": "Mulhouse", "publics": ["personnes-exilees"], "courriel": "cdafal68.asl@hotmail.fr", "date_maj": "2026-01-20", "latitude": 47.756287, "longitude": 7.336421, "structure": {"id": "carif-oref--01_GE305449", "nom": "Conseil Départemental des Associations des Familles Laïques du Haut Rhin Association", "siret": "43751505900032", "source": "carif-oref", "adresse": "100 Avenue de Colmar", "commune": "Mulhouse", "courriel": "cdafal68.asl@hotmail.fr", "date_maj": "2026-01-20", "doublons": [], "latitude": 47.756287, "site_web": "http://cdafal68.eu/", "longitude": 7.336421, "telephone": "+33787069017", "code_insee": "68224", "code_postal": "68200", "description": null, "lien_source": "https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-01_GE305449.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33787069017", "code_insee": "68224", "code_postal": "68200", "description": "### Objectif de la formation\n\n- Se présenter et présenter sa famille.- Ecrire son nom et son prénom.- Discriminer les sons des voyelles et des consonnes.- Remplir un formulaire simple avec leurs éléments d'identité de base.\n\n### Contenu de la formation\n\n- Acquisition de la lecture- Production orale, activités d'expression- Production écrite- Réception écrite", "lien_source": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-01_GE245976_GE2030516.html", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--01_GE305449", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Pas de prerequis", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": "- Test de positionnement de départ\n- Évaluation préalable", "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$a61170d7-5124-4009-bc54-856242b4bb69$seed$, $seed$3b6ad197-2478-418d-88b3-2eaf36807e55$seed$, 1, $seed$DI$seed$, $seed$non_compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$e5266641-084d-4ab5-a6e1-acb6b21c5a3d$seed$, $seed$2026-02-16 09:55:46.840481+00$seed$, $seed$2026-02-16 09:55:46.840481+00$seed$, $seed$---
id: carif-oref--02_00437877
nom: Ouvrir l'école aux parents pour la réussite des enfants - OEPRE
type: formation
extra:
  action:
    session:
      - "@ref": "33782"
        extras:
          - "@info": delegation
            extra:
              - $: "0"
                "@info": region
              - $: "00437877"
                "@info": identifiant
        "@numero": "00437877"
        periode:
          fin: "20260131"
          debut: "20230904"
        recrutement:
          - "@numero": 02_00437877_3
            modalite-recrutement: "3"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: Secretariat
              telfixe:
                numtel:
                  - "0557400212"
              courriel: ce.0330064R@ac-bordeaux.fr
            type-contact: "3"
        adresse-inscription:
          adresse:
            ligne:
              - 325 Rue Jean Monnet
            ville: Castillon-la-Bataille
            codepostal: "33350"
            departement: "33"
            code-INSEE-commune: "33108"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 120
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81022"
                "@ref": V14
                "@info": code-public-vise
              - $: Ouvrir l'école aux parents pour la réussite des enfants
                "@info": programme-financeur
        code-financeur: "12"
        nb-places-financees: 1
      - extras:
          - "@info": specificites
            extra:
              - $: "81022"
                "@ref": V14
                "@info": code-public-vise
              - $: Ouvrir l'école aux parents pour la réussite des enfants
                "@info": programme-financeur
        code-financeur: "19"
        nb-places-financees: 1
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: null
frais: null
source: carif-oref
adresse: 325 Rue Jean Monnet
commune: Castillon-la-Bataille
publics:
  - personnes-exilees
courriel: ce.0330064R@ac-bordeaux.fr
date_maj: 2025-02-24
latitude: 44.851134
longitude: -0.050648
telephone: "+33557400212"
code_insee: "33108"
code_postal: "33350"
description: >-
  ### Objectif de la formation


  Les formations ont pour but de favoriser l'intégration des parents d'élèves,
  primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en
  les impliquant notamment dans la scolarité de leur enfant.


  ### Contenu de la formation


  Les formations portent sur trois axes d'apprentissage : - l'acquisition du
  français (comprendre, parler, lire et écrire) ; - la connaissance des valeurs
  de la République et leur mise en œuvre dans la société française ; - la
  connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves
  et des parents. Cette formation est assurée par des enseignants en Français
  Langue Seconde, des enseignants des UPE2A, ou des membres d'associations
  diplômés en FLE-FLS
lien_source: https://www.intercariforef.org/formations/formations-intitule-formation/formation-02_201901059923_00437877.html
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
structure_id: carif-oref--02_7303923
modes_accueil:
  - en-presentiel
score_qualite: 0.8699999999999999
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: >-
  Primo-arrivant, refugies

  Avoir un enfant scolarise dans l etablissement ou se deroule le dispositif ou
  un etablissement proche.
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "16"
  - "17"
  - "19"
  - "23"
  - "24"
  - "33"
  - "40"
  - "47"
  - "64"
  - "79"
  - "86"
  - "87"
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--02_7303923
  nom: COLLEGE ALIENOR D'AQUITAINE
  siret: "19330143900017"
  source: carif-oref
  adresse: 325 Rue Jean Monnet
  commune: Castillon-la-Bataille
  courriel: ce.0330064R@ac-bordeaux.fr
  date_maj: 2025-02-24
  doublons: []
  latitude: 44.851134
  site_web: null
  longitude: -0.050648
  telephone: "+33557400212"
  code_insee: "33108"
  code_postal: "33350"
  description: null
  lien_source: https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-02_7303923.html
  score_qualite: 0.87
  horaires_accueil: null
  reseaux_porteurs: null
  accessibilite_lieu: null
  complement_adresse: null
---

# Ouvrir l'école aux parents pour la réussite des enfants - OEPRE

### Objectif de la formation

Les formations ont pour but de favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage : - l'acquisition du français (comprendre, parler, lire et écrire) ; - la connaissance des valeurs de la République et leur mise en œuvre dans la société française ; - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents. Cette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS

## Conditions d'accès

Primo-arrivant, refugies
Avoir un enfant scolarise dans l etablissement ou se deroule le dispositif ou un etablissement proche.$seed$, $seed${"id": "carif-oref--02_00437877", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "type": "formation", "extra": {"action": {"session": [{"@ref": "33782", "extras": [{"@info": "delegation", "extra": [{"$": "0", "@info": "region"}, {"$": "00437877", "@info": "identifiant"}]}], "@numero": "00437877", "periode": {"fin": "20260131", "debut": "20230904"}, "recrutement": [{"@numero": "02_00437877_3", "modalite-recrutement": "3"}], "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "Secretariat", "telfixe": {"numtel": ["0557400212"]}, "courriel": "ce.0330064R@ac-bordeaux.fr"}, "type-contact": "3"}], "adresse-inscription": {"adresse": {"ligne": ["325 Rue Jean Monnet"], "ville": "Castillon-la-Bataille", "codepostal": "33350", "departement": "33", "code-INSEE-commune": "33108"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81022", "@ref": "V14", "@info": "code-public-vise"}, {"$": "Ouvrir l'école aux parents pour la réussite des enfants", "@info": "programme-financeur"}]}], "code-financeur": "12", "nb-places-financees": 1}, {"extras": [{"@info": "specificites", "extra": [{"$": "81022", "@ref": "V14", "@info": "code-public-vise"}, {"$": "Ouvrir l'école aux parents pour la réussite des enfants", "@info": "programme-financeur"}]}], "code-financeur": "19", "nb-places-financees": 1}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": null}}, "frais": null, "source": "carif-oref", "adresse": "325 Rue Jean Monnet", "commune": "Castillon-la-Bataille", "publics": ["personnes-exilees"], "courriel": "ce.0330064R@ac-bordeaux.fr", "date_maj": "2025-02-24", "latitude": 44.851134, "longitude": -0.050648, "structure": {"id": "carif-oref--02_7303923", "nom": "COLLEGE ALIENOR D'AQUITAINE", "siret": "19330143900017", "source": "carif-oref", "adresse": "325 Rue Jean Monnet", "commune": "Castillon-la-Bataille", "courriel": "ce.0330064R@ac-bordeaux.fr", "date_maj": "2025-02-24", "doublons": [], "latitude": 44.851134, "site_web": null, "longitude": -0.050648, "telephone": "+33557400212", "code_insee": "33108", "code_postal": "33350", "description": null, "lien_source": "https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-02_7303923.html", "score_qualite": 0.87, "horaires_accueil": null, "reseaux_porteurs": null, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33557400212", "code_insee": "33108", "code_postal": "33350", "description": "### Objectif de la formation\n\nLes formations ont pour but de favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage : - l'acquisition du français (comprendre, parler, lire et écrire) ; - la connaissance des valeurs de la République et leur mise en œuvre dans la société française ; - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents. Cette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS", "lien_source": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-02_201901059923_00437877.html", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--02_7303923", "modes_accueil": ["en-presentiel"], "score_qualite": 0.8699999999999999, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Primo-arrivant, refugies\nAvoir un enfant scolarise dans l etablissement ou se deroule le dispositif ou un etablissement proche.", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["16", "17", "19", "23", "24", "33", "40", "47", "64", "79", "86", "87"], "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$b36125d2-2b3e-42d5-88bb-a37c13d0a2fd$seed$, $seed$23651d12-5a9d-4cc5-a034-720e553083c2$seed$, 1, $seed$DI$seed$, $seed$compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$6bdce5bd-1f0d-44fc-ba80-b39bb463f33e$seed$, $seed$2026-02-16 09:55:46.840481+00$seed$, $seed$2026-02-16 09:55:46.840481+00$seed$, $seed$---
id: carif-oref--01_GE2021586
nom: Ouvrir l'école aux parents pour la réussite des enfants
type: formation
extra:
  action:
    session:
      - "@ref": "13768"
        "@numero": GE2021586
        periode:
          fin: "20270131"
          debut: "20250901"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: non precise
              prenom: non precise
              telfixe:
                numtel:
                  - "0387509020"
              courriel: ce.0572493A@ac-nancy-metz.fr
            type-contact: "3"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            ligne:
              - 1 place du Mineur
            ville: Petite-Rosselle
            codepostal: "57540"
            denomination: 1 place du Mineur
            code-INSEE-commune: "57537"
        periode-inscription:
          periode:
            fin: "20270131"
            debut: "20250901"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 120
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "81042"
                "@ref": V14
                "@info": code-public-vise
              - $: OEPRE
                "@info": programme-financeur
              - $: .
                "@info": ref-action-marche-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 1 Place du Mineur
commune: Petite-Rosselle
publics:
  - personnes-exilees
courriel: ce.0572493A@ac-nancy-metz.fr
date_maj: 2026-01-14
latitude: 49.209202
longitude: 6.850071
telephone: "+33387509020"
code_insee: "57537"
code_postal: "57540"
description: >-
  ### Objectif de la formation


  - Les formations ont pour but de favoriser l'intégration des parents d'élèves,
  primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en
  les impliquant notamment dans la scolarité de leur enfant.

  - Attestation de suivi.

  - Validation possible selon le cas (DELF, DCL).


  ### Contenu de la formation


  Les formations portent sur trois axes d'apprentissage :

  - l'acquisition du français (comprendre, parler, lire et écrire) ;

  - la connaissance des valeurs de la République et leur mise en œuvre dans la
  société française ;

  - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des
  élèves et des parents.

  Cette formation est assurée par des enseignants en Français Langue Seconde,
  des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS.
lien_source: https://www.intercariforef.org/formations/formations-intitule-formation/formation-01_GE471359_GE2021586.html
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
structure_id: carif-oref--01_GE307361
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Etre primo-arrivants, immigres ou etrangers hors Union europeenne.
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--01_GE307361
  nom: Collège Louis Armand
  siret: "19572493500018"
  source: carif-oref
  adresse: 1 Place du Mineur
  commune: Petite-Rosselle
  courriel: ce.0572493A@ac-nancy-metz.fr
  date_maj: 2026-01-14
  doublons: []
  latitude: 49.209202
  site_web: null
  longitude: 6.850071
  telephone: "+33387509020"
  code_insee: "57537"
  code_postal: "57540"
  description: null
  lien_source: https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-01_GE307361.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  accessibilite_lieu: null
  complement_adresse: null
---

# Ouvrir l'école aux parents pour la réussite des enfants

### Objectif de la formation

- Les formations ont pour but de favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.
- Attestation de suivi.
- Validation possible selon le cas (DELF, DCL).

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage :
- l'acquisition du français (comprendre, parler, lire et écrire) ;
- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;
- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.
Cette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS.

## Conditions d'accès

Etre primo-arrivants, immigres ou etrangers hors Union europeenne.$seed$, $seed${"id": "carif-oref--01_GE2021586", "nom": "Ouvrir l'école aux parents pour la réussite des enfants", "type": "formation", "extra": {"action": {"session": [{"@ref": "13768", "@numero": "GE2021586", "periode": {"fin": "20270131", "debut": "20250901"}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "non precise", "prenom": "non precise", "telfixe": {"numtel": ["0387509020"]}, "courriel": "ce.0572493A@ac-nancy-metz.fr"}, "type-contact": "3"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"ligne": ["1 place du Mineur"], "ville": "Petite-Rosselle", "codepostal": "57540", "denomination": "1 place du Mineur", "code-INSEE-commune": "57537"}}, "periode-inscription": {"periode": {"fin": "20270131", "debut": "20250901"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81042", "@ref": "V14", "@info": "code-public-vise"}, {"$": "OEPRE", "@info": "programme-financeur"}, {"$": ".", "@info": "ref-action-marche-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "1 Place du Mineur", "commune": "Petite-Rosselle", "publics": ["personnes-exilees"], "courriel": "ce.0572493A@ac-nancy-metz.fr", "date_maj": "2026-01-14", "latitude": 49.209202, "longitude": 6.850071, "structure": {"id": "carif-oref--01_GE307361", "nom": "Collège Louis Armand", "siret": "19572493500018", "source": "carif-oref", "adresse": "1 Place du Mineur", "commune": "Petite-Rosselle", "courriel": "ce.0572493A@ac-nancy-metz.fr", "date_maj": "2026-01-14", "doublons": [], "latitude": 49.209202, "site_web": null, "longitude": 6.850071, "telephone": "+33387509020", "code_insee": "57537", "code_postal": "57540", "description": null, "lien_source": "https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-01_GE307361.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33387509020", "code_insee": "57537", "code_postal": "57540", "description": "### Objectif de la formation\n\n- Les formations ont pour but de favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.\n- Attestation de suivi.\n- Validation possible selon le cas (DELF, DCL).\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :\n- l'acquisition du français (comprendre, parler, lire et écrire) ;\n- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;\n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.\nCette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS.", "lien_source": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-01_GE471359_GE2021586.html", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--01_GE307361", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Etre primo-arrivants, immigres ou etrangers hors Union europeenne.", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$b54e7bdd-df78-4eec-b3cb-f58e3d3a8df7$seed$, $seed$0d379ef4-1624-4b0d-8eef-08b41e4b0b3a$seed$, 1, $seed$DI$seed$, $seed$compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$4c6b9a8a-5ad8-4a8f-9ccf-6f3be424c773$seed$, $seed$2026-02-16 09:55:49.692879+00$seed$, $seed$2026-02-16 09:55:49.692879+00$seed$, $seed$---
id: carif-oref--07_776575S
nom: "FLE : Progresser en français"
type: formation
extra:
  action:
    session:
      - "@ref": "182827"
        "@numero": 776575S
        periode:
          fin: "20260430"
          debut: "20260211"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            pays: FR
            ligne:
              - 13 Rue Robert Nau
            ville: Blois
            codepostal: "41000"
            departement: "41"
            denomination: AFPA de Blois
            geolocalisation:
              latitude: "47.612388"
              longitude: "1.332562"
            code-INSEE-commune: "41018"
        periode-inscription:
          periode:
            fin: "20260210"
            debut: "20260115"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: "270"
    info-public-vise: Cette formation s adresse a tout public allophone dont l
      appropriation de la langue francaise est insuffisante pour s inserer en
      emploi et qui est en recherche d emploi et engage dans une dynamique d
      insertion ou de reconversion professionn[...]
    nombre-heures-total: 321
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "80006"
                "@ref": V14
                "@info": code-public-vise
              - $: Cette formation s'adresse à tout public allophone dont l'appropriation de la
                  langue française est insuffisante pour s'insérer en emploi et
                  qui est en recherche d'emploi et engagé dans une dynamique
                  d'insertion ou de reconversion professionn[...]
                "@info": info-public-vise
              - $: "3"
                "@info": code-perimetre-recrutement
              - $: "Programme régional 2025-2028 : Dispositif de formations linguistiques"
                "@info": programme-financeur
              - $: 251DF0005A-2-71323
                "@info": ref-action-marche-financeur
        code-financeur: "2"
        nb-places-financees: 10
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "0"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 13 Rue Robert Nau
commune: Blois
publics:
  - demandeurs-emploi
courriel: via.info@viaformation.fr
date_maj: 2026-01-28
latitude: 47.612388
longitude: 1.332562
telephone: "+33243756585"
code_insee: "41018"
code_postal: "41000"
description: >-
  ### Objectif de la formation


  La formation « FRANÇAIS LANGUE ÉTRANGÈRE » vise l'acquisition des bases
  linguistiques des bénéficiaires pour faciliter le passage à l'écrit dans des
  situations diverses (écrit volontaire ou obligé). Les personnes sauront
  comprendre et s'exprimer oralement dans un contexte professionnel et dans des
  situations diverses et auront acquis ou renforcer les compétences
  linguistiques attendues en entreprise pour réussir leur projet professionnel
  par l'accès à l'emploi et/ou à la qualification. Elle doit permettre à tout
  citoyen allophone de plus de 16 ans et sorti du système scolaire d'évoluer de
  façon autonome dans les situations les plus diverses et les plus courantes de
  la vie économique, sociale et professionnelle par le développement de
  l'ensemble des compétences et connaissances de base. La consolidation des
  savoirs de base doit permettre une insertion sociale et professionnelle
  réussie, ancrée dans les réalités culturelles françaises : règles sociales,
  sociétales françaises et régionales, stéréotypes, relations familiales, monde
  du travail, monde associatif et le retour et le maintien dans l'emploi, la
  stabilisation d'un projet professionnel et favoriser si besoin l'accès à une
  certification et/ou qualification. Développer l'aptitude des personnes à la
  communication interactive : comprendre, parler, lire et écrire en français
  dans un contexte social et professionnel.


  ### Contenu de la formation


  Elément Titre Court : Succès Pack - Accompagnement Vers le Succès - AVS AVS1 -
  Assurer un accueil et une intégration de qualité - 7h - Objectifs : Assurer un
  accueil et une intégration de qualité S1 : Présenter le centre de formation et
  ses interlocuteurs - 1h S2 : Identifier le cadre de la formation : Livret
  d'accueil et Carnet de bord, règlement intérieur, modalités d'organisation,
  moyens pédagogiques, matériels, Soutien individualisé, Coaching, planning - 4h
  S3 : Constituer son dossier de rémunération de formation - 1h S4 : Instaurer
  une dynamique de groupe et de travail - 1h - 7 hElément Titre Court : Succès
  Pack - Accompagnement Vers le Succès - AVS AVS2 - Identifier les compétences à
  acquérir - Positionnement - 7h - Objectif : Identifier les compétences à
  acquérir et contractualiser les parcours individualisés S1 : Effectuer un
  positionnement - 1h S2 : Préciser les compétences acquises et définir les
  compétences à acquérir - 1h S3 : Identifier ses points d'appui, freins et
  contraintes - 1h S4 : Formaliser les objectifs dans un contrat pédagogique -
  1h S5 : Planifier les étapes de progression - 1h S6 : S'approprier son
  itinéraire individuel de formation - 1h S7 : Appréhender les modalités
  pédagogiques proposées et les outils mobilisables, dont les plateformes de
  formation - 1h - 7 hElément Titre Court : Succès Pack - Accompagnement Vers le
  Succès - AVS AVS3 - Maîtriser les règles pour une insertion durable : TRE -
  11h - Objectif : S'initier aux techniques de recherche d'emploi S1 : Créer son
  CV par compétences et l'actualiser - 2h S2 : Produire un modèle de lettre de
  motivation - 2h S3 : Savoir se présenter et argumenter sa candidature - 2h S4
  : Utiliser l'emploi store - 2h S5 : Préparer sa visite sur des forums emploi -
  2h S6 : Préparer sa visite sur des forums emploi, job dating, café métiers,...
  - 1h - 11 hElément Titre Court : Succès Pack - Accompagnement Vers le Succès -
  AVS AVS4 - Participer à un projet collectif simple, développement des softs
  skills et transitions - 14h - S1 : Participer à un projet collectif
  contextualisé au métier S2 : Développer et reconnaître ses soft skills S3 : Se
  sensibiliser aux transitions numériques et écologiques.
lien_source: https://www.intercariforef.org/formations/formations-intitule-formation/formation-07_2585152F_776575S.html
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
structure_id: carif-oref--07_14262
modes_accueil:
  - en-presentiel
score_qualite: 0.8499999999999999
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: >-
  Le dispositif s adresse a toutes les personnes dont l appropriation de la
  langue francaise est insuffisante pour s inserer dans l emploi.

  Action ouverte a un public age de plus de 16 ans, sorti du systeme scolaire et
  residant prioritairement en Region Centre-Val de Loire et qui a une reelle
  motivation pour engager un parcours de formation.
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "18"
  - "28"
  - "36"
  - "37"
  - "41"
  - "45"
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: Cette formation s adresse a tout public allophone dont l
  appropriation de la langue francaise est insuffisante pour s inserer en emploi
  et qui est en recherche d emploi et engage dans une dynamique d insertion ou
  de reconversion professionn[...]
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--07_14262
  nom: Agence pour la formation professionnelle des adultes
  siret: "82422814201924"
  source: carif-oref
  adresse: 13 Rue Robert Nau
  commune: Blois
  courriel: null
  date_maj: 2026-01-28
  doublons:
    - id: emplois-de-linclusion--d030f614-8890-4846-863a-496e08c50b2f
      source: emplois-de-linclusion
  latitude: 47.612388
  site_web: null
  longitude: 1.332562
  telephone: null
  code_insee: "41018"
  code_postal: "41000"
  description: null
  lien_source: https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-07_14262.html
  score_qualite: 0.84
  horaires_accueil: null
  reseaux_porteurs: null
  accessibilite_lieu: null
  complement_adresse: null
---

# FLE : Progresser en français

### Objectif de la formation

La formation « FRANÇAIS LANGUE ÉTRANGÈRE » vise l'acquisition des bases linguistiques des bénéficiaires pour faciliter le passage à l'écrit dans des situations diverses (écrit volontaire ou obligé). Les personnes sauront comprendre et s'exprimer oralement dans un contexte professionnel et dans des situations diverses et auront acquis ou renforcer les compétences linguistiques attendues en entreprise pour réussir leur projet professionnel par l'accès à l'emploi et/ou à la qualification. Elle doit permettre à tout citoyen allophone de plus de 16 ans et sorti du système scolaire d'évoluer de façon autonome dans les situations les plus diverses et les plus courantes de la vie économique, sociale et professionnelle par le développement de l'ensemble des compétences et connaissances de base. La consolidation des savoirs de base doit permettre une insertion sociale et professionnelle réussie, ancrée dans les réalités culturelles françaises : règles sociales, sociétales françaises et régionales, stéréotypes, relations familiales, monde du travail, monde associatif et le retour et le maintien dans l'emploi, la stabilisation d'un projet professionnel et favoriser si besoin l'accès à une certification et/ou qualification. Développer l'aptitude des personnes à la communication interactive : comprendre, parler, lire et écrire en français dans un contexte social et professionnel.

### Contenu de la formation

Elément Titre Court : Succès Pack - Accompagnement Vers le Succès - AVS AVS1 - Assurer un accueil et une intégration de qualité - 7h - Objectifs : Assurer un accueil et une intégration de qualité S1 : Présenter le centre de formation et ses interlocuteurs - 1h S2 : Identifier le cadre de la formation : Livret d'accueil et Carnet de bord, règlement intérieur, modalités d'organisation, moyens pédagogiques, matériels, Soutien individualisé, Coaching, planning - 4h S3 : Constituer son dossier de rémunération de formation - 1h S4 : Instaurer une dynamique de groupe et de travail - 1h - 7 hElément Titre Court : Succès Pack - Accompagnement Vers le Succès - AVS AVS2 - Identifier les compétences à acquérir - Positionnement - 7h - Objectif : Identifier les compétences à acquérir et contractualiser les parcours individualisés S1 : Effectuer un positionnement - 1h S2 : Préciser les compétences acquises et définir les compétences à acquérir - 1h S3 : Identifier ses points d'appui, freins et contraintes - 1h S4 : Formaliser les objectifs dans un contrat pédagogique - 1h S5 : Planifier les étapes de progression - 1h S6 : S'approprier son itinéraire individuel de formation - 1h S7 : Appréhender les modalités pédagogiques proposées et les outils mobilisables, dont les plateformes de formation - 1h - 7 hElément Titre Court : Succès Pack - Accompagnement Vers le Succès - AVS AVS3 - Maîtriser les règles pour une insertion durable : TRE - 11h - Objectif : S'initier aux techniques de recherche d'emploi S1 : Créer son CV par compétences et l'actualiser - 2h S2 : Produire un modèle de lettre de motivation - 2h S3 : Savoir se présenter et argumenter sa candidature - 2h S4 : Utiliser l'emploi store - 2h S5 : Préparer sa visite sur des forums emploi - 2h S6 : Préparer sa visite sur des forums emploi, job dating, café métiers,... - 1h - 11 hElément Titre Court : Succès Pack - Accompagnement Vers le Succès - AVS AVS4 - Participer à un projet collectif simple, développement des softs skills et transitions - 14h - S1 : Participer à un projet collectif contextualisé au métier S2 : Développer et reconnaître ses soft skills S3 : Se sensibiliser aux transitions numériques et écologiques.

## Conditions d'accès

Le dispositif s adresse a toutes les personnes dont l appropriation de la langue francaise est insuffisante pour s inserer dans l emploi.
Action ouverte a un public age de plus de 16 ans, sorti du systeme scolaire et residant prioritairement en Region Centre-Val de Loire et qui a une reelle motivation pour engager un parcours de formation.$seed$, $seed${"id": "carif-oref--07_776575S", "nom": "FLE : Progresser en français", "type": "formation", "extra": {"action": {"session": [{"@ref": "182827", "@numero": "776575S", "periode": {"fin": "20260430", "debut": "20260211"}, "etat-recrutement": "1", "adresse-inscription": {"adresse": {"pays": "FR", "ligne": ["13 Rue Robert Nau"], "ville": "Blois", "codepostal": "41000", "departement": "41", "denomination": "AFPA de Blois", "geolocalisation": {"latitude": "47.612388", "longitude": "1.332562"}, "code-INSEE-commune": "41018"}}, "periode-inscription": {"periode": {"fin": "20260210", "debut": "20260115"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": "270", "info-public-vise": "Cette formation s adresse a tout public allophone dont l appropriation de la langue francaise est insuffisante pour s inserer en emploi et qui est en recherche d emploi et engage dans une dynamique d insertion ou de reconversion professionn[...]", "nombre-heures-total": 321, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "80006", "@ref": "V14", "@info": "code-public-vise"}, {"$": "Cette formation s'adresse à tout public allophone dont l'appropriation de la langue française est insuffisante pour s'insérer en emploi et qui est en recherche d'emploi et engagé dans une dynamique d'insertion ou de reconversion professionn[...]", "@info": "info-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "Programme régional 2025-2028 : Dispositif de formations linguistiques", "@info": "programme-financeur"}, {"$": "251DF0005A-2-71323", "@info": "ref-action-marche-financeur"}]}], "code-financeur": "2", "nb-places-financees": 10}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "0"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "13 Rue Robert Nau", "commune": "Blois", "publics": ["demandeurs-emploi"], "courriel": "via.info@viaformation.fr", "date_maj": "2026-01-28", "latitude": 47.612388, "longitude": 1.332562, "structure": {"id": "carif-oref--07_14262", "nom": "Agence pour la formation professionnelle des adultes", "siret": "82422814201924", "source": "carif-oref", "adresse": "13 Rue Robert Nau", "commune": "Blois", "courriel": null, "date_maj": "2026-01-28", "doublons": [{"id": "emplois-de-linclusion--d030f614-8890-4846-863a-496e08c50b2f", "source": "emplois-de-linclusion"}], "latitude": 47.612388, "site_web": null, "longitude": 1.332562, "telephone": null, "code_insee": "41018", "code_postal": "41000", "description": null, "lien_source": "https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-07_14262.html", "score_qualite": 0.84, "horaires_accueil": null, "reseaux_porteurs": null, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33243756585", "code_insee": "41018", "code_postal": "41000", "description": "### Objectif de la formation\n\nLa formation « FRANÇAIS LANGUE ÉTRANGÈRE » vise l'acquisition des bases linguistiques des bénéficiaires pour faciliter le passage à l'écrit dans des situations diverses (écrit volontaire ou obligé). Les personnes sauront comprendre et s'exprimer oralement dans un contexte professionnel et dans des situations diverses et auront acquis ou renforcer les compétences linguistiques attendues en entreprise pour réussir leur projet professionnel par l'accès à l'emploi et/ou à la qualification. Elle doit permettre à tout citoyen allophone de plus de 16 ans et sorti du système scolaire d'évoluer de façon autonome dans les situations les plus diverses et les plus courantes de la vie économique, sociale et professionnelle par le développement de l'ensemble des compétences et connaissances de base. La consolidation des savoirs de base doit permettre une insertion sociale et professionnelle réussie, ancrée dans les réalités culturelles françaises : règles sociales, sociétales françaises et régionales, stéréotypes, relations familiales, monde du travail, monde associatif et le retour et le maintien dans l'emploi, la stabilisation d'un projet professionnel et favoriser si besoin l'accès à une certification et/ou qualification. Développer l'aptitude des personnes à la communication interactive : comprendre, parler, lire et écrire en français dans un contexte social et professionnel.\n\n### Contenu de la formation\n\nElément Titre Court : Succès Pack - Accompagnement Vers le Succès - AVS AVS1 - Assurer un accueil et une intégration de qualité - 7h - Objectifs : Assurer un accueil et une intégration de qualité S1 : Présenter le centre de formation et ses interlocuteurs - 1h S2 : Identifier le cadre de la formation : Livret d'accueil et Carnet de bord, règlement intérieur, modalités d'organisation, moyens pédagogiques, matériels, Soutien individualisé, Coaching, planning - 4h S3 : Constituer son dossier de rémunération de formation - 1h S4 : Instaurer une dynamique de groupe et de travail - 1h - 7 hElément Titre Court : Succès Pack - Accompagnement Vers le Succès - AVS AVS2 - Identifier les compétences à acquérir - Positionnement - 7h - Objectif : Identifier les compétences à acquérir et contractualiser les parcours individualisés S1 : Effectuer un positionnement - 1h S2 : Préciser les compétences acquises et définir les compétences à acquérir - 1h S3 : Identifier ses points d'appui, freins et contraintes - 1h S4 : Formaliser les objectifs dans un contrat pédagogique - 1h S5 : Planifier les étapes de progression - 1h S6 : S'approprier son itinéraire individuel de formation - 1h S7 : Appréhender les modalités pédagogiques proposées et les outils mobilisables, dont les plateformes de formation - 1h - 7 hElément Titre Court : Succès Pack - Accompagnement Vers le Succès - AVS AVS3 - Maîtriser les règles pour une insertion durable : TRE - 11h - Objectif : S'initier aux techniques de recherche d'emploi S1 : Créer son CV par compétences et l'actualiser - 2h S2 : Produire un modèle de lettre de motivation - 2h S3 : Savoir se présenter et argumenter sa candidature - 2h S4 : Utiliser l'emploi store - 2h S5 : Préparer sa visite sur des forums emploi - 2h S6 : Préparer sa visite sur des forums emploi, job dating, café métiers,... - 1h - 11 hElément Titre Court : Succès Pack - Accompagnement Vers le Succès - AVS AVS4 - Participer à un projet collectif simple, développement des softs skills et transitions - 14h - S1 : Participer à un projet collectif contextualisé au métier S2 : Développer et reconnaître ses soft skills S3 : Se sensibiliser aux transitions numériques et écologiques.", "lien_source": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-07_2585152F_776575S.html", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--07_14262", "modes_accueil": ["en-presentiel"], "score_qualite": 0.8499999999999999, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Le dispositif s adresse a toutes les personnes dont l appropriation de la langue francaise est insuffisante pour s inserer dans l emploi.\nAction ouverte a un public age de plus de 16 ans, sorti du systeme scolaire et residant prioritairement en Region Centre-Val de Loire et qui a une reelle motivation pour engager un parcours de formation.", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["18", "28", "36", "37", "41", "45"], "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": "Cette formation s adresse a tout public allophone dont l appropriation de la langue francaise est insuffisante pour s inserer en emploi et qui est en recherche d emploi et engage dans une dynamique d insertion ou de reconversion professionn[...]", "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$7158ab99-564c-4457-8ae1-3a19a7aa1d2f$seed$, $seed$75dcf5dd-ec18-4149-b2bf-aed755fd2f92$seed$, 1, $seed$DI$seed$, $seed$compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$5676e468-63f0-4944-958b-ece04393803b$seed$, $seed$2026-02-16 09:55:49.692879+00$seed$, $seed$2026-02-16 09:55:49.692879+00$seed$, $seed$---
id: carif-oref--07_763179S
nom: Du FLE (Français langue étrangère) à l'emploi
type: formation
extra:
  action:
    session:
      - "@ref": "182375"
        "@numero": 763179S
        periode:
          fin: "20261231"
          debut: "20250101"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            pays: FR
            ligne:
              - 12 place de Juranville
            ville: BOURGES
            codepostal: "18000"
            departement: "18"
            denomination: Le relais 18
            geolocalisation:
              latitude: "47.082194"
              longitude: "2.3892692"
            code-INSEE-commune: "18033"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: 4 a 12 hebdomadaire
    info-public-vise: null
    nombre-heures-total: null
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "3"
                "@info": code-perimetre-recrutement
              - $: Action socio-linguistique (ASL)
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 1 Allée Napoléon III
commune: Bourges
publics:
  - personnes-exilees
courriel: contact@lerelais18.fr
date_maj: 2026-01-20
latitude: 47.074363
longitude: 2.419547
telephone: "+33248656703"
code_insee: "18033"
code_postal: "18000"
description: >-
  ### Objectif de la formation


  La formation FLE a pour objectifs de permettre aux stagiaires : - De
  comprendre et s'exprimer oralement dans des situations diverses de la vie
  courante et dans un contexte professionnel - D'acquérir des bases
  linguistiques pour faciliter le passage à l'écrit - D'acquérir ou renforcer
  des compétences linguistiques attendues en entreprise pour réussir son projet
  professionnel par l'accès à l'emploi et/ou à la qualification - De découvrir
  un environnement professionnel et comprendre les codes de l'entreprise.


  ### Contenu de la formation


  Non renseigné
lien_source: https://www.intercariforef.org/formations/formations-intitule-formation/formation-07_25105315F_763179S.html
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
structure_id: carif-oref--07_00297P
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: >-
  
  	Un entretien de positionnement a l arrivee. Orientation en fonction du niveau (debutants, intermediaires ou avances)
  	Prerequis en fonction du niveau d entree souhaite et du niveau d atteinte vise
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "18"
  - "28"
  - "36"
  - "37"
  - "41"
  - "45"
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--07_00297P
  nom: Association le relais
  siret: "33361188700097"
  source: carif-oref
  adresse: 12 Place Juranville
  commune: Bourges
  courriel: null
  date_maj: 2026-01-20
  doublons:
    - id: dora--cd57ecd7-0228-4aa0-864b-904725d0b78f
      source: dora
    - id: emplois-de-linclusion--16cec7d4-b1a1-4f5a-ab30-ceb91d64b49f
      source: emplois-de-linclusion
    - id: emplois-de-linclusion--3c68ab30-821c-43f2-ae75-428156c8dd68
      source: emplois-de-linclusion
    - id: emplois-de-linclusion--fde975f1-5000-42d4-8f40-9a20e85404cd
      source: emplois-de-linclusion
  latitude: 47.083377
  site_web: null
  longitude: 2.388358
  telephone: null
  code_insee: "18033"
  code_postal: "18000"
  description: null
  lien_source: https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-07_00297P.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  accessibilite_lieu: null
  complement_adresse: null
---

# Du FLE (Français langue étrangère) à l'emploi

### Objectif de la formation

La formation FLE a pour objectifs de permettre aux stagiaires : - De comprendre et s'exprimer oralement dans des situations diverses de la vie courante et dans un contexte professionnel - D'acquérir des bases linguistiques pour faciliter le passage à l'écrit - D'acquérir ou renforcer des compétences linguistiques attendues en entreprise pour réussir son projet professionnel par l'accès à l'emploi et/ou à la qualification - De découvrir un environnement professionnel et comprendre les codes de l'entreprise.

### Contenu de la formation

Non renseigné

## Conditions d'accès

Un entretien de positionnement a l arrivee. Orientation en fonction du niveau (debutants, intermediaires ou avances)
	Prerequis en fonction du niveau d entree souhaite et du niveau d atteinte vise$seed$, $seed${"id": "carif-oref--07_763179S", "nom": "Du FLE (Français langue étrangère) à l'emploi", "type": "formation", "extra": {"action": {"session": [{"@ref": "182375", "@numero": "763179S", "periode": {"fin": "20261231", "debut": "20250101"}, "etat-recrutement": "1", "adresse-inscription": {"adresse": {"pays": "FR", "ligne": ["12 place de Juranville"], "ville": "BOURGES", "codepostal": "18000", "departement": "18", "denomination": "Le relais 18", "geolocalisation": {"latitude": "47.082194", "longitude": "2.3892692"}, "code-INSEE-commune": "18033"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": "4 a 12 hebdomadaire", "info-public-vise": null, "nombre-heures-total": null, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "Action socio-linguistique (ASL)", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "1 Allée Napoléon III", "commune": "Bourges", "publics": ["personnes-exilees"], "courriel": "contact@lerelais18.fr", "date_maj": "2026-01-20", "latitude": 47.074363, "longitude": 2.419547, "structure": {"id": "carif-oref--07_00297P", "nom": "Association le relais", "siret": "33361188700097", "source": "carif-oref", "adresse": "12 Place Juranville", "commune": "Bourges", "courriel": null, "date_maj": "2026-01-20", "doublons": [{"id": "dora--cd57ecd7-0228-4aa0-864b-904725d0b78f", "source": "dora"}, {"id": "emplois-de-linclusion--16cec7d4-b1a1-4f5a-ab30-ceb91d64b49f", "source": "emplois-de-linclusion"}, {"id": "emplois-de-linclusion--3c68ab30-821c-43f2-ae75-428156c8dd68", "source": "emplois-de-linclusion"}, {"id": "emplois-de-linclusion--fde975f1-5000-42d4-8f40-9a20e85404cd", "source": "emplois-de-linclusion"}], "latitude": 47.083377, "site_web": null, "longitude": 2.388358, "telephone": null, "code_insee": "18033", "code_postal": "18000", "description": null, "lien_source": "https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-07_00297P.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33248656703", "code_insee": "18033", "code_postal": "18000", "description": "### Objectif de la formation\n\nLa formation FLE a pour objectifs de permettre aux stagiaires : - De comprendre et s'exprimer oralement dans des situations diverses de la vie courante et dans un contexte professionnel - D'acquérir des bases linguistiques pour faciliter le passage à l'écrit - D'acquérir ou renforcer des compétences linguistiques attendues en entreprise pour réussir son projet professionnel par l'accès à l'emploi et/ou à la qualification - De découvrir un environnement professionnel et comprendre les codes de l'entreprise.\n\n### Contenu de la formation\n\nNon renseigné", "lien_source": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-07_25105315F_763179S.html", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--07_00297P", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "\n\tUn entretien de positionnement a l arrivee. Orientation en fonction du niveau (debutants, intermediaires ou avances)\n\tPrerequis en fonction du niveau d entree souhaite et du niveau d atteinte vise", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["18", "28", "36", "37", "41", "45"], "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$02e9e9ae-e08c-4943-b1cb-87145d08e23a$seed$, $seed$53685853-af44-41d0-8193-212b172bdac7$seed$, 1, $seed$DI$seed$, $seed$compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$647c3976-8243-423b-98a2-61151a56994f$seed$, $seed$2026-02-16 09:55:50.000604+00$seed$, $seed$2026-02-16 09:55:50.000604+00$seed$, $seed$---
id: carif-oref--14_SE_0001116944
nom: Ouvrir l'école aux parents pour la réussite des enfants - OEPRE
type: formation
extra:
  action:
    session:
      - "@ref": "265940"
        "@numero": SE_0001116944
        periode:
          fin: "20260131"
          debut: "20240901"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            pays: FR
            ligne:
              - College la mare aux saules
              - 14 Rue du Moulin a Vent
            ville: Coignières
            codepostal: "78310"
            departement: "78"
            denomination: Collège la mare aux saules
            geolocalisation:
              latitude: "48.753928"
              longitude: "1.924428"
            code-INSEE-commune: "78168"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 120
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "3"
                "@info": code-perimetre-recrutement
              - $: Ouvrir l'école aux parents pour la réussite des enfants (OEPRE) 2024-2025
                "@info": programme-financeur
        code-financeur: "12"
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "3"
                "@info": code-perimetre-recrutement
              - $: Ouvrir l'école aux parents pour la réussite des enfants (OEPRE) 2024-2025
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 14 Rue du Moulin à Vent
commune: Coignières
publics:
  - personnes-exilees
courriel: 0781511u@ac-versailles.fr
date_maj: 2025-03-21
latitude: 48.754055
longitude: 1.923561
telephone: "+33130050060"
code_insee: "78168"
code_postal: "78310"
description: >-
  ### Objectif de la formation


  Favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou
  étrangers hors Union européenne, volontaires, en les impliquant notamment dans
  la scolarité de leur enfant.


  ### Contenu de la formation


  Les formations portent sur trois axes d'apprentissage : - l'acquisition du
  français (comprendre, parler, lire et écrire) ; - la connaissance des valeurs
  de la République et leur mise en oeuvre dans la société française ; - la
  connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves
  et des parents. Cette formation est assurée par des enseignants en Français
  Langue Seconde, des enseignants des UPE2A, ou des membres d'associations
  diplômés en FLE-FLS.
lien_source: https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000178861_SE_0001116944.html
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
structure_id: carif-oref--14_OF_0000017294
modes_accueil:
  - en-presentiel
score_qualite: 0.8699999999999999
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Aucun
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "75"
  - "77"
  - "78"
  - "91"
  - "92"
  - "93"
  - "94"
  - "95"
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: 3
structure:
  id: carif-oref--14_OF_0000017294
  nom: Collège la mare aux saules
  siret: "19781511100012"
  source: carif-oref
  adresse: 14 Rue du Moulin à Vent
  commune: Coignières
  courriel: null
  date_maj: 2026-02-03
  doublons: []
  latitude: 48.754055
  site_web: null
  longitude: 1.923561
  telephone: null
  code_insee: "78168"
  code_postal: "78310"
  description: null
  lien_source: https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-14_OF_0000017294.html
  score_qualite: 0.88
  horaires_accueil: null
  reseaux_porteurs: null
  accessibilite_lieu: null
  complement_adresse: null
---

# Ouvrir l'école aux parents pour la réussite des enfants - OEPRE

### Objectif de la formation

Favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage : - l'acquisition du français (comprendre, parler, lire et écrire) ; - la connaissance des valeurs de la République et leur mise en oeuvre dans la société française ; - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents. Cette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS.

## Conditions d'accès

Aucun$seed$, $seed${"id": "carif-oref--14_SE_0001116944", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "type": "formation", "extra": {"action": {"session": [{"@ref": "265940", "@numero": "SE_0001116944", "periode": {"fin": "20260131", "debut": "20240901"}, "etat-recrutement": "1", "adresse-inscription": {"adresse": {"pays": "FR", "ligne": ["College la mare aux saules", "14 Rue du Moulin a Vent"], "ville": "Coignières", "codepostal": "78310", "departement": "78", "denomination": "Collège la mare aux saules", "geolocalisation": {"latitude": "48.753928", "longitude": "1.924428"}, "code-INSEE-commune": "78168"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "Ouvrir l'école aux parents pour la réussite des enfants (OEPRE) 2024-2025", "@info": "programme-financeur"}]}], "code-financeur": "12"}, {"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "Ouvrir l'école aux parents pour la réussite des enfants (OEPRE) 2024-2025", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "14 Rue du Moulin à Vent", "commune": "Coignières", "publics": ["personnes-exilees"], "courriel": "0781511u@ac-versailles.fr", "date_maj": "2025-03-21", "latitude": 48.754055, "longitude": 1.923561, "structure": {"id": "carif-oref--14_OF_0000017294", "nom": "Collège la mare aux saules", "siret": "19781511100012", "source": "carif-oref", "adresse": "14 Rue du Moulin à Vent", "commune": "Coignières", "courriel": null, "date_maj": "2026-02-03", "doublons": [], "latitude": 48.754055, "site_web": null, "longitude": 1.923561, "telephone": null, "code_insee": "78168", "code_postal": "78310", "description": null, "lien_source": "https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-14_OF_0000017294.html", "score_qualite": 0.88, "horaires_accueil": null, "reseaux_porteurs": null, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33130050060", "code_insee": "78168", "code_postal": "78310", "description": "### Objectif de la formation\n\nFavoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage : - l'acquisition du français (comprendre, parler, lire et écrire) ; - la connaissance des valeurs de la République et leur mise en oeuvre dans la société française ; - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents. Cette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS.", "lien_source": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000178861_SE_0001116944.html", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--14_OF_0000017294", "modes_accueil": ["en-presentiel"], "score_qualite": 0.8699999999999999, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Aucun", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["75", "77", "78", "91", "92", "93", "94", "95"], "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": 3}$seed$, NULL, NULL, $seed$dd407c50-92e1-48cb-9565-5683665583a7$seed$, $seed$9e95054a-6c0a-42cf-95f9-314562755f9c$seed$, 1, $seed$DI$seed$, $seed$non_compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$2598d2a2-6421-4de4-b7e3-4af4500ca8d4$seed$, $seed$2026-02-16 09:55:50.000604+00$seed$, $seed$2026-02-16 09:55:50.000604+00$seed$, $seed$---
id: carif-oref--14_SE_0001116947
nom: Ouvrir l'école aux parents pour la réussite des enfants - OEPRE
type: formation
extra:
  action:
    session:
      - "@ref": "265941"
        "@numero": SE_0001116947
        periode:
          fin: "20260131"
          debut: "20240901"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            pays: FR
            ligne:
              - College Jules Verne
              - Rue Albert Thomas
            ville: Les Mureaux
            codepostal: "78130"
            departement: "78"
            denomination: Collège Jules Verne
            geolocalisation:
              latitude: "48.979766"
              longitude: "1.921576"
            code-INSEE-commune: "78440"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 120
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "3"
                "@info": code-perimetre-recrutement
              - $: Ouvrir l'école aux parents pour la réussite des enfants (OEPRE) 2024-2025
                "@info": programme-financeur
        code-financeur: "12"
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "3"
                "@info": code-perimetre-recrutement
              - $: Ouvrir l'école aux parents pour la réussite des enfants (OEPRE) 2024-2025
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: Rue Albert Thomas
commune: Les Mureaux
publics:
  - personnes-exilees
courriel: ce.0780180x@ac-versailles.fr
date_maj: 2025-03-21
latitude: 48.982753
longitude: 1.922887
telephone: "+33134741945"
code_insee: "78440"
code_postal: "78130"
description: >-
  ### Objectif de la formation


  Favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou
  étrangers hors Union européenne, volontaires, en les impliquant notamment dans
  la scolarité de leur enfant.


  ### Contenu de la formation


  Les formations portent sur trois axes d'apprentissage : - l'acquisition du
  français (comprendre, parler, lire et écrire) ; - la connaissance des valeurs
  de la République et leur mise en oeuvre dans la société française ; - la
  connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves
  et des parents. Cette formation est assurée par des enseignants en Français
  Langue Seconde, des enseignants des UPE2A, ou des membres d'associations
  diplômés en FLE-FLS.
lien_source: https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000178863_SE_0001116947.html
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
structure_id: carif-oref--14_OF_0000016454
modes_accueil:
  - en-presentiel
score_qualite: 0.8699999999999999
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Aucun
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "75"
  - "77"
  - "78"
  - "91"
  - "92"
  - "93"
  - "94"
  - "95"
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: 3
structure:
  id: carif-oref--14_OF_0000016454
  nom: Collège Jules Verne
  siret: "19780180600013"
  source: carif-oref
  adresse: Rue Albert Thomas
  commune: Les Mureaux
  courriel: null
  date_maj: 2026-02-03
  doublons: []
  latitude: 48.982753
  site_web: null
  longitude: 1.922887
  telephone: null
  code_insee: "78440"
  code_postal: "78130"
  description: null
  lien_source: https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-14_OF_0000016454.html
  score_qualite: 0.88
  horaires_accueil: null
  reseaux_porteurs: null
  accessibilite_lieu: null
  complement_adresse: null
---

# Ouvrir l'école aux parents pour la réussite des enfants - OEPRE

### Objectif de la formation

Favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage : - l'acquisition du français (comprendre, parler, lire et écrire) ; - la connaissance des valeurs de la République et leur mise en oeuvre dans la société française ; - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents. Cette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS.

## Conditions d'accès

Aucun$seed$, $seed${"id": "carif-oref--14_SE_0001116947", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "type": "formation", "extra": {"action": {"session": [{"@ref": "265941", "@numero": "SE_0001116947", "periode": {"fin": "20260131", "debut": "20240901"}, "etat-recrutement": "1", "adresse-inscription": {"adresse": {"pays": "FR", "ligne": ["College Jules Verne", "Rue Albert Thomas"], "ville": "Les Mureaux", "codepostal": "78130", "departement": "78", "denomination": "Collège Jules Verne", "geolocalisation": {"latitude": "48.979766", "longitude": "1.921576"}, "code-INSEE-commune": "78440"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "Ouvrir l'école aux parents pour la réussite des enfants (OEPRE) 2024-2025", "@info": "programme-financeur"}]}], "code-financeur": "12"}, {"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "Ouvrir l'école aux parents pour la réussite des enfants (OEPRE) 2024-2025", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "Rue Albert Thomas", "commune": "Les Mureaux", "publics": ["personnes-exilees"], "courriel": "ce.0780180x@ac-versailles.fr", "date_maj": "2025-03-21", "latitude": 48.982753, "longitude": 1.922887, "structure": {"id": "carif-oref--14_OF_0000016454", "nom": "Collège Jules Verne", "siret": "19780180600013", "source": "carif-oref", "adresse": "Rue Albert Thomas", "commune": "Les Mureaux", "courriel": null, "date_maj": "2026-02-03", "doublons": [], "latitude": 48.982753, "site_web": null, "longitude": 1.922887, "telephone": null, "code_insee": "78440", "code_postal": "78130", "description": null, "lien_source": "https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-14_OF_0000016454.html", "score_qualite": 0.88, "horaires_accueil": null, "reseaux_porteurs": null, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33134741945", "code_insee": "78440", "code_postal": "78130", "description": "### Objectif de la formation\n\nFavoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage : - l'acquisition du français (comprendre, parler, lire et écrire) ; - la connaissance des valeurs de la République et leur mise en oeuvre dans la société française ; - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents. Cette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS.", "lien_source": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000178863_SE_0001116947.html", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--14_OF_0000016454", "modes_accueil": ["en-presentiel"], "score_qualite": 0.8699999999999999, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Aucun", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["75", "77", "78", "91", "92", "93", "94", "95"], "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": 3}$seed$, NULL, NULL, $seed$ab0e6e9a-3ed2-4ce8-8029-9226a69cd11b$seed$, $seed$d0f12be5-0cbc-4a90-9bb2-a64b26d11929$seed$, 1, $seed$DI$seed$, $seed$non_compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$fb5fc33c-00eb-478b-8889-f975edfb1624$seed$, $seed$2026-02-16 09:55:50.773099+00$seed$, $seed$2026-02-16 09:55:50.773099+00$seed$, $seed$---
id: carif-oref--14_SE_0001611012
nom: Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers
  sociolinguistiques et Compétences Pro
type: formation
extra:
  action:
    session:
      - "@ref": "282093"
        "@numero": SE_0001611012
        periode:
          fin: "20260626"
          debut: "20250929"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: Contact
              prenom: Centre social et culturel
              telfixe:
                numtel:
                  - "0160285101"
              courriel: cscpontault@gmail.com
            type-contact: "0"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            pays: FR
            ligne:
              - Centre social et culturel
              - 3 Rue de l Orme au Charron
            ville: Pontault-Combault
            codepostal: "77340"
            departement: "77"
            denomination: Centre social et culturel
            geolocalisation:
              latitude: "48.800217"
              longitude: "2.609679"
            code-INSEE-commune: "77373"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 120
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "81042"
                "@ref": V14
                "@info": code-public-vise
              - $: "3"
                "@info": code-perimetre-recrutement
              - $: Actions socio-linguistiques (ASL) complémentaires du CIR 77 - 2025-2026
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 3 Rue de l'Orme au Charron
commune: Pontault-Combault
publics:
  - personnes-exilees
courriel: cscpontault@gmail.com
date_maj: 2025-12-09
latitude: 48.800217
longitude: 2.609679
telephone: "+33160285101"
code_insee: "77373"
code_postal: "77340"
description: >-
  ### Objectif de la formation


  Ce sont des formations de proximité qui visent à rendre autonomes les «
  apprenants » dans les différents espaces sociaux c'est-à-dire les différents
  lieux ou institutions de la vie courante (centres sociaux, médiathèque, CAF,
  CPAM, centre hospitalier, écoles, …).

  L'apprentissage de la langue française est toujours contextualisé dans le
  respect des valeurs de la République. Les ASL concourent à cette démarche
  spécifique de développement de programmes destinés à favoriser l'intégration
  sociale, l'accès à l'emploi, l'accès aux droits, l'accès à la culture…

  1. Permettre l'autonomie linguistique des primo-arrivants par l'apprentissage
  du français jusqu'au niveau A2

  2. Favoriser l'insertion professionnelle par l'acquisition de compétences
  linguistiques à visée professionnelle

  3. Lutter contre l'isolement et favoriser la prise ou la reprise de confiance
  en soi

  4. Développer l'accessibilité aux droits notamment par l'apprentissage du
  numérique

  5. Impliquer les participants dans la vie du centre et dans la vie locale pour
  faciliter le développement d'une citoyenneté active


  ### Contenu de la formation


  Notre projet s'inscrit dans l'axe de l'apprentissage linguistique mais avec
  une dimension civique intégrée qui en fait sa spécificité.

  Notre approche d'apprentissage :

  Chaque module de notre programme raconte une histoire : celle d'hommes et de
  femmes qui, partis de leur pays d'origine avec leurs rêves et leurs
  compétences, construisent pas à pas leur nouvelle vie en France. Le français
  devient alors non pas une matière scolaire, mais l'outil de leur émancipation,
  le moyen de faire entendre leur voix, de défendre leurs droits, d'accompagner
  leurs enfants dans leur scolarité… d'élaborer un avenir.

  Contenu plus étayé et plu personnalisé pour répondre aux nouvelles exigences
  du passage a terme du niveau A2 obligatoire et de l'examen civique.
lien_source: https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000242984_SE_0001611012.html
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
structure_id: carif-oref--14_OF_0000014841
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Aucun
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "75"
  - "77"
  - "78"
  - "91"
  - "92"
  - "93"
  - "94"
  - "95"
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: 4
structure:
  id: carif-oref--14_OF_0000014841
  nom: Association animation centre social
  siret: "31170235100017"
  source: carif-oref
  adresse: 3 Rue de l'Orme au Charron
  commune: Pontault-Combault
  courriel: null
  date_maj: 2025-12-09
  doublons:
    - id: mediation-numerique--Coop-numérique_30203fcf-4093-4dbf-94c3-2639d16ab9a8
      source: mediation-numerique
  latitude: 48.800217
  site_web: null
  longitude: 2.609679
  telephone: null
  code_insee: "77373"
  code_postal: "77340"
  description: null
  lien_source: https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-14_OF_0000014841.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  accessibilite_lieu: null
  complement_adresse: null
---

# Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers sociolinguistiques et Compétences Pro

### Objectif de la formation

Ce sont des formations de proximité qui visent à rendre autonomes les « apprenants » dans les différents espaces sociaux c'est-à-dire les différents lieux ou institutions de la vie courante (centres sociaux, médiathèque, CAF, CPAM, centre hospitalier, écoles, …).
L'apprentissage de la langue française est toujours contextualisé dans le respect des valeurs de la République. Les ASL concourent à cette démarche spécifique de développement de programmes destinés à favoriser l'intégration sociale, l'accès à l'emploi, l'accès aux droits, l'accès à la culture…
1. Permettre l'autonomie linguistique des primo-arrivants par l'apprentissage du français jusqu'au niveau A2
2. Favoriser l'insertion professionnelle par l'acquisition de compétences linguistiques à visée professionnelle
3. Lutter contre l'isolement et favoriser la prise ou la reprise de confiance en soi
4. Développer l'accessibilité aux droits notamment par l'apprentissage du numérique
5. Impliquer les participants dans la vie du centre et dans la vie locale pour faciliter le développement d'une citoyenneté active

### Contenu de la formation

Notre projet s'inscrit dans l'axe de l'apprentissage linguistique mais avec une dimension civique intégrée qui en fait sa spécificité.
Notre approche d'apprentissage :
Chaque module de notre programme raconte une histoire : celle d'hommes et de femmes qui, partis de leur pays d'origine avec leurs rêves et leurs compétences, construisent pas à pas leur nouvelle vie en France. Le français devient alors non pas une matière scolaire, mais l'outil de leur émancipation, le moyen de faire entendre leur voix, de défendre leurs droits, d'accompagner leurs enfants dans leur scolarité… d'élaborer un avenir.
Contenu plus étayé et plu personnalisé pour répondre aux nouvelles exigences du passage a terme du niveau A2 obligatoire et de l'examen civique.

## Conditions d'accès

Aucun$seed$, $seed${"id": "carif-oref--14_SE_0001611012", "nom": "Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers sociolinguistiques et Compétences Pro", "type": "formation", "extra": {"action": {"session": [{"@ref": "282093", "@numero": "SE_0001611012", "periode": {"fin": "20260626", "debut": "20250929"}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "Contact", "prenom": "Centre social et culturel", "telfixe": {"numtel": ["0160285101"]}, "courriel": "cscpontault@gmail.com"}, "type-contact": "0"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"pays": "FR", "ligne": ["Centre social et culturel", "3 Rue de l Orme au Charron"], "ville": "Pontault-Combault", "codepostal": "77340", "departement": "77", "denomination": "Centre social et culturel", "geolocalisation": {"latitude": "48.800217", "longitude": "2.609679"}, "code-INSEE-commune": "77373"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81042", "@ref": "V14", "@info": "code-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "Actions socio-linguistiques (ASL) complémentaires du CIR 77 - 2025-2026", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "3 Rue de l'Orme au Charron", "commune": "Pontault-Combault", "publics": ["personnes-exilees"], "courriel": "cscpontault@gmail.com", "date_maj": "2025-12-09", "latitude": 48.800217, "longitude": 2.609679, "structure": {"id": "carif-oref--14_OF_0000014841", "nom": "Association animation centre social", "siret": "31170235100017", "source": "carif-oref", "adresse": "3 Rue de l'Orme au Charron", "commune": "Pontault-Combault", "courriel": null, "date_maj": "2025-12-09", "doublons": [{"id": "mediation-numerique--Coop-numérique_30203fcf-4093-4dbf-94c3-2639d16ab9a8", "source": "mediation-numerique"}], "latitude": 48.800217, "site_web": null, "longitude": 2.609679, "telephone": null, "code_insee": "77373", "code_postal": "77340", "description": null, "lien_source": "https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-14_OF_0000014841.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33160285101", "code_insee": "77373", "code_postal": "77340", "description": "### Objectif de la formation\n\nCe sont des formations de proximité qui visent à rendre autonomes les « apprenants » dans les différents espaces sociaux c'est-à-dire les différents lieux ou institutions de la vie courante (centres sociaux, médiathèque, CAF, CPAM, centre hospitalier, écoles, …).\nL'apprentissage de la langue française est toujours contextualisé dans le respect des valeurs de la République. Les ASL concourent à cette démarche spécifique de développement de programmes destinés à favoriser l'intégration sociale, l'accès à l'emploi, l'accès aux droits, l'accès à la culture…\n1. Permettre l'autonomie linguistique des primo-arrivants par l'apprentissage du français jusqu'au niveau A2\n2. Favoriser l'insertion professionnelle par l'acquisition de compétences linguistiques à visée professionnelle\n3. Lutter contre l'isolement et favoriser la prise ou la reprise de confiance en soi\n4. Développer l'accessibilité aux droits notamment par l'apprentissage du numérique\n5. Impliquer les participants dans la vie du centre et dans la vie locale pour faciliter le développement d'une citoyenneté active\n\n### Contenu de la formation\n\nNotre projet s'inscrit dans l'axe de l'apprentissage linguistique mais avec une dimension civique intégrée qui en fait sa spécificité.\nNotre approche d'apprentissage :\nChaque module de notre programme raconte une histoire : celle d'hommes et de femmes qui, partis de leur pays d'origine avec leurs rêves et leurs compétences, construisent pas à pas leur nouvelle vie en France. Le français devient alors non pas une matière scolaire, mais l'outil de leur émancipation, le moyen de faire entendre leur voix, de défendre leurs droits, d'accompagner leurs enfants dans leur scolarité… d'élaborer un avenir.\nContenu plus étayé et plu personnalisé pour répondre aux nouvelles exigences du passage a terme du niveau A2 obligatoire et de l'examen civique.", "lien_source": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000242984_SE_0001611012.html", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--14_OF_0000014841", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Aucun", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["75", "77", "78", "91", "92", "93", "94", "95"], "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": 4}$seed$, NULL, NULL, $seed$6155cec5-09cb-4fa9-8e4b-e3973052afff$seed$, $seed$85dfded3-08df-4138-b242-bb868b8b6dbd$seed$, 1, $seed$DI$seed$, $seed$compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$131769a1-f80d-457d-80e4-58a0a57df15e$seed$, $seed$2026-02-16 09:55:51.078406+00$seed$, $seed$2026-02-16 09:55:51.078406+00$seed$, $seed$---
id: carif-oref--14_SE_0001597312
nom: Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers
  linguistiques du soir
type: formation
extra:
  action:
    session:
      - "@ref": "281750"
        "@numero": SE_0001597312
        periode:
          fin: "20261231"
          debut: "20261105"
        url-session:
          urlweb:
            - https://ifdevformations.fr/
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: Atigui
              prenom: Aicha
              courriel: a.atigui@ifdev.fr
            type-contact: "0"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            pays: FR
            ligne:
              - Ifdev
              - 44 Boulevard Georges Clemenceau
            ville: Mantes-la-Jolie
            codepostal: "78200"
            departement: "78"
            denomination: Ifdev
            geolocalisation:
              latitude: "48.99789"
              longitude: "1.687963"
            code-INSEE-commune: "78361"
        periode-inscription:
          periode:
            fin: "20261030"
            debut: "20260105"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: 2 ateliers de 2h chacun
    info-public-vise: Salaries primo arrivants avec contrat de travail Femmes primo
      arrivantes ayant des problemes de garde d enfant qui ne leur permettent
      pas de suivre les cours en journee.
    nombre-heures-total: 320
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "81042"
                "@ref": V14
                "@info": code-public-vise
              - $: "Salariés primo arrivants avec contrat de travail\r

                  Femmes primo arrivantes ayant des problèmes de garde d'enfant
                  qui ne leur permettent pas de suivre les cours en journée."
                "@info": info-public-vise
              - $: "3"
                "@info": code-perimetre-recrutement
              - $: Actions socio-linguistiques (ASL) complémentaires du CIR 78 - 2025-26
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "12"
frais: null
source: carif-oref
adresse: 44 Boulevard Georges Clémenceau
commune: Mantes-la-Jolie
publics:
  - personnes-exilees
courriel: a.atigui@ifdev.org
date_maj: 2026-01-22
latitude: 48.99789
longitude: 1.687963
telephone: "+33130946383"
code_insee: "78361"
code_postal: "78200"
description: >-
  ### Objectif de la formation


  Accéder à l'emploi ou préparer une réorientation professionnelle

  Utiliser l'informatique

  Préparer un diplôme ou une certification de langue française [DILF, DELF A1,
  DELF A2 ou DELF B1 selon le niveau du bénéficiaire]

  Devenir autonome au quotidien [Apprentissage de la langue française dans ses
  volets vie pratique / vie publique / vie professionnelle, en vue d'un accès à
  l'autonomie]

  Se former aux questions civiques et de citoyenneté

  Niveau de langue et de compétences visé par la formation :

  CECRL : A1, A2, B1


  ### Contenu de la formation


  Cette action vise l'accompagnement dans l'apprentissage de la langue des
  salariés et des mères de famille non disponibles en journée. Elle prend en
  compte les besoins de formation linguistique des demandeurs en vue de lever
  les freins à l'emploi et à la formation mais aussi acquérir l'autonomie dans
  ses démarches administratives. Elle permet à chaque demandeur de formation de
  réaliser un parcours cohérent tenant compte du rythme, de l'individualisation,
  de son profil et de son projet professionnel. L'apprentissage du français
  permet de lever un frein à l'emploi et à l'insertion dans la société.

  Il s'agit aussi de permettre aux personnes d'avoir le niveau A2 pour la carte
  de résidents de 10 ans ou le B1 pour la naturalisation française. Les
  bénéficiaires sont préparés au TCF, DELF A1, A2 et B1.
lien_source: https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000241678_SE_0001597312.html
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
structure_id: carif-oref--14_OF_0000012792
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: |-
  Competences linguistiques a l entree en formation :
  CECRL :
  Oral : A1.1, A1
  Ecrit : A1.1, A1
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "75"
  - "77"
  - "78"
  - "91"
  - "92"
  - "93"
  - "94"
  - "95"
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: Salaries primo arrivants avec contrat de travail Femmes
  primo arrivantes ayant des problemes de garde d enfant qui ne leur permettent
  pas de suivre les cours en journee.
mobilisation_precisions: null
volume_horaire_hebdomadaire: 4
structure:
  id: carif-oref--14_OF_0000012792
  nom: Institut de formation et de développement
  siret: "80927292500029"
  source: carif-oref
  adresse: 44 Boulevard Georges Clémenceau
  commune: Mantes-la-Jolie
  courriel: null
  date_maj: 2026-01-22
  doublons:
    - id: dora--9f552361-77c1-483d-b6bb-24b0276ed0c9
      source: dora
  latitude: 48.99789
  site_web: null
  longitude: 1.687963
  telephone: null
  code_insee: "78361"
  code_postal: "78200"
  description: null
  lien_source: https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-14_OF_0000012792.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  accessibilite_lieu: null
  complement_adresse: null
---

# Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers linguistiques du soir

### Objectif de la formation

Accéder à l'emploi ou préparer une réorientation professionnelle
Utiliser l'informatique
Préparer un diplôme ou une certification de langue française [DILF, DELF A1, DELF A2 ou DELF B1 selon le niveau du bénéficiaire]
Devenir autonome au quotidien [Apprentissage de la langue française dans ses volets vie pratique / vie publique / vie professionnelle, en vue d'un accès à l'autonomie]
Se former aux questions civiques et de citoyenneté
Niveau de langue et de compétences visé par la formation :
CECRL : A1, A2, B1

### Contenu de la formation

Cette action vise l'accompagnement dans l'apprentissage de la langue des salariés et des mères de famille non disponibles en journée. Elle prend en compte les besoins de formation linguistique des demandeurs en vue de lever les freins à l'emploi et à la formation mais aussi acquérir l'autonomie dans ses démarches administratives. Elle permet à chaque demandeur de formation de réaliser un parcours cohérent tenant compte du rythme, de l'individualisation, de son profil et de son projet professionnel. L'apprentissage du français permet de lever un frein à l'emploi et à l'insertion dans la société.
Il s'agit aussi de permettre aux personnes d'avoir le niveau A2 pour la carte de résidents de 10 ans ou le B1 pour la naturalisation française. Les bénéficiaires sont préparés au TCF, DELF A1, A2 et B1.

## Conditions d'accès

Competences linguistiques a l entree en formation :
CECRL :
Oral : A1.1, A1
Ecrit : A1.1, A1$seed$, $seed${"id": "carif-oref--14_SE_0001597312", "nom": "Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers linguistiques du soir", "type": "formation", "extra": {"action": {"session": [{"@ref": "281750", "@numero": "SE_0001597312", "periode": {"fin": "20261231", "debut": "20261105"}, "url-session": {"urlweb": ["https://ifdevformations.fr/"]}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "Atigui", "prenom": "Aicha", "courriel": "a.atigui@ifdev.fr"}, "type-contact": "0"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"pays": "FR", "ligne": ["Ifdev", "44 Boulevard Georges Clemenceau"], "ville": "Mantes-la-Jolie", "codepostal": "78200", "departement": "78", "denomination": "Ifdev", "geolocalisation": {"latitude": "48.99789", "longitude": "1.687963"}, "code-INSEE-commune": "78361"}}, "periode-inscription": {"periode": {"fin": "20261030", "debut": "20260105"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": "2 ateliers de 2h chacun", "info-public-vise": "Salaries primo arrivants avec contrat de travail Femmes primo arrivantes ayant des problemes de garde d enfant qui ne leur permettent pas de suivre les cours en journee.", "nombre-heures-total": 320, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81042", "@ref": "V14", "@info": "code-public-vise"}, {"$": "Salariés primo arrivants avec contrat de travail\r\nFemmes primo arrivantes ayant des problèmes de garde d'enfant qui ne leur permettent pas de suivre les cours en journée.", "@info": "info-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "Actions socio-linguistiques (ASL) complémentaires du CIR 78 - 2025-26", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "12"}}, "frais": null, "source": "carif-oref", "adresse": "44 Boulevard Georges Clémenceau", "commune": "Mantes-la-Jolie", "publics": ["personnes-exilees"], "courriel": "a.atigui@ifdev.org", "date_maj": "2026-01-22", "latitude": 48.99789, "longitude": 1.687963, "structure": {"id": "carif-oref--14_OF_0000012792", "nom": "Institut de formation et de développement", "siret": "80927292500029", "source": "carif-oref", "adresse": "44 Boulevard Georges Clémenceau", "commune": "Mantes-la-Jolie", "courriel": null, "date_maj": "2026-01-22", "doublons": [{"id": "dora--9f552361-77c1-483d-b6bb-24b0276ed0c9", "source": "dora"}], "latitude": 48.99789, "site_web": null, "longitude": 1.687963, "telephone": null, "code_insee": "78361", "code_postal": "78200", "description": null, "lien_source": "https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-14_OF_0000012792.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33130946383", "code_insee": "78361", "code_postal": "78200", "description": "### Objectif de la formation\n\nAccéder à l'emploi ou préparer une réorientation professionnelle\nUtiliser l'informatique\nPréparer un diplôme ou une certification de langue française [DILF, DELF A1, DELF A2 ou DELF B1 selon le niveau du bénéficiaire]\nDevenir autonome au quotidien [Apprentissage de la langue française dans ses volets vie pratique / vie publique / vie professionnelle, en vue d'un accès à l'autonomie]\nSe former aux questions civiques et de citoyenneté\nNiveau de langue et de compétences visé par la formation :\nCECRL : A1, A2, B1\n\n### Contenu de la formation\n\nCette action vise l'accompagnement dans l'apprentissage de la langue des salariés et des mères de famille non disponibles en journée. Elle prend en compte les besoins de formation linguistique des demandeurs en vue de lever les freins à l'emploi et à la formation mais aussi acquérir l'autonomie dans ses démarches administratives. Elle permet à chaque demandeur de formation de réaliser un parcours cohérent tenant compte du rythme, de l'individualisation, de son profil et de son projet professionnel. L'apprentissage du français permet de lever un frein à l'emploi et à l'insertion dans la société.\nIl s'agit aussi de permettre aux personnes d'avoir le niveau A2 pour la carte de résidents de 10 ans ou le B1 pour la naturalisation française. Les bénéficiaires sont préparés au TCF, DELF A1, A2 et B1.", "lien_source": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000241678_SE_0001597312.html", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--14_OF_0000012792", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Competences linguistiques a l entree en formation :\nCECRL :\nOral : A1.1, A1\nEcrit : A1.1, A1", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["75", "77", "78", "91", "92", "93", "94", "95"], "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": "Salaries primo arrivants avec contrat de travail Femmes primo arrivantes ayant des problemes de garde d enfant qui ne leur permettent pas de suivre les cours en journee.", "mobilisation_precisions": null, "volume_horaire_hebdomadaire": 4}$seed$, NULL, NULL, $seed$cc6ceb12-341c-44f4-91de-468db874f028$seed$, $seed$9941211d-d843-4d04-8dee-b9a3fbf48203$seed$, 1, $seed$DI$seed$, $seed$compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$6c7489e5-de43-4b6a-95b5-9ad6d40cc3db$seed$, $seed$2026-02-16 09:55:51.078406+00$seed$, $seed$2026-03-02 13:29:25.682+00$seed$, $seed$---
id: carif-oref--14_SE_0001608026
nom: "Actions socio-linguistiques complémentaires du CIR (ASL) - LING PRO :
  Parcours Linguistique à visée professionnelle généraliste"
type: formation
extra:
  action:
    session:
      - "@ref": "281975"
        "@numero": SE_0001608026
        periode:
          fin: "20260731"
          debut: "20251001"
        url-session:
          urlweb:
            - https://www.apijasso.org/
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: Contact
              prenom: Association pour l insertion des jeunes
              telfixe:
                numtel:
                  - "0695925301"
              courriel: sophiedanne.apij@gmail.com
            type-contact: "0"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            pays: FR
            ligne:
              - Association pour l insertion des jeunes
              - 5 Place Youri Gagarine
            ville: Saint-Denis
            codepostal: "93200"
            departement: "93"
            denomination: Association pour l'insertion des jeunes
            geolocalisation:
              latitude: "48.931921"
              longitude: "2.382025"
            code-INSEE-commune: "93066"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: + demandeurs d asile
    nombre-heures-total: 110
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "81042"
                "@ref": V14
                "@info": code-public-vise
              - $: + demandeurs d'asile
                "@info": info-public-vise
              - $: "3"
                "@info": code-perimetre-recrutement
              - $: Actions socio-linguistiques (ASL) complémentaires du CIR régional IDF -
                  2025-2026
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 5 Place Youri Gagarine
commune: Saint-Denis
publics:
  - personnes-exilees
courriel: direction.asso.apij@gmail.com
date_maj: 2025-12-08
latitude: 48.931511
longitude: 2.382324
telephone: "+33148297370"
code_insee: "93066"
code_postal: "93200"
description: >-
  ### Objectif de la formation


  Donner à des personnes en difficulté professionnelle en raison de leur
  méconnaissance de la langue française la possibilité de se familiariser avec
  le langage professionnel et spécifique au monde du travail en France.


  ### Contenu de la formation


  La formation sera articulée autour des trois modules :

  Compétences linguistiques de base (Oral / Ecrit), FOS (visée professionnel et
  sociale), citoyenneté, etc.

  Techniques de Recherche d'Emploi : CV, lettre de motivation, recherche
  d'emploi / formation, monde de l'entreprise, marché du travail, etc.

  Module informatique et internet: recherche d'emploi, outils numériques, monde
  contemporain, ressources du territoire, mobilité, etc.

  Elle est complétée par un suivi individualisé et un accompagnement à l'emploi.
lien_source: https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000242613_SE_0001608026.html
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
structure_id: carif-oref--14_OF_0000005723
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: |-
  Competences linguistiques a l entree en formation :
  CECRL :
  Oral : A1.1
  Ecrit : A1.1
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "75"
  - "77"
  - "78"
  - "91"
  - "92"
  - "93"
  - "94"
  - "95"
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: + demandeurs d asile
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--14_OF_0000005723
  nom: Association pour l'insertion des jeunes
  siret: "32618558400074"
  source: carif-oref
  adresse: 5 Place Youri Gagarine
  commune: Saint-Denis
  courriel: null
  date_maj: 2025-12-08
  doublons: []
  latitude: 48.931511
  site_web: null
  longitude: 2.382324
  telephone: "+33950979280"
  code_insee: "93066"
  code_postal: "93200"
  description: null
  lien_source: https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-14_OF_0000005723.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  accessibilite_lieu: null
  complement_adresse: null
---

# Actions socio-linguistiques complémentaires du CIR (ASL) - LING PRO : Parcours Linguistique à visée professionnelle généraliste

### Objectif de la formation

Donner à des personnes en difficulté professionnelle en raison de leur méconnaissance de la langue française la possibilité de se familiariser avec le langage professionnel et spécifique au monde du travail en France.

### Contenu de la formation

La formation sera articulée autour des trois modules :
Compétences linguistiques de base (Oral / Ecrit), FOS (visée professionnel et sociale), citoyenneté, etc.
Techniques de Recherche d'Emploi : CV, lettre de motivation, recherche d'emploi / formation, monde de l'entreprise, marché du travail, etc.
Module informatique et internet: recherche d'emploi, outils numériques, monde contemporain, ressources du territoire, mobilité, etc.
Elle est complétée par un suivi individualisé et un accompagnement à l'emploi.

## Conditions d'accès

Competences linguistiques a l entree en formation :
CECRL :
Oral : A1.1
Ecrit : A1.1$seed$, $seed${"id": "carif-oref--14_SE_0001608026", "nom": "Actions socio-linguistiques complémentaires du CIR (ASL) - LING PRO : Parcours Linguistique à visée professionnelle généraliste", "type": "formation", "extra": {"action": {"session": [{"@ref": "281975", "@numero": "SE_0001608026", "periode": {"fin": "20260731", "debut": "20251001"}, "url-session": {"urlweb": ["https://www.apijasso.org/"]}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "Contact", "prenom": "Association pour l insertion des jeunes", "telfixe": {"numtel": ["0695925301"]}, "courriel": "sophiedanne.apij@gmail.com"}, "type-contact": "0"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"pays": "FR", "ligne": ["Association pour l insertion des jeunes", "5 Place Youri Gagarine"], "ville": "Saint-Denis", "codepostal": "93200", "departement": "93", "denomination": "Association pour l'insertion des jeunes", "geolocalisation": {"latitude": "48.931921", "longitude": "2.382025"}, "code-INSEE-commune": "93066"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": "+ demandeurs d asile", "nombre-heures-total": 110, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81042", "@ref": "V14", "@info": "code-public-vise"}, {"$": "+ demandeurs d'asile", "@info": "info-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "Actions socio-linguistiques (ASL) complémentaires du CIR régional IDF - 2025-2026", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "5 Place Youri Gagarine", "commune": "Saint-Denis", "publics": ["personnes-exilees"], "courriel": "direction.asso.apij@gmail.com", "date_maj": "2025-12-08", "latitude": 48.931511, "longitude": 2.382324, "structure": {"id": "carif-oref--14_OF_0000005723", "nom": "Association pour l'insertion des jeunes", "siret": "32618558400074", "source": "carif-oref", "adresse": "5 Place Youri Gagarine", "commune": "Saint-Denis", "courriel": null, "date_maj": "2025-12-08", "doublons": [], "latitude": 48.931511, "site_web": null, "longitude": 2.382324, "telephone": "+33950979280", "code_insee": "93066", "code_postal": "93200", "description": null, "lien_source": "https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-14_OF_0000005723.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33148297370", "code_insee": "93066", "code_postal": "93200", "description": "### Objectif de la formation\n\nDonner à des personnes en difficulté professionnelle en raison de leur méconnaissance de la langue française la possibilité de se familiariser avec le langage professionnel et spécifique au monde du travail en France.\n\n### Contenu de la formation\n\nLa formation sera articulée autour des trois modules :\nCompétences linguistiques de base (Oral / Ecrit), FOS (visée professionnel et sociale), citoyenneté, etc.\nTechniques de Recherche d'Emploi : CV, lettre de motivation, recherche d'emploi / formation, monde de l'entreprise, marché du travail, etc.\nModule informatique et internet: recherche d'emploi, outils numériques, monde contemporain, ressources du territoire, mobilité, etc.\nElle est complétée par un suivi individualisé et un accompagnement à l'emploi.", "lien_source": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-14_AF_0000242613_SE_0001608026.html", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--14_OF_0000005723", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Competences linguistiques a l entree en formation :\nCECRL :\nOral : A1.1\nEcrit : A1.1", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["75", "77", "78", "91", "92", "93", "94", "95"], "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": "+ demandeurs d asile", "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$87396d48-2f19-489d-b31d-ce0b6dfa5e89$seed$, $seed$a1513954-083e-43d6-a904-341fa459727f$seed$, 1, $seed$DI$seed$, $seed$compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$3ecab6bf-c363-41d2-b4f7-e4f387e5f420$seed$, $seed$2026-02-25 02:01:10.428947+00$seed$, $seed$2026-06-17 14:36:11.416705+00$seed$, $seed$---
id: carif-oref--14_SE_0001116783
nom: Ouvrir l'école aux parents pour la réussite des enfants - OEPRE
type: formation
extra:
  action:
    session:
      - "@ref": "240395"
        "@numero": SE_0001116783
        periode:
          fin: "20260131"
          debut: "20240901"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            pays: FR
            ligne:
              - Ecole elementaire Joliot-Curie A
              - 23 Rue Saint-Just
            ville: Ivry-sur-Seine
            codepostal: "94200"
            departement: "94"
            denomination: Ecole élémentaire Joliot-Curie A
            geolocalisation:
              latitude: "48.811023"
              longitude: "2.389238"
            code-INSEE-commune: "94041"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 120
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "3"
                "@info": code-perimetre-recrutement
              - $: Ouvrir l'école aux parents pour la réussite des enfants (OEPRE) 2024-2025
                "@info": programme-financeur
        code-financeur: "12"
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "3"
                "@info": code-perimetre-recrutement
              - $: Ouvrir l'école aux parents pour la réussite des enfants (OEPRE) 2024-2025
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: Rue Saint-Just
commune: Ivry-sur-Seine
publics:
  - personnes-exilees
courriel: ce.0940249k@ac-creteil.fr
date_maj: 2025-03-21
latitude: 48.810817
longitude: 2.389171
telephone: "+33172046679"
code_insee: "94041"
code_postal: "94200"
description: >-
  ### Objectif de la formation


  Favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou
  étrangers hors Union européenne, volontaires, en les impliquant notamment dans
  la scolarité de leur enfant.


  ### Contenu de la formation


  Les formations portent sur trois axes d'apprentissage :

  - l'acquisition du français (comprendre, parler, lire et écrire) ;

  - la connaissance des valeurs de la République et leur mise en oeuvre dans la
  société française ;

  - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des
  élèves et des parents.

  Cette formation est assurée par des enseignants en Français Langue Seconde,
  des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS.
lien_source: https://www.intercariforef.org/formations/ouvrir-l-ecole-aux-parents-pour-la-reussite-des-enfants-oepre/formation-14_AF_0000178821_SE_0001116783.html
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
structure_id: carif-oref--14_OF_0000014533
modes_accueil:
  - en-presentiel
score_qualite: 0.8699999999999999
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Aucun
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "75"
  - "77"
  - "78"
  - "91"
  - "92"
  - "93"
  - "94"
  - "95"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - telephoner
  - envoyer-un-courriel
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: 3
structure:
  id: carif-oref--14_OF_0000014533
  nom: Commune d'Ivry-sur-Seine
  siret: "21940041300171"
  source: carif-oref
  adresse: Rue Saint-Just
  commune: Ivry-sur-Seine
  courriel: null
  date_maj: 2025-03-21
  doublons: []
  latitude: 48.810817
  site_web: null
  longitude: 2.389171
  telephone: "+33172046679"
  code_insee: "94041"
  code_postal: "94200"
  description: null
  lien_source: https://www.intercariforef.org/formations/commune-d-ivry-sur-seine/organisme-14_OF_0000014533.html
  score_qualite: 0.88
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Ouvrir l'école aux parents pour la réussite des enfants - OEPRE

### Objectif de la formation

Favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage :
- l'acquisition du français (comprendre, parler, lire et écrire) ;
- la connaissance des valeurs de la République et leur mise en oeuvre dans la société française ;
- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.
Cette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS.

## Conditions d'accès

Aucun$seed$, $seed${"id": "carif-oref--14_SE_0001116783", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "type": "formation", "extra": {"action": {"session": [{"@ref": "240395", "@numero": "SE_0001116783", "periode": {"fin": "20260131", "debut": "20240901"}, "etat-recrutement": "1", "adresse-inscription": {"adresse": {"pays": "FR", "ligne": ["Ecole elementaire Joliot-Curie A", "23 Rue Saint-Just"], "ville": "Ivry-sur-Seine", "codepostal": "94200", "departement": "94", "denomination": "Ecole élémentaire Joliot-Curie A", "geolocalisation": {"latitude": "48.811023", "longitude": "2.389238"}, "code-INSEE-commune": "94041"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "Ouvrir l'école aux parents pour la réussite des enfants (OEPRE) 2024-2025", "@info": "programme-financeur"}]}], "code-financeur": "12"}, {"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "Ouvrir l'école aux parents pour la réussite des enfants (OEPRE) 2024-2025", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "Rue Saint-Just", "commune": "Ivry-sur-Seine", "publics": ["personnes-exilees"], "courriel": "ce.0940249k@ac-creteil.fr", "date_maj": "2025-03-21", "latitude": 48.810817, "longitude": 2.389171, "structure": {"id": "carif-oref--14_OF_0000014533", "nom": "Commune d'Ivry-sur-Seine", "siret": "21940041300171", "source": "carif-oref", "adresse": "Rue Saint-Just", "commune": "Ivry-sur-Seine", "courriel": null, "date_maj": "2025-03-21", "doublons": [], "latitude": 48.810817, "site_web": null, "longitude": 2.389171, "telephone": "+33172046679", "code_insee": "94041", "code_postal": "94200", "description": null, "lien_source": "https://www.intercariforef.org/formations/commune-d-ivry-sur-seine/organisme-14_OF_0000014533.html", "score_qualite": 0.88, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33172046679", "code_insee": "94041", "code_postal": "94200", "description": "### Objectif de la formation\n\nFavoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :\n- l'acquisition du français (comprendre, parler, lire et écrire) ;\n- la connaissance des valeurs de la République et leur mise en oeuvre dans la société française ;\n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.\nCette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS.", "lien_source": "https://www.intercariforef.org/formations/ouvrir-l-ecole-aux-parents-pour-la-reussite-des-enfants-oepre/formation-14_AF_0000178821_SE_0001116783.html", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--14_OF_0000014533", "modes_accueil": ["en-presentiel"], "score_qualite": 0.8699999999999999, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Aucun", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["75", "77", "78", "91", "92", "93", "94", "95"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["telephoner", "envoyer-un-courriel"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": 3}$seed$, NULL, NULL, $seed$6c6f7070-50ff-4d73-a257-9191c7630819$seed$, $seed$7b111ba0-9cf8-43f2-a946-b515448e6d89$seed$, 1, $seed$DI$seed$, $seed$non_compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$28909517-ba30-49c4-8470-0f705c851831$seed$, $seed$2026-06-17 14:36:08.26557+00$seed$, $seed$2026-06-17 14:36:11.416705+00$seed$, $seed$---
id: carif-oref--01_GE1954741
nom: Ouvrir l'école aux parents pour la réussite des enfants - OEPRE
type: formation
extra:
  action:
    session:
      - "@ref": "12111"
        "@numero": GE1954741
        periode:
          fin: "20270131"
          debut: "20250901"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: non precise
              prenom: .
              telfixe:
                numtel:
                  - "0389445460"
              courriel: ce.0681147C@ac-strasbourg.fr
            type-contact: "3"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            ligne:
              - 11 rue du Languedoc
            ville: Mulhouse
            codepostal: "68100"
            denomination: Ecole maternelle Saint Exupéry
            code-INSEE-commune: "68224"
        periode-inscription:
          periode:
            fin: "20270131"
            debut: "20250901"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 120
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: OEPRE
                "@info": programme-financeur
              - $: .
                "@info": ref-action-marche-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 11 Rue du Languedoc
commune: Mulhouse
publics:
  - personnes-exilees
courriel: ce.0681147C@ac-strasbourg.fr
date_maj: 2026-01-07
latitude: 47.759639
longitude: 7.36361
telephone: "+33389445460"
code_insee: "68224"
code_postal: "68100"
description: >-
  ### Objectif de la formation


  Les formations ont pour but d'améliorer les compétences des parents ayant un
  profil ALPHA et :  

  - d'apprendre, dans l'enceinte d'un établissement scolaire, la langue
  française à l'oral et à l'écrit en s'appropriant les principes et valeurs de
  la République en découvrant le fonctionnement de l'école ;  

  - afin d'acquérir les moyens d'aider ses propres enfants au cours de leur
  scolarité.  

  Validation et sanction :  

  - Attestation de suivi  

  - Validation possible selon le cas (DILF, DELF, DCL).


  ### Contenu de la formation


  Les formations portent sur trois axes d'apprentissage :  

  - l'acquisition du français (comprendre, parler, lire et écrire) ;  

  - la connaissance des valeurs de la République et leur mise en œuvre dans la
  société française ;  

  - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des
  élèves et des parents.  

  Cette formation est assurée par des enseignants en Français Langue Seconde ou
  des membres d'associations diplômés en FLE-FLS.
lien_source: https://formation.grandest.fr/accueil/formations/45497
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
  - lecture-ecriture-calcul--maitriser-le-calcul
structure_id: carif-oref--01_GE2784
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Pas de condition specifique
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--01_GE2784
  nom: Ecole maternelle Saint Exupéry
  siret: "19680111200018"
  source: carif-oref
  adresse: 11 Rue du Languedoc
  commune: Mulhouse
  courriel: ce.0681147C@ac-strasbourg.fr
  date_maj: 2026-01-07
  doublons: []
  latitude: 47.759639
  site_web: null
  longitude: 7.36361
  telephone: "+33389445460"
  code_insee: "68224"
  code_postal: "68100"
  description: null
  lien_source: https://www.intercariforef.org/formations/ecole-maternelle-saint-exupery/organisme-01_GE2784.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Ouvrir l'école aux parents pour la réussite des enfants - OEPRE

### Objectif de la formation

Les formations ont pour but d'améliorer les compétences des parents ayant un profil ALPHA et :  
- d'apprendre, dans l'enceinte d'un établissement scolaire, la langue française à l'oral et à l'écrit en s'appropriant les principes et valeurs de la République en découvrant le fonctionnement de l'école ;  
- afin d'acquérir les moyens d'aider ses propres enfants au cours de leur scolarité.  
Validation et sanction :  
- Attestation de suivi  
- Validation possible selon le cas (DILF, DELF, DCL).

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage :  
- l'acquisition du français (comprendre, parler, lire et écrire) ;  
- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  
- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.  
Cette formation est assurée par des enseignants en Français Langue Seconde ou des membres d'associations diplômés en FLE-FLS.

## Conditions d'accès

Pas de condition specifique$seed$, $seed${"id": "carif-oref--01_GE1954741", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "type": "formation", "extra": {"action": {"session": [{"@ref": "12111", "@numero": "GE1954741", "periode": {"fin": "20270131", "debut": "20250901"}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "non precise", "prenom": ".", "telfixe": {"numtel": ["0389445460"]}, "courriel": "ce.0681147C@ac-strasbourg.fr"}, "type-contact": "3"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"ligne": ["11 rue du Languedoc"], "ville": "Mulhouse", "codepostal": "68100", "denomination": "Ecole maternelle Saint Exupéry", "code-INSEE-commune": "68224"}}, "periode-inscription": {"periode": {"fin": "20270131", "debut": "20250901"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "OEPRE", "@info": "programme-financeur"}, {"$": ".", "@info": "ref-action-marche-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "11 Rue du Languedoc", "commune": "Mulhouse", "publics": ["personnes-exilees"], "courriel": "ce.0681147C@ac-strasbourg.fr", "date_maj": "2026-01-07", "latitude": 47.759639, "longitude": 7.36361, "structure": {"id": "carif-oref--01_GE2784", "nom": "Ecole maternelle Saint Exupéry", "siret": "19680111200018", "source": "carif-oref", "adresse": "11 Rue du Languedoc", "commune": "Mulhouse", "courriel": "ce.0681147C@ac-strasbourg.fr", "date_maj": "2026-01-07", "doublons": [], "latitude": 47.759639, "site_web": null, "longitude": 7.36361, "telephone": "+33389445460", "code_insee": "68224", "code_postal": "68100", "description": null, "lien_source": "https://www.intercariforef.org/formations/ecole-maternelle-saint-exupery/organisme-01_GE2784.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33389445460", "code_insee": "68224", "code_postal": "68100", "description": "### Objectif de la formation\n\nLes formations ont pour but d'améliorer les compétences des parents ayant un profil ALPHA et :  \n- d'apprendre, dans l'enceinte d'un établissement scolaire, la langue française à l'oral et à l'écrit en s'appropriant les principes et valeurs de la République en découvrant le fonctionnement de l'école ;  \n- afin d'acquérir les moyens d'aider ses propres enfants au cours de leur scolarité.  \nValidation et sanction :  \n- Attestation de suivi  \n- Validation possible selon le cas (DILF, DELF, DCL).\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :  \n- l'acquisition du français (comprendre, parler, lire et écrire) ;  \n- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  \n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.  \nCette formation est assurée par des enseignants en Français Langue Seconde ou des membres d'associations diplômés en FLE-FLS.", "lien_source": "https://formation.grandest.fr/accueil/formations/45497", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais", "lecture-ecriture-calcul--maitriser-le-calcul"], "structure_id": "carif-oref--01_GE2784", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Pas de condition specifique", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$82e827f7-d953-4f68-9c33-fd4bcd684d28$seed$, $seed$81549a24-bd45-4c69-aafd-4bf1908d4c05$seed$, 1, $seed$DI$seed$, $seed$non_compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$f2539246-a6e0-4723-a7e6-ce0af0d49e2f$seed$, $seed$2026-06-17 14:36:08.26557+00$seed$, $seed$2026-06-17 14:36:11.416705+00$seed$, $seed$---
id: carif-oref--01_GE1848679
nom: DAEU diplôme d'accès aux études universitaires option A
type: formation
extra:
  action:
    session:
      - "@ref": "14706"
        "@numero": GE1848679
        periode:
          fin: "20260630"
          debut: "20251006"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: GRISINELLI
              prenom: Sandra
              telfixe:
                numtel:
                  - "0368854998"
              courriel: s.grisinelli@unistra.fr
            type-contact: "0"
        etat-recrutement: "1"
        blocs-competences:
          - bloc-competences:
              - code-bloc: RNCP40181BC01
                libelle-bloc: Accueillir, orienter et accompagner les différents types de
                  publics
              - code-bloc: RNCP40181BC02
                libelle-bloc: Organiser et gérer des tâches administratives simples
              - code-bloc: RNCP40181BC03
                libelle-bloc: Suivre et vérifier ses activités
              - code-bloc: RNCP40181BC04
                libelle-bloc: Communiquer à l'écrit et à l'oral
              - code-bloc: RNCP40181BC05
                libelle-bloc: Rechercher et partager des informations et des données, en
                  intégrant l'évolution des technologies
            validation-blocs: "1"
            reference-certification:
              reference-code-CERTIFINFO: "118300"
        adresse-inscription:
          adresse:
            ligne:
              - 21 Rue du Marechal Lefebvre
            ville: Strasbourg
            codepostal: "67100"
            denomination: Université de Strasbourg
            code-INSEE-commune: "67482"
        periode-inscription:
          periode:
            fin: "20250910"
            debut: "20250701"
        reference-certification:
          - reference-code-RNCP: "40181"
            reference-code-CERTIFINFO: "118300"
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 308
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "80006"
                "@ref": V14
                "@info": code-public-vise
              - $: Accord cadre université
                "@info": programme-financeur
              - $: 2025-30971
                "@info": ref-action-marche-financeur
        code-financeur: "2"
        nb-places-financees: 13
    modalites-recrutement: >-
      MODALITÉS D'ADMISSION

      Pour accéder à la formation, les candidats doivent avoir déposé un dossier
      de pré-inscription sur https://ecandidat.unistra.

      fr/ avant le 10 septembre 2025 et réussi les tests de sélection :

      &gt; Français (option A&amp;B) : Maitriser la langue française, comprendre
      un texte simple, développer une argumentation.

      &gt; Langue vivante (option A) : Posséder un niveau de l'utilisateur
      élémentaire A2 du CECRL


      La réussite au test de français est indispensable pour pouvoir s'inscrire
      au DAEU. Un programme renforcé peut être

      proposé aux candidats ne disposant pas des prérequis nécessaires.
    modalites-enseignement: "0"
    modalites-entrees-sorties: "0"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "14"
frais: null
source: carif-oref
adresse: 4 Rue Blaise Pascal
commune: Strasbourg
publics:
  - demandeurs-emploi
courriel: sfc-contact@unistra.fr
date_maj: 2026-03-06
latitude: 48.580714
longitude: 7.766568
telephone: "+33368854920"
code_insee: "67482"
code_postal: "67000"
description: >-
  ### Objectif de la formation


  COMPÉTENCES À L'ISSUE DE LA FORMATION  

  > Développer des outils méthodologiques et structurels (prise de notes,
  mémorisation, organisation)  

  > Déployer et mettre en forme des compétences d'analyse et de raisonnement  

  > Mobiliser un socle de connaissances développé dans les disciplines
  enseignées  

  > Mettre en oeuvre des méthodes en lien les contenus disciplinaires suivis


  Le DAEU permet la poursuite d'études dans les établissements d'enseignement
  supérieur et donne accès aux formations, concours et emplois pour lesquels le
  baccalauréat est requis. Afin d'orienter le candidat vers le parcours de
  formation adapté à son niveau et son projet, des tests de niveau suivis d'un
  entretien individuel sont organisés en amont de la formation.  

  Pour offrir davantage de souplesse à un public adulte, les stagiaires peuvent
  construire leur parcours à la carte : cours du soir ou à distance, formation
  sur un an ou module par module sur plusieurs années.


  ### Contenu de la formation


  La formation a pour objectif de permettre aux stagiaires d'acquérir les
  connaissances et les modes de raisonnement indispensables pour toute formation
  supérieure.  

  Renforcement (40h à 80h) : français et/ou mathématiques et/ou anglais.  

  > Option A : Lettres, langues et sciences humaines  

  2 modules obligatoires (64h/module) : français et langue vivante (allemand ou
  anglais)  

  2 modules optionnels (50h/module) : géographie, histoire, mathématiques,
  culture générale.


  Vous trouverez l'ensemble des documents du présentation du DAEU à télécharger
  sur notre site.
lien_source: https://sfc.unistra.fr/formationcontinue-de-luniversite-de-strasbourg/les-daeu/
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
  - lecture-ecriture-calcul--maitriser-le-calcul
structure_id: carif-oref--01_AFI354
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: >-
  Cette formation s adresse aux candidats n ayant ni le baccalaureat ni un
  diplome admis en equivalence, ayant interrompu leurs etudes initiales depuis
  au moins 2 ans et remplissant les conditions d age suivantes au 1er octobre de
  l annee de delivrance du diplome :

  > Etre age de 20 ans au moins et justifier de 2 annees d activite
  professionnelle (ou autres situations prevues par l arrete ministeriel)

  > Etre age de 24 ans au moins.

  Pour les titulaires du baccalaureat, il est possible de s inscrire a une ou
  plusieurs matieres en vue de l acquisition d un complement de competences.
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: >-
  MODALITÉS D'ADMISSION

  Pour accéder à la formation, les candidats doivent avoir déposé un dossier de
  pré-inscription sur https://ecandidat.unistra.

  fr/ avant le 10 septembre 2025 et réussi les tests de sélection :

  &gt; Français (option A&amp;B) : Maitriser la langue française, comprendre un
  texte simple, développer une argumentation.

  &gt; Langue vivante (option A) : Posséder un niveau de l'utilisateur
  élémentaire A2 du CECRL


  La réussite au test de français est indispensable pour pouvoir s'inscrire au
  DAEU. Un programme renforcé peut être

  proposé aux candidats ne disposant pas des prérequis nécessaires.
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--01_AFI354
  nom: UNISTRA SFC
  siret: "13000545700010"
  source: carif-oref
  adresse: 22 Rue René Descartes
  commune: Strasbourg
  courriel: sfc-contact@unistra.fr
  date_maj: 2026-06-10
  doublons: []
  latitude: 48.578385
  site_web: https://sfc.unistra.fr/
  longitude: 7.764964
  telephone: "+33368854920"
  code_insee: "67482"
  code_postal: "67000"
  description: null
  lien_source: https://www.intercariforef.org/formations/unistra-sfc/organisme-01_AFI354.html
  score_qualite: 0.88
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# DAEU diplôme d'accès aux études universitaires option A

### Objectif de la formation

COMPÉTENCES À L'ISSUE DE LA FORMATION  
> Développer des outils méthodologiques et structurels (prise de notes, mémorisation, organisation)  
> Déployer et mettre en forme des compétences d'analyse et de raisonnement  
> Mobiliser un socle de connaissances développé dans les disciplines enseignées  
> Mettre en oeuvre des méthodes en lien les contenus disciplinaires suivis

Le DAEU permet la poursuite d'études dans les établissements d'enseignement supérieur et donne accès aux formations, concours et emplois pour lesquels le baccalauréat est requis. Afin d'orienter le candidat vers le parcours de formation adapté à son niveau et son projet, des tests de niveau suivis d'un entretien individuel sont organisés en amont de la formation.  
Pour offrir davantage de souplesse à un public adulte, les stagiaires peuvent construire leur parcours à la carte : cours du soir ou à distance, formation sur un an ou module par module sur plusieurs années.

### Contenu de la formation

La formation a pour objectif de permettre aux stagiaires d'acquérir les connaissances et les modes de raisonnement indispensables pour toute formation supérieure.  
Renforcement (40h à 80h) : français et/ou mathématiques et/ou anglais.  
> Option A : Lettres, langues et sciences humaines  
2 modules obligatoires (64h/module) : français et langue vivante (allemand ou anglais)  
2 modules optionnels (50h/module) : géographie, histoire, mathématiques, culture générale.

Vous trouverez l'ensemble des documents du présentation du DAEU à télécharger sur notre site.

## Conditions d'accès

Cette formation s adresse aux candidats n ayant ni le baccalaureat ni un diplome admis en equivalence, ayant interrompu leurs etudes initiales depuis au moins 2 ans et remplissant les conditions d age suivantes au 1er octobre de l annee de delivrance du diplome :
> Etre age de 20 ans au moins et justifier de 2 annees d activite professionnelle (ou autres situations prevues par l arrete ministeriel)
> Etre age de 24 ans au moins.
Pour les titulaires du baccalaureat, il est possible de s inscrire a une ou plusieurs matieres en vue de l acquisition d un complement de competences.$seed$, $seed${"id": "carif-oref--01_GE1848679", "nom": "DAEU diplôme d'accès aux études universitaires option A", "type": "formation", "extra": {"action": {"session": [{"@ref": "14706", "@numero": "GE1848679", "periode": {"fin": "20260630", "debut": "20251006"}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "GRISINELLI", "prenom": "Sandra", "telfixe": {"numtel": ["0368854998"]}, "courriel": "s.grisinelli@unistra.fr"}, "type-contact": "0"}], "etat-recrutement": "1", "blocs-competences": [{"bloc-competences": [{"code-bloc": "RNCP40181BC01", "libelle-bloc": "Accueillir, orienter et accompagner les différents types de publics"}, {"code-bloc": "RNCP40181BC02", "libelle-bloc": "Organiser et gérer des tâches administratives simples"}, {"code-bloc": "RNCP40181BC03", "libelle-bloc": "Suivre et vérifier ses activités"}, {"code-bloc": "RNCP40181BC04", "libelle-bloc": "Communiquer à l'écrit et à l'oral"}, {"code-bloc": "RNCP40181BC05", "libelle-bloc": "Rechercher et partager des informations et des données, en intégrant l'évolution des technologies"}], "validation-blocs": "1", "reference-certification": {"reference-code-CERTIFINFO": "118300"}}], "adresse-inscription": {"adresse": {"ligne": ["21 Rue du Marechal Lefebvre"], "ville": "Strasbourg", "codepostal": "67100", "denomination": "Université de Strasbourg", "code-INSEE-commune": "67482"}}, "periode-inscription": {"periode": {"fin": "20250910", "debut": "20250701"}}, "reference-certification": [{"reference-code-RNCP": "40181", "reference-code-CERTIFINFO": "118300"}]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 308, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "80006", "@ref": "V14", "@info": "code-public-vise"}, {"$": "Accord cadre université", "@info": "programme-financeur"}, {"$": "2025-30971", "@info": "ref-action-marche-financeur"}]}], "code-financeur": "2", "nb-places-financees": 13}], "modalites-recrutement": "MODALITÉS D'ADMISSION\nPour accéder à la formation, les candidats doivent avoir déposé un dossier de pré-inscription sur https://ecandidat.unistra.\nfr/ avant le 10 septembre 2025 et réussi les tests de sélection :\n&gt; Français (option A&amp;B) : Maitriser la langue française, comprendre un texte simple, développer une argumentation.\n&gt; Langue vivante (option A) : Posséder un niveau de l'utilisateur élémentaire A2 du CECRL\n\nLa réussite au test de français est indispensable pour pouvoir s'inscrire au DAEU. Un programme renforcé peut être\nproposé aux candidats ne disposant pas des prérequis nécessaires.", "modalites-enseignement": "0", "modalites-entrees-sorties": "0"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "14"}}, "frais": null, "source": "carif-oref", "adresse": "4 Rue Blaise Pascal", "commune": "Strasbourg", "publics": ["demandeurs-emploi"], "courriel": "sfc-contact@unistra.fr", "date_maj": "2026-03-06", "latitude": 48.580714, "longitude": 7.766568, "structure": {"id": "carif-oref--01_AFI354", "nom": "UNISTRA SFC", "siret": "13000545700010", "source": "carif-oref", "adresse": "22 Rue René Descartes", "commune": "Strasbourg", "courriel": "sfc-contact@unistra.fr", "date_maj": "2026-06-10", "doublons": [], "latitude": 48.578385, "site_web": "https://sfc.unistra.fr/", "longitude": 7.764964, "telephone": "+33368854920", "code_insee": "67482", "code_postal": "67000", "description": null, "lien_source": "https://www.intercariforef.org/formations/unistra-sfc/organisme-01_AFI354.html", "score_qualite": 0.88, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33368854920", "code_insee": "67482", "code_postal": "67000", "description": "### Objectif de la formation\n\nCOMPÉTENCES À L'ISSUE DE LA FORMATION  \n> Développer des outils méthodologiques et structurels (prise de notes, mémorisation, organisation)  \n> Déployer et mettre en forme des compétences d'analyse et de raisonnement  \n> Mobiliser un socle de connaissances développé dans les disciplines enseignées  \n> Mettre en oeuvre des méthodes en lien les contenus disciplinaires suivis\n\nLe DAEU permet la poursuite d'études dans les établissements d'enseignement supérieur et donne accès aux formations, concours et emplois pour lesquels le baccalauréat est requis. Afin d'orienter le candidat vers le parcours de formation adapté à son niveau et son projet, des tests de niveau suivis d'un entretien individuel sont organisés en amont de la formation.  \nPour offrir davantage de souplesse à un public adulte, les stagiaires peuvent construire leur parcours à la carte : cours du soir ou à distance, formation sur un an ou module par module sur plusieurs années.\n\n### Contenu de la formation\n\nLa formation a pour objectif de permettre aux stagiaires d'acquérir les connaissances et les modes de raisonnement indispensables pour toute formation supérieure.  \nRenforcement (40h à 80h) : français et/ou mathématiques et/ou anglais.  \n> Option A : Lettres, langues et sciences humaines  \n2 modules obligatoires (64h/module) : français et langue vivante (allemand ou anglais)  \n2 modules optionnels (50h/module) : géographie, histoire, mathématiques, culture générale.\n\nVous trouverez l'ensemble des documents du présentation du DAEU à télécharger sur notre site.", "lien_source": "https://sfc.unistra.fr/formationcontinue-de-luniversite-de-strasbourg/les-daeu/", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais", "lecture-ecriture-calcul--maitriser-le-calcul"], "structure_id": "carif-oref--01_AFI354", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Cette formation s adresse aux candidats n ayant ni le baccalaureat ni un diplome admis en equivalence, ayant interrompu leurs etudes initiales depuis au moins 2 ans et remplissant les conditions d age suivantes au 1er octobre de l annee de delivrance du diplome :\n> Etre age de 20 ans au moins et justifier de 2 annees d activite professionnelle (ou autres situations prevues par l arrete ministeriel)\n> Etre age de 24 ans au moins.\nPour les titulaires du baccalaureat, il est possible de s inscrire a une ou plusieurs matieres en vue de l acquisition d un complement de competences.", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": "MODALITÉS D'ADMISSION\nPour accéder à la formation, les candidats doivent avoir déposé un dossier de pré-inscription sur https://ecandidat.unistra.\nfr/ avant le 10 septembre 2025 et réussi les tests de sélection :\n&gt; Français (option A&amp;B) : Maitriser la langue française, comprendre un texte simple, développer une argumentation.\n&gt; Langue vivante (option A) : Posséder un niveau de l'utilisateur élémentaire A2 du CECRL\n\nLa réussite au test de français est indispensable pour pouvoir s'inscrire au DAEU. Un programme renforcé peut être\nproposé aux candidats ne disposant pas des prérequis nécessaires.", "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$bb4e2df8-21f8-4fef-a6c0-8e41d7140106$seed$, $seed$db4f937a-dced-4709-b813-06dd4d42b13b$seed$, 1, $seed$DI$seed$, $seed$error$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$f28dd88e-4ad5-4ba0-80bc-b01396fd4a6f$seed$, $seed$2026-06-17 14:36:08.26557+00$seed$, $seed$2026-06-17 14:36:11.416705+00$seed$, $seed$---
id: carif-oref--01_AL1954988
nom: Ouvrir l'école aux parents pour la réussite des enfants - OEPRE
type: formation
extra:
  action:
    session:
      - "@ref": "12133"
        "@numero": GE1954988
        periode:
          fin: "20270131"
          debut: "20250901"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: non precise
              prenom: .
              telfixe:
                numtel:
                  - "0388911435"
              courriel: ce.0672239V@ac-strasbourg.fr
            type-contact: "3"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            ligne:
              - 14 Rue des Sources
            ville: Saverne
            codepostal: "67700"
            denomination: 14 rue des Sources Saverne
            code-INSEE-commune: "67437"
        periode-inscription:
          periode:
            fin: "20270131"
            debut: "20250901"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 120
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: OEPRE
                "@info": programme-financeur
              - $: .
                "@info": ref-action-marche-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 14 Rue des Sources
commune: Saverne
publics:
  - personnes-exilees
courriel: ce.0672239V@ac-strasbourg.fr
date_maj: 2026-01-07
latitude: 48.735851
longitude: 7.367611
telephone: "+33388911435"
code_insee: "67437"
code_postal: "67700"
description: >-
  ### Objectif de la formation


  Les formations ont pour but d'améliorer les compétences des parents ayant un
  profil ALPHA et :  

  - d'apprendre, dans l'enceinte d'un établissement scolaire, la langue
  française à l'oral et à l'écrit en s'appropriant les principes et valeurs de
  la République en découvrant le fonctionnement de l'école ;  

  - afin d'acquérir les moyens d'aider ses propres enfants au cours de leur
  scolarité.  

  Validation et sanction :  

  - Attestation de suivi  

  - Validation possible selon le cas (DILF, DELF, DCL).


  ### Contenu de la formation


  Les formations portent sur trois axes d'apprentissage :  

  - l'acquisition du français (comprendre, parler, lire et écrire) ;  

  - la connaissance des valeurs de la République et leur mise en œuvre dans la
  société française ;  

  - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des
  élèves et des parents.  

  Cette formation est assurée par des enseignants en Français Langue Seconde ou
  des membres d'associations diplômés en FLE-FLS.
lien_source: https://formation.grandest.fr/accueil/formations/42026
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
  - lecture-ecriture-calcul--maitriser-le-calcul
structure_id: carif-oref--01_989
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Pas de condition specifique
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--01_989
  nom: Ecole primaire Les Sources
  siret: "21670437900116"
  source: carif-oref
  adresse: 14 Rue des Sources
  commune: Saverne
  courriel: ce.0672239V@ac-strasbourg.fr
  date_maj: 2026-01-07
  doublons: []
  latitude: 48.735851
  site_web: null
  longitude: 7.367611
  telephone: "+33388911435"
  code_insee: "67437"
  code_postal: "67700"
  description: null
  lien_source: https://www.intercariforef.org/formations/ecole-primaire-les-sources/organisme-01_989.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Ouvrir l'école aux parents pour la réussite des enfants - OEPRE

### Objectif de la formation

Les formations ont pour but d'améliorer les compétences des parents ayant un profil ALPHA et :  
- d'apprendre, dans l'enceinte d'un établissement scolaire, la langue française à l'oral et à l'écrit en s'appropriant les principes et valeurs de la République en découvrant le fonctionnement de l'école ;  
- afin d'acquérir les moyens d'aider ses propres enfants au cours de leur scolarité.  
Validation et sanction :  
- Attestation de suivi  
- Validation possible selon le cas (DILF, DELF, DCL).

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage :  
- l'acquisition du français (comprendre, parler, lire et écrire) ;  
- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  
- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.  
Cette formation est assurée par des enseignants en Français Langue Seconde ou des membres d'associations diplômés en FLE-FLS.

## Conditions d'accès

Pas de condition specifique$seed$, $seed${"id": "carif-oref--01_AL1954988", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "type": "formation", "extra": {"action": {"session": [{"@ref": "12133", "@numero": "GE1954988", "periode": {"fin": "20270131", "debut": "20250901"}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "non precise", "prenom": ".", "telfixe": {"numtel": ["0388911435"]}, "courriel": "ce.0672239V@ac-strasbourg.fr"}, "type-contact": "3"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"ligne": ["14 Rue des Sources"], "ville": "Saverne", "codepostal": "67700", "denomination": "14 rue des Sources Saverne", "code-INSEE-commune": "67437"}}, "periode-inscription": {"periode": {"fin": "20270131", "debut": "20250901"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "OEPRE", "@info": "programme-financeur"}, {"$": ".", "@info": "ref-action-marche-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "14 Rue des Sources", "commune": "Saverne", "publics": ["personnes-exilees"], "courriel": "ce.0672239V@ac-strasbourg.fr", "date_maj": "2026-01-07", "latitude": 48.735851, "longitude": 7.367611, "structure": {"id": "carif-oref--01_989", "nom": "Ecole primaire Les Sources", "siret": "21670437900116", "source": "carif-oref", "adresse": "14 Rue des Sources", "commune": "Saverne", "courriel": "ce.0672239V@ac-strasbourg.fr", "date_maj": "2026-01-07", "doublons": [], "latitude": 48.735851, "site_web": null, "longitude": 7.367611, "telephone": "+33388911435", "code_insee": "67437", "code_postal": "67700", "description": null, "lien_source": "https://www.intercariforef.org/formations/ecole-primaire-les-sources/organisme-01_989.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33388911435", "code_insee": "67437", "code_postal": "67700", "description": "### Objectif de la formation\n\nLes formations ont pour but d'améliorer les compétences des parents ayant un profil ALPHA et :  \n- d'apprendre, dans l'enceinte d'un établissement scolaire, la langue française à l'oral et à l'écrit en s'appropriant les principes et valeurs de la République en découvrant le fonctionnement de l'école ;  \n- afin d'acquérir les moyens d'aider ses propres enfants au cours de leur scolarité.  \nValidation et sanction :  \n- Attestation de suivi  \n- Validation possible selon le cas (DILF, DELF, DCL).\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :  \n- l'acquisition du français (comprendre, parler, lire et écrire) ;  \n- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  \n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.  \nCette formation est assurée par des enseignants en Français Langue Seconde ou des membres d'associations diplômés en FLE-FLS.", "lien_source": "https://formation.grandest.fr/accueil/formations/42026", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais", "lecture-ecriture-calcul--maitriser-le-calcul"], "structure_id": "carif-oref--01_989", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Pas de condition specifique", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$d0c7cbe1-58fe-4b01-afc2-bee7330886ca$seed$, $seed$9853f249-8135-4697-b901-1ae3255745f6$seed$, 1, $seed$DI$seed$, $seed$non_compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$c4c377a9-752b-4cb6-9acf-025afe51b4d2$seed$, $seed$2026-06-17 14:36:08.26557+00$seed$, $seed$2026-06-17 14:36:11.416705+00$seed$, $seed$---
id: carif-oref--01_AL1954832
nom: Ouvrir l'école aux parents pour la réussite des enfants - OEPRE
type: formation
extra:
  action:
    session:
      - "@ref": "12120"
        "@numero": GE1954832
        periode:
          fin: "20270131"
          debut: "20250901"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: non precise
              prenom: .
              telfixe:
                numtel:
                  - "0388131900"
              courriel: ce.0673009G@ac-strasbourg.fr
            type-contact: "3"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            ligne:
              - 33 Rue Cerf Berr
            ville: Strasbourg
            codepostal: "67200"
            denomination: 33 rue Cerf Berr Strasbourg
            code-INSEE-commune: "67482"
        periode-inscription:
          periode:
            fin: "20270131"
            debut: "20250901"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 120
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: OEPRE
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 33 Rue Cerf Berr
commune: Strasbourg
publics:
  - personnes-exilees
courriel: ce.0673009G@ac-strasbourg.fr
date_maj: 2026-02-13
latitude: 48.584899
longitude: 7.69213
telephone: "+33388131900"
code_insee: "67482"
code_postal: "67200"
description: >-
  ### Objectif de la formation


  Les formations ont pour but d'améliorer les compétences des parents ayant un
  profil ALPHA et :  

  - d'apprendre, dans l'enceinte d'un établissement scolaire, la langue
  française à l'oral et à l'écrit en s'appropriant les principes et valeurs de
  la République en découvrant le fonctionnement de l'école ;  

  - afin d'acquérir les moyens d'aider ses propres enfants au cours de leur
  scolarité.  

  Validation et sanction :  

  - Attestation de suivi  

  - Validation possible selon le cas (DILF, DELF, DCL).


  ### Contenu de la formation


  Les formations portent sur trois axes d'apprentissage :  

  - l'acquisition du français (comprendre, parler, lire et écrire) ;  

  - la connaissance des valeurs de la République et leur mise en œuvre dans la
  société française ;  

  - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des
  élèves et des parents.  

  Cette formation est assurée par des enseignants en Français Langue Seconde ou
  des membres d'associations diplômés en FLE-FLS.
lien_source: https://formation.grandest.fr/accueil/formations/42065
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
  - lecture-ecriture-calcul--maitriser-le-calcul
structure_id: carif-oref--01_1001
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Pas de condition specifique
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--01_1001
  nom: Etablissement scolaire
  siret: "21670482501686"
  source: carif-oref
  adresse: 33 Rue Cerf Berr
  commune: Strasbourg
  courriel: ce.0673009G@ac-strasbourg.fr
  date_maj: 2026-02-13
  doublons: []
  latitude: 48.584899
  site_web: null
  longitude: 7.69213
  telephone: "+33388131900"
  code_insee: "67482"
  code_postal: "67200"
  description: null
  lien_source: https://www.intercariforef.org/formations/etablissement-scolaire/organisme-01_1001.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Ouvrir l'école aux parents pour la réussite des enfants - OEPRE

### Objectif de la formation

Les formations ont pour but d'améliorer les compétences des parents ayant un profil ALPHA et :  
- d'apprendre, dans l'enceinte d'un établissement scolaire, la langue française à l'oral et à l'écrit en s'appropriant les principes et valeurs de la République en découvrant le fonctionnement de l'école ;  
- afin d'acquérir les moyens d'aider ses propres enfants au cours de leur scolarité.  
Validation et sanction :  
- Attestation de suivi  
- Validation possible selon le cas (DILF, DELF, DCL).

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage :  
- l'acquisition du français (comprendre, parler, lire et écrire) ;  
- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  
- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.  
Cette formation est assurée par des enseignants en Français Langue Seconde ou des membres d'associations diplômés en FLE-FLS.

## Conditions d'accès

Pas de condition specifique$seed$, $seed${"id": "carif-oref--01_AL1954832", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "type": "formation", "extra": {"action": {"session": [{"@ref": "12120", "@numero": "GE1954832", "periode": {"fin": "20270131", "debut": "20250901"}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "non precise", "prenom": ".", "telfixe": {"numtel": ["0388131900"]}, "courriel": "ce.0673009G@ac-strasbourg.fr"}, "type-contact": "3"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"ligne": ["33 Rue Cerf Berr"], "ville": "Strasbourg", "codepostal": "67200", "denomination": "33 rue Cerf Berr Strasbourg", "code-INSEE-commune": "67482"}}, "periode-inscription": {"periode": {"fin": "20270131", "debut": "20250901"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "OEPRE", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "33 Rue Cerf Berr", "commune": "Strasbourg", "publics": ["personnes-exilees"], "courriel": "ce.0673009G@ac-strasbourg.fr", "date_maj": "2026-02-13", "latitude": 48.584899, "longitude": 7.69213, "structure": {"id": "carif-oref--01_1001", "nom": "Etablissement scolaire", "siret": "21670482501686", "source": "carif-oref", "adresse": "33 Rue Cerf Berr", "commune": "Strasbourg", "courriel": "ce.0673009G@ac-strasbourg.fr", "date_maj": "2026-02-13", "doublons": [], "latitude": 48.584899, "site_web": null, "longitude": 7.69213, "telephone": "+33388131900", "code_insee": "67482", "code_postal": "67200", "description": null, "lien_source": "https://www.intercariforef.org/formations/etablissement-scolaire/organisme-01_1001.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33388131900", "code_insee": "67482", "code_postal": "67200", "description": "### Objectif de la formation\n\nLes formations ont pour but d'améliorer les compétences des parents ayant un profil ALPHA et :  \n- d'apprendre, dans l'enceinte d'un établissement scolaire, la langue française à l'oral et à l'écrit en s'appropriant les principes et valeurs de la République en découvrant le fonctionnement de l'école ;  \n- afin d'acquérir les moyens d'aider ses propres enfants au cours de leur scolarité.  \nValidation et sanction :  \n- Attestation de suivi  \n- Validation possible selon le cas (DILF, DELF, DCL).\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :  \n- l'acquisition du français (comprendre, parler, lire et écrire) ;  \n- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  \n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.  \nCette formation est assurée par des enseignants en Français Langue Seconde ou des membres d'associations diplômés en FLE-FLS.", "lien_source": "https://formation.grandest.fr/accueil/formations/42065", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais", "lecture-ecriture-calcul--maitriser-le-calcul"], "structure_id": "carif-oref--01_1001", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Pas de condition specifique", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$98583263-4e99-4474-982f-780769b619a1$seed$, $seed$b970b6e6-ba3c-4cb1-a003-036766e37feb$seed$, 1, $seed$DI$seed$, $seed$non_compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$e4e3a6c3-40a1-4026-b2c1-a602b5e4a00a$seed$, $seed$2026-06-17 14:36:08.26557+00$seed$, $seed$2026-06-17 14:36:11.416705+00$seed$, $seed$---
id: carif-oref--01_AL1954752
nom: Ouvrir l'école aux parents pour la réussite des enfants - OEPRE
type: formation
extra:
  action:
    session:
      - "@ref": "12112"
        "@numero": GE1954752
        periode:
          fin: "20270131"
          debut: "20250901"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: non precise
              prenom: .
              telfixe:
                numtel:
                  - "0389665177"
              courriel: ce.0680984A@ac-strasbourg.fr
            type-contact: "3"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            ligne:
              - 9 Rue de Battenheim
            ville: Mulhouse
            codepostal: "68100"
            denomination: 9 rue de Battenheim Mulhouse
            code-INSEE-commune: "68224"
        periode-inscription:
          periode:
            fin: "20270131"
            debut: "20250901"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 120
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: OEPRE
                "@info": programme-financeur
              - $: .
                "@info": ref-action-marche-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 9 Rue de Battenheim
commune: Mulhouse
publics:
  - personnes-exilees
courriel: ce.0680984A@ac-strasbourg.fr
date_maj: 2026-02-13
latitude: 47.751474
longitude: 7.349641
telephone: "+33389665177"
code_insee: "68224"
code_postal: "68100"
description: >-
  ### Objectif de la formation


  Les formations ont pour but d'améliorer les compétences des parents ayant un
  profil ALPHA et :  

  - d'apprendre, dans l'enceinte d'un établissement scolaire, la langue
  française à l'oral et à l'écrit en s'appropriant les principes et valeurs de
  la République en découvrant le fonctionnement de l'école ;  

  - afin d'acquérir les moyens d'aider ses propres enfants au cours de leur
  scolarité.  

  Validation et sanction :  

  - Attestation de suivi  

  - Validation possible selon le cas (DILF, DELF, DCL).


  ### Contenu de la formation


  Les formations portent sur trois axes d'apprentissage :  

  - l'acquisition du français (comprendre, parler, lire et écrire) ;  

  - la connaissance des valeurs de la République et leur mise en œuvre dans la
  société française ;  

  - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des
  élèves et des parents.  

  Cette formation est assurée par des enseignants en Français Langue Seconde ou
  des membres d'associations diplômés en FLE-FLS.
lien_source: https://formation.grandest.fr/accueil/formations/42048
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
  - lecture-ecriture-calcul--maitriser-le-calcul
structure_id: carif-oref--01_998
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Pas de condition specifique
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--01_998
  nom: Etablissement scolaire
  siret: "21680224900070"
  source: carif-oref
  adresse: 9 Rue de Battenheim
  commune: Mulhouse
  courriel: ce.0680984A@ac-strasbourg.fr
  date_maj: 2026-02-13
  doublons: []
  latitude: 47.751474
  site_web: null
  longitude: 7.349641
  telephone: "+33389665177"
  code_insee: "68224"
  code_postal: "68100"
  description: null
  lien_source: https://www.intercariforef.org/formations/etablissement-scolaire/organisme-01_998.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Ouvrir l'école aux parents pour la réussite des enfants - OEPRE

### Objectif de la formation

Les formations ont pour but d'améliorer les compétences des parents ayant un profil ALPHA et :  
- d'apprendre, dans l'enceinte d'un établissement scolaire, la langue française à l'oral et à l'écrit en s'appropriant les principes et valeurs de la République en découvrant le fonctionnement de l'école ;  
- afin d'acquérir les moyens d'aider ses propres enfants au cours de leur scolarité.  
Validation et sanction :  
- Attestation de suivi  
- Validation possible selon le cas (DILF, DELF, DCL).

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage :  
- l'acquisition du français (comprendre, parler, lire et écrire) ;  
- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  
- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.  
Cette formation est assurée par des enseignants en Français Langue Seconde ou des membres d'associations diplômés en FLE-FLS.

## Conditions d'accès

Pas de condition specifique$seed$, $seed${"id": "carif-oref--01_AL1954752", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "type": "formation", "extra": {"action": {"session": [{"@ref": "12112", "@numero": "GE1954752", "periode": {"fin": "20270131", "debut": "20250901"}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "non precise", "prenom": ".", "telfixe": {"numtel": ["0389665177"]}, "courriel": "ce.0680984A@ac-strasbourg.fr"}, "type-contact": "3"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"ligne": ["9 Rue de Battenheim"], "ville": "Mulhouse", "codepostal": "68100", "denomination": "9 rue de Battenheim Mulhouse", "code-INSEE-commune": "68224"}}, "periode-inscription": {"periode": {"fin": "20270131", "debut": "20250901"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "OEPRE", "@info": "programme-financeur"}, {"$": ".", "@info": "ref-action-marche-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "9 Rue de Battenheim", "commune": "Mulhouse", "publics": ["personnes-exilees"], "courriel": "ce.0680984A@ac-strasbourg.fr", "date_maj": "2026-02-13", "latitude": 47.751474, "longitude": 7.349641, "structure": {"id": "carif-oref--01_998", "nom": "Etablissement scolaire", "siret": "21680224900070", "source": "carif-oref", "adresse": "9 Rue de Battenheim", "commune": "Mulhouse", "courriel": "ce.0680984A@ac-strasbourg.fr", "date_maj": "2026-02-13", "doublons": [], "latitude": 47.751474, "site_web": null, "longitude": 7.349641, "telephone": "+33389665177", "code_insee": "68224", "code_postal": "68100", "description": null, "lien_source": "https://www.intercariforef.org/formations/etablissement-scolaire/organisme-01_998.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33389665177", "code_insee": "68224", "code_postal": "68100", "description": "### Objectif de la formation\n\nLes formations ont pour but d'améliorer les compétences des parents ayant un profil ALPHA et :  \n- d'apprendre, dans l'enceinte d'un établissement scolaire, la langue française à l'oral et à l'écrit en s'appropriant les principes et valeurs de la République en découvrant le fonctionnement de l'école ;  \n- afin d'acquérir les moyens d'aider ses propres enfants au cours de leur scolarité.  \nValidation et sanction :  \n- Attestation de suivi  \n- Validation possible selon le cas (DILF, DELF, DCL).\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :  \n- l'acquisition du français (comprendre, parler, lire et écrire) ;  \n- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  \n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.  \nCette formation est assurée par des enseignants en Français Langue Seconde ou des membres d'associations diplômés en FLE-FLS.", "lien_source": "https://formation.grandest.fr/accueil/formations/42048", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais", "lecture-ecriture-calcul--maitriser-le-calcul"], "structure_id": "carif-oref--01_998", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Pas de condition specifique", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$9a9b8908-1574-4f2e-b703-4914b39be27b$seed$, $seed$ebd35a40-42f7-42ec-bf34-cc194917f693$seed$, 1, $seed$DI$seed$, $seed$non_compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$23801143-693d-43f9-8712-bd2b4c519c32$seed$, $seed$2026-06-17 14:36:08.26557+00$seed$, $seed$2026-06-17 14:36:11.416705+00$seed$, $seed$---
id: carif-oref--01_GE1954642
nom: Ouvrir l'école aux parents pour la réussite des enfants - OEPRE
type: formation
extra:
  action:
    session:
      - "@ref": "12103"
        "@numero": GE1954642
        periode:
          fin: "20270131"
          debut: "20250901"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: non precise
              prenom: .
              telfixe:
                numtel:
                  - "0389697275"
              courriel: ce.0680951P@ac-strasbourg.fr
            type-contact: "3"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            ligne:
              - 44bis Rue de Mulhouse
            ville: Saint-Louis
            codepostal: "68300"
            denomination: Ecole primaire La Cigogne/Victor Hugo
            code-INSEE-commune: "68297"
        periode-inscription:
          periode:
            fin: "20270131"
            debut: "20250901"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 120
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: OEPRE
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 44bis Rue de Mulhouse
commune: Saint-Louis
publics:
  - personnes-exilees
courriel: ce.0680951P@ac-strasbourg.fr
date_maj: 2026-01-07
latitude: 47.588082
longitude: 7.560576
telephone: "+33389697275"
code_insee: "68297"
code_postal: "68300"
description: >-
  ### Objectif de la formation


  Union européenne, volontaires, en les impliquant notamment dans la scolarité
  de leur enfant.  

  Validation et sanction :  

  Attestation de suivi  

  Validation possible selon le cas (DELF, DCL)


  ### Contenu de la formation


  Les formations portent sur trois axes d'apprentissage :  

  - l'acquisition du français (comprendre, parler, lire et écrire) ;  

  - la connaissance des valeurs de la République et leur mise en œuvre dans la
  société française ;  

  - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des
  élèves et des parents.   

  Cette formation est assurée par des enseignants en Français Langue Seconde,
  des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS
lien_source: https://formation.grandest.fr/accueil/formations/69118
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
  - lecture-ecriture-calcul--maitriser-le-calcul
structure_id: carif-oref--01_GE304060
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Pas de condition specifique
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--01_GE304060
  nom: Ecole primaire La Cigogne/Victor Hugo
  siret: "21680297500070"
  source: carif-oref
  adresse: 44bis Rue de Mulhouse
  commune: Saint-Louis
  courriel: ce.0680951P@ac-strasbourg.fr
  date_maj: 2026-01-07
  doublons: []
  latitude: 47.588082
  site_web: null
  longitude: 7.560576
  telephone: "+33389697275"
  code_insee: "68297"
  code_postal: "68300"
  description: null
  lien_source: https://www.intercariforef.org/formations/ecole-primaire-la-cigogne-victor-hugo/organisme-01_GE304060.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Ouvrir l'école aux parents pour la réussite des enfants - OEPRE

### Objectif de la formation

Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.  
Validation et sanction :  
Attestation de suivi  
Validation possible selon le cas (DELF, DCL)

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage :  
- l'acquisition du français (comprendre, parler, lire et écrire) ;  
- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  
- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.   
Cette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS

## Conditions d'accès

Pas de condition specifique$seed$, $seed${"id": "carif-oref--01_GE1954642", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "type": "formation", "extra": {"action": {"session": [{"@ref": "12103", "@numero": "GE1954642", "periode": {"fin": "20270131", "debut": "20250901"}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "non precise", "prenom": ".", "telfixe": {"numtel": ["0389697275"]}, "courriel": "ce.0680951P@ac-strasbourg.fr"}, "type-contact": "3"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"ligne": ["44bis Rue de Mulhouse"], "ville": "Saint-Louis", "codepostal": "68300", "denomination": "Ecole primaire La Cigogne/Victor Hugo", "code-INSEE-commune": "68297"}}, "periode-inscription": {"periode": {"fin": "20270131", "debut": "20250901"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "OEPRE", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "44bis Rue de Mulhouse", "commune": "Saint-Louis", "publics": ["personnes-exilees"], "courriel": "ce.0680951P@ac-strasbourg.fr", "date_maj": "2026-01-07", "latitude": 47.588082, "longitude": 7.560576, "structure": {"id": "carif-oref--01_GE304060", "nom": "Ecole primaire La Cigogne/Victor Hugo", "siret": "21680297500070", "source": "carif-oref", "adresse": "44bis Rue de Mulhouse", "commune": "Saint-Louis", "courriel": "ce.0680951P@ac-strasbourg.fr", "date_maj": "2026-01-07", "doublons": [], "latitude": 47.588082, "site_web": null, "longitude": 7.560576, "telephone": "+33389697275", "code_insee": "68297", "code_postal": "68300", "description": null, "lien_source": "https://www.intercariforef.org/formations/ecole-primaire-la-cigogne-victor-hugo/organisme-01_GE304060.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33389697275", "code_insee": "68297", "code_postal": "68300", "description": "### Objectif de la formation\n\nUnion européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.  \nValidation et sanction :  \nAttestation de suivi  \nValidation possible selon le cas (DELF, DCL)\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :  \n- l'acquisition du français (comprendre, parler, lire et écrire) ;  \n- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  \n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.   \nCette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS", "lien_source": "https://formation.grandest.fr/accueil/formations/69118", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais", "lecture-ecriture-calcul--maitriser-le-calcul"], "structure_id": "carif-oref--01_GE304060", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Pas de condition specifique", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$d3dc61c8-4960-49bd-b0f8-98ffaa9eca74$seed$, $seed$3ce39ecf-ab8c-437b-b322-5a759fddfaca$seed$, 1, $seed$DI$seed$, $seed$non_compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$dcf7b4f9-93f8-4955-8446-0da83ff7ba86$seed$, $seed$2026-06-17 14:36:08.26557+00$seed$, $seed$2026-06-17 14:36:11.416705+00$seed$, $seed$---
id: carif-oref--01_GE1954623
nom: Ouvrir l'école aux parents pour la réussite des enfants - OEPRE
type: formation
extra:
  action:
    session:
      - "@ref": "12100"
        "@numero": GE1954623
        periode:
          fin: "20270131"
          debut: "20250901"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: non precise
              prenom: .
              telfixe:
                numtel:
                  - "0389464334"
              courriel: ce.0681467A@ac-strasbourg.fr
            type-contact: "3"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            ligne:
              - 26 rue des Jonquilles - Modenheim
            ville: Illzach
            codepostal: "68110"
            denomination: Ecole élémentaire Les Jonquilles
            code-INSEE-commune: "68154"
        periode-inscription:
          periode:
            fin: "20270131"
            debut: "20250901"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 120
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: OEPRE
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 26 Rue des Jonquilles
commune: Illzach
publics:
  - personnes-exilees
courriel: ce.0681467A@ac-strasbourg.fr
date_maj: 2026-01-07
latitude: 47.763499
longitude: 7.367055
telephone: "+33389464334"
code_insee: "68154"
code_postal: "68110"
description: >-
  ### Objectif de la formation


  Les formations ont pour but de favoriser l'intégration des parents d'élèves,
  primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en
  les impliquant notamment dans la scolarité de leur enfant.  

  Validation et sanction :  

  Attestation de suivi  

  Validation possible selon le cas (DELF, DCL)


  ### Contenu de la formation


  Les formations portent sur trois axes d'apprentissage :  

  - l'acquisition du français (comprendre, parler, lire et écrire) ;  

  - la connaissance des valeurs de la République et leur mise en œuvre dans la
  société française ;  

  - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des
  élèves et des parents.   

  Cette formation est assurée par des enseignants en Français Langue Seconde,
  des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS
lien_source: https://formation.grandest.fr/accueil/formations/69111
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
  - lecture-ecriture-calcul--maitriser-le-calcul
structure_id: carif-oref--01_GE304052
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Pas de condition specifique
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--01_GE304052
  nom: Ecole élémentaire Les Jonquilles
  siret: "21680154800118"
  source: carif-oref
  adresse: 26 Rue des Jonquilles
  commune: Illzach
  courriel: ce.0681467A@ac-strasbourg.fr
  date_maj: 2026-01-07
  doublons: []
  latitude: 47.763499
  site_web: null
  longitude: 7.367055
  telephone: "+33389464334"
  code_insee: "68154"
  code_postal: "68110"
  description: null
  lien_source: https://www.intercariforef.org/formations/ecole-elementaire-les-jonquilles/organisme-01_GE304052.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Ouvrir l'école aux parents pour la réussite des enfants - OEPRE

### Objectif de la formation

Les formations ont pour but de favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.  
Validation et sanction :  
Attestation de suivi  
Validation possible selon le cas (DELF, DCL)

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage :  
- l'acquisition du français (comprendre, parler, lire et écrire) ;  
- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  
- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.   
Cette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS

## Conditions d'accès

Pas de condition specifique$seed$, $seed${"id": "carif-oref--01_GE1954623", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "type": "formation", "extra": {"action": {"session": [{"@ref": "12100", "@numero": "GE1954623", "periode": {"fin": "20270131", "debut": "20250901"}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "non precise", "prenom": ".", "telfixe": {"numtel": ["0389464334"]}, "courriel": "ce.0681467A@ac-strasbourg.fr"}, "type-contact": "3"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"ligne": ["26 rue des Jonquilles - Modenheim"], "ville": "Illzach", "codepostal": "68110", "denomination": "Ecole élémentaire Les Jonquilles", "code-INSEE-commune": "68154"}}, "periode-inscription": {"periode": {"fin": "20270131", "debut": "20250901"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "OEPRE", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "26 Rue des Jonquilles", "commune": "Illzach", "publics": ["personnes-exilees"], "courriel": "ce.0681467A@ac-strasbourg.fr", "date_maj": "2026-01-07", "latitude": 47.763499, "longitude": 7.367055, "structure": {"id": "carif-oref--01_GE304052", "nom": "Ecole élémentaire Les Jonquilles", "siret": "21680154800118", "source": "carif-oref", "adresse": "26 Rue des Jonquilles", "commune": "Illzach", "courriel": "ce.0681467A@ac-strasbourg.fr", "date_maj": "2026-01-07", "doublons": [], "latitude": 47.763499, "site_web": null, "longitude": 7.367055, "telephone": "+33389464334", "code_insee": "68154", "code_postal": "68110", "description": null, "lien_source": "https://www.intercariforef.org/formations/ecole-elementaire-les-jonquilles/organisme-01_GE304052.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33389464334", "code_insee": "68154", "code_postal": "68110", "description": "### Objectif de la formation\n\nLes formations ont pour but de favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.  \nValidation et sanction :  \nAttestation de suivi  \nValidation possible selon le cas (DELF, DCL)\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :  \n- l'acquisition du français (comprendre, parler, lire et écrire) ;  \n- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  \n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.   \nCette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS", "lien_source": "https://formation.grandest.fr/accueil/formations/69111", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais", "lecture-ecriture-calcul--maitriser-le-calcul"], "structure_id": "carif-oref--01_GE304052", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Pas de condition specifique", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$2ffcc5e2-6ac2-4dd9-ac95-d9118937b5ee$seed$, $seed$bcbec07f-fb11-44d8-8365-026f98a689b6$seed$, 1, $seed$DI$seed$, $seed$non_compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$3e91f40e-a915-4a96-a887-913236359066$seed$, $seed$2026-06-17 14:36:08.26557+00$seed$, $seed$2026-06-17 14:36:11.416705+00$seed$, $seed$---
id: carif-oref--01_GE1954693
nom: Ouvrir l'école aux parents pour la réussite des enfants - OEPRE
type: formation
extra:
  action:
    session:
      - "@ref": "12108"
        "@numero": GE1954693
        periode:
          fin: "20270131"
          debut: "20250901"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: non precise
              prenom: .
              telfixe:
                numtel:
                  - "0389524018"
              courriel: ce.0680695L@ac-strasbourg.fr
            type-contact: "3"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            ligne:
              - 5 rue des Perdrix - Strueth
            ville: Kingersheim
            codepostal: "68260"
            denomination: Ecole primaire Les Perdrix - Strueth
            code-INSEE-commune: "68166"
        periode-inscription:
          periode:
            fin: "20270131"
            debut: "20250901"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 120
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: OEPRE
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 5 Rue des Perdrix
commune: Kingersheim
publics:
  - personnes-exilees
courriel: ce.0680695L@ac-strasbourg.fr
date_maj: 2026-01-07
latitude: 47.783152
longitude: 7.314759
telephone: "+33389524018"
code_insee: "68166"
code_postal: "68260"
description: >-
  ### Objectif de la formation


  Les formations ont pour but de favoriser l'intégration des parents d'élèves,
  primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en
  les impliquant notamment dans la scolarité de leur enfant.  

  Validation et sanction :  

  Attestation de suivi  

  Validation possible selon le cas (DELF, DCL)


  ### Contenu de la formation


  Les formations portent sur trois axes d'apprentissage :  

  - l'acquisition du français (comprendre, parler, lire et écrire) ;  

  - la connaissance des valeurs de la République et leur mise en œuvre dans la
  société française ;  

  - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des
  élèves et des parents.   

  Cette formation est assurée par des enseignants en Français Langue Seconde,
  des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS
lien_source: https://formation.grandest.fr/accueil/formations/69117
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
  - lecture-ecriture-calcul--maitriser-le-calcul
structure_id: carif-oref--01_GE304059
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Pas de condition specifique
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--01_GE304059
  nom: Ecole primaire Les Perdrix - Strueth
  siret: "21680166200075"
  source: carif-oref
  adresse: 5 Rue des Perdrix
  commune: Kingersheim
  courriel: ce.0680695L@ac-strasbourg.fr
  date_maj: 2026-01-07
  doublons: []
  latitude: 47.783152
  site_web: null
  longitude: 7.314759
  telephone: "+33389524018"
  code_insee: "68166"
  code_postal: "68260"
  description: null
  lien_source: https://www.intercariforef.org/formations/ecole-primaire-les-perdrix-strueth/organisme-01_GE304059.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Ouvrir l'école aux parents pour la réussite des enfants - OEPRE

### Objectif de la formation

Les formations ont pour but de favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.  
Validation et sanction :  
Attestation de suivi  
Validation possible selon le cas (DELF, DCL)

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage :  
- l'acquisition du français (comprendre, parler, lire et écrire) ;  
- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  
- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.   
Cette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS

## Conditions d'accès

Pas de condition specifique$seed$, $seed${"id": "carif-oref--01_GE1954693", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "type": "formation", "extra": {"action": {"session": [{"@ref": "12108", "@numero": "GE1954693", "periode": {"fin": "20270131", "debut": "20250901"}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "non precise", "prenom": ".", "telfixe": {"numtel": ["0389524018"]}, "courriel": "ce.0680695L@ac-strasbourg.fr"}, "type-contact": "3"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"ligne": ["5 rue des Perdrix - Strueth"], "ville": "Kingersheim", "codepostal": "68260", "denomination": "Ecole primaire Les Perdrix - Strueth", "code-INSEE-commune": "68166"}}, "periode-inscription": {"periode": {"fin": "20270131", "debut": "20250901"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "OEPRE", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "5 Rue des Perdrix", "commune": "Kingersheim", "publics": ["personnes-exilees"], "courriel": "ce.0680695L@ac-strasbourg.fr", "date_maj": "2026-01-07", "latitude": 47.783152, "longitude": 7.314759, "structure": {"id": "carif-oref--01_GE304059", "nom": "Ecole primaire Les Perdrix - Strueth", "siret": "21680166200075", "source": "carif-oref", "adresse": "5 Rue des Perdrix", "commune": "Kingersheim", "courriel": "ce.0680695L@ac-strasbourg.fr", "date_maj": "2026-01-07", "doublons": [], "latitude": 47.783152, "site_web": null, "longitude": 7.314759, "telephone": "+33389524018", "code_insee": "68166", "code_postal": "68260", "description": null, "lien_source": "https://www.intercariforef.org/formations/ecole-primaire-les-perdrix-strueth/organisme-01_GE304059.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33389524018", "code_insee": "68166", "code_postal": "68260", "description": "### Objectif de la formation\n\nLes formations ont pour but de favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.  \nValidation et sanction :  \nAttestation de suivi  \nValidation possible selon le cas (DELF, DCL)\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :  \n- l'acquisition du français (comprendre, parler, lire et écrire) ;  \n- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  \n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.   \nCette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS", "lien_source": "https://formation.grandest.fr/accueil/formations/69117", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais", "lecture-ecriture-calcul--maitriser-le-calcul"], "structure_id": "carif-oref--01_GE304059", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Pas de condition specifique", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$4c32108f-82cc-4a21-a9fb-d0d43ca8280f$seed$, $seed$59820b8b-7a55-488f-b263-1199e2cf1e5f$seed$, 1, $seed$DI$seed$, $seed$error$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$fffeb72c-673a-494f-a3da-dec259c07e00$seed$, $seed$2026-06-17 14:36:08.26557+00$seed$, $seed$2026-06-17 14:36:11.416705+00$seed$, $seed$---
id: carif-oref--01_GE1954656
nom: Ouvrir l'école aux parents pour la réussite des enfants - OEPRE
type: formation
extra:
  action:
    session:
      - "@ref": "12105"
        "@numero": GE1954656
        periode:
          fin: "20270131"
          debut: "20250901"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: non precise
              prenom: .
              telfixe:
                numtel:
                  - "0389082334"
              courriel: ce.0680014w@ac-strasbourg.fr
            type-contact: "3"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            ligne:
              - 2 rue Alphonse Jenn
            ville: Ferrette
            codepostal: "68480"
            denomination: Collège Adélaïde Hautval
            code-INSEE-commune: "68090"
        periode-inscription:
          periode:
            fin: "20270131"
            debut: "20250901"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 120
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: OEPRE
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 2 Rue Alphonse Jenn
commune: Ferrette
publics:
  - personnes-exilees
courriel: ce.0680014w@ac-strasbourg.fr
date_maj: 2026-01-07
latitude: 47.501117
longitude: 7.309948
telephone: "+33389082334"
code_insee: "68090"
code_postal: "68480"
description: >-
  ### Objectif de la formation


  Les formations ont pour but de favoriser l'intégration des parents d'élèves,
  primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en
  les impliquant notamment dans la scolarité de leur enfant.  

  Validation et sanction :  

  Attestation de suivi  

  Validation possible selon le cas (DELF, DCL)


  ### Contenu de la formation


  Les formations portent sur trois axes d'apprentissage :  

  - l'acquisition du français (comprendre, parler, lire et écrire) ;  

  - la connaissance des valeurs de la République et leur mise en œuvre dans la
  société française ;  

  - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des
  élèves et des parents.   

  Cette formation est assurée par des enseignants en Français Langue Seconde,
  des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS
lien_source: https://formation.grandest.fr/accueil/formations/69101
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
  - lecture-ecriture-calcul--maitriser-le-calcul
structure_id: carif-oref--01_GE304044
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Pas de condition specifique
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--01_GE304044
  nom: Collège de Ferrette
  siret: "19680014800013"
  source: carif-oref
  adresse: 2 Rue Alphonse Jenn
  commune: Ferrette
  courriel: ce.0680014w@ac-strasbourg.fr
  date_maj: 2026-01-07
  doublons: []
  latitude: 47.501117
  site_web: null
  longitude: 7.309948
  telephone: "+33389082334"
  code_insee: "68090"
  code_postal: "68480"
  description: null
  lien_source: https://www.intercariforef.org/formations/college-de-ferrette/organisme-01_GE304044.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Ouvrir l'école aux parents pour la réussite des enfants - OEPRE

### Objectif de la formation

Les formations ont pour but de favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.  
Validation et sanction :  
Attestation de suivi  
Validation possible selon le cas (DELF, DCL)

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage :  
- l'acquisition du français (comprendre, parler, lire et écrire) ;  
- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  
- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.   
Cette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS

## Conditions d'accès

Pas de condition specifique$seed$, $seed${"id": "carif-oref--01_GE1954656", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "type": "formation", "extra": {"action": {"session": [{"@ref": "12105", "@numero": "GE1954656", "periode": {"fin": "20270131", "debut": "20250901"}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "non precise", "prenom": ".", "telfixe": {"numtel": ["0389082334"]}, "courriel": "ce.0680014w@ac-strasbourg.fr"}, "type-contact": "3"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"ligne": ["2 rue Alphonse Jenn"], "ville": "Ferrette", "codepostal": "68480", "denomination": "Collège Adélaïde Hautval", "code-INSEE-commune": "68090"}}, "periode-inscription": {"periode": {"fin": "20270131", "debut": "20250901"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "OEPRE", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "2 Rue Alphonse Jenn", "commune": "Ferrette", "publics": ["personnes-exilees"], "courriel": "ce.0680014w@ac-strasbourg.fr", "date_maj": "2026-01-07", "latitude": 47.501117, "longitude": 7.309948, "structure": {"id": "carif-oref--01_GE304044", "nom": "Collège de Ferrette", "siret": "19680014800013", "source": "carif-oref", "adresse": "2 Rue Alphonse Jenn", "commune": "Ferrette", "courriel": "ce.0680014w@ac-strasbourg.fr", "date_maj": "2026-01-07", "doublons": [], "latitude": 47.501117, "site_web": null, "longitude": 7.309948, "telephone": "+33389082334", "code_insee": "68090", "code_postal": "68480", "description": null, "lien_source": "https://www.intercariforef.org/formations/college-de-ferrette/organisme-01_GE304044.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33389082334", "code_insee": "68090", "code_postal": "68480", "description": "### Objectif de la formation\n\nLes formations ont pour but de favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.  \nValidation et sanction :  \nAttestation de suivi  \nValidation possible selon le cas (DELF, DCL)\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :  \n- l'acquisition du français (comprendre, parler, lire et écrire) ;  \n- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  \n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.   \nCette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS", "lien_source": "https://formation.grandest.fr/accueil/formations/69101", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais", "lecture-ecriture-calcul--maitriser-le-calcul"], "structure_id": "carif-oref--01_GE304044", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Pas de condition specifique", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$d1ef8b6f-26ff-4dcf-94f4-e64f5fb8fb7a$seed$, $seed$3dce6bda-4d49-4131-bc92-a5baf9d13b13$seed$, 1, $seed$DI$seed$, $seed$non_compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$1359b67d-0008-40f5-b011-f1ed64c177fe$seed$, $seed$2026-06-17 14:36:08.26557+00$seed$, $seed$2026-06-17 14:36:11.416705+00$seed$, $seed$---
id: carif-oref--01_GE1954648
nom: Ouvrir l'école aux parents pour la réussite des enfants - OEPRE
type: formation
extra:
  action:
    session:
      - "@ref": "12104"
        "@numero": GE1954648
        periode:
          fin: "20270131"
          debut: "20250901"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: non precise
              prenom: .
              telfixe:
                numtel:
                  - "0389690411"
              courriel: ce.0681831w@ac-strasbourg.fr
            type-contact: "3"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            ligne:
              - 5 rue de Mulhouse
            ville: Huningue
            codepostal: "68330"
            denomination: Ecole élémentaire Marcel Pagnol
            code-INSEE-commune: "68149"
        periode-inscription:
          periode:
            fin: "20270131"
            debut: "20250901"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 120
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: OEPRE
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 5 Rue de Mulhouse
commune: Huningue
publics:
  - personnes-exilees
courriel: ce.0681831w@ac-strasbourg.fr
date_maj: 2026-01-07
latitude: 47.595174
longitude: 7.585898
telephone: "+33389690411"
code_insee: "68149"
code_postal: "68330"
description: >-
  ### Objectif de la formation


  Les formations ont pour but de favoriser l'intégration des parents d'élèves,
  primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en
  les impliquant notamment dans la scolarité de leur enfant.  

  Validation et sanction :  

  Attestation de suivi  

  Validation possible selon le cas (DELF, DCL)


  ### Contenu de la formation


  Les formations portent sur trois axes d'apprentissage :  

  - l'acquisition du français (comprendre, parler, lire et écrire) ;  

  - la connaissance des valeurs de la République et leur mise en œuvre dans la
  société française ;  

  - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des
  élèves et des parents.   

  Cette formation est assurée par des enseignants en Français Langue Seconde,
  des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS
lien_source: https://formation.grandest.fr/accueil/formations/69114
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
  - lecture-ecriture-calcul--maitriser-le-calcul
structure_id: carif-oref--01_GE304058
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Pas de condition specifique
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--01_GE304058
  nom: Ecole élémentaire Marcel Pagnol
  siret: "21680149800058"
  source: carif-oref
  adresse: 5 Rue de Mulhouse
  commune: Huningue
  courriel: ce.0681831w@ac-strasbourg.fr
  date_maj: 2026-01-07
  doublons: []
  latitude: 47.595174
  site_web: null
  longitude: 7.585898
  telephone: "+33389690411"
  code_insee: "68149"
  code_postal: "68330"
  description: null
  lien_source: https://www.intercariforef.org/formations/ecole-elementaire-marcel-pagnol/organisme-01_GE304058.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Ouvrir l'école aux parents pour la réussite des enfants - OEPRE

### Objectif de la formation

Les formations ont pour but de favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.  
Validation et sanction :  
Attestation de suivi  
Validation possible selon le cas (DELF, DCL)

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage :  
- l'acquisition du français (comprendre, parler, lire et écrire) ;  
- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  
- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.   
Cette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS

## Conditions d'accès

Pas de condition specifique$seed$, $seed${"id": "carif-oref--01_GE1954648", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "type": "formation", "extra": {"action": {"session": [{"@ref": "12104", "@numero": "GE1954648", "periode": {"fin": "20270131", "debut": "20250901"}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "non precise", "prenom": ".", "telfixe": {"numtel": ["0389690411"]}, "courriel": "ce.0681831w@ac-strasbourg.fr"}, "type-contact": "3"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"ligne": ["5 rue de Mulhouse"], "ville": "Huningue", "codepostal": "68330", "denomination": "Ecole élémentaire Marcel Pagnol", "code-INSEE-commune": "68149"}}, "periode-inscription": {"periode": {"fin": "20270131", "debut": "20250901"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "OEPRE", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "5 Rue de Mulhouse", "commune": "Huningue", "publics": ["personnes-exilees"], "courriel": "ce.0681831w@ac-strasbourg.fr", "date_maj": "2026-01-07", "latitude": 47.595174, "longitude": 7.585898, "structure": {"id": "carif-oref--01_GE304058", "nom": "Ecole élémentaire Marcel Pagnol", "siret": "21680149800058", "source": "carif-oref", "adresse": "5 Rue de Mulhouse", "commune": "Huningue", "courriel": "ce.0681831w@ac-strasbourg.fr", "date_maj": "2026-01-07", "doublons": [], "latitude": 47.595174, "site_web": null, "longitude": 7.585898, "telephone": "+33389690411", "code_insee": "68149", "code_postal": "68330", "description": null, "lien_source": "https://www.intercariforef.org/formations/ecole-elementaire-marcel-pagnol/organisme-01_GE304058.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33389690411", "code_insee": "68149", "code_postal": "68330", "description": "### Objectif de la formation\n\nLes formations ont pour but de favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.  \nValidation et sanction :  \nAttestation de suivi  \nValidation possible selon le cas (DELF, DCL)\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :  \n- l'acquisition du français (comprendre, parler, lire et écrire) ;  \n- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  \n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.   \nCette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS", "lien_source": "https://formation.grandest.fr/accueil/formations/69114", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais", "lecture-ecriture-calcul--maitriser-le-calcul"], "structure_id": "carif-oref--01_GE304058", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Pas de condition specifique", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$4b069dcb-d416-471e-aae5-fb9e2c69df71$seed$, $seed$4a2d6870-fd45-4216-b5fd-1a95db5376a2$seed$, 1, $seed$DI$seed$, $seed$non_compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$728bfb51-1b93-485e-8181-9068a4262d2d$seed$, $seed$2026-06-17 14:36:08.26557+00$seed$, $seed$2026-06-17 14:36:11.416705+00$seed$, $seed$---
id: carif-oref--01_GE1954628
nom: Ouvrir l'école aux parents pour la réussite des enfants - OEPRE
type: formation
extra:
  action:
    session:
      - "@ref": "12101"
        "@numero": GE1954628
        periode:
          fin: "20270131"
          debut: "20250901"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: non precise
              prenom: .
              telfixe:
                numtel:
                  - "0383556007"
              courriel: ce.0540111C@ac-nancy-metz.fr
            type-contact: "3"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            ligne:
              - 12 Rue Jacques Callot
            ville: Vandœuvre-lès-Nancy
            codepostal: "54500"
            denomination: Collège Jacques Callot
            code-INSEE-commune: "54547"
        periode-inscription:
          periode:
            fin: "20270131"
            debut: "20250901"
        reference-certification:
          - reference-code-CERTIFINFO: "62926"
          - reference-code-RS: RS5455
            reference-code-CERTIFINFO: "68846"
          - reference-code-CERTIFINFO: "109659"
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 120
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: OEPRE
                "@info": programme-financeur
              - $: .
                "@info": ref-action-marche-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 12 Rue Jacques Callot
commune: Vandœuvre-lès-Nancy
publics:
  - personnes-exilees
courriel: ce.0540111C@ac-nancy-metz.fr
date_maj: 2026-01-12
latitude: 48.666422
longitude: 6.163611
telephone: "+33383556007"
code_insee: "54547"
code_postal: "54500"
description: >-
  ### Objectif de la formation


  Les formations ont pour but d'améliorer les compétences des parents ayant un
  profil ALPHA et :  

  - d'apprendre, dans l'enceinte d'un établissement scolaire, la langue
  française à l'oral et à l'écrit en s'appropriant les principes et valeurs de
  la République en découvrant le fonctionnement de l'école ;  

  - afin d'acquérir les moyens d'aider ses propres enfants au cours de leur
  scolarité.  

  Validation et sanction :  

  - Attestation de suivi  

  - Validation possible selon le cas (DILF, DELF, DCL).


  ### Contenu de la formation


  Les formations portent sur trois axes d'apprentissage :  

  - l'acquisition du français (comprendre, parler, lire et écrire) ;  

  - la connaissance des valeurs de la République et leur mise en œuvre dans la
  société française ;  

  - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des
  élèves et des parents.  

  Cette formation est assurée par des enseignants en Français Langue Seconde ou
  des membres d'associations diplômés en FLE-FLS.
lien_source: https://formation.grandest.fr/accueil/formations/45398
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
  - lecture-ecriture-calcul--maitriser-le-calcul
structure_id: carif-oref--17_7908
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Pas de condition specifique
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--17_7908
  nom: Collège Jacques Callot
  siret: "19540111200014"
  source: carif-oref
  adresse: 12 Rue Jacques Callot
  commune: Vandœuvre-lès-Nancy
  courriel: ce.0540111C@ac-nancy-metz.fr
  date_maj: 2026-01-12
  doublons: []
  latitude: 48.666422
  site_web: null
  longitude: 6.163611
  telephone: "+33383556007"
  code_insee: "54547"
  code_postal: "54500"
  description: null
  lien_source: https://www.intercariforef.org/formations/college-jacques-callot/organisme-17_7908.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Ouvrir l'école aux parents pour la réussite des enfants - OEPRE

### Objectif de la formation

Les formations ont pour but d'améliorer les compétences des parents ayant un profil ALPHA et :  
- d'apprendre, dans l'enceinte d'un établissement scolaire, la langue française à l'oral et à l'écrit en s'appropriant les principes et valeurs de la République en découvrant le fonctionnement de l'école ;  
- afin d'acquérir les moyens d'aider ses propres enfants au cours de leur scolarité.  
Validation et sanction :  
- Attestation de suivi  
- Validation possible selon le cas (DILF, DELF, DCL).

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage :  
- l'acquisition du français (comprendre, parler, lire et écrire) ;  
- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  
- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.  
Cette formation est assurée par des enseignants en Français Langue Seconde ou des membres d'associations diplômés en FLE-FLS.

## Conditions d'accès

Pas de condition specifique$seed$, $seed${"id": "carif-oref--01_GE1954628", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "type": "formation", "extra": {"action": {"session": [{"@ref": "12101", "@numero": "GE1954628", "periode": {"fin": "20270131", "debut": "20250901"}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "non precise", "prenom": ".", "telfixe": {"numtel": ["0383556007"]}, "courriel": "ce.0540111C@ac-nancy-metz.fr"}, "type-contact": "3"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"ligne": ["12 Rue Jacques Callot"], "ville": "Vandœuvre-lès-Nancy", "codepostal": "54500", "denomination": "Collège Jacques Callot", "code-INSEE-commune": "54547"}}, "periode-inscription": {"periode": {"fin": "20270131", "debut": "20250901"}}, "reference-certification": [{"reference-code-CERTIFINFO": "62926"}, {"reference-code-RS": "RS5455", "reference-code-CERTIFINFO": "68846"}, {"reference-code-CERTIFINFO": "109659"}]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "OEPRE", "@info": "programme-financeur"}, {"$": ".", "@info": "ref-action-marche-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "12 Rue Jacques Callot", "commune": "Vandœuvre-lès-Nancy", "publics": ["personnes-exilees"], "courriel": "ce.0540111C@ac-nancy-metz.fr", "date_maj": "2026-01-12", "latitude": 48.666422, "longitude": 6.163611, "structure": {"id": "carif-oref--17_7908", "nom": "Collège Jacques Callot", "siret": "19540111200014", "source": "carif-oref", "adresse": "12 Rue Jacques Callot", "commune": "Vandœuvre-lès-Nancy", "courriel": "ce.0540111C@ac-nancy-metz.fr", "date_maj": "2026-01-12", "doublons": [], "latitude": 48.666422, "site_web": null, "longitude": 6.163611, "telephone": "+33383556007", "code_insee": "54547", "code_postal": "54500", "description": null, "lien_source": "https://www.intercariforef.org/formations/college-jacques-callot/organisme-17_7908.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33383556007", "code_insee": "54547", "code_postal": "54500", "description": "### Objectif de la formation\n\nLes formations ont pour but d'améliorer les compétences des parents ayant un profil ALPHA et :  \n- d'apprendre, dans l'enceinte d'un établissement scolaire, la langue française à l'oral et à l'écrit en s'appropriant les principes et valeurs de la République en découvrant le fonctionnement de l'école ;  \n- afin d'acquérir les moyens d'aider ses propres enfants au cours de leur scolarité.  \nValidation et sanction :  \n- Attestation de suivi  \n- Validation possible selon le cas (DILF, DELF, DCL).\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :  \n- l'acquisition du français (comprendre, parler, lire et écrire) ;  \n- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  \n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.  \nCette formation est assurée par des enseignants en Français Langue Seconde ou des membres d'associations diplômés en FLE-FLS.", "lien_source": "https://formation.grandest.fr/accueil/formations/45398", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais", "lecture-ecriture-calcul--maitriser-le-calcul"], "structure_id": "carif-oref--17_7908", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Pas de condition specifique", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$dbdffc07-f92e-449b-88aa-33ba0eee876d$seed$, $seed$bdc10a0c-676a-451d-872e-723e63f2ef2c$seed$, 1, $seed$DI$seed$, $seed$non_compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$c709b3a0-7956-42d4-990b-5f137e435035$seed$, $seed$2026-06-17 14:36:08.26557+00$seed$, $seed$2026-06-17 14:36:11.416705+00$seed$, $seed$---
id: carif-oref--01_GE1848681
nom: DAEU diplôme d'accès aux études universitaires option A
type: formation
extra:
  action:
    session:
      - "@ref": "13821"
        "@numero": GE1848681
        periode:
          fin: "20260605"
          debut: "20250915"
        recrutement:
          - "@numero": 01_GE856528
            adresse:
              ligne:
                - Rue des Freres Lumiere
              ville: Mulhouse
              codepostal: "68200"
              departement: "68"
              denomination: SERFA
              code-INSEE-commune: "68224"
            periode:
              fin: "20250903"
              debut: "20250903"
            heure-fin: 20h00
            nb-places: 30
            a-distance: "0"
            heure-debut: 18h30
            modalite-recrutement: "9"
            code-perimetre-recrutement: "3"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: RETHABER
              prenom: Aurelia
              telfixe:
                numtel:
                  - "0389336500"
              courriel: aurelia.rethaber@uha.fr
            type-contact: "0"
        etat-recrutement: "1"
        blocs-competences:
          - bloc-competences:
              - code-bloc: RNCP40181BC01
                libelle-bloc: Accueillir, orienter et accompagner les différents types de
                  publics
              - code-bloc: RNCP40181BC02
                libelle-bloc: Organiser et gérer des tâches administratives simples
              - code-bloc: RNCP40181BC03
                libelle-bloc: Suivre et vérifier ses activités
              - code-bloc: RNCP40181BC04
                libelle-bloc: Communiquer à l'écrit et à l'oral
              - code-bloc: RNCP40181BC05
                libelle-bloc: Rechercher et partager des informations et des données, en
                  intégrant l'évolution des technologies
            validation-blocs: "1"
            reference-certification:
              reference-code-CERTIFINFO: "118300"
        adresse-inscription:
          adresse:
            ligne:
              - Rue des Freres Lumiere
            ville: Mulhouse
            codepostal: "68200"
            denomination: SERFA
            code-INSEE-commune: "68224"
        periode-inscription:
          periode:
            fin: "20250905"
            debut: "20250519"
        modalites-inscription: Dossier d inscription, entretien et tests de positionnement
        reference-certification:
          - reference-code-RNCP: "40181"
            reference-code-CERTIFINFO: "118300"
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 320
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "80006"
                "@ref": V14
                "@info": code-public-vise
              - $: Accord cadre université
                "@info": programme-financeur
              - $: 2025-30973
                "@info": ref-action-marche-financeur
        code-financeur: "2"
        nb-places-financees: 14
    modalites-recrutement: >-
      Le D.A.E.U (Diplôme d'Accès aux Études Universitaires) est accessible à
      toute personne ayant interrompu ses études initiales depuis 2 ans et
      satisfaisant à l'une des conditions suivantes :


      - Avoir au moins 20 ans au 1er octobre de l'année de l'examen et justifier
      de deux année d'activité professionnelle salariée ou d'une activité ayant
      donné lieu à deux années de cotisation à la sécurité sociale (périodes de
      chômage avec inscription à France Travail, éducation d'un enfant,
      participation à un dispositif de formation professionnelle, exercice d'une
      activité sportive de haut niveau, ... etc.).


      - Avoir 24 ans ou plus au 1er octobre de l'année de l'examen.
    modalites-enseignement: "0"
    modalites-entrees-sorties: "0"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "14"
frais: gratuit
source: carif-oref
adresse: Rue des Frères Lumière
commune: Mulhouse
publics:
  - demandeurs-emploi
courriel: severine.gourmelon@uha.fr
date_maj: 2025-10-15
latitude: 47.732154
longitude: 7.315176
telephone: "+33389336504"
code_insee: "68224"
code_postal: "68200"
description: >-
  ### Objectif de la formation


  Le D.A.E.U (Diplôme d'Accès aux Études Universitaires) A accorde les mêmes
  droits que le baccalauréat, notamment en termes d'accès aux études
  supérieures.


  Il est destiné aux personnes ayant interrompu leurs études sans avoir le
  baccalauréat ni un diplôme admis en équivalence.


  ### Contenu de la formation


  2 matières obligatoires : 90 heures/an par matière :  

  - Français  

  - Langue vivante : Anglais, Allemand, Italien ou Espagnol (ces trois dernières
  langues ne sont pas préparées au SERFA mais peuvent être présentées à
  l'examen).


  2 matières au choix, 70 heures/an par matière, à choisir parmi :  

  - Mathématiques  

  - Histoire contemporaine  

  - Géographie
lien_source: https://formation.grandest.fr/accueil/formations/137095
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
  - lecture-ecriture-calcul--maitriser-le-calcul
structure_id: carif-oref--01_203
modes_accueil:
  - en-presentiel
score_qualite: 0.99
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: >-
  Niveau de classe terminale ou de premiere de l enseignement secondaire ou
  equivalent.

  De plus, les personnes de nationalite etrangere doivent etre titulaires d un
  permis de sejour en cours de validite au 31 octobre de l annee de l examen
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: >-
  Le D.A.E.U (Diplôme d'Accès aux Études Universitaires) est accessible à toute
  personne ayant interrompu ses études initiales depuis 2 ans et satisfaisant à
  l'une des conditions suivantes :


  - Avoir au moins 20 ans au 1er octobre de l'année de l'examen et justifier de
  deux année d'activité professionnelle salariée ou d'une activité ayant donné
  lieu à deux années de cotisation à la sécurité sociale (périodes de chômage
  avec inscription à France Travail, éducation d'un enfant, participation à un
  dispositif de formation professionnelle, exercice d'une activité sportive de
  haut niveau, ... etc.).


  - Avoir 24 ans ou plus au 1er octobre de l'année de l'examen.
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--01_203
  nom: Université de Haute Alsace SERFA
  siret: "19681166500278"
  source: carif-oref
  adresse: Rue des Frères Lumière
  commune: Mulhouse
  courriel: severine.gourmelon@uha.fr
  date_maj: 2026-02-03
  doublons: []
  latitude: 47.732154
  site_web: https://www.serfa.fr/
  longitude: 7.315176
  telephone: "+33389336504"
  code_insee: "68224"
  code_postal: "68200"
  description: null
  lien_source: https://www.intercariforef.org/formations/universite-de-haute-alsace-serfa/organisme-01_203.html
  score_qualite: 1
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# DAEU diplôme d'accès aux études universitaires option A

### Objectif de la formation

Le D.A.E.U (Diplôme d'Accès aux Études Universitaires) A accorde les mêmes droits que le baccalauréat, notamment en termes d'accès aux études supérieures.

Il est destiné aux personnes ayant interrompu leurs études sans avoir le baccalauréat ni un diplôme admis en équivalence.

### Contenu de la formation

2 matières obligatoires : 90 heures/an par matière :  
- Français  
- Langue vivante : Anglais, Allemand, Italien ou Espagnol (ces trois dernières langues ne sont pas préparées au SERFA mais peuvent être présentées à l'examen).

2 matières au choix, 70 heures/an par matière, à choisir parmi :  
- Mathématiques  
- Histoire contemporaine  
- Géographie

## Conditions d'accès

Niveau de classe terminale ou de premiere de l enseignement secondaire ou equivalent.
De plus, les personnes de nationalite etrangere doivent etre titulaires d un permis de sejour en cours de validite au 31 octobre de l annee de l examen$seed$, $seed${"id": "carif-oref--01_GE1848681", "nom": "DAEU diplôme d'accès aux études universitaires option A", "type": "formation", "extra": {"action": {"session": [{"@ref": "13821", "@numero": "GE1848681", "periode": {"fin": "20260605", "debut": "20250915"}, "recrutement": [{"@numero": "01_GE856528", "adresse": {"ligne": ["Rue des Freres Lumiere"], "ville": "Mulhouse", "codepostal": "68200", "departement": "68", "denomination": "SERFA", "code-INSEE-commune": "68224"}, "periode": {"fin": "20250903", "debut": "20250903"}, "heure-fin": "20h00", "nb-places": 30, "a-distance": "0", "heure-debut": "18h30", "modalite-recrutement": "9", "code-perimetre-recrutement": "3"}], "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "RETHABER", "prenom": "Aurelia", "telfixe": {"numtel": ["0389336500"]}, "courriel": "aurelia.rethaber@uha.fr"}, "type-contact": "0"}], "etat-recrutement": "1", "blocs-competences": [{"bloc-competences": [{"code-bloc": "RNCP40181BC01", "libelle-bloc": "Accueillir, orienter et accompagner les différents types de publics"}, {"code-bloc": "RNCP40181BC02", "libelle-bloc": "Organiser et gérer des tâches administratives simples"}, {"code-bloc": "RNCP40181BC03", "libelle-bloc": "Suivre et vérifier ses activités"}, {"code-bloc": "RNCP40181BC04", "libelle-bloc": "Communiquer à l'écrit et à l'oral"}, {"code-bloc": "RNCP40181BC05", "libelle-bloc": "Rechercher et partager des informations et des données, en intégrant l'évolution des technologies"}], "validation-blocs": "1", "reference-certification": {"reference-code-CERTIFINFO": "118300"}}], "adresse-inscription": {"adresse": {"ligne": ["Rue des Freres Lumiere"], "ville": "Mulhouse", "codepostal": "68200", "denomination": "SERFA", "code-INSEE-commune": "68224"}}, "periode-inscription": {"periode": {"fin": "20250905", "debut": "20250519"}}, "modalites-inscription": "Dossier d inscription, entretien et tests de positionnement", "reference-certification": [{"reference-code-RNCP": "40181", "reference-code-CERTIFINFO": "118300"}]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 320, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "80006", "@ref": "V14", "@info": "code-public-vise"}, {"$": "Accord cadre université", "@info": "programme-financeur"}, {"$": "2025-30973", "@info": "ref-action-marche-financeur"}]}], "code-financeur": "2", "nb-places-financees": 14}], "modalites-recrutement": "Le D.A.E.U (Diplôme d'Accès aux Études Universitaires) est accessible à toute personne ayant interrompu ses études initiales depuis 2 ans et satisfaisant à l'une des conditions suivantes :\n\n- Avoir au moins 20 ans au 1er octobre de l'année de l'examen et justifier de deux année d'activité professionnelle salariée ou d'une activité ayant donné lieu à deux années de cotisation à la sécurité sociale (périodes de chômage avec inscription à France Travail, éducation d'un enfant, participation à un dispositif de formation professionnelle, exercice d'une activité sportive de haut niveau, ... etc.).\n\n- Avoir 24 ans ou plus au 1er octobre de l'année de l'examen.", "modalites-enseignement": "0", "modalites-entrees-sorties": "0"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "14"}}, "frais": "gratuit", "source": "carif-oref", "adresse": "Rue des Frères Lumière", "commune": "Mulhouse", "publics": ["demandeurs-emploi"], "courriel": "severine.gourmelon@uha.fr", "date_maj": "2025-10-15", "latitude": 47.732154, "longitude": 7.315176, "structure": {"id": "carif-oref--01_203", "nom": "Université de Haute Alsace SERFA", "siret": "19681166500278", "source": "carif-oref", "adresse": "Rue des Frères Lumière", "commune": "Mulhouse", "courriel": "severine.gourmelon@uha.fr", "date_maj": "2026-02-03", "doublons": [], "latitude": 47.732154, "site_web": "https://www.serfa.fr/", "longitude": 7.315176, "telephone": "+33389336504", "code_insee": "68224", "code_postal": "68200", "description": null, "lien_source": "https://www.intercariforef.org/formations/universite-de-haute-alsace-serfa/organisme-01_203.html", "score_qualite": 1, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33389336504", "code_insee": "68224", "code_postal": "68200", "description": "### Objectif de la formation\n\nLe D.A.E.U (Diplôme d'Accès aux Études Universitaires) A accorde les mêmes droits que le baccalauréat, notamment en termes d'accès aux études supérieures.\n\nIl est destiné aux personnes ayant interrompu leurs études sans avoir le baccalauréat ni un diplôme admis en équivalence.\n\n### Contenu de la formation\n\n2 matières obligatoires : 90 heures/an par matière :  \n- Français  \n- Langue vivante : Anglais, Allemand, Italien ou Espagnol (ces trois dernières langues ne sont pas préparées au SERFA mais peuvent être présentées à l'examen).\n\n2 matières au choix, 70 heures/an par matière, à choisir parmi :  \n- Mathématiques  \n- Histoire contemporaine  \n- Géographie", "lien_source": "https://formation.grandest.fr/accueil/formations/137095", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais", "lecture-ecriture-calcul--maitriser-le-calcul"], "structure_id": "carif-oref--01_203", "modes_accueil": ["en-presentiel"], "score_qualite": 0.99, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Niveau de classe terminale ou de premiere de l enseignement secondaire ou equivalent.\nDe plus, les personnes de nationalite etrangere doivent etre titulaires d un permis de sejour en cours de validite au 31 octobre de l annee de l examen", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": "Le D.A.E.U (Diplôme d'Accès aux Études Universitaires) est accessible à toute personne ayant interrompu ses études initiales depuis 2 ans et satisfaisant à l'une des conditions suivantes :\n\n- Avoir au moins 20 ans au 1er octobre de l'année de l'examen et justifier de deux année d'activité professionnelle salariée ou d'une activité ayant donné lieu à deux années de cotisation à la sécurité sociale (périodes de chômage avec inscription à France Travail, éducation d'un enfant, participation à un dispositif de formation professionnelle, exercice d'une activité sportive de haut niveau, ... etc.).\n\n- Avoir 24 ans ou plus au 1er octobre de l'année de l'examen.", "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$4dee1aeb-eb6a-46ac-839f-a22cb37891e5$seed$, $seed$1daa68fc-4391-4f9d-a3da-682f35681ce4$seed$, 1, $seed$DI$seed$, $seed$non_compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$39216948-93b4-4cf0-8db1-e797d0e3078a$seed$, $seed$2026-06-17 14:36:08.26557+00$seed$, $seed$2026-06-17 14:36:11.416705+00$seed$, $seed$---
id: carif-oref--01_GE1852850
nom: Ateliers Français Langue Etrangère
type: formation
extra:
  action:
    session:
      - "@ref": "14402"
        "@numero": GE1852850
        periode:
          fin: "20260612"
          debut: "20250929"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: Tosheva
              prenom: Silvana
              telfixe:
                numtel:
                  - "0388777675"
              courriel: formationlinguistique@csc-schoelcher.fr
            type-contact: "14"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            ligne:
              - 56 Rue du Rieth
            ville: Strasbourg
            codepostal: "67200"
            denomination: CSC Victor Schoelcher
            code-INSEE-commune: "67482"
        periode-inscription:
          periode:
            fin: "20250930"
            debut: "20250915"
        modalites-inscription: Entretien individuel.
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: null
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81021"
                "@ref": V14
                "@info": code-public-vise
              - $: "81022"
                "@ref": V14
                "@info": code-public-vise
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "81042"
                "@ref": V14
                "@info": code-public-vise
              - $: Atelier FLE
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "0"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 56 Rue du Rieth
commune: Strasbourg
publics: null
courriel: contact@csc-schoelcher.fr
date_maj: 2026-06-10
latitude: 48.601228
longitude: 7.721186
telephone: "+33388777675"
code_insee: "67482"
code_postal: "67200"
description: >-
  ### Objectif de la formation


  Objectifs de la formation :  

  - L'intégration sociale, professionnelle, citoyenne et culturelle des
  migrants.    

  - L'acquisition d'une autonomie sociolangagière : comprendre et se faire
  comprendre dans les situations de la vie quotidienne : les échanges
  interpersonnels, professionnels, avec les administrations et les services, ou
  la communication médiatisée, grâce à une meilleure maîtrise de la langue
  française, une meilleure connaissance des institutions françaises et des lieux
  culturels, des codes sociaux et des valeurs citoyennes sur lesquels repose le
  bien vivre ensemble.


  ### Contenu de la formation


  - Cours de langue générale du niveau A1.1 au niveau A2.  

  - Travail sur les 4 compétences : Compréhension et production orale,
  compréhension et production écrite.  

  - Cours d'alphabétisation.  

  - Acquérir des connaissance de base de la langue afin de communiquer lors des
  situations courantes de la vie quotidienne.  

  - L'action consiste à la mise en place d'ateliers socio-linguistiques
  proposant un apprentissage de la langue française orale et écrite tout en
  s'ouvrant à la culture française et au fonctionnement de la société.
lien_source: https://formation.grandest.fr/accueil/formations/94454
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
structure_id: carif-oref--01_GE305404
modes_accueil:
  - en-presentiel
score_qualite: 0.7999999999999999
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Formation pour adultes (+ 18 ans).
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--01_GE305404
  nom: CSC Victor Schoelcher
  siret: "77887070900079"
  source: carif-oref
  adresse: 56 Rue du Rieth
  commune: Strasbourg
  courriel: contact@csc-schoelcher.fr
  date_maj: 2026-06-10
  doublons:
    - id: emplois-de-linclusion--696b4f05-6a84-4f81-af3a-3e3e21c746f6
      source: emplois-de-linclusion
  latitude: 48.601228
  site_web: null
  longitude: 7.721186
  telephone: "+33388777675"
  code_insee: "67482"
  code_postal: "67200"
  description: null
  lien_source: https://www.intercariforef.org/formations/csc-victor-schoelcher/organisme-01_GE305404.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Ateliers Français Langue Etrangère

### Objectif de la formation

Objectifs de la formation :  
- L'intégration sociale, professionnelle, citoyenne et culturelle des migrants.    
- L'acquisition d'une autonomie sociolangagière : comprendre et se faire comprendre dans les situations de la vie quotidienne : les échanges interpersonnels, professionnels, avec les administrations et les services, ou la communication médiatisée, grâce à une meilleure maîtrise de la langue française, une meilleure connaissance des institutions françaises et des lieux culturels, des codes sociaux et des valeurs citoyennes sur lesquels repose le bien vivre ensemble.

### Contenu de la formation

- Cours de langue générale du niveau A1.1 au niveau A2.  
- Travail sur les 4 compétences : Compréhension et production orale, compréhension et production écrite.  
- Cours d'alphabétisation.  
- Acquérir des connaissance de base de la langue afin de communiquer lors des situations courantes de la vie quotidienne.  
- L'action consiste à la mise en place d'ateliers socio-linguistiques proposant un apprentissage de la langue française orale et écrite tout en s'ouvrant à la culture française et au fonctionnement de la société.

## Conditions d'accès

Formation pour adultes (+ 18 ans).$seed$, $seed${"id": "carif-oref--01_GE1852850", "nom": "Ateliers Français Langue Etrangère", "type": "formation", "extra": {"action": {"session": [{"@ref": "14402", "@numero": "GE1852850", "periode": {"fin": "20260612", "debut": "20250929"}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "Tosheva", "prenom": "Silvana", "telfixe": {"numtel": ["0388777675"]}, "courriel": "formationlinguistique@csc-schoelcher.fr"}, "type-contact": "14"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"ligne": ["56 Rue du Rieth"], "ville": "Strasbourg", "codepostal": "67200", "denomination": "CSC Victor Schoelcher", "code-INSEE-commune": "67482"}}, "periode-inscription": {"periode": {"fin": "20250930", "debut": "20250915"}}, "modalites-inscription": "Entretien individuel.", "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": null, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81021", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81022", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81042", "@ref": "V14", "@info": "code-public-vise"}, {"$": "Atelier FLE", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "0"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "56 Rue du Rieth", "commune": "Strasbourg", "publics": null, "courriel": "contact@csc-schoelcher.fr", "date_maj": "2026-06-10", "latitude": 48.601228, "longitude": 7.721186, "structure": {"id": "carif-oref--01_GE305404", "nom": "CSC Victor Schoelcher", "siret": "77887070900079", "source": "carif-oref", "adresse": "56 Rue du Rieth", "commune": "Strasbourg", "courriel": "contact@csc-schoelcher.fr", "date_maj": "2026-06-10", "doublons": [{"id": "emplois-de-linclusion--696b4f05-6a84-4f81-af3a-3e3e21c746f6", "source": "emplois-de-linclusion"}], "latitude": 48.601228, "site_web": null, "longitude": 7.721186, "telephone": "+33388777675", "code_insee": "67482", "code_postal": "67200", "description": null, "lien_source": "https://www.intercariforef.org/formations/csc-victor-schoelcher/organisme-01_GE305404.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33388777675", "code_insee": "67482", "code_postal": "67200", "description": "### Objectif de la formation\n\nObjectifs de la formation :  \n- L'intégration sociale, professionnelle, citoyenne et culturelle des migrants.    \n- L'acquisition d'une autonomie sociolangagière : comprendre et se faire comprendre dans les situations de la vie quotidienne : les échanges interpersonnels, professionnels, avec les administrations et les services, ou la communication médiatisée, grâce à une meilleure maîtrise de la langue française, une meilleure connaissance des institutions françaises et des lieux culturels, des codes sociaux et des valeurs citoyennes sur lesquels repose le bien vivre ensemble.\n\n### Contenu de la formation\n\n- Cours de langue générale du niveau A1.1 au niveau A2.  \n- Travail sur les 4 compétences : Compréhension et production orale, compréhension et production écrite.  \n- Cours d'alphabétisation.  \n- Acquérir des connaissance de base de la langue afin de communiquer lors des situations courantes de la vie quotidienne.  \n- L'action consiste à la mise en place d'ateliers socio-linguistiques proposant un apprentissage de la langue française orale et écrite tout en s'ouvrant à la culture française et au fonctionnement de la société.", "lien_source": "https://formation.grandest.fr/accueil/formations/94454", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--01_GE305404", "modes_accueil": ["en-presentiel"], "score_qualite": 0.7999999999999999, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Formation pour adultes (+ 18 ans).", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$baceea7f-ce51-4f97-88a9-1793fb42cb70$seed$, $seed$012007bf-e21e-4724-a922-efd33ce8881b$seed$, 1, $seed$DI$seed$, $seed$non_compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$51ddd2c9-f774-4a3e-804b-5bda4ab6efd4$seed$, $seed$2026-06-17 14:36:08.26557+00$seed$, $seed$2026-06-17 14:36:11.416705+00$seed$, $seed$---
id: carif-oref--01_GE1845760
nom: Cours de FLE - Accompagnement sociolinguistique des primo-arrivants allophones
type: formation
extra:
  action:
    session:
      - "@ref": "12513"
        "@numero": GE1845760
        periode:
          fin: "20260703"
          debut: "20250902"
        recrutement:
          - "@numero": 01_GE855261
            adresse:
              ligne:
                - 8, impasse Prevert
              ville: Frouard
              codepostal: "54390"
              departement: "54"
              denomination: Espace de Vie Sociale Francas de Frouard (Les Francas 54)
              code-INSEE-commune: "54215"
            periode:
              fin: "20250702"
              debut: "20250702"
            heure-fin: 17h00
            nb-places: 36
            a-distance: "0"
            commentaire: Les inscriptions aux ateliers de FLE pour la session 2025-2026
              auront lieu sur rendez-vous exclusivement.
            heure-debut: 10h00
            modalite-recrutement: "8"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: CHOUKRI
              prenom: Najia
              telfixe:
                numtel:
                  - "0698231458"
              courriel: n.choukri@francas54.org
            type-contact: "0"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            ligne:
              - 8, impasse Prevert
            ville: Frouard
            codepostal: "54390"
            denomination: Espace de Vie Sociale Francas de Frouard (Les Francas 54)
            code-INSEE-commune: "54215"
        periode-inscription:
          periode:
            fin: "20260703"
            debut: "20250701"
        modalites-inscription: Remplissage d une fiche d inscription (bulletin d
          adhesion a l EVS de Frouard) + versement de la cotisation annuelle (5
          euros)
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 100
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81022"
                "@ref": V14
                "@info": code-public-vise
              - $: Atelier FLE
                "@info": programme-financeur
              - $: .
                "@info": ref-action-marche-financeur
        code-financeur: "19"
        nb-places-financees: 36
    modalites-recrutement: |-
      - Rendez-vous d'inscription et de test de positionnement
      - Adhésion à l'association (5€ à l'année).
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: payant
source: carif-oref
adresse: 8, impasse Prevert
commune: Frouard
publics:
  - personnes-exilees
courriel: a.simon@francas-vosges.org
date_maj: 2025-06-02
latitude: 48.758748
longitude: 6.125786
telephone: "+33383293723"
code_insee: "54215"
code_postal: "54390"
description: >-
  ### Objectif de la formation


  Finalité : favoriser l'intégration des personnes primo-arrivantes sur le
  territoire (Frouard - QPV de La Penotte et CCBP)   
    
  Objectifs généraux :   

  - Accueillir les primo-arrivants allophones et recueillir leurs besoins en
  matière d'accompagnement sociolinguistique ;  

  - Contribuer à tisser du lien social entre les habitants, notamment entre les
  allophones et les francophones natifs ;  

  - Faciliter la bonne compréhension de ce qu'est la citoyenneté française,
  incluant l'acquisition des références culturelles et des codes sociaux.  
    
  Objectifs opérationnels :  

  - Proposer des ateliers sociolinguistiques adaptés aux besoins et au niveau de
  chacun, en tenant compte des contraintes ;  

  - Suivre la progression des apprenants dans leur acquisition de la langue
  française et des codes socioculturels ;  

  - Accompagner les primo-arrivants en les conseillant au quotidien dans leur
  apprentissage et dans leur parcours d'intégration, en les orientant vers les
  structures et dispositifs adéquats ;  

  - Encourager les apprenants à participer à l'ensemble des actions de l'EVS
  afin de leur fournir autant d'occasions que possible de tisser des liens avec
  les autres habitants du territoire et de pratiquer la langue française.


  ### Contenu de la formation


  3 groupes d'une capacité totale d'une douzaine d'apprenants chacun  :  

  - un groupe de débutants de niveau 0 vers A1,  

  - un groupe de niveau intermédiaire, de niveau A1 vers A2,  

  - un groupe de niveau plus avancé, de niveau A2 vers B1.  
    
  Ces cours de groupes ont lieu deux fois par semaine en période scolaire, les
  mardis et les jeudis à raison de 2h par séance, soit 4h hebdomadaires.   

  S'ajoutent des cours au format individuel proposé aux personnes de profils
  différents de ceux des 3 groupes : alphabétisation (pour ceux qui ne
  maîtrisent pas l'alphabet latin et les relations grapho-phonologiques de base
  du français) ou de niveau supérieur à B1, ainsi que pour les personnes
  potentiellement indisponibles aux heures des cours de groupe. (Capacité
  d'accueil : de 2 à 5 apprenants en individuel max.)  

  Par ailleurs, les apprenants du groupe le plus avancé peuvent accéder à une
  séance supplémentaire de 2h axée sur le travail du français par les textes et
  supports écrits authentiques (articles, romans, etc.)
lien_source: https://www.facebook.com/people/Espace-de-vie-sociale-maison-prevert/100075521187616/
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
structure_id: carif-oref--17_2260
modes_accueil:
  - en-presentiel
score_qualite: 0.8600000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Connaissance prealable de l alphabet latin, pour les
  apprenants des 3 groupes de FLE.
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
adresse_certifiee: false
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: |-
  - Rendez-vous d'inscription et de test de positionnement
  - Adhésion à l'association (5€ à l'année).
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--17_2260
  nom: Union Régionale des Francas du Grand Est
  siret: "78334594500050"
  source: carif-oref
  adresse: 8, impasse Prevert
  commune: Frouard
  courriel: a.simon@francas-vosges.org
  date_maj: 2025-06-02
  doublons: []
  latitude: 48.758748
  site_web: http://www.francaslca.net/
  longitude: 6.125786
  telephone: "+33383293723"
  code_insee: "54215"
  code_postal: "54390"
  description: null
  lien_source: https://www.intercariforef.org/formations/union-regionale-des-francas-du-grand-est/organisme-17_2260.html
  score_qualite: 0.86
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: false
  accessibilite_lieu: null
  complement_adresse: null
---

# Cours de FLE - Accompagnement sociolinguistique des primo-arrivants allophones

### Objectif de la formation

Finalité : favoriser l'intégration des personnes primo-arrivantes sur le territoire (Frouard - QPV de La Penotte et CCBP)   
  
Objectifs généraux :   
- Accueillir les primo-arrivants allophones et recueillir leurs besoins en matière d'accompagnement sociolinguistique ;  
- Contribuer à tisser du lien social entre les habitants, notamment entre les allophones et les francophones natifs ;  
- Faciliter la bonne compréhension de ce qu'est la citoyenneté française, incluant l'acquisition des références culturelles et des codes sociaux.  
  
Objectifs opérationnels :  
- Proposer des ateliers sociolinguistiques adaptés aux besoins et au niveau de chacun, en tenant compte des contraintes ;  
- Suivre la progression des apprenants dans leur acquisition de la langue française et des codes socioculturels ;  
- Accompagner les primo-arrivants en les conseillant au quotidien dans leur apprentissage et dans leur parcours d'intégration, en les orientant vers les structures et dispositifs adéquats ;  
- Encourager les apprenants à participer à l'ensemble des actions de l'EVS afin de leur fournir autant d'occasions que possible de tisser des liens avec les autres habitants du territoire et de pratiquer la langue française.

### Contenu de la formation

3 groupes d'une capacité totale d'une douzaine d'apprenants chacun  :  
- un groupe de débutants de niveau 0 vers A1,  
- un groupe de niveau intermédiaire, de niveau A1 vers A2,  
- un groupe de niveau plus avancé, de niveau A2 vers B1.  
  
Ces cours de groupes ont lieu deux fois par semaine en période scolaire, les mardis et les jeudis à raison de 2h par séance, soit 4h hebdomadaires.   
S'ajoutent des cours au format individuel proposé aux personnes de profils différents de ceux des 3 groupes : alphabétisation (pour ceux qui ne maîtrisent pas l'alphabet latin et les relations grapho-phonologiques de base du français) ou de niveau supérieur à B1, ainsi que pour les personnes potentiellement indisponibles aux heures des cours de groupe. (Capacité d'accueil : de 2 à 5 apprenants en individuel max.)  
Par ailleurs, les apprenants du groupe le plus avancé peuvent accéder à une séance supplémentaire de 2h axée sur le travail du français par les textes et supports écrits authentiques (articles, romans, etc.)

## Conditions d'accès

Connaissance prealable de l alphabet latin, pour les apprenants des 3 groupes de FLE.$seed$, $seed${"id": "carif-oref--01_GE1845760", "nom": "Cours de FLE - Accompagnement sociolinguistique des primo-arrivants allophones", "type": "formation", "extra": {"action": {"session": [{"@ref": "12513", "@numero": "GE1845760", "periode": {"fin": "20260703", "debut": "20250902"}, "recrutement": [{"@numero": "01_GE855261", "adresse": {"ligne": ["8, impasse Prevert"], "ville": "Frouard", "codepostal": "54390", "departement": "54", "denomination": "Espace de Vie Sociale Francas de Frouard (Les Francas 54)", "code-INSEE-commune": "54215"}, "periode": {"fin": "20250702", "debut": "20250702"}, "heure-fin": "17h00", "nb-places": 36, "a-distance": "0", "commentaire": "Les inscriptions aux ateliers de FLE pour la session 2025-2026 auront lieu sur rendez-vous exclusivement.", "heure-debut": "10h00", "modalite-recrutement": "8"}], "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "CHOUKRI", "prenom": "Najia", "telfixe": {"numtel": ["0698231458"]}, "courriel": "n.choukri@francas54.org"}, "type-contact": "0"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"ligne": ["8, impasse Prevert"], "ville": "Frouard", "codepostal": "54390", "denomination": "Espace de Vie Sociale Francas de Frouard (Les Francas 54)", "code-INSEE-commune": "54215"}}, "periode-inscription": {"periode": {"fin": "20260703", "debut": "20250701"}}, "modalites-inscription": "Remplissage d une fiche d inscription (bulletin d adhesion a l EVS de Frouard) + versement de la cotisation annuelle (5 euros)", "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 100, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81022", "@ref": "V14", "@info": "code-public-vise"}, {"$": "Atelier FLE", "@info": "programme-financeur"}, {"$": ".", "@info": "ref-action-marche-financeur"}]}], "code-financeur": "19", "nb-places-financees": 36}], "modalites-recrutement": "- Rendez-vous d'inscription et de test de positionnement\n- Adhésion à l'association (5€ à l'année).", "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": "payant", "source": "carif-oref", "adresse": "8, impasse Prevert", "commune": "Frouard", "publics": ["personnes-exilees"], "courriel": "a.simon@francas-vosges.org", "date_maj": "2025-06-02", "latitude": 48.758748, "longitude": 6.125786, "structure": {"id": "carif-oref--17_2260", "nom": "Union Régionale des Francas du Grand Est", "siret": "78334594500050", "source": "carif-oref", "adresse": "8, impasse Prevert", "commune": "Frouard", "courriel": "a.simon@francas-vosges.org", "date_maj": "2025-06-02", "doublons": [], "latitude": 48.758748, "site_web": "http://www.francaslca.net/", "longitude": 6.125786, "telephone": "+33383293723", "code_insee": "54215", "code_postal": "54390", "description": null, "lien_source": "https://www.intercariforef.org/formations/union-regionale-des-francas-du-grand-est/organisme-17_2260.html", "score_qualite": 0.86, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": false, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33383293723", "code_insee": "54215", "code_postal": "54390", "description": "### Objectif de la formation\n\nFinalité : favoriser l'intégration des personnes primo-arrivantes sur le territoire (Frouard - QPV de La Penotte et CCBP)   \n  \nObjectifs généraux :   \n- Accueillir les primo-arrivants allophones et recueillir leurs besoins en matière d'accompagnement sociolinguistique ;  \n- Contribuer à tisser du lien social entre les habitants, notamment entre les allophones et les francophones natifs ;  \n- Faciliter la bonne compréhension de ce qu'est la citoyenneté française, incluant l'acquisition des références culturelles et des codes sociaux.  \n  \nObjectifs opérationnels :  \n- Proposer des ateliers sociolinguistiques adaptés aux besoins et au niveau de chacun, en tenant compte des contraintes ;  \n- Suivre la progression des apprenants dans leur acquisition de la langue française et des codes socioculturels ;  \n- Accompagner les primo-arrivants en les conseillant au quotidien dans leur apprentissage et dans leur parcours d'intégration, en les orientant vers les structures et dispositifs adéquats ;  \n- Encourager les apprenants à participer à l'ensemble des actions de l'EVS afin de leur fournir autant d'occasions que possible de tisser des liens avec les autres habitants du territoire et de pratiquer la langue française.\n\n### Contenu de la formation\n\n3 groupes d'une capacité totale d'une douzaine d'apprenants chacun  :  \n- un groupe de débutants de niveau 0 vers A1,  \n- un groupe de niveau intermédiaire, de niveau A1 vers A2,  \n- un groupe de niveau plus avancé, de niveau A2 vers B1.  \n  \nCes cours de groupes ont lieu deux fois par semaine en période scolaire, les mardis et les jeudis à raison de 2h par séance, soit 4h hebdomadaires.   \nS'ajoutent des cours au format individuel proposé aux personnes de profils différents de ceux des 3 groupes : alphabétisation (pour ceux qui ne maîtrisent pas l'alphabet latin et les relations grapho-phonologiques de base du français) ou de niveau supérieur à B1, ainsi que pour les personnes potentiellement indisponibles aux heures des cours de groupe. (Capacité d'accueil : de 2 à 5 apprenants en individuel max.)  \nPar ailleurs, les apprenants du groupe le plus avancé peuvent accéder à une séance supplémentaire de 2h axée sur le travail du français par les textes et supports écrits authentiques (articles, romans, etc.)", "lien_source": "https://www.facebook.com/people/Espace-de-vie-sociale-maison-prevert/100075521187616/", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--17_2260", "modes_accueil": ["en-presentiel"], "score_qualite": 0.8600000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Connaissance prealable de l alphabet latin, pour les apprenants des 3 groupes de FLE.", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "adresse_certifiee": false, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": "- Rendez-vous d'inscription et de test de positionnement\n- Adhésion à l'association (5€ à l'année).", "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$f4f1195f-4a43-4b60-b5be-6286e9ff26c1$seed$, $seed$93920d12-0908-45cd-a342-985f42896d2f$seed$, 1, $seed$DI$seed$, $seed$error$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$185c7a16-def7-4448-aabd-24f30b77df78$seed$, $seed$2026-06-17 14:36:08.26557+00$seed$, $seed$2026-06-17 14:36:11.416705+00$seed$, $seed$---
id: carif-oref--01_GE1848682
nom: DAEU diplôme d'accès aux études universitaires option B
type: formation
extra:
  action:
    session:
      - "@ref": "13820"
        "@numero": GE1848682
        periode:
          fin: "20260605"
          debut: "20250915"
        recrutement:
          - "@numero": 01_GE856529
            adresse:
              ligne:
                - Rue des Freres Lumiere
              ville: Mulhouse
              codepostal: "68200"
              departement: "68"
              denomination: SERFA
              code-INSEE-commune: "68224"
            periode:
              fin: "20250903"
              debut: "20250903"
            heure-fin: 20h00
            nb-places: 30
            a-distance: "0"
            heure-debut: 18h30
            modalite-recrutement: "9"
            code-perimetre-recrutement: "3"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: RETHABER
              prenom: Aurelia
              telfixe:
                numtel:
                  - "0389336500"
              courriel: aurelia.rethaber@uha.fr
            type-contact: "0"
        etat-recrutement: "1"
        blocs-competences:
          - bloc-competences:
              - code-bloc: RNCP40181BC01
                libelle-bloc: Accueillir, orienter et accompagner les différents types de
                  publics
              - code-bloc: RNCP40181BC02
                libelle-bloc: Organiser et gérer des tâches administratives simples
              - code-bloc: RNCP40181BC03
                libelle-bloc: Suivre et vérifier ses activités
              - code-bloc: RNCP40181BC04
                libelle-bloc: Communiquer à l'écrit et à l'oral
              - code-bloc: RNCP40181BC05
                libelle-bloc: Rechercher et partager des informations et des données, en
                  intégrant l'évolution des technologies
            validation-blocs: "1"
            reference-certification:
              reference-code-CERTIFINFO: "118302"
        adresse-inscription:
          adresse:
            ligne:
              - Rue des Freres Lumiere
            ville: Mulhouse
            codepostal: "68200"
            denomination: SERFA
            code-INSEE-commune: "68224"
        periode-inscription:
          periode:
            fin: "20250905"
            debut: "20250519"
        modalites-inscription: Dossier d inscription, entretien et tests de positionnement
        reference-certification:
          - reference-code-RNCP: "40181"
            reference-code-CERTIFINFO: "118302"
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 320
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "80006"
                "@ref": V14
                "@info": code-public-vise
              - $: Accord cadre université
                "@info": programme-financeur
              - $: 2025-30973
                "@info": ref-action-marche-financeur
        code-financeur: "2"
        nb-places-financees: 14
    modalites-recrutement: >-
      Le D.A.E.U (Diplôme d'Accès aux Études Universitaires) est accessible à
      toute personne ayant interrompu ses études initiales depuis 2 ans et
      satisfaisant à l'une des conditions suivantes :


      - Avoir au moins 20 ans au 1er octobre de l'année de l'examen et justifier
      de deux années d'activité professionnelle salariée ou d'une activité ayant
      donné lieu à deux années de cotisation à la sécurité sociale (périodes de
      chômage avec inscription à France Travail, éducation d'un enfant,
      participation à un dispositif de formation professionnelle, exercice d'une
      activité sportive de haut niveau, ... etc.)


      - Avoir 24 ans ou plus au 1er octobre de l'année de l'examen
    modalites-enseignement: "0"
    modalites-entrees-sorties: "0"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "14"
frais: gratuit
source: carif-oref
adresse: Rue des Frères Lumière
commune: Mulhouse
publics:
  - demandeurs-emploi
courriel: severine.gourmelon@uha.fr
date_maj: 2026-02-03
latitude: 47.732154
longitude: 7.315176
telephone: "+33389336504"
code_insee: "68224"
code_postal: "68200"
description: >-
  ### Objectif de la formation


  Le D.A.E.U (Diplôme d'Accès aux Études Universitaires) B accorde les mêmes
  droits que le baccalauréat, notamment en termes d'accès aux études
  supérieures.  
    
  Il est destiné aux personnes ayant interrompu leurs études sans avoir le
  baccalauréat ni un diplôme admis en équivalence.


  ### Contenu de la formation


  2 matières obligatoires : 90 heures/an par matière :  

  - Français  

  - Mathématiques  
    
  2 matières au choix, 70 heures/ans par matière, à choisir parmi :  

  - Biologie  

  - Chimie  

  - Physique (matière non préparée au SERFA mais pouvant être présentée à
  l'examen)
lien_source: https://formation.grandest.fr/accueil/formations/137096
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
  - lecture-ecriture-calcul--maitriser-le-calcul
structure_id: carif-oref--01_203
modes_accueil:
  - en-presentiel
score_qualite: 1
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: >-
  Niveau de classe terminale ou de premiere de l enseignement secondaire ou
  equivalent.

  De plus, les personnes de nationalite etrangere doivent etre titulaires d un
  permis de sejour en cours de validite au 31 octobre de l annee de l examen
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: >-
  Le D.A.E.U (Diplôme d'Accès aux Études Universitaires) est accessible à toute
  personne ayant interrompu ses études initiales depuis 2 ans et satisfaisant à
  l'une des conditions suivantes :


  - Avoir au moins 20 ans au 1er octobre de l'année de l'examen et justifier de
  deux années d'activité professionnelle salariée ou d'une activité ayant donné
  lieu à deux années de cotisation à la sécurité sociale (périodes de chômage
  avec inscription à France Travail, éducation d'un enfant, participation à un
  dispositif de formation professionnelle, exercice d'une activité sportive de
  haut niveau, ... etc.)


  - Avoir 24 ans ou plus au 1er octobre de l'année de l'examen
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--01_203
  nom: Université de Haute Alsace SERFA
  siret: "19681166500278"
  source: carif-oref
  adresse: Rue des Frères Lumière
  commune: Mulhouse
  courriel: severine.gourmelon@uha.fr
  date_maj: 2026-02-03
  doublons: []
  latitude: 47.732154
  site_web: https://www.serfa.fr/
  longitude: 7.315176
  telephone: "+33389336504"
  code_insee: "68224"
  code_postal: "68200"
  description: null
  lien_source: https://www.intercariforef.org/formations/universite-de-haute-alsace-serfa/organisme-01_203.html
  score_qualite: 1
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# DAEU diplôme d'accès aux études universitaires option B

### Objectif de la formation

Le D.A.E.U (Diplôme d'Accès aux Études Universitaires) B accorde les mêmes droits que le baccalauréat, notamment en termes d'accès aux études supérieures.  
  
Il est destiné aux personnes ayant interrompu leurs études sans avoir le baccalauréat ni un diplôme admis en équivalence.

### Contenu de la formation

2 matières obligatoires : 90 heures/an par matière :  
- Français  
- Mathématiques  
  
2 matières au choix, 70 heures/ans par matière, à choisir parmi :  
- Biologie  
- Chimie  
- Physique (matière non préparée au SERFA mais pouvant être présentée à l'examen)

## Conditions d'accès

Niveau de classe terminale ou de premiere de l enseignement secondaire ou equivalent.
De plus, les personnes de nationalite etrangere doivent etre titulaires d un permis de sejour en cours de validite au 31 octobre de l annee de l examen$seed$, $seed${"id": "carif-oref--01_GE1848682", "nom": "DAEU diplôme d'accès aux études universitaires option B", "type": "formation", "extra": {"action": {"session": [{"@ref": "13820", "@numero": "GE1848682", "periode": {"fin": "20260605", "debut": "20250915"}, "recrutement": [{"@numero": "01_GE856529", "adresse": {"ligne": ["Rue des Freres Lumiere"], "ville": "Mulhouse", "codepostal": "68200", "departement": "68", "denomination": "SERFA", "code-INSEE-commune": "68224"}, "periode": {"fin": "20250903", "debut": "20250903"}, "heure-fin": "20h00", "nb-places": 30, "a-distance": "0", "heure-debut": "18h30", "modalite-recrutement": "9", "code-perimetre-recrutement": "3"}], "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "RETHABER", "prenom": "Aurelia", "telfixe": {"numtel": ["0389336500"]}, "courriel": "aurelia.rethaber@uha.fr"}, "type-contact": "0"}], "etat-recrutement": "1", "blocs-competences": [{"bloc-competences": [{"code-bloc": "RNCP40181BC01", "libelle-bloc": "Accueillir, orienter et accompagner les différents types de publics"}, {"code-bloc": "RNCP40181BC02", "libelle-bloc": "Organiser et gérer des tâches administratives simples"}, {"code-bloc": "RNCP40181BC03", "libelle-bloc": "Suivre et vérifier ses activités"}, {"code-bloc": "RNCP40181BC04", "libelle-bloc": "Communiquer à l'écrit et à l'oral"}, {"code-bloc": "RNCP40181BC05", "libelle-bloc": "Rechercher et partager des informations et des données, en intégrant l'évolution des technologies"}], "validation-blocs": "1", "reference-certification": {"reference-code-CERTIFINFO": "118302"}}], "adresse-inscription": {"adresse": {"ligne": ["Rue des Freres Lumiere"], "ville": "Mulhouse", "codepostal": "68200", "denomination": "SERFA", "code-INSEE-commune": "68224"}}, "periode-inscription": {"periode": {"fin": "20250905", "debut": "20250519"}}, "modalites-inscription": "Dossier d inscription, entretien et tests de positionnement", "reference-certification": [{"reference-code-RNCP": "40181", "reference-code-CERTIFINFO": "118302"}]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 320, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "80006", "@ref": "V14", "@info": "code-public-vise"}, {"$": "Accord cadre université", "@info": "programme-financeur"}, {"$": "2025-30973", "@info": "ref-action-marche-financeur"}]}], "code-financeur": "2", "nb-places-financees": 14}], "modalites-recrutement": "Le D.A.E.U (Diplôme d'Accès aux Études Universitaires) est accessible à toute personne ayant interrompu ses études initiales depuis 2 ans et satisfaisant à l'une des conditions suivantes :\n\n- Avoir au moins 20 ans au 1er octobre de l'année de l'examen et justifier de deux années d'activité professionnelle salariée ou d'une activité ayant donné lieu à deux années de cotisation à la sécurité sociale (périodes de chômage avec inscription à France Travail, éducation d'un enfant, participation à un dispositif de formation professionnelle, exercice d'une activité sportive de haut niveau, ... etc.)\n\n- Avoir 24 ans ou plus au 1er octobre de l'année de l'examen", "modalites-enseignement": "0", "modalites-entrees-sorties": "0"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "14"}}, "frais": "gratuit", "source": "carif-oref", "adresse": "Rue des Frères Lumière", "commune": "Mulhouse", "publics": ["demandeurs-emploi"], "courriel": "severine.gourmelon@uha.fr", "date_maj": "2026-02-03", "latitude": 47.732154, "longitude": 7.315176, "structure": {"id": "carif-oref--01_203", "nom": "Université de Haute Alsace SERFA", "siret": "19681166500278", "source": "carif-oref", "adresse": "Rue des Frères Lumière", "commune": "Mulhouse", "courriel": "severine.gourmelon@uha.fr", "date_maj": "2026-02-03", "doublons": [], "latitude": 47.732154, "site_web": "https://www.serfa.fr/", "longitude": 7.315176, "telephone": "+33389336504", "code_insee": "68224", "code_postal": "68200", "description": null, "lien_source": "https://www.intercariforef.org/formations/universite-de-haute-alsace-serfa/organisme-01_203.html", "score_qualite": 1, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33389336504", "code_insee": "68224", "code_postal": "68200", "description": "### Objectif de la formation\n\nLe D.A.E.U (Diplôme d'Accès aux Études Universitaires) B accorde les mêmes droits que le baccalauréat, notamment en termes d'accès aux études supérieures.  \n  \nIl est destiné aux personnes ayant interrompu leurs études sans avoir le baccalauréat ni un diplôme admis en équivalence.\n\n### Contenu de la formation\n\n2 matières obligatoires : 90 heures/an par matière :  \n- Français  \n- Mathématiques  \n  \n2 matières au choix, 70 heures/ans par matière, à choisir parmi :  \n- Biologie  \n- Chimie  \n- Physique (matière non préparée au SERFA mais pouvant être présentée à l'examen)", "lien_source": "https://formation.grandest.fr/accueil/formations/137096", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais", "lecture-ecriture-calcul--maitriser-le-calcul"], "structure_id": "carif-oref--01_203", "modes_accueil": ["en-presentiel"], "score_qualite": 1, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Niveau de classe terminale ou de premiere de l enseignement secondaire ou equivalent.\nDe plus, les personnes de nationalite etrangere doivent etre titulaires d un permis de sejour en cours de validite au 31 octobre de l annee de l examen", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": "Le D.A.E.U (Diplôme d'Accès aux Études Universitaires) est accessible à toute personne ayant interrompu ses études initiales depuis 2 ans et satisfaisant à l'une des conditions suivantes :\n\n- Avoir au moins 20 ans au 1er octobre de l'année de l'examen et justifier de deux années d'activité professionnelle salariée ou d'une activité ayant donné lieu à deux années de cotisation à la sécurité sociale (périodes de chômage avec inscription à France Travail, éducation d'un enfant, participation à un dispositif de formation professionnelle, exercice d'une activité sportive de haut niveau, ... etc.)\n\n- Avoir 24 ans ou plus au 1er octobre de l'année de l'examen", "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$0f52153d-c5de-4ad1-a8f6-3b2a89fb0fdc$seed$, $seed$1daa68fc-4391-4f9d-a3da-682f35681ce4$seed$, 1, $seed$DI$seed$, $seed$non_compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$f8023806-3d8c-49bd-a0ab-964e2df479f4$seed$, $seed$2026-06-17 14:36:08.26557+00$seed$, $seed$2026-06-17 14:36:11.416705+00$seed$, $seed$---
id: carif-oref--01_GE1716206
nom: Cours de français langue d'intégration
type: formation
extra:
  action:
    session:
      - "@ref": "1261"
        "@numero": GE1716206
        periode:
          fin: "20261218"
          debut: "20240101"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: ROBERT-TISSOT
              prenom: Frederique
              telfixe:
                numtel:
                  - "0781936238"
              courriel: fle@csc-saint-louis.fr
            type-contact: "3"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            ligne:
              - 95 Rue de Mulhouse
            ville: Saint-Louis
            codepostal: "68300"
            denomination: Maison de quartier
            code-INSEE-commune: "68297"
        periode-inscription:
          periode:
            fin: "20261218"
            debut: "20240101"
        modalites-inscription: FLI niveau A1.1
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: null
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81022"
                "@ref": V14
                "@info": code-public-vise
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "81042"
                "@ref": V14
                "@info": code-public-vise
              - $: Atelier FLE
                "@info": programme-financeur
              - $: BOP 104
                "@info": ref-action-marche-financeur
        code-financeur: "19"
        nb-places-financees: 10
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 95 Rue de Mulhouse
commune: Saint-Louis
publics:
  - personnes-exilees
courriel: accueil@csc-saint-louis.fr
date_maj: 2024-12-13
latitude: 47.592185
longitude: 7.55682
telephone: "+33389691668"
code_insee: "68297"
code_postal: "68300"
description: >-
  ### Objectif de la formation


  L'objectif du cours de Français Langue d'Intégration est d'apporter de l'aide
  dans les processus de socialisation des populations migrantes par
  l'apprentissage du français. Il s'agit de développer les compétences
  communicatives orales et écrites afin de favoriser l'autonomie de la personne,
  d'aider l'apprenant à s'approprier l'environnement social et les règles de la
  vie en France, de le rendre indépendant grâce à son travail et de le
  sensibiliser à la culture française.


  ### Contenu de la formation


  Proposition de cours de niveau A1, A2, B1, de cours de conversation, de cours
  d'alphabétisation.
lien_source: https://formation.grandest.fr/accueil/formations/113663
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
structure_id: carif-oref--01_GE305705
modes_accueil:
  - en-presentiel
score_qualite: 0.8299999999999998
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Positionnement selon niveau par le CIDFF
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--01_GE305705
  nom: Centre socio-culturel de Saint-Louis
  siret: "77897285100092"
  source: carif-oref
  adresse: 95 Rue de Mulhouse
  commune: Saint-Louis
  courriel: accueil@csc-saint-louis.fr
  date_maj: 2025-06-02
  doublons: []
  latitude: 47.592185
  site_web: null
  longitude: 7.55682
  telephone: "+33389691668"
  code_insee: "68297"
  code_postal: "68300"
  description: null
  lien_source: https://www.intercariforef.org/formations/centre-socio-culturel-de-saint-louis/organisme-01_GE305705.html
  score_qualite: 0.85
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Cours de français langue d'intégration

### Objectif de la formation

L'objectif du cours de Français Langue d'Intégration est d'apporter de l'aide dans les processus de socialisation des populations migrantes par l'apprentissage du français. Il s'agit de développer les compétences communicatives orales et écrites afin de favoriser l'autonomie de la personne, d'aider l'apprenant à s'approprier l'environnement social et les règles de la vie en France, de le rendre indépendant grâce à son travail et de le sensibiliser à la culture française.

### Contenu de la formation

Proposition de cours de niveau A1, A2, B1, de cours de conversation, de cours d'alphabétisation.

## Conditions d'accès

Positionnement selon niveau par le CIDFF$seed$, $seed${"id": "carif-oref--01_GE1716206", "nom": "Cours de français langue d'intégration", "type": "formation", "extra": {"action": {"session": [{"@ref": "1261", "@numero": "GE1716206", "periode": {"fin": "20261218", "debut": "20240101"}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "ROBERT-TISSOT", "prenom": "Frederique", "telfixe": {"numtel": ["0781936238"]}, "courriel": "fle@csc-saint-louis.fr"}, "type-contact": "3"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"ligne": ["95 Rue de Mulhouse"], "ville": "Saint-Louis", "codepostal": "68300", "denomination": "Maison de quartier", "code-INSEE-commune": "68297"}}, "periode-inscription": {"periode": {"fin": "20261218", "debut": "20240101"}}, "modalites-inscription": "FLI niveau A1.1", "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": null, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81022", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81042", "@ref": "V14", "@info": "code-public-vise"}, {"$": "Atelier FLE", "@info": "programme-financeur"}, {"$": "BOP 104", "@info": "ref-action-marche-financeur"}]}], "code-financeur": "19", "nb-places-financees": 10}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "95 Rue de Mulhouse", "commune": "Saint-Louis", "publics": ["personnes-exilees"], "courriel": "accueil@csc-saint-louis.fr", "date_maj": "2024-12-13", "latitude": 47.592185, "longitude": 7.55682, "structure": {"id": "carif-oref--01_GE305705", "nom": "Centre socio-culturel de Saint-Louis", "siret": "77897285100092", "source": "carif-oref", "adresse": "95 Rue de Mulhouse", "commune": "Saint-Louis", "courriel": "accueil@csc-saint-louis.fr", "date_maj": "2025-06-02", "doublons": [], "latitude": 47.592185, "site_web": null, "longitude": 7.55682, "telephone": "+33389691668", "code_insee": "68297", "code_postal": "68300", "description": null, "lien_source": "https://www.intercariforef.org/formations/centre-socio-culturel-de-saint-louis/organisme-01_GE305705.html", "score_qualite": 0.85, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33389691668", "code_insee": "68297", "code_postal": "68300", "description": "### Objectif de la formation\n\nL'objectif du cours de Français Langue d'Intégration est d'apporter de l'aide dans les processus de socialisation des populations migrantes par l'apprentissage du français. Il s'agit de développer les compétences communicatives orales et écrites afin de favoriser l'autonomie de la personne, d'aider l'apprenant à s'approprier l'environnement social et les règles de la vie en France, de le rendre indépendant grâce à son travail et de le sensibiliser à la culture française.\n\n### Contenu de la formation\n\nProposition de cours de niveau A1, A2, B1, de cours de conversation, de cours d'alphabétisation.", "lien_source": "https://formation.grandest.fr/accueil/formations/113663", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--01_GE305705", "modes_accueil": ["en-presentiel"], "score_qualite": 0.8299999999999998, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Positionnement selon niveau par le CIDFF", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$68b0b379-f54e-4df3-a850-795fa9e49c3f$seed$, $seed$f4930a06-d645-443e-ae04-e1ddd246adf5$seed$, 1, $seed$DI$seed$, $seed$error$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$c85d2432-9257-456c-9f29-9efbb80a8389$seed$, $seed$2026-06-17 14:36:08.26557+00$seed$, $seed$2026-06-17 14:36:11.416705+00$seed$, $seed$---
id: carif-oref--01_GE1692490
nom: Objectif compétences de base
type: formation
extra:
  action:
    session:
      - "@ref": "6828"
        "@numero": GE1692490
        periode:
          fin: "20261031"
          debut: "20250115"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: JAUJOU
              prenom: Coralie
              telfixe:
                numtel:
                  - "0602417176"
              courriel: cjaujou@arfp.asso.fr
            type-contact: "3"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            ligne:
              - 7 Boulevard des Nations
              - Service Orientation et Formation professionnelle
            ville: Mulhouse
            codepostal: "68200"
            denomination: Atelier de Pédagogie Personnalisée de MULHOUSE - APP
            code-INSEE-commune: "68224"
        periode-inscription:
          periode:
            fin: "20251219"
            debut: "20250115"
        modalites-inscription: >-
          Inscription sur information collective aupres de FranceTravail.

          Contacter l APP directement pour prise de rendez-vous individuel avec
          la coordinatrice au 03.89.33.19.12
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 300
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "80006"
                "@ref": V14
                "@info": code-public-vise
              - $: Programme Régional de Formation
                "@info": programme-financeur
              - $: 2025-18521
                "@info": ref-action-marche-financeur
        code-financeur: "2"
        nb-places-financees: 315
    modalites-recrutement: Un positionnement (entretien, test de niveau) est réalisé
      à l'entrée de formation. Le programme de formation est construit en
      fonction du niveau repéré et des objectifs à atteindre.
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 7 Boulevard des Nations, Service Orientation et Formation professionnelle
commune: Mulhouse
publics:
  - demandeurs-emploi
courriel: app.mulhouse@arfp.asso.fr
date_maj: 2026-05-29
latitude: 47.747462
longitude: 7.33195
telephone: "+33389331912"
code_insee: "68224"
code_postal: "68200"
description: >-
  ### Objectif de la formation


  L'action proposée vise à minima la maîtrise d'une ou

  plusieurs des compétences de base du référentiel CLéA, en lien direct avec le

  projet d'insertion dans l'emploi des personnes et elle est élargie à

  l'acquisition ou au renforcement d'une ou plusieurs des compétences clés

  européennes.


  Pour l'apprenant concrètement il s'agit de développer des

  compétences en français, mathématiques, culture numérique, comptabilité,

  anglais etc. et d'améliorer ses stratégies d'apprentissage dans la perspective

  par exemple :


  * D'acquérir
    les savoirs et compétences de base (lire/écrire/s'exprimer/calculer/se
    repérer dans l'espace, le temps/ développer sa logique, mémoire)
  * D'utiliser
    les outils numériques (messagerie électronique, internet, logiciels
    éditeurs de documents, outils collaboratifs, outils de visio...)
  * D'atteindre
    les prérequis d'une formation qualifiante
  * De
    développer des compétences directement mobilisables en emploi
  * De
    gagner en autonomie dans sa vie professionnelle
  * De
    se préparer aux épreuves d'une examen, d'un titre professionnel ou d'une
    certification
  * De
    se préparer aux épreuves écrites et orales d'un concours
  * De
    renforcer un accompagnement VAE par de l'aide à l'écriture, par une remise
    à niveau dans une discipline, se préparer à l'oral de jury...
  * D'obtenir
    une certification : CléA, CléA numérique (hors financement région)

  ### Contenu de la formation


  **Chaque stagiaire bénéficie d'un parcours de formation

  personnalisé, dans le domaine des savoirs de base et des compétences clés, qui

  tient compte de ses acquis ainsi que des exigences liées aux objectifs
  visés** (entrée

  en formation qualifiante, épreuve d'examen et de concours, développement de

  compétences pour l'accès à l'emploi...).


  Ainsi pourront être travaillés :


  **Les sept domaines du socle de connaissances et de

  compétences professionnelles (CléA) :**


  * La
    communication en français
  * L'utilisation
    des règles de base en calcul et du raisonnement logique
  * L'utilisation
    des techniques usuelles de l'information et de la communication numérique
  * L'aptitude
    à travailler dans le cadre de règles définies d'une travail en équipe
  * L'aptitude
    à travailler en autonomie et à réaliser un objectif individuel
  * La
    capacité à apprendre à apprendre tout au long de la vie la maitrise des
    gestes et posture et respect des règles d'hygiène, de sécurité et
    environnementales élémentaire

  **La lutte contre l'illettrisme.**


  **L'appropriation des outils numérique**.


  Cette offre minimale, plutôt de niveau 3 (anciennement V)

  est élargie aux compétences clés européennes.


  Chaque bénéficiaire peut ainsi accéder à des modules

  complémentaires (anglais, culture générale, comptabilité...) ou à des modules

  de renforcement à chaque fois que nécessaire et en fonction des besoins et

  nécessités repérés.
lien_source: https://formation.grandest.fr/accueil/formations/121997
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
  - lecture-ecriture-calcul--maitriser-le-calcul
structure_id: carif-oref--01_208
modes_accueil:
  - en-presentiel
score_qualite: 0.8499999999999999
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Maitrise a minima de la langue francaise
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
adresse_certifiee: false
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: Un positionnement (entretien, test de niveau) est
  réalisé à l'entrée de formation. Le programme de formation est construit en
  fonction du niveau repéré et des objectifs à atteindre.
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--01_208
  nom: Association pour la Réadaptation et la Formation Professionnelle
  siret: "77895430500018"
  source: carif-oref
  adresse: 1 Rue Schertz
  commune: Strasbourg
  courriel: app.mulhouse@arfp.asso.fr
  date_maj: 2026-03-06
  doublons: []
  latitude: 48.556139
  site_web: https://www.crm68.fr/
  longitude: 7.745021
  telephone: "+33389331912"
  code_insee: "67482"
  code_postal: "67100"
  description: null
  lien_source: https://www.intercariforef.org/formations/association-pour-la-readaptation-et-la-formation-professionnelle/organisme-01_208.html
  score_qualite: 0.88
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Objectif compétences de base

### Objectif de la formation

L'action proposée vise à minima la maîtrise d'une ou
plusieurs des compétences de base du référentiel CLéA, en lien direct avec le
projet d'insertion dans l'emploi des personnes et elle est élargie à
l'acquisition ou au renforcement d'une ou plusieurs des compétences clés
européennes.

Pour l'apprenant concrètement il s'agit de développer des
compétences en français, mathématiques, culture numérique, comptabilité,
anglais etc. et d'améliorer ses stratégies d'apprentissage dans la perspective
par exemple :

* D'acquérir
  les savoirs et compétences de base (lire/écrire/s'exprimer/calculer/se
  repérer dans l'espace, le temps/ développer sa logique, mémoire)
* D'utiliser
  les outils numériques (messagerie électronique, internet, logiciels
  éditeurs de documents, outils collaboratifs, outils de visio...)
* D'atteindre
  les prérequis d'une formation qualifiante
* De
  développer des compétences directement mobilisables en emploi
* De
  gagner en autonomie dans sa vie professionnelle
* De
  se préparer aux épreuves d'une examen, d'un titre professionnel ou d'une
  certification
* De
  se préparer aux épreuves écrites et orales d'un concours
* De
  renforcer un accompagnement VAE par de l'aide à l'écriture, par une remise
  à niveau dans une discipline, se préparer à l'oral de jury...
* D'obtenir
  une certification : CléA, CléA numérique (hors financement région)

### Contenu de la formation

**Chaque stagiaire bénéficie d'un parcours de formation
personnalisé, dans le domaine des savoirs de base et des compétences clés, qui
tient compte de ses acquis ainsi que des exigences liées aux objectifs visés** (entrée
en formation qualifiante, épreuve d'examen et de concours, développement de
compétences pour l'accès à l'emploi...).

Ainsi pourront être travaillés :

**Les sept domaines du socle de connaissances et de
compétences professionnelles (CléA) :**

* La
  communication en français
* L'utilisation
  des règles de base en calcul et du raisonnement logique
* L'utilisation
  des techniques usuelles de l'information et de la communication numérique
* L'aptitude
  à travailler dans le cadre de règles définies d'une travail en équipe
* L'aptitude
  à travailler en autonomie et à réaliser un objectif individuel
* La
  capacité à apprendre à apprendre tout au long de la vie la maitrise des
  gestes et posture et respect des règles d'hygiène, de sécurité et
  environnementales élémentaire

**La lutte contre l'illettrisme.**

**L'appropriation des outils numérique**.

Cette offre minimale, plutôt de niveau 3 (anciennement V)
est élargie aux compétences clés européennes.

Chaque bénéficiaire peut ainsi accéder à des modules
complémentaires (anglais, culture générale, comptabilité...) ou à des modules
de renforcement à chaque fois que nécessaire et en fonction des besoins et
nécessités repérés.

## Conditions d'accès

Maitrise a minima de la langue francaise$seed$, $seed${"id": "carif-oref--01_GE1692490", "nom": "Objectif compétences de base", "type": "formation", "extra": {"action": {"session": [{"@ref": "6828", "@numero": "GE1692490", "periode": {"fin": "20261031", "debut": "20250115"}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "JAUJOU", "prenom": "Coralie", "telfixe": {"numtel": ["0602417176"]}, "courriel": "cjaujou@arfp.asso.fr"}, "type-contact": "3"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"ligne": ["7 Boulevard des Nations", "Service Orientation et Formation professionnelle"], "ville": "Mulhouse", "codepostal": "68200", "denomination": "Atelier de Pédagogie Personnalisée de MULHOUSE - APP", "code-INSEE-commune": "68224"}}, "periode-inscription": {"periode": {"fin": "20251219", "debut": "20250115"}}, "modalites-inscription": "Inscription sur information collective aupres de FranceTravail.\nContacter l APP directement pour prise de rendez-vous individuel avec la coordinatrice au 03.89.33.19.12", "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 300, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "80006", "@ref": "V14", "@info": "code-public-vise"}, {"$": "Programme Régional de Formation", "@info": "programme-financeur"}, {"$": "2025-18521", "@info": "ref-action-marche-financeur"}]}], "code-financeur": "2", "nb-places-financees": 315}], "modalites-recrutement": "Un positionnement (entretien, test de niveau) est réalisé à l'entrée de formation. Le programme de formation est construit en fonction du niveau repéré et des objectifs à atteindre.", "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "7 Boulevard des Nations, Service Orientation et Formation professionnelle", "commune": "Mulhouse", "publics": ["demandeurs-emploi"], "courriel": "app.mulhouse@arfp.asso.fr", "date_maj": "2026-05-29", "latitude": 47.747462, "longitude": 7.33195, "structure": {"id": "carif-oref--01_208", "nom": "Association pour la Réadaptation et la Formation Professionnelle", "siret": "77895430500018", "source": "carif-oref", "adresse": "1 Rue Schertz", "commune": "Strasbourg", "courriel": "app.mulhouse@arfp.asso.fr", "date_maj": "2026-03-06", "doublons": [], "latitude": 48.556139, "site_web": "https://www.crm68.fr/", "longitude": 7.745021, "telephone": "+33389331912", "code_insee": "67482", "code_postal": "67100", "description": null, "lien_source": "https://www.intercariforef.org/formations/association-pour-la-readaptation-et-la-formation-professionnelle/organisme-01_208.html", "score_qualite": 0.88, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33389331912", "code_insee": "68224", "code_postal": "68200", "description": "### Objectif de la formation\n\nL'action proposée vise à minima la maîtrise d'une ou\nplusieurs des compétences de base du référentiel CLéA, en lien direct avec le\nprojet d'insertion dans l'emploi des personnes et elle est élargie à\nl'acquisition ou au renforcement d'une ou plusieurs des compétences clés\neuropéennes.\n\nPour l'apprenant concrètement il s'agit de développer des\ncompétences en français, mathématiques, culture numérique, comptabilité,\nanglais etc. et d'améliorer ses stratégies d'apprentissage dans la perspective\npar exemple :\n\n* D'acquérir\n  les savoirs et compétences de base (lire/écrire/s'exprimer/calculer/se\n  repérer dans l'espace, le temps/ développer sa logique, mémoire)\n* D'utiliser\n  les outils numériques (messagerie électronique, internet, logiciels\n  éditeurs de documents, outils collaboratifs, outils de visio...)\n* D'atteindre\n  les prérequis d'une formation qualifiante\n* De\n  développer des compétences directement mobilisables en emploi\n* De\n  gagner en autonomie dans sa vie professionnelle\n* De\n  se préparer aux épreuves d'une examen, d'un titre professionnel ou d'une\n  certification\n* De\n  se préparer aux épreuves écrites et orales d'un concours\n* De\n  renforcer un accompagnement VAE par de l'aide à l'écriture, par une remise\n  à niveau dans une discipline, se préparer à l'oral de jury...\n* D'obtenir\n  une certification : CléA, CléA numérique (hors financement région)\n\n### Contenu de la formation\n\n**Chaque stagiaire bénéficie d'un parcours de formation\npersonnalisé, dans le domaine des savoirs de base et des compétences clés, qui\ntient compte de ses acquis ainsi que des exigences liées aux objectifs visés** (entrée\nen formation qualifiante, épreuve d'examen et de concours, développement de\ncompétences pour l'accès à l'emploi...).\n\nAinsi pourront être travaillés :\n\n**Les sept domaines du socle de connaissances et de\ncompétences professionnelles (CléA) :**\n\n* La\n  communication en français\n* L'utilisation\n  des règles de base en calcul et du raisonnement logique\n* L'utilisation\n  des techniques usuelles de l'information et de la communication numérique\n* L'aptitude\n  à travailler dans le cadre de règles définies d'une travail en équipe\n* L'aptitude\n  à travailler en autonomie et à réaliser un objectif individuel\n* La\n  capacité à apprendre à apprendre tout au long de la vie la maitrise des\n  gestes et posture et respect des règles d'hygiène, de sécurité et\n  environnementales élémentaire\n\n**La lutte contre l'illettrisme.**\n\n**L'appropriation des outils numérique**.\n\nCette offre minimale, plutôt de niveau 3 (anciennement V)\nest élargie aux compétences clés européennes.\n\nChaque bénéficiaire peut ainsi accéder à des modules\ncomplémentaires (anglais, culture générale, comptabilité...) ou à des modules\nde renforcement à chaque fois que nécessaire et en fonction des besoins et\nnécessités repérés.", "lien_source": "https://formation.grandest.fr/accueil/formations/121997", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais", "lecture-ecriture-calcul--maitriser-le-calcul"], "structure_id": "carif-oref--01_208", "modes_accueil": ["en-presentiel"], "score_qualite": 0.8499999999999999, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Maitrise a minima de la langue francaise", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "adresse_certifiee": false, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": "Un positionnement (entretien, test de niveau) est réalisé à l'entrée de formation. Le programme de formation est construit en fonction du niveau repéré et des objectifs à atteindre.", "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$e9956851-a7c3-44f4-80dd-a01264b63b73$seed$, $seed$2055ccad-4c41-48ab-b743-e9b0a4fb8666$seed$, 1, $seed$DI$seed$, $seed$compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$e7eb67c9-d6de-488e-8def-4b74996d6fa7$seed$, $seed$2026-06-17 14:36:08.26557+00$seed$, $seed$2026-06-17 14:36:11.416705+00$seed$, $seed$---
id: carif-oref--01_AL1954771
nom: Ouvrir l'école aux parents pour la réussite des enfants - OEPRE
type: formation
extra:
  action:
    session:
      - "@ref": "12114"
        "@numero": GE1954771
        periode:
          fin: "20270131"
          debut: "20250901"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: non precise
              prenom: .
              telfixe:
                numtel:
                  - "0389793216"
              courriel: ce.0681632E@ac-strasbourg.fr
            type-contact: "3"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            ligne:
              - 19 Rue de Berlin
            ville: Colmar
            codepostal: "68000"
            denomination: 19 rue de Berlin Colmar
            code-INSEE-commune: "68066"
        periode-inscription:
          periode:
            fin: "20270131"
            debut: "20250901"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 120
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: OEPRE
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 19 Rue de Berlin
commune: Colmar
publics:
  - personnes-exilees
courriel: ce.0681632E@ac-strasbourg.fr
date_maj: 2026-01-07
latitude: 48.07382
longitude: 7.325337
telephone: "+33389793216"
code_insee: "68066"
code_postal: "68000"
description: >-
  ### Objectif de la formation


  Les formations ont pour but d'améliorer les compétences des parents ayant un
  profil ALPHA et :  

  - d'apprendre, dans l'enceinte d'un établissement scolaire, la langue
  française à l'oral et à l'écrit en s'appropriant les principes et valeurs de
  la République en découvrant le fonctionnement de l'école ;  

  - afin d'acquérir les moyens d'aider ses propres enfants au cours de leur
  scolarité.  

  Validation et sanction :  

  - Attestation de suivi  

  - Validation possible selon le cas (DILF, DELF, DCL).


  ### Contenu de la formation


  Les formations portent sur trois axes d'apprentissage :  

  - l'acquisition du français (comprendre, parler, lire et écrire) ;  

  - la connaissance des valeurs de la République et leur mise en œuvre dans la
  société française ;  

  - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des
  élèves et des parents.  

  Cette formation est assurée par des enseignants en Français Langue Seconde ou
  des membres d'associations diplômés en FLE-FLS.
lien_source: https://formation.grandest.fr/accueil/formations/42044
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
  - lecture-ecriture-calcul--maitriser-le-calcul
structure_id: carif-oref--01_987
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Pas de condition specifique
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--01_987
  nom: Etablissement scolaire
  siret: "21680066400114"
  source: carif-oref
  adresse: 19 Rue de Berlin
  commune: Colmar
  courriel: ce.0681632E@ac-strasbourg.fr
  date_maj: 2026-01-07
  doublons: []
  latitude: 48.07382
  site_web: null
  longitude: 7.325337
  telephone: "+33389793216"
  code_insee: "68066"
  code_postal: "68000"
  description: null
  lien_source: https://www.intercariforef.org/formations/etablissement-scolaire/organisme-01_987.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Ouvrir l'école aux parents pour la réussite des enfants - OEPRE

### Objectif de la formation

Les formations ont pour but d'améliorer les compétences des parents ayant un profil ALPHA et :  
- d'apprendre, dans l'enceinte d'un établissement scolaire, la langue française à l'oral et à l'écrit en s'appropriant les principes et valeurs de la République en découvrant le fonctionnement de l'école ;  
- afin d'acquérir les moyens d'aider ses propres enfants au cours de leur scolarité.  
Validation et sanction :  
- Attestation de suivi  
- Validation possible selon le cas (DILF, DELF, DCL).

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage :  
- l'acquisition du français (comprendre, parler, lire et écrire) ;  
- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  
- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.  
Cette formation est assurée par des enseignants en Français Langue Seconde ou des membres d'associations diplômés en FLE-FLS.

## Conditions d'accès

Pas de condition specifique$seed$, $seed${"id": "carif-oref--01_AL1954771", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "type": "formation", "extra": {"action": {"session": [{"@ref": "12114", "@numero": "GE1954771", "periode": {"fin": "20270131", "debut": "20250901"}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "non precise", "prenom": ".", "telfixe": {"numtel": ["0389793216"]}, "courriel": "ce.0681632E@ac-strasbourg.fr"}, "type-contact": "3"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"ligne": ["19 Rue de Berlin"], "ville": "Colmar", "codepostal": "68000", "denomination": "19 rue de Berlin Colmar", "code-INSEE-commune": "68066"}}, "periode-inscription": {"periode": {"fin": "20270131", "debut": "20250901"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "OEPRE", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "19 Rue de Berlin", "commune": "Colmar", "publics": ["personnes-exilees"], "courriel": "ce.0681632E@ac-strasbourg.fr", "date_maj": "2026-01-07", "latitude": 48.07382, "longitude": 7.325337, "structure": {"id": "carif-oref--01_987", "nom": "Etablissement scolaire", "siret": "21680066400114", "source": "carif-oref", "adresse": "19 Rue de Berlin", "commune": "Colmar", "courriel": "ce.0681632E@ac-strasbourg.fr", "date_maj": "2026-01-07", "doublons": [], "latitude": 48.07382, "site_web": null, "longitude": 7.325337, "telephone": "+33389793216", "code_insee": "68066", "code_postal": "68000", "description": null, "lien_source": "https://www.intercariforef.org/formations/etablissement-scolaire/organisme-01_987.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33389793216", "code_insee": "68066", "code_postal": "68000", "description": "### Objectif de la formation\n\nLes formations ont pour but d'améliorer les compétences des parents ayant un profil ALPHA et :  \n- d'apprendre, dans l'enceinte d'un établissement scolaire, la langue française à l'oral et à l'écrit en s'appropriant les principes et valeurs de la République en découvrant le fonctionnement de l'école ;  \n- afin d'acquérir les moyens d'aider ses propres enfants au cours de leur scolarité.  \nValidation et sanction :  \n- Attestation de suivi  \n- Validation possible selon le cas (DILF, DELF, DCL).\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :  \n- l'acquisition du français (comprendre, parler, lire et écrire) ;  \n- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  \n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.  \nCette formation est assurée par des enseignants en Français Langue Seconde ou des membres d'associations diplômés en FLE-FLS.", "lien_source": "https://formation.grandest.fr/accueil/formations/42044", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais", "lecture-ecriture-calcul--maitriser-le-calcul"], "structure_id": "carif-oref--01_987", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Pas de condition specifique", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$69d61e8c-36a9-4af0-ab5d-e62e7d5deb6e$seed$, $seed$0b759658-7c73-4a84-b87d-bb6d7b067f7d$seed$, 1, $seed$DI$seed$, $seed$non_compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$9241f8c0-e70e-4459-b908-219eebab5fb1$seed$, $seed$2026-06-17 14:36:08.371026+00$seed$, $seed$2026-06-17 14:36:08.371026+00$seed$, $seed$---
id: carif-oref--01_GE2030516
nom: Atelier Français Langue Etrangère - Formation en français - Alphabétisation
  niveau A1.1 - Groupe 2 (ASL)
type: formation
extra:
  action:
    session:
      - "@ref": "13910"
        "@numero": GE2030516
        periode:
          fin: "20260630"
          debut: "20250915"
        recrutement:
          - "@numero": 01_GE896174
            adresse:
              ligne:
                - 3 rue Georges Risler
              ville: Mulhouse
              codepostal: "68100"
              departement: "68"
              denomination: CDAFAL 68 Association
              code-INSEE-commune: "68224"
            periode:
              fin: "20260121"
              debut: "20260121"
            heure-fin: 12h00
            nb-places: 12
            a-distance: "0"
            commentaire: Compter 30mn par rendez-vous
            heure-debut: 09h00
            modalite-recrutement: "8"
            code-perimetre-recrutement: "2"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: AHMANE
              prenom: Malika
              telfixe:
                numtel:
                  - "0787069017"
              courriel: cdafal68.asl@hotmail.fr
            type-contact: "3"
          - coordonnees:
              nom: KOBEL
              prenom: Christiane
              telfixe:
                numtel:
                  - "0608056497"
              courriel: cdafal68.asl@hotmail.fr
            type-contact: "5"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            ligne:
              - 3 Rue Georges Risler
            ville: Mulhouse
            codepostal: "68100"
            denomination: Cdafal 68
            code-INSEE-commune: "68224"
        periode-inscription:
          periode:
            fin: "20260630"
            debut: "20250901"
        modalites-inscription: |-
          Inscription tous les mercredis matin.
          Contact : https://formation.cdafal68.eu/ ou 03 89 42 85 20
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: null
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81021"
                "@ref": V14
                "@info": code-public-vise
              - $: "81022"
                "@ref": V14
                "@info": code-public-vise
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "81042"
                "@ref": V14
                "@info": code-public-vise
              - $: Atelier FLE
                "@info": programme-financeur
              - $: BOP 104
                "@info": ref-action-marche-financeur
        code-financeur: "19"
        nb-places-financees: 12
    modalites-recrutement: |-
      - Test de positionnement de départ.
      - Évaluation préalable.
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "11"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 100 Avenue de Colmar
commune: Mulhouse
publics: null
courriel: cdafal68.asl@hotmail.fr
date_maj: 2026-06-10
latitude: 47.756287
longitude: 7.336421
telephone: "+33787069017"
code_insee: "68224"
code_postal: "68200"
description: |-
  ### Objectif de la formation

  - Se présenter et présenter sa famille.  
  - Écrire son nom et son prénom.  
  - Discriminer les sons des voyelles et des consonnes.  
  - Remplir un formulaire simple avec leurs éléments d'identité de base.

  ### Contenu de la formation

  - Acquisition de la lecture.  
  - Production orale, activités d'expression.  
  - Production écrite.  
  - Réception écrite.
lien_source: https://cdafal68.eu/
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
structure_id: carif-oref--01_GE305449
modes_accueil:
  - en-presentiel
score_qualite: 0.7999999999999999
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Pas de prerequis.
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: |-
  - Test de positionnement de départ.
  - Évaluation préalable.
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--01_GE305449
  nom: Conseil Départemental des Associations des Familles Laïques du Haut Rhin
    Association
  siret: "43751505900032"
  source: carif-oref
  adresse: 100 Avenue de Colmar
  commune: Mulhouse
  courriel: cdafal68.asl@hotmail.fr
  date_maj: 2026-06-10
  doublons: []
  latitude: 47.756287
  site_web: http://cdafal68.eu/
  longitude: 7.336421
  telephone: "+33787069017"
  code_insee: "68224"
  code_postal: "68200"
  description: null
  lien_source: https://www.intercariforef.org/formations/conseil-departemental-des-associations-des-familles-laiques-du-haut-rhin-association/organisme-01_GE305449.html
  score_qualite: 0.88
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Atelier Français Langue Etrangère - Formation en français - Alphabétisation niveau A1.1 - Groupe 2 (ASL)

### Objectif de la formation

- Se présenter et présenter sa famille.  
- Écrire son nom et son prénom.  
- Discriminer les sons des voyelles et des consonnes.  
- Remplir un formulaire simple avec leurs éléments d'identité de base.

### Contenu de la formation

- Acquisition de la lecture.  
- Production orale, activités d'expression.  
- Production écrite.  
- Réception écrite.

## Conditions d'accès

Pas de prerequis.$seed$, $seed${"id": "carif-oref--01_GE2030516", "nom": "Atelier Français Langue Etrangère - Formation en français - Alphabétisation niveau A1.1 - Groupe 2 (ASL)", "type": "formation", "extra": {"action": {"session": [{"@ref": "13910", "@numero": "GE2030516", "periode": {"fin": "20260630", "debut": "20250915"}, "recrutement": [{"@numero": "01_GE896174", "adresse": {"ligne": ["3 rue Georges Risler"], "ville": "Mulhouse", "codepostal": "68100", "departement": "68", "denomination": "CDAFAL 68 Association", "code-INSEE-commune": "68224"}, "periode": {"fin": "20260121", "debut": "20260121"}, "heure-fin": "12h00", "nb-places": 12, "a-distance": "0", "commentaire": "Compter 30mn par rendez-vous", "heure-debut": "09h00", "modalite-recrutement": "8", "code-perimetre-recrutement": "2"}], "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "AHMANE", "prenom": "Malika", "telfixe": {"numtel": ["0787069017"]}, "courriel": "cdafal68.asl@hotmail.fr"}, "type-contact": "3"}, {"coordonnees": {"nom": "KOBEL", "prenom": "Christiane", "telfixe": {"numtel": ["0608056497"]}, "courriel": "cdafal68.asl@hotmail.fr"}, "type-contact": "5"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"ligne": ["3 Rue Georges Risler"], "ville": "Mulhouse", "codepostal": "68100", "denomination": "Cdafal 68", "code-INSEE-commune": "68224"}}, "periode-inscription": {"periode": {"fin": "20260630", "debut": "20250901"}}, "modalites-inscription": "Inscription tous les mercredis matin.\nContact : https://formation.cdafal68.eu/ ou 03 89 42 85 20", "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": null, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81021", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81022", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81042", "@ref": "V14", "@info": "code-public-vise"}, {"$": "Atelier FLE", "@info": "programme-financeur"}, {"$": "BOP 104", "@info": "ref-action-marche-financeur"}]}], "code-financeur": "19", "nb-places-financees": 12}], "modalites-recrutement": "- Test de positionnement de départ.\n- Évaluation préalable.", "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "11", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "100 Avenue de Colmar", "commune": "Mulhouse", "publics": null, "courriel": "cdafal68.asl@hotmail.fr", "date_maj": "2026-06-10", "latitude": 47.756287, "longitude": 7.336421, "structure": {"id": "carif-oref--01_GE305449", "nom": "Conseil Départemental des Associations des Familles Laïques du Haut Rhin Association", "siret": "43751505900032", "source": "carif-oref", "adresse": "100 Avenue de Colmar", "commune": "Mulhouse", "courriel": "cdafal68.asl@hotmail.fr", "date_maj": "2026-06-10", "doublons": [], "latitude": 47.756287, "site_web": "http://cdafal68.eu/", "longitude": 7.336421, "telephone": "+33787069017", "code_insee": "68224", "code_postal": "68200", "description": null, "lien_source": "https://www.intercariforef.org/formations/conseil-departemental-des-associations-des-familles-laiques-du-haut-rhin-association/organisme-01_GE305449.html", "score_qualite": 0.88, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33787069017", "code_insee": "68224", "code_postal": "68200", "description": "### Objectif de la formation\n\n- Se présenter et présenter sa famille.  \n- Écrire son nom et son prénom.  \n- Discriminer les sons des voyelles et des consonnes.  \n- Remplir un formulaire simple avec leurs éléments d'identité de base.\n\n### Contenu de la formation\n\n- Acquisition de la lecture.  \n- Production orale, activités d'expression.  \n- Production écrite.  \n- Réception écrite.", "lien_source": "https://cdafal68.eu/", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--01_GE305449", "modes_accueil": ["en-presentiel"], "score_qualite": 0.7999999999999999, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Pas de prerequis.", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": "- Test de positionnement de départ.\n- Évaluation préalable.", "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$9afab3e0-113c-4eff-84ae-e63dafed0713$seed$, $seed$a1668c1e-abb3-4de1-8b02-23fb62afa7d7$seed$, 2, $seed$DI$seed$, NULL) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$f9aaf091-75d7-4888-afed-b011c946c2ac$seed$, $seed$2026-06-17 14:36:08.371026+00$seed$, $seed$2026-06-17 14:36:08.371026+00$seed$, $seed$---
id: carif-oref--01_GE2021586
nom: Ouvrir l'école aux parents pour la réussite des enfants
type: formation
extra:
  action:
    session:
      - "@ref": "12284"
        "@numero": GE2021586
        periode:
          fin: "20270131"
          debut: "20250901"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: non precise
              prenom: non precise
              telfixe:
                numtel:
                  - "0387509020"
              courriel: ce.0572493A@ac-nancy-metz.fr
            type-contact: "3"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            ligne:
              - 1 place du Mineur
            ville: Petite-Rosselle
            codepostal: "57540"
            denomination: 1 place du Mineur
            code-INSEE-commune: "57537"
        periode-inscription:
          periode:
            fin: "20270131"
            debut: "20250901"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 120
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "81042"
                "@ref": V14
                "@info": code-public-vise
              - $: OEPRE
                "@info": programme-financeur
              - $: .
                "@info": ref-action-marche-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 1 Place du Mineur
commune: Petite-Rosselle
publics:
  - personnes-exilees
courriel: ce.0572493A@ac-nancy-metz.fr
date_maj: 2026-01-14
latitude: 49.209202
longitude: 6.850071
telephone: "+33387509020"
code_insee: "57537"
code_postal: "57540"
description: >-
  ### Objectif de la formation


  - Les formations ont pour but de favoriser l'intégration des parents d'élèves,
  primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en
  les impliquant notamment dans la scolarité de leur enfant.  

  - Attestation de suivi.  

  - Validation possible selon le cas (DELF, DCL).


  ### Contenu de la formation


  Les formations portent sur trois axes d'apprentissage :  

  - l'acquisition du français (comprendre, parler, lire et écrire) ;  

  - la connaissance des valeurs de la République et leur mise en œuvre dans la
  société française ;  

  - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des
  élèves et des parents.   

  Cette formation est assurée par des enseignants en Français Langue Seconde,
  des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS.
lien_source: https://formation.grandest.fr/accueil/formations/145866
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
structure_id: carif-oref--01_GE307361
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Etre primo-arrivants, immigres ou etrangers hors Union europeenne.
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "08"
  - "10"
  - "51"
  - "52"
  - "54"
  - "55"
  - "57"
  - "67"
  - "68"
  - "88"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--01_GE307361
  nom: Collège Louis Armand
  siret: "19572493500018"
  source: carif-oref
  adresse: 1 Place du Mineur
  commune: Petite-Rosselle
  courriel: ce.0572493A@ac-nancy-metz.fr
  date_maj: 2026-01-14
  doublons: []
  latitude: 49.209202
  site_web: null
  longitude: 6.850071
  telephone: "+33387509020"
  code_insee: "57537"
  code_postal: "57540"
  description: null
  lien_source: https://www.intercariforef.org/formations/college-louis-armand/organisme-01_GE307361.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Ouvrir l'école aux parents pour la réussite des enfants

### Objectif de la formation

- Les formations ont pour but de favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.  
- Attestation de suivi.  
- Validation possible selon le cas (DELF, DCL).

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage :  
- l'acquisition du français (comprendre, parler, lire et écrire) ;  
- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  
- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.   
Cette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS.

## Conditions d'accès

Etre primo-arrivants, immigres ou etrangers hors Union europeenne.$seed$, $seed${"id": "carif-oref--01_GE2021586", "nom": "Ouvrir l'école aux parents pour la réussite des enfants", "type": "formation", "extra": {"action": {"session": [{"@ref": "12284", "@numero": "GE2021586", "periode": {"fin": "20270131", "debut": "20250901"}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "non precise", "prenom": "non precise", "telfixe": {"numtel": ["0387509020"]}, "courriel": "ce.0572493A@ac-nancy-metz.fr"}, "type-contact": "3"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"ligne": ["1 place du Mineur"], "ville": "Petite-Rosselle", "codepostal": "57540", "denomination": "1 place du Mineur", "code-INSEE-commune": "57537"}}, "periode-inscription": {"periode": {"fin": "20270131", "debut": "20250901"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81042", "@ref": "V14", "@info": "code-public-vise"}, {"$": "OEPRE", "@info": "programme-financeur"}, {"$": ".", "@info": "ref-action-marche-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "1 Place du Mineur", "commune": "Petite-Rosselle", "publics": ["personnes-exilees"], "courriel": "ce.0572493A@ac-nancy-metz.fr", "date_maj": "2026-01-14", "latitude": 49.209202, "longitude": 6.850071, "structure": {"id": "carif-oref--01_GE307361", "nom": "Collège Louis Armand", "siret": "19572493500018", "source": "carif-oref", "adresse": "1 Place du Mineur", "commune": "Petite-Rosselle", "courriel": "ce.0572493A@ac-nancy-metz.fr", "date_maj": "2026-01-14", "doublons": [], "latitude": 49.209202, "site_web": null, "longitude": 6.850071, "telephone": "+33387509020", "code_insee": "57537", "code_postal": "57540", "description": null, "lien_source": "https://www.intercariforef.org/formations/college-louis-armand/organisme-01_GE307361.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33387509020", "code_insee": "57537", "code_postal": "57540", "description": "### Objectif de la formation\n\n- Les formations ont pour but de favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.  \n- Attestation de suivi.  \n- Validation possible selon le cas (DELF, DCL).\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :  \n- l'acquisition du français (comprendre, parler, lire et écrire) ;  \n- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;  \n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.   \nCette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS.", "lien_source": "https://formation.grandest.fr/accueil/formations/145866", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--01_GE307361", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Etre primo-arrivants, immigres ou etrangers hors Union europeenne.", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$ba82ea79-f8f7-4ab0-9738-bc24449be0b4$seed$, $seed$9ae6bbf5-fdc4-4e1e-9156-b848a349fcb4$seed$, 2, $seed$DI$seed$, NULL) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$587c133f-3017-4740-8e09-df0f8b57771d$seed$, $seed$2026-06-17 14:36:08.578326+00$seed$, $seed$2026-06-17 14:36:08.578326+00$seed$, $seed$---
id: carif-oref--03_2552706S
nom: Ouvrir l'école aux parents pour la réussite des enfants - OEPRE
type: formation
extra:
  action:
    session:
      - "@ref": "125840"
        "@numero": 2552706S
        periode:
          fin: "20270131"
          debut: "20250901"
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: Secretariat
              adresse:
                pays: FR
                ligne:
                  - 34 Rue Jean Jaures
                ville: Bron
                region: "03"
                codepostal: "69500"
                departement: "69"
                denomination: Collège Théodore Monod
                geolocalisation:
                  latitude: "45.730538"
                  longitude: "4.903545"
                code-INSEE-commune: "69029"
              telfixe:
                numtel:
                  - "0478268076"
              courriel: ce.0693834T@ac-lyon.fr
            type-contact: "0"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            pays: FR
            ligne:
              - 34 Rue Jean Jaures
            ville: Bron
            codepostal: "69500"
            departement: "69"
            denomination: Collège Théodore Monod
            geolocalisation:
              latitude: "45.730538"
              longitude: "4.903545"
            code-INSEE-commune: "69029"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: Primo-arrivants, refugies sans niveau specifique
    nombre-heures-total: 120
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "80001"
                "@ref": V14
                "@info": code-public-vise
              - $: "81022"
                "@ref": V14
                "@info": code-public-vise
              - $: Primo-arrivants, réfugiés sans niveau spécifique
                "@info": info-public-vise
              - $: "3"
                "@info": code-perimetre-recrutement
              - $: Ouvrir l'Ecole aux parents pour la réussite des enfants (OEPRE)
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 34 Rue Jean Jaurès
commune: Bron
publics:
  - demandeurs-emploi
courriel: ce.0693834T@ac-lyon.fr
date_maj: 2026-01-06
latitude: 45.730538
longitude: 4.903545
telephone: "+33478268076"
code_insee: "69029"
code_postal: "69500"
description: >-
  ### Objectif de la formation


  Les formations ont pour but de favoriser l'intégration des parents d'élèves,
  primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en
  les impliquant notamment dans la scolarité de leur enfant.


  ### Contenu de la formation


  Les formations portent sur trois axes d'apprentissage :


  * **l'acquisition du français (comprendre, parler, lire et écrire**) ;

  * **la connaissance des valeurs de la République et leur mise en œuvre dans la
  société française ;**

  * **la connaissance du fonctionnement et des attentes de l'école vis-à-vis des
  élèves et des parents.**

    
  Cette formation est assurée par des enseignants en Français Langue Seconde,
  des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS
lien_source: https://www.intercariforef.org/formations/ouvrir-l-ecole-aux-parents-pour-la-reussite-des-enfants-oepre/formation-03_1900311F_2552706S.html
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
  - lecture-ecriture-calcul--maitriser-le-calcul
structure_id: carif-oref--03_6665
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: "-"
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "01"
  - "03"
  - "07"
  - "15"
  - "26"
  - "38"
  - "42"
  - "43"
  - "63"
  - "69"
  - "73"
  - "74"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: Primo-arrivants, refugies sans niveau specifique
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--03_6665
  nom: Collège Théodore Monod
  siret: "19693843500027"
  source: carif-oref
  adresse: 34 Rue Jean Jaurès
  commune: Bron
  courriel: ce.0693834T@ac-lyon.fr
  date_maj: 2026-01-06
  doublons: []
  latitude: 45.730538
  site_web: null
  longitude: 4.903545
  telephone: "+33478268076"
  code_insee: "69029"
  code_postal: "69500"
  description: null
  lien_source: https://www.intercariforef.org/formations/college-theodore-monod/organisme-03_6665.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Ouvrir l'école aux parents pour la réussite des enfants - OEPRE

### Objectif de la formation

Les formations ont pour but de favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage :

* **l'acquisition du français (comprendre, parler, lire et écrire**) ;
* **la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;**
* **la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.**

  
Cette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS

## Conditions d'accès

-$seed$, $seed${"id": "carif-oref--03_2552706S", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "type": "formation", "extra": {"action": {"session": [{"@ref": "125840", "@numero": "2552706S", "periode": {"fin": "20270131", "debut": "20250901"}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "Secretariat", "adresse": {"pays": "FR", "ligne": ["34 Rue Jean Jaures"], "ville": "Bron", "region": "03", "codepostal": "69500", "departement": "69", "denomination": "Collège Théodore Monod", "geolocalisation": {"latitude": "45.730538", "longitude": "4.903545"}, "code-INSEE-commune": "69029"}, "telfixe": {"numtel": ["0478268076"]}, "courriel": "ce.0693834T@ac-lyon.fr"}, "type-contact": "0"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"pays": "FR", "ligne": ["34 Rue Jean Jaures"], "ville": "Bron", "codepostal": "69500", "departement": "69", "denomination": "Collège Théodore Monod", "geolocalisation": {"latitude": "45.730538", "longitude": "4.903545"}, "code-INSEE-commune": "69029"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": "Primo-arrivants, refugies sans niveau specifique", "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "80001", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81022", "@ref": "V14", "@info": "code-public-vise"}, {"$": "Primo-arrivants, réfugiés sans niveau spécifique", "@info": "info-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "Ouvrir l'Ecole aux parents pour la réussite des enfants (OEPRE)", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "34 Rue Jean Jaurès", "commune": "Bron", "publics": ["demandeurs-emploi"], "courriel": "ce.0693834T@ac-lyon.fr", "date_maj": "2026-01-06", "latitude": 45.730538, "longitude": 4.903545, "structure": {"id": "carif-oref--03_6665", "nom": "Collège Théodore Monod", "siret": "19693843500027", "source": "carif-oref", "adresse": "34 Rue Jean Jaurès", "commune": "Bron", "courriel": "ce.0693834T@ac-lyon.fr", "date_maj": "2026-01-06", "doublons": [], "latitude": 45.730538, "site_web": null, "longitude": 4.903545, "telephone": "+33478268076", "code_insee": "69029", "code_postal": "69500", "description": null, "lien_source": "https://www.intercariforef.org/formations/college-theodore-monod/organisme-03_6665.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33478268076", "code_insee": "69029", "code_postal": "69500", "description": "### Objectif de la formation\n\nLes formations ont pour but de favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :\n\n* **l'acquisition du français (comprendre, parler, lire et écrire**) ;\n* **la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;**\n* **la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.**\n\n  \nCette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS", "lien_source": "https://www.intercariforef.org/formations/ouvrir-l-ecole-aux-parents-pour-la-reussite-des-enfants-oepre/formation-03_1900311F_2552706S.html", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais", "lecture-ecriture-calcul--maitriser-le-calcul"], "structure_id": "carif-oref--03_6665", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "-", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["01", "03", "07", "15", "26", "38", "42", "43", "63", "69", "73", "74"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": "Primo-arrivants, refugies sans niveau specifique", "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$1ebd6746-33dc-42fd-90dc-4c21823429b9$seed$, $seed$74389db5-335b-40c5-a046-204bd140685b$seed$, 2, $seed$DI$seed$, NULL) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$67fe8b9e-8252-48a8-b13b-4772c8bbed3d$seed$, $seed$2026-06-17 14:36:09.083037+00$seed$, $seed$2026-06-17 14:36:09.083037+00$seed$, $seed$---
id: carif-oref--07_763179S
nom: Du FLE (Français langue étrangère) à l'emploi
type: formation
extra:
  action:
    session:
      - "@ref": "184574"
        "@numero": 763179S
        periode:
          fin: "20261231"
          debut: "20250101"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            pays: FR
            ligne:
              - 1 Allee Napoleon III
            ville: Bourges
            codepostal: "18000"
            departement: "18"
            denomination: Le relais 18
            geolocalisation:
              latitude: "47.074363"
              longitude: "2.419547"
            code-INSEE-commune: "18033"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: 4 a 12 hebdomadaire
    info-public-vise: null
    nombre-heures-total: null
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "3"
                "@info": code-perimetre-recrutement
              - $: Action socio-linguistique (ASL)
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 1 Allée Napoléon III
commune: Bourges
publics:
  - personnes-exilees
courriel: contact@lerelais18.fr
date_maj: 2026-01-20
latitude: 47.074363
longitude: 2.419547
telephone: "+33248656703"
code_insee: "18033"
code_postal: "18000"
description: >-
  ### Objectif de la formation



   La formation FLE a pour objectifs de permettre aux stagiaires : - De
  comprendre et s'exprimer oralement dans des situations diverses de la vie
  courante et dans un contexte professionnel - D'acquérir des bases
  linguistiques pour faciliter le passage à l'écrit - D'acquérir ou renforcer
  des compétences linguistiques attendues en entreprise pour réussir son projet
  professionnel par l'accès à l'emploi et/ou à la qualification - De découvrir
  un environnement professionnel et comprendre les codes de l'entreprise.


  ### Contenu de la formation


  Non renseigné
lien_source: https://www.intercariforef.org/formations/du-fle-francais-langue-etrangere-a-l-emploi/formation-07_25105315F_763179S.html
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
structure_id: carif-oref--10_9514P
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: >-
  
  	Un entretien de positionnement a l arrivee. Orientation en fonction du niveau (debutants, intermediaires ou avances)
  	Prerequis en fonction du niveau d entree souhaite et du niveau d atteinte vise
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "18"
  - "28"
  - "36"
  - "37"
  - "41"
  - "45"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--10_9514P
  nom: Association le relais
  siret: "33361188700162"
  source: carif-oref
  adresse: 1 Allée Napoléon III
  commune: Bourges
  courriel: direction@lerelais18.fr
  date_maj: 2026-01-20
  doublons: []
  latitude: 47.074363
  site_web: null
  longitude: 2.419547
  telephone: "+33248656703"
  code_insee: "18033"
  code_postal: "18000"
  description: null
  lien_source: https://www.intercariforef.org/formations/association-le-relais/organisme-10_9514P.html
  score_qualite: 0.87
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Du FLE (Français langue étrangère) à l'emploi

### Objectif de la formation


 La formation FLE a pour objectifs de permettre aux stagiaires : - De comprendre et s'exprimer oralement dans des situations diverses de la vie courante et dans un contexte professionnel - D'acquérir des bases linguistiques pour faciliter le passage à l'écrit - D'acquérir ou renforcer des compétences linguistiques attendues en entreprise pour réussir son projet professionnel par l'accès à l'emploi et/ou à la qualification - De découvrir un environnement professionnel et comprendre les codes de l'entreprise.

### Contenu de la formation

Non renseigné

## Conditions d'accès

Un entretien de positionnement a l arrivee. Orientation en fonction du niveau (debutants, intermediaires ou avances)
	Prerequis en fonction du niveau d entree souhaite et du niveau d atteinte vise$seed$, $seed${"id": "carif-oref--07_763179S", "nom": "Du FLE (Français langue étrangère) à l'emploi", "type": "formation", "extra": {"action": {"session": [{"@ref": "184574", "@numero": "763179S", "periode": {"fin": "20261231", "debut": "20250101"}, "etat-recrutement": "1", "adresse-inscription": {"adresse": {"pays": "FR", "ligne": ["1 Allee Napoleon III"], "ville": "Bourges", "codepostal": "18000", "departement": "18", "denomination": "Le relais 18", "geolocalisation": {"latitude": "47.074363", "longitude": "2.419547"}, "code-INSEE-commune": "18033"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": "4 a 12 hebdomadaire", "info-public-vise": null, "nombre-heures-total": null, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "Action socio-linguistique (ASL)", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "1 Allée Napoléon III", "commune": "Bourges", "publics": ["personnes-exilees"], "courriel": "contact@lerelais18.fr", "date_maj": "2026-01-20", "latitude": 47.074363, "longitude": 2.419547, "structure": {"id": "carif-oref--10_9514P", "nom": "Association le relais", "siret": "33361188700162", "source": "carif-oref", "adresse": "1 Allée Napoléon III", "commune": "Bourges", "courriel": "direction@lerelais18.fr", "date_maj": "2026-01-20", "doublons": [], "latitude": 47.074363, "site_web": null, "longitude": 2.419547, "telephone": "+33248656703", "code_insee": "18033", "code_postal": "18000", "description": null, "lien_source": "https://www.intercariforef.org/formations/association-le-relais/organisme-10_9514P.html", "score_qualite": 0.87, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33248656703", "code_insee": "18033", "code_postal": "18000", "description": "### Objectif de la formation\n\n\n La formation FLE a pour objectifs de permettre aux stagiaires : - De comprendre et s'exprimer oralement dans des situations diverses de la vie courante et dans un contexte professionnel - D'acquérir des bases linguistiques pour faciliter le passage à l'écrit - D'acquérir ou renforcer des compétences linguistiques attendues en entreprise pour réussir son projet professionnel par l'accès à l'emploi et/ou à la qualification - De découvrir un environnement professionnel et comprendre les codes de l'entreprise.\n\n### Contenu de la formation\n\nNon renseigné", "lien_source": "https://www.intercariforef.org/formations/du-fle-francais-langue-etrangere-a-l-emploi/formation-07_25105315F_763179S.html", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--10_9514P", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "\n\tUn entretien de positionnement a l arrivee. Orientation en fonction du niveau (debutants, intermediaires ou avances)\n\tPrerequis en fonction du niveau d entree souhaite et du niveau d atteinte vise", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["18", "28", "36", "37", "41", "45"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$71f0f131-aa74-4e12-bce0-86b0831127da$seed$, $seed$ed0a29d7-eb99-46b4-9960-e969578f39e0$seed$, 2, $seed$DI$seed$, NULL) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$97b549e5-ee2d-4eb0-a8c0-316349d561c3$seed$, $seed$2026-06-17 14:36:09.277263+00$seed$, $seed$2026-06-17 14:36:09.277263+00$seed$, $seed$---
id: carif-oref--10_377967S
nom: Ouvrir l'école aux parents pour la réussite des enfants - OEPRE
type: formation
extra:
  action:
    session:
      - "@ref": "199453"
        "@numero": 377967S
        periode:
          fin: "20270131"
          debut: "20250901"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            pays: FR
            ligne:
              - Rue Bernard Palissy
            ville: Nevers
            codepostal: "58000"
            departement: "58"
            denomination: Ecole Elémentaire Pierre Brossolette
            geolocalisation:
              latitude: "46.986289"
              longitude: "3.172369"
            code-INSEE-commune: "58194"
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: null
    nombre-heures-total: 80
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "81042"
                "@ref": V14
                "@info": code-public-vise
              - $: "3"
                "@info": code-perimetre-recrutement
              - $: L'école des parents (Oepre)
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: Rue Bernard Palissy
commune: Nevers
publics:
  - personnes-exilees
courriel: ce.0580606u@ac-dijon.fr
date_maj: 2025-09-04
latitude: 46.986289
longitude: 3.172369
telephone: "+33386684384"
code_insee: "58194"
code_postal: "58000"
description: >-
  ### Objectif de la formation


  Favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou
  étrangers hors Union européenne, volontaires, en les impliquant notamment dans
  la scolarité de leur enfant.


  ### Contenu de la formation


  Les formations portent sur trois axes d'apprentissage :  

  - l'acquisition du français (comprendre, parler, lire et écrire),  

  - la connaissance des valeurs de la République et leur mise en oeuvre dans la
  société française,  

  - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des
  élèves et des parents.
lien_source: https://www.intercariforef.org/formations/ouvrir-l-ecole-aux-parents-pour-la-reussite-des-enfants-oepre/formation-10_2590061F_377967S.html
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
structure_id: carif-oref--10_4417
modes_accueil:
  - en-presentiel
score_qualite: 0.8800000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: >-
  Avoir un enfant scolarise dans l etablissement ou se deroule le dispositif ou
  dans un etablissement proche.

  Jours et horaires des ateliers : lundi et vendredi 8h45 10h45
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "21"
  - "25"
  - "39"
  - "58"
  - "70"
  - "71"
  - "89"
  - "90"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: null
mobilisation_precisions: null
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--10_4417
  nom: ECOLE ELEMENTAIRE PIERRE BROSSOLETTE
  siret: "21580194500282"
  source: carif-oref
  adresse: Rue Bernard Palissy
  commune: Nevers
  courriel: null
  date_maj: 2025-09-04
  doublons: []
  latitude: 46.986289
  site_web: null
  longitude: 3.172369
  telephone: "+33386684384"
  code_insee: "58194"
  code_postal: "58000"
  description: null
  lien_source: https://www.intercariforef.org/formations/ecole-elementaire-pierre-brossolette/organisme-10_4417.html
  score_qualite: 0.88
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Ouvrir l'école aux parents pour la réussite des enfants - OEPRE

### Objectif de la formation

Favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage :  
- l'acquisition du français (comprendre, parler, lire et écrire),  
- la connaissance des valeurs de la République et leur mise en oeuvre dans la société française,  
- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.

## Conditions d'accès

Avoir un enfant scolarise dans l etablissement ou se deroule le dispositif ou dans un etablissement proche.
Jours et horaires des ateliers : lundi et vendredi 8h45 10h45$seed$, $seed${"id": "carif-oref--10_377967S", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "type": "formation", "extra": {"action": {"session": [{"@ref": "199453", "@numero": "377967S", "periode": {"fin": "20270131", "debut": "20250901"}, "etat-recrutement": "1", "adresse-inscription": {"adresse": {"pays": "FR", "ligne": ["Rue Bernard Palissy"], "ville": "Nevers", "codepostal": "58000", "departement": "58", "denomination": "Ecole Elémentaire Pierre Brossolette", "geolocalisation": {"latitude": "46.986289", "longitude": "3.172369"}, "code-INSEE-commune": "58194"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 80, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81042", "@ref": "V14", "@info": "code-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "L'école des parents (Oepre)", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "Rue Bernard Palissy", "commune": "Nevers", "publics": ["personnes-exilees"], "courriel": "ce.0580606u@ac-dijon.fr", "date_maj": "2025-09-04", "latitude": 46.986289, "longitude": 3.172369, "structure": {"id": "carif-oref--10_4417", "nom": "ECOLE ELEMENTAIRE PIERRE BROSSOLETTE", "siret": "21580194500282", "source": "carif-oref", "adresse": "Rue Bernard Palissy", "commune": "Nevers", "courriel": null, "date_maj": "2025-09-04", "doublons": [], "latitude": 46.986289, "site_web": null, "longitude": 3.172369, "telephone": "+33386684384", "code_insee": "58194", "code_postal": "58000", "description": null, "lien_source": "https://www.intercariforef.org/formations/ecole-elementaire-pierre-brossolette/organisme-10_4417.html", "score_qualite": 0.88, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33386684384", "code_insee": "58194", "code_postal": "58000", "description": "### Objectif de la formation\n\nFavoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :  \n- l'acquisition du français (comprendre, parler, lire et écrire),  \n- la connaissance des valeurs de la République et leur mise en oeuvre dans la société française,  \n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.", "lien_source": "https://www.intercariforef.org/formations/ouvrir-l-ecole-aux-parents-pour-la-reussite-des-enfants-oepre/formation-10_2590061F_377967S.html", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--10_4417", "modes_accueil": ["en-presentiel"], "score_qualite": 0.8800000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Avoir un enfant scolarise dans l etablissement ou se deroule le dispositif ou dans un etablissement proche.\nJours et horaires des ateliers : lundi et vendredi 8h45 10h45", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["21", "25", "39", "58", "70", "71", "89", "90"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$75286e03-78f0-4c9e-8ec9-93a94871c07a$seed$, $seed$5db1d9b2-7980-4abc-8871-99c0a9436b27$seed$, 2, $seed$DI$seed$, NULL) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$a722c720-6ef3-4355-9e5b-c98a809dd003$seed$, $seed$2026-06-17 14:36:09.655737+00$seed$, $seed$2026-06-17 14:36:09.655737+00$seed$, $seed$---
id: carif-oref--14_SE_0001597312
nom: Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers
  linguistiques du soir
type: formation
extra:
  action:
    session:
      - "@ref": "268350"
        "@numero": SE_0001597312
        periode:
          fin: "20261231"
          debut: "20260105"
        recrutement:
          - "@numero": 14_372130
            adresse:
              pays: FR
              ligne:
                - 44 Boulevard Georges Clemenceau
              ville: Mantes-la-Jolie
              codepostal: "78200"
              departement: "78"
              denomination: IFDEV
              geolocalisation:
                latitude: "48.99789"
                longitude: "1.687963"
              code-INSEE-commune: "78361"
            periode:
              fin: "20261030"
              debut: "20260105"
            heure-fin: 19h00
            nb-places: 40
            a-distance: "0"
            commentaire: "Pré-inscriptions sur le site par un prescripteur  \r

              https://ifdevformations.fr/\r

              une information collective (+ diagnostics oral et écrit) a lieu 1
              fois par mois les mardis de 18 à 19h"
            heure-debut: 18h00
            modalite-recrutement: "9"
            code-perimetre-recrutement: "2"
            infos-perimetre-recrutement: Pré-inscriptions sur le site par un prescripteur
        url-session:
          urlweb:
            - https://ifdevformations.fr/
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: ATIGUI
              prenom: Aicha
              courriel: a.atigui@ifdev.org
            type-contact: "5"
          - coordonnees:
              nom: Atigui
              prenom: Aicha
              courriel: a.atigui@ifdev.fr
            type-contact: "0"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            pays: FR
            ligne:
              - Ifdev
              - 44 Boulevard Georges Clemenceau
            ville: Mantes-la-Jolie
            codepostal: "78200"
            departement: "78"
            denomination: Ifdev
            geolocalisation:
              latitude: "48.99789"
              longitude: "1.687963"
            code-INSEE-commune: "78361"
        periode-inscription:
          periode:
            fin: "20261030"
            debut: "20260102"
        reference-certification:
          - reference-code-RS: RS6775
            reference-code-CERTIFINFO: "117684"
    frais-restants: null
    conventionnement: "1"
    duree-indicative: 2 ateliers de 2h chacun
    info-public-vise: Salaries primo arrivants avec contrat de travail Femmes primo
      arrivantes ayant des problemes de garde d enfant qui ne leur permettent
      pas de suivre les cours en journee.
    nombre-heures-total: 320
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "81042"
                "@ref": V14
                "@info": code-public-vise
              - $: "Salariés primo arrivants avec contrat de travail\r

                  Femmes primo arrivantes ayant des problèmes de garde d'enfant
                  qui ne leur permettent pas de suivre les cours en journée."
                "@info": info-public-vise
              - $: "3"
                "@info": code-perimetre-recrutement
              - $: Actions socio-linguistiques (ASL) complémentaires du CIR 78 - 2025-26
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: null
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 44 Boulevard Georges Clémenceau
commune: Mantes-la-Jolie
publics:
  - personnes-exilees
courriel: a.atigui@ifdev.org
date_maj: 2026-03-23
latitude: 48.99789
longitude: 1.687963
telephone: "+33130946383"
code_insee: "78361"
code_postal: "78200"
description: >-
  ### Objectif de la formation


  Accéder à l'emploi ou préparer une réorientation professionnelle  

  Utiliser l'informatique  

  Préparer un diplôme ou une certification de langue française [DILF, DELF A1,
  DELF A2, DELF B1 ou B2 selon le niveau du bénéficiaire]  

  Devenir autonome au quotidien [Apprentissage de la langue française dans ses
  volets vie pratique / vie publique / vie professionnelle, en vue d'un accès à
  l'autonomie]  

  Se former aux questions civiques et de citoyenneté  
    
  Niveau de langue et de compétences visé par la formation :  

  CECRL : A1, A2, B1  

  Les bénéficiaires sont préparés (examens balncs en condition de passation ) et
  accompagnés à l'inscription aux DELF ou TEF/TCF A2 B1 B2


  ### Contenu de la formation


  Les cours ont lieu par niveau (3 groupes) 2 fois par semaine (mardi et jeudi
  de 18h à 20h):  

  Niveau Débutant (A1.1 /A1 ) : "L'Autonomie Immédiate"  

  Objectif : Pouvoir se débrouiller seul dans la vie quotidienne.


  * Oral : Se présenter (nom, âge, pays), demander son chemin, faire des courses
  (prix, quantités).

  * Écrit : Remplir un formulaire administratif simple, écrire un SMS court,
  lire des panneaux de signalisation.

  * Grammaire : Présent de l'indicatif, articles définis/indéfinis, pronoms
  personnels, les nombres.

  * Atelier pratique : Simulations d'achats au marché ou à la boulangerie.

    
  2. Niveau Intermédiaire (A2 - B1) : "L'intégration et le travail"  

  Objectif : Raconter des événements passés et exprimer des opinions.


  * Oral : Parler de son parcours professionnel, raconter ses vacances, exprimer
  son accord ou désaccord.

  * Écrit : Rédiger un email professionnel, une lettre de motivation courte,
  comprendre une consigne de sécurité.

  * Grammaire : Passé composé vs Imparfait, le futur simple, les pronoms
  relatifs (qui, que, où), le comparatif.

  * Atelier pratique : Jeux de rôles "Entretien d'embauche" ou "Rendez-vous chez
  le médecin".

    
  3. Niveau Avancé (B2) : "L'indépendance et le débat"  

  Objectif : Argumenter et comprendre des sujets complexes (société, actualité).


  * Oral : Participer à un débat, argumenter pour convaincre, comprendre des
  émissions de radio ou des vidéos sans sous-titres.

  * Écrit : Rédiger une lettre de réclamation, faire un compte-rendu de réunion,
  rédiger un texte argumenté.

  * Grammaire : Subjonctif (sentiments, doutes), le conditionnel, la voix
  passive, les connecteurs logiques complexes.

  * Atelier pratique : Débats sur des thèmes d'actualité ou analyse de la presse
  française.

    
  Structure type d'une séance (2 heures)  

  Pour maintenir l'énergie en cours du soir,  rythme :  

  Le "Brise-glace" (15 min) : Discussion libre sur la journée pour délier les
  langues.  

  Apport Théorique (30 min) : Une règle de grammaire ou de conjugaison.  

  Mise en pratique (45 min) : Exercices écrits et surtout oraux (travail en
  binôme).  

  Culture et détente (30 min) : Analyse d'une chanson, d'une vidéo courte ou
  d'une expression idiomatique française.
lien_source: https://ifdevformations.fr/
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
structure_id: carif-oref--14_OF_0000012792
modes_accueil:
  - en-presentiel
score_qualite: 0.8499999999999999
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: >-
  Conditions d acces (Profil) : 

  Etre primo arrivants (en France depuis moins de 5 ans)

  Statut : Etre salarie(e), auto-entrepreneur ou mere de famille n ayant pas de
  solution de garde en journee.

  Age : Etre majeur (plus de 18 ans).

  Niveau de langue : Un test de positionnement initial est obligatoire pour
  creer des groupes de niveau (A1.1 a B1).
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "75"
  - "77"
  - "78"
  - "91"
  - "92"
  - "93"
  - "94"
  - "95"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: Salaries primo arrivants avec contrat de travail Femmes
  primo arrivantes ayant des problemes de garde d enfant qui ne leur permettent
  pas de suivre les cours en journee.
mobilisation_precisions: null
volume_horaire_hebdomadaire: 4
structure:
  id: carif-oref--14_OF_0000012792
  nom: Institut de formation et de développement
  siret: "80927292500029"
  source: carif-oref
  adresse: 44 Boulevard Georges Clémenceau
  commune: Mantes-la-Jolie
  courriel: a.atigui@ifdev.org
  date_maj: 2026-04-14
  doublons:
    - id: dora--9f552361-77c1-483d-b6bb-24b0276ed0c9
      source: dora
  latitude: 48.99789
  site_web: null
  longitude: 1.687963
  telephone: null
  code_insee: "78361"
  code_postal: "78200"
  description: null
  lien_source: https://www.intercariforef.org/formations/institut-de-formation-et-de-developpement/organisme-14_OF_0000012792.html
  score_qualite: 0.87
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers linguistiques du soir

### Objectif de la formation

Accéder à l'emploi ou préparer une réorientation professionnelle  
Utiliser l'informatique  
Préparer un diplôme ou une certification de langue française [DILF, DELF A1, DELF A2, DELF B1 ou B2 selon le niveau du bénéficiaire]  
Devenir autonome au quotidien [Apprentissage de la langue française dans ses volets vie pratique / vie publique / vie professionnelle, en vue d'un accès à l'autonomie]  
Se former aux questions civiques et de citoyenneté  
  
Niveau de langue et de compétences visé par la formation :  
CECRL : A1, A2, B1  
Les bénéficiaires sont préparés (examens balncs en condition de passation ) et accompagnés à l'inscription aux DELF ou TEF/TCF A2 B1 B2

### Contenu de la formation

Les cours ont lieu par niveau (3 groupes) 2 fois par semaine (mardi et jeudi de 18h à 20h):  
Niveau Débutant (A1.1 /A1 ) : "L'Autonomie Immédiate"  
Objectif : Pouvoir se débrouiller seul dans la vie quotidienne.

* Oral : Se présenter (nom, âge, pays), demander son chemin, faire des courses (prix, quantités).
* Écrit : Remplir un formulaire administratif simple, écrire un SMS court, lire des panneaux de signalisation.
* Grammaire : Présent de l'indicatif, articles définis/indéfinis, pronoms personnels, les nombres.
* Atelier pratique : Simulations d'achats au marché ou à la boulangerie.

  
2. Niveau Intermédiaire (A2 - B1) : "L'intégration et le travail"  
Objectif : Raconter des événements passés et exprimer des opinions.

* Oral : Parler de son parcours professionnel, raconter ses vacances, exprimer son accord ou désaccord.
* Écrit : Rédiger un email professionnel, une lettre de motivation courte, comprendre une consigne de sécurité.
* Grammaire : Passé composé vs Imparfait, le futur simple, les pronoms relatifs (qui, que, où), le comparatif.
* Atelier pratique : Jeux de rôles "Entretien d'embauche" ou "Rendez-vous chez le médecin".

  
3. Niveau Avancé (B2) : "L'indépendance et le débat"  
Objectif : Argumenter et comprendre des sujets complexes (société, actualité).

* Oral : Participer à un débat, argumenter pour convaincre, comprendre des émissions de radio ou des vidéos sans sous-titres.
* Écrit : Rédiger une lettre de réclamation, faire un compte-rendu de réunion, rédiger un texte argumenté.
* Grammaire : Subjonctif (sentiments, doutes), le conditionnel, la voix passive, les connecteurs logiques complexes.
* Atelier pratique : Débats sur des thèmes d'actualité ou analyse de la presse française.

  
Structure type d'une séance (2 heures)  
Pour maintenir l'énergie en cours du soir,  rythme :  
Le "Brise-glace" (15 min) : Discussion libre sur la journée pour délier les langues.  
Apport Théorique (30 min) : Une règle de grammaire ou de conjugaison.  
Mise en pratique (45 min) : Exercices écrits et surtout oraux (travail en binôme).  
Culture et détente (30 min) : Analyse d'une chanson, d'une vidéo courte ou d'une expression idiomatique française.

## Conditions d'accès

Conditions d acces (Profil) : 
Etre primo arrivants (en France depuis moins de 5 ans)
Statut : Etre salarie(e), auto-entrepreneur ou mere de famille n ayant pas de solution de garde en journee.
Age : Etre majeur (plus de 18 ans).
Niveau de langue : Un test de positionnement initial est obligatoire pour creer des groupes de niveau (A1.1 a B1).$seed$, $seed${"id": "carif-oref--14_SE_0001597312", "nom": "Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers linguistiques du soir", "type": "formation", "extra": {"action": {"session": [{"@ref": "268350", "@numero": "SE_0001597312", "periode": {"fin": "20261231", "debut": "20260105"}, "recrutement": [{"@numero": "14_372130", "adresse": {"pays": "FR", "ligne": ["44 Boulevard Georges Clemenceau"], "ville": "Mantes-la-Jolie", "codepostal": "78200", "departement": "78", "denomination": "IFDEV", "geolocalisation": {"latitude": "48.99789", "longitude": "1.687963"}, "code-INSEE-commune": "78361"}, "periode": {"fin": "20261030", "debut": "20260105"}, "heure-fin": "19h00", "nb-places": 40, "a-distance": "0", "commentaire": "Pré-inscriptions sur le site par un prescripteur  \r\nhttps://ifdevformations.fr/\r\nune information collective (+ diagnostics oral et écrit) a lieu 1 fois par mois les mardis de 18 à 19h", "heure-debut": "18h00", "modalite-recrutement": "9", "code-perimetre-recrutement": "2", "infos-perimetre-recrutement": "Pré-inscriptions sur le site par un prescripteur"}], "url-session": {"urlweb": ["https://ifdevformations.fr/"]}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "ATIGUI", "prenom": "Aicha", "courriel": "a.atigui@ifdev.org"}, "type-contact": "5"}, {"coordonnees": {"nom": "Atigui", "prenom": "Aicha", "courriel": "a.atigui@ifdev.fr"}, "type-contact": "0"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"pays": "FR", "ligne": ["Ifdev", "44 Boulevard Georges Clemenceau"], "ville": "Mantes-la-Jolie", "codepostal": "78200", "departement": "78", "denomination": "Ifdev", "geolocalisation": {"latitude": "48.99789", "longitude": "1.687963"}, "code-INSEE-commune": "78361"}}, "periode-inscription": {"periode": {"fin": "20261030", "debut": "20260102"}}, "reference-certification": [{"reference-code-RS": "RS6775", "reference-code-CERTIFINFO": "117684"}]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": "2 ateliers de 2h chacun", "info-public-vise": "Salaries primo arrivants avec contrat de travail Femmes primo arrivantes ayant des problemes de garde d enfant qui ne leur permettent pas de suivre les cours en journee.", "nombre-heures-total": 320, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81042", "@ref": "V14", "@info": "code-public-vise"}, {"$": "Salariés primo arrivants avec contrat de travail\r\nFemmes primo arrivantes ayant des problèmes de garde d'enfant qui ne leur permettent pas de suivre les cours en journée.", "@info": "info-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "Actions socio-linguistiques (ASL) complémentaires du CIR 78 - 2025-26", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "44 Boulevard Georges Clémenceau", "commune": "Mantes-la-Jolie", "publics": ["personnes-exilees"], "courriel": "a.atigui@ifdev.org", "date_maj": "2026-03-23", "latitude": 48.99789, "longitude": 1.687963, "structure": {"id": "carif-oref--14_OF_0000012792", "nom": "Institut de formation et de développement", "siret": "80927292500029", "source": "carif-oref", "adresse": "44 Boulevard Georges Clémenceau", "commune": "Mantes-la-Jolie", "courriel": "a.atigui@ifdev.org", "date_maj": "2026-04-14", "doublons": [{"id": "dora--9f552361-77c1-483d-b6bb-24b0276ed0c9", "source": "dora"}], "latitude": 48.99789, "site_web": null, "longitude": 1.687963, "telephone": null, "code_insee": "78361", "code_postal": "78200", "description": null, "lien_source": "https://www.intercariforef.org/formations/institut-de-formation-et-de-developpement/organisme-14_OF_0000012792.html", "score_qualite": 0.87, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33130946383", "code_insee": "78361", "code_postal": "78200", "description": "### Objectif de la formation\n\nAccéder à l'emploi ou préparer une réorientation professionnelle  \nUtiliser l'informatique  \nPréparer un diplôme ou une certification de langue française [DILF, DELF A1, DELF A2, DELF B1 ou B2 selon le niveau du bénéficiaire]  \nDevenir autonome au quotidien [Apprentissage de la langue française dans ses volets vie pratique / vie publique / vie professionnelle, en vue d'un accès à l'autonomie]  \nSe former aux questions civiques et de citoyenneté  \n  \nNiveau de langue et de compétences visé par la formation :  \nCECRL : A1, A2, B1  \nLes bénéficiaires sont préparés (examens balncs en condition de passation ) et accompagnés à l'inscription aux DELF ou TEF/TCF A2 B1 B2\n\n### Contenu de la formation\n\nLes cours ont lieu par niveau (3 groupes) 2 fois par semaine (mardi et jeudi de 18h à 20h):  \nNiveau Débutant (A1.1 /A1 ) : \"L'Autonomie Immédiate\"  \nObjectif : Pouvoir se débrouiller seul dans la vie quotidienne.\n\n* Oral : Se présenter (nom, âge, pays), demander son chemin, faire des courses (prix, quantités).\n* Écrit : Remplir un formulaire administratif simple, écrire un SMS court, lire des panneaux de signalisation.\n* Grammaire : Présent de l'indicatif, articles définis/indéfinis, pronoms personnels, les nombres.\n* Atelier pratique : Simulations d'achats au marché ou à la boulangerie.\n\n  \n2. Niveau Intermédiaire (A2 - B1) : \"L'intégration et le travail\"  \nObjectif : Raconter des événements passés et exprimer des opinions.\n\n* Oral : Parler de son parcours professionnel, raconter ses vacances, exprimer son accord ou désaccord.\n* Écrit : Rédiger un email professionnel, une lettre de motivation courte, comprendre une consigne de sécurité.\n* Grammaire : Passé composé vs Imparfait, le futur simple, les pronoms relatifs (qui, que, où), le comparatif.\n* Atelier pratique : Jeux de rôles \"Entretien d'embauche\" ou \"Rendez-vous chez le médecin\".\n\n  \n3. Niveau Avancé (B2) : \"L'indépendance et le débat\"  \nObjectif : Argumenter et comprendre des sujets complexes (société, actualité).\n\n* Oral : Participer à un débat, argumenter pour convaincre, comprendre des émissions de radio ou des vidéos sans sous-titres.\n* Écrit : Rédiger une lettre de réclamation, faire un compte-rendu de réunion, rédiger un texte argumenté.\n* Grammaire : Subjonctif (sentiments, doutes), le conditionnel, la voix passive, les connecteurs logiques complexes.\n* Atelier pratique : Débats sur des thèmes d'actualité ou analyse de la presse française.\n\n  \nStructure type d'une séance (2 heures)  \nPour maintenir l'énergie en cours du soir,  rythme :  \nLe \"Brise-glace\" (15 min) : Discussion libre sur la journée pour délier les langues.  \nApport Théorique (30 min) : Une règle de grammaire ou de conjugaison.  \nMise en pratique (45 min) : Exercices écrits et surtout oraux (travail en binôme).  \nCulture et détente (30 min) : Analyse d'une chanson, d'une vidéo courte ou d'une expression idiomatique française.", "lien_source": "https://ifdevformations.fr/", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--14_OF_0000012792", "modes_accueil": ["en-presentiel"], "score_qualite": 0.8499999999999999, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Conditions d acces (Profil) : \nEtre primo arrivants (en France depuis moins de 5 ans)\nStatut : Etre salarie(e), auto-entrepreneur ou mere de famille n ayant pas de solution de garde en journee.\nAge : Etre majeur (plus de 18 ans).\nNiveau de langue : Un test de positionnement initial est obligatoire pour creer des groupes de niveau (A1.1 a B1).", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["75", "77", "78", "91", "92", "93", "94", "95"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": "Salaries primo arrivants avec contrat de travail Femmes primo arrivantes ayant des problemes de garde d enfant qui ne leur permettent pas de suivre les cours en journee.", "mobilisation_precisions": null, "volume_horaire_hebdomadaire": 4}$seed$, NULL, NULL, $seed$21114029-83f8-47ff-bc5c-bca4aaeeb6b8$seed$, $seed$5037c7eb-89af-4ca9-b5ed-d169c9db6a82$seed$, 2, $seed$DI$seed$, NULL) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$ba857d02-3eb0-4b5b-88eb-e5da1de8a68b$seed$, $seed$2026-06-17 14:36:09.888976+00$seed$, $seed$2026-06-17 14:36:09.888976+00$seed$, $seed$---
id: carif-oref--14_SE_0001608026
nom: "Actions socio-linguistiques complémentaires du CIR (ASL) - LING PRO :
  Parcours Linguistique à visée professionnelle généraliste"
type: formation
extra:
  action:
    session:
      - "@ref": "268905"
        "@numero": SE_0001608026
        periode:
          fin: "20260731"
          debut: "20251001"
        recrutement:
          - "@numero": 14_365514
            a-distance: "0"
            modalite-recrutement: "4"
        url-session:
          urlweb:
            - https://www.apijasso.org/
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: Contact
              prenom: Association pour l insertion des jeunes
              telfixe:
                numtel:
                  - "0695925301"
              courriel: sophiedanne.apij@gmail.com
            type-contact: "0"
          - coordonnees:
              nom: Contact
              prenom: Association pour l insertion des jeunes
              telfixe:
                numtel:
                  - "0695925301"
              courriel: sophiedanne.apij@gmail.com
            type-contact: "0"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            pays: FR
            ligne:
              - Association pour l insertion des jeunes
              - 5 Place Youri Gagarine
            ville: Saint-Denis
            codepostal: "93200"
            departement: "93"
            denomination: Association pour l'insertion des jeunes
            geolocalisation:
              latitude: "48.931921"
              longitude: "2.382025"
            code-INSEE-commune: "93066"
        modalites-inscription: Tests pratiques
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: + demandeurs d asile
    nombre-heures-total: 110
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "81042"
                "@ref": V14
                "@info": code-public-vise
              - $: + demandeurs d'asile
                "@info": info-public-vise
              - $: "3"
                "@info": code-perimetre-recrutement
              - $: Actions socio-linguistiques (ASL) complémentaires du CIR régional IDF -
                  2025-2026
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: Tests pratiques
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 5 Place Youri Gagarine
commune: Saint-Denis
publics:
  - personnes-exilees
courriel: sophiedanne.apij@gmail.com
date_maj: 2026-03-02
latitude: 48.931511
longitude: 2.382324
telephone: "+33695925301"
code_insee: "93066"
code_postal: "93200"
description: >-
  ### Objectif de la formation


  Donner à des personnes en difficulté professionnelle en raison de leur
  méconnaissance de la langue française la possibilité de se familiariser avec
  le langage professionnel et spécifique au monde du travail en France.


  ### Contenu de la formation


  La formation sera articulée autour des trois modules :  

   Compétences linguistiques de base (Oral / Ecrit), FOS (visée professionnel et
  sociale), citoyenneté, etc.  

   Techniques de Recherche d'Emploi : CV, lettre de motivation, recherche
  d'emploi / formation, monde de l'entreprise, marché du travail, etc.  

   Module informatique et internet: recherche d'emploi, outils numériques, monde
  contemporain, ressources du territoire, mobilité, etc.  

  Elle est complétée par un suivi individualisé et un accompagnement à l'emploi.
lien_source: https://www.apijasso.org/
thematiques:
  - preparer-sa-candidature--organiser-ses-demarches-de-recherche-demploi
  - choisir-un-metier--confirmer-son-choix-de-metier
  - lecture-ecriture-calcul--maitriser-le-francais
  - trouver-un-emploi--suivre-ses-candidatures-et-relancer-les-employeurs
structure_id: carif-oref--14_OF_0000005723
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: |-
  Competences linguistiques a l entree en formation :
  CECRL :
  Oral : A1.1
  Ecrit : A1.1
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "75"
  - "77"
  - "78"
  - "91"
  - "92"
  - "93"
  - "94"
  - "95"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: + demandeurs d asile
mobilisation_precisions: Tests pratiques
volume_horaire_hebdomadaire: null
structure:
  id: carif-oref--14_OF_0000005723
  nom: Association pour l'insertion des jeunes
  siret: "32618558400074"
  source: carif-oref
  adresse: 5 Place Youri Gagarine
  commune: Saint-Denis
  courriel: null
  date_maj: 2026-04-14
  doublons:
    - id: dora--7cc469a4-acfe-4c8c-a868-0635a7e1cd39
      source: dora
    - id: emplois-de-linclusion--54fbb3e1-1df4-4b75-ace3-e8f7a0d5e541
      source: emplois-de-linclusion
  latitude: 48.931511
  site_web: null
  longitude: 2.382324
  telephone: null
  code_insee: "93066"
  code_postal: "93200"
  description: null
  lien_source: https://www.intercariforef.org/formations/association-pour-l-insertion-des-jeunes/organisme-14_OF_0000005723.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Actions socio-linguistiques complémentaires du CIR (ASL) - LING PRO : Parcours Linguistique à visée professionnelle généraliste

### Objectif de la formation

Donner à des personnes en difficulté professionnelle en raison de leur méconnaissance de la langue française la possibilité de se familiariser avec le langage professionnel et spécifique au monde du travail en France.

### Contenu de la formation

La formation sera articulée autour des trois modules :  
 Compétences linguistiques de base (Oral / Ecrit), FOS (visée professionnel et sociale), citoyenneté, etc.  
 Techniques de Recherche d'Emploi : CV, lettre de motivation, recherche d'emploi / formation, monde de l'entreprise, marché du travail, etc.  
 Module informatique et internet: recherche d'emploi, outils numériques, monde contemporain, ressources du territoire, mobilité, etc.  
Elle est complétée par un suivi individualisé et un accompagnement à l'emploi.

## Conditions d'accès

Competences linguistiques a l entree en formation :
CECRL :
Oral : A1.1
Ecrit : A1.1$seed$, $seed${"id": "carif-oref--14_SE_0001608026", "nom": "Actions socio-linguistiques complémentaires du CIR (ASL) - LING PRO : Parcours Linguistique à visée professionnelle généraliste", "type": "formation", "extra": {"action": {"session": [{"@ref": "268905", "@numero": "SE_0001608026", "periode": {"fin": "20260731", "debut": "20251001"}, "recrutement": [{"@numero": "14_365514", "a-distance": "0", "modalite-recrutement": "4"}], "url-session": {"urlweb": ["https://www.apijasso.org/"]}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "Contact", "prenom": "Association pour l insertion des jeunes", "telfixe": {"numtel": ["0695925301"]}, "courriel": "sophiedanne.apij@gmail.com"}, "type-contact": "0"}, {"coordonnees": {"nom": "Contact", "prenom": "Association pour l insertion des jeunes", "telfixe": {"numtel": ["0695925301"]}, "courriel": "sophiedanne.apij@gmail.com"}, "type-contact": "0"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"pays": "FR", "ligne": ["Association pour l insertion des jeunes", "5 Place Youri Gagarine"], "ville": "Saint-Denis", "codepostal": "93200", "departement": "93", "denomination": "Association pour l'insertion des jeunes", "geolocalisation": {"latitude": "48.931921", "longitude": "2.382025"}, "code-INSEE-commune": "93066"}}, "modalites-inscription": "Tests pratiques", "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": "+ demandeurs d asile", "nombre-heures-total": 110, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81042", "@ref": "V14", "@info": "code-public-vise"}, {"$": "+ demandeurs d'asile", "@info": "info-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "Actions socio-linguistiques (ASL) complémentaires du CIR régional IDF - 2025-2026", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": "Tests pratiques", "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "5 Place Youri Gagarine", "commune": "Saint-Denis", "publics": ["personnes-exilees"], "courriel": "sophiedanne.apij@gmail.com", "date_maj": "2026-03-02", "latitude": 48.931511, "longitude": 2.382324, "structure": {"id": "carif-oref--14_OF_0000005723", "nom": "Association pour l'insertion des jeunes", "siret": "32618558400074", "source": "carif-oref", "adresse": "5 Place Youri Gagarine", "commune": "Saint-Denis", "courriel": null, "date_maj": "2026-04-14", "doublons": [{"id": "dora--7cc469a4-acfe-4c8c-a868-0635a7e1cd39", "source": "dora"}, {"id": "emplois-de-linclusion--54fbb3e1-1df4-4b75-ace3-e8f7a0d5e541", "source": "emplois-de-linclusion"}], "latitude": 48.931511, "site_web": null, "longitude": 2.382324, "telephone": null, "code_insee": "93066", "code_postal": "93200", "description": null, "lien_source": "https://www.intercariforef.org/formations/association-pour-l-insertion-des-jeunes/organisme-14_OF_0000005723.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33695925301", "code_insee": "93066", "code_postal": "93200", "description": "### Objectif de la formation\n\nDonner à des personnes en difficulté professionnelle en raison de leur méconnaissance de la langue française la possibilité de se familiariser avec le langage professionnel et spécifique au monde du travail en France.\n\n### Contenu de la formation\n\nLa formation sera articulée autour des trois modules :  \n Compétences linguistiques de base (Oral / Ecrit), FOS (visée professionnel et sociale), citoyenneté, etc.  \n Techniques de Recherche d'Emploi : CV, lettre de motivation, recherche d'emploi / formation, monde de l'entreprise, marché du travail, etc.  \n Module informatique et internet: recherche d'emploi, outils numériques, monde contemporain, ressources du territoire, mobilité, etc.  \nElle est complétée par un suivi individualisé et un accompagnement à l'emploi.", "lien_source": "https://www.apijasso.org/", "thematiques": ["preparer-sa-candidature--organiser-ses-demarches-de-recherche-demploi", "choisir-un-metier--confirmer-son-choix-de-metier", "lecture-ecriture-calcul--maitriser-le-francais", "trouver-un-emploi--suivre-ses-candidatures-et-relancer-les-employeurs"], "structure_id": "carif-oref--14_OF_0000005723", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Competences linguistiques a l entree en formation :\nCECRL :\nOral : A1.1\nEcrit : A1.1", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["75", "77", "78", "91", "92", "93", "94", "95"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": "+ demandeurs d asile", "mobilisation_precisions": "Tests pratiques", "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$75691d1f-f1e6-435e-9cd9-3f770e8ca14b$seed$, $seed$ca8e0bae-fa1d-4d57-8a9e-83c92f78553c$seed$, 2, $seed$DI$seed$, NULL) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$17ba326e-0e5e-4072-b8f5-e7f42c49e1f5$seed$, $seed$2026-06-17 14:36:09.888976+00$seed$, $seed$2026-06-17 14:36:09.888976+00$seed$, $seed$---
id: carif-oref--14_SE_0001611012
nom: Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers
  sociolinguistiques et Compétences Pro
type: formation
extra:
  action:
    session:
      - "@ref": "269140"
        "@numero": SE_0001611012
        periode:
          fin: "20260626"
          debut: "20250929"
        recrutement:
          - "@numero": 14_372793
            periode:
              fin: "20260312"
              debut: "20250915"
            nb-places: 20
            a-distance: "0"
            modalite-recrutement: "4"
            code-perimetre-recrutement: "2"
            infos-perimetre-recrutement: Villes voisines de PC
        contact-session:
          - "@tag": principal
            coordonnees:
              nom: DURAND
              prenom: Sophie
              courriel: coordocsc@cscpontault.fr
            type-contact: "3"
          - coordonnees:
              nom: Contact
              prenom: Centre social et culturel
              telfixe:
                numtel:
                  - "0160285101"
              courriel: cscpontault@gmail.com
            type-contact: "0"
        etat-recrutement: "1"
        adresse-inscription:
          adresse:
            pays: FR
            ligne:
              - Centre social et culturel
              - 4 Rue de l Orme au Charron
            ville: Pontault-Combault
            codepostal: "77340"
            departement: "77"
            denomination: Centre social et culturel
            geolocalisation:
              latitude: "48.79982"
              longitude: "2.609985"
            code-INSEE-commune: "77373"
        periode-inscription:
          periode:
            fin: "20260312"
            debut: "20250915"
        modalites-inscription: Tests pratiques
        reference-certification:
          - null
    frais-restants: null
    conventionnement: "1"
    duree-indicative: null
    info-public-vise: CIR - BPI - BP
    nombre-heures-total: 120
    organisme-financeur:
      - extras:
          - "@info": specificites
            extra:
              - $: "81023"
                "@ref": V14
                "@info": code-public-vise
              - $: "81042"
                "@ref": V14
                "@info": code-public-vise
              - $: CIR - BPI - BP
                "@info": info-public-vise
              - $: "3"
                "@info": code-perimetre-recrutement
              - $: Actions socio-linguistiques (ASL) complémentaires du CIR 77 - 2025-2026
                "@info": programme-financeur
        code-financeur: "19"
    modalites-recrutement: Tests pratiques
    modalites-enseignement: "0"
    modalites-entrees-sorties: "1"
  formation:
    code-niveau-entree: "1"
    code-niveau-sortie: "1"
frais: null
source: carif-oref
adresse: 4 Rue de l'Orme au Charron
commune: Pontault-Combault
publics:
  - personnes-exilees
courriel: coordocsc@cscpontault.fr
date_maj: 2026-03-19
latitude: 48.79982
longitude: 2.609985
telephone: "+33160285101"
code_insee: "77373"
code_postal: "77340"
description: >-
  ### Objectif de la formation


  Ce sont des formations de proximité qui visent à rendre autonomes les «
  apprenants » dans les différents espaces sociaux c'est-à-dire les différents
  lieux ou institutions de la vie courante (centres sociaux, médiathèque, CAF,
  CPAM, centre hospitalier, écoles, …).  

   L'apprentissage de la langue française est toujours contextualisé dans le
  respect des valeurs de la République. Les ASL concourent à cette démarche
  spécifique de développement de programmes destinés à favoriser l'intégration
  sociale, l'accès à l'emploi, l'accès aux droits, l'accès à la culture…  
    
  1. Permettre l'autonomie linguistique des primo-arrivants par l'apprentissage
  du français jusqu'au niveau A2   

  2. Favoriser l'insertion professionnelle par l'acquisition de compétences
  linguistiques à visée professionnelle   

  3. Lutter contre l'isolement et favoriser la prise ou la reprise de confiance
  en soi   

  4. Développer l'accessibilité aux droits notamment par l'apprentissage du
  numérique   

  5. Impliquer les participants dans la vie du centre et dans la vie locale pour
  faciliter le développement d'une citoyenneté active  

   


  ### Contenu de la formation


  Notre projet s'inscrit dans l'axe de l'apprentissage linguistique mais avec
  une dimension civique intégrée qui en fait sa spécificité.  

  Notre approche d'apprentissage :  

  Chaque module de notre programme raconte une histoire : celle d'hommes et de
  femmes qui, partis de leur pays d'origine avec leurs rêves et leurs
  compétences, construisent pas à pas leur nouvelle vie en France. Le français
  devient alors non pas une matière scolaire, mais l'outil de leur émancipation,
  le moyen de faire entendre leur voix, de défendre leurs droits, d'accompagner
  leurs enfants dans leur scolarité… d'élaborer un avenir.  

  Contenu plus étayé et plu personnalisé pour répondre aux nouvelles exigences
  du passage a terme du niveau A2 obligatoire et de l'examen civique.
lien_source: https://www.intercariforef.org/formations/actions-socio-linguistiques-complementaires-du-cir-asl-ateliers-sociolinguistiques-et-competences-pro/formation-14_AF_0000242984_SE_0001611012.html
thematiques:
  - preparer-sa-candidature--organiser-ses-demarches-de-recherche-demploi
  - choisir-un-metier--confirmer-son-choix-de-metier
  - lecture-ecriture-calcul--maitriser-le-francais
  - trouver-un-emploi--suivre-ses-candidatures-et-relancer-les-employeurs
structure_id: carif-oref--14_OF_0000014841
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
mobilisable_par:
  - professionnels
nombre_semaines: null
conditions_acces: Aucun
frais_precisions: null
horaires_accueil: null
zone_eligibilite:
  - "75"
  - "77"
  - "78"
  - "91"
  - "92"
  - "93"
  - "94"
  - "95"
adresse_certifiee: true
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - envoyer-un-courriel
  - telephoner
publics_precisions: CIR - BPI - BP
mobilisation_precisions: Tests pratiques
volume_horaire_hebdomadaire: 4
structure:
  id: carif-oref--14_OF_0000014841
  nom: Association animation centre social
  siret: "31170235100017"
  source: carif-oref
  adresse: 4 Rue de l'Orme au Charron
  commune: Pontault-Combault
  courriel: coordocsc@cscpontault.fr
  date_maj: 2026-03-19
  doublons:
    - id: mediation-numerique--Coop-numérique_30203fcf-4093-4dbf-94c3-2639d16ab9a8
      source: mediation-numerique
  latitude: 48.79982
  site_web: null
  longitude: 2.609985
  telephone: null
  code_insee: "77373"
  code_postal: "77340"
  description: null
  lien_source: https://www.intercariforef.org/formations/association-animation-centre-social/organisme-14_OF_0000014841.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  adresse_certifiee: true
  accessibilite_lieu: null
  complement_adresse: null
---

# Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers sociolinguistiques et Compétences Pro

### Objectif de la formation

Ce sont des formations de proximité qui visent à rendre autonomes les « apprenants » dans les différents espaces sociaux c'est-à-dire les différents lieux ou institutions de la vie courante (centres sociaux, médiathèque, CAF, CPAM, centre hospitalier, écoles, …).  
 L'apprentissage de la langue française est toujours contextualisé dans le respect des valeurs de la République. Les ASL concourent à cette démarche spécifique de développement de programmes destinés à favoriser l'intégration sociale, l'accès à l'emploi, l'accès aux droits, l'accès à la culture…  
  
1. Permettre l'autonomie linguistique des primo-arrivants par l'apprentissage du français jusqu'au niveau A2   
2. Favoriser l'insertion professionnelle par l'acquisition de compétences linguistiques à visée professionnelle   
3. Lutter contre l'isolement et favoriser la prise ou la reprise de confiance en soi   
4. Développer l'accessibilité aux droits notamment par l'apprentissage du numérique   
5. Impliquer les participants dans la vie du centre et dans la vie locale pour faciliter le développement d'une citoyenneté active  
 

### Contenu de la formation

Notre projet s'inscrit dans l'axe de l'apprentissage linguistique mais avec une dimension civique intégrée qui en fait sa spécificité.  
Notre approche d'apprentissage :  
Chaque module de notre programme raconte une histoire : celle d'hommes et de femmes qui, partis de leur pays d'origine avec leurs rêves et leurs compétences, construisent pas à pas leur nouvelle vie en France. Le français devient alors non pas une matière scolaire, mais l'outil de leur émancipation, le moyen de faire entendre leur voix, de défendre leurs droits, d'accompagner leurs enfants dans leur scolarité… d'élaborer un avenir.  
Contenu plus étayé et plu personnalisé pour répondre aux nouvelles exigences du passage a terme du niveau A2 obligatoire et de l'examen civique.

## Conditions d'accès

Aucun$seed$, $seed${"id": "carif-oref--14_SE_0001611012", "nom": "Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers sociolinguistiques et Compétences Pro", "type": "formation", "extra": {"action": {"session": [{"@ref": "269140", "@numero": "SE_0001611012", "periode": {"fin": "20260626", "debut": "20250929"}, "recrutement": [{"@numero": "14_372793", "periode": {"fin": "20260312", "debut": "20250915"}, "nb-places": 20, "a-distance": "0", "modalite-recrutement": "4", "code-perimetre-recrutement": "2", "infos-perimetre-recrutement": "Villes voisines de PC"}], "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "DURAND", "prenom": "Sophie", "courriel": "coordocsc@cscpontault.fr"}, "type-contact": "3"}, {"coordonnees": {"nom": "Contact", "prenom": "Centre social et culturel", "telfixe": {"numtel": ["0160285101"]}, "courriel": "cscpontault@gmail.com"}, "type-contact": "0"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"pays": "FR", "ligne": ["Centre social et culturel", "4 Rue de l Orme au Charron"], "ville": "Pontault-Combault", "codepostal": "77340", "departement": "77", "denomination": "Centre social et culturel", "geolocalisation": {"latitude": "48.79982", "longitude": "2.609985"}, "code-INSEE-commune": "77373"}}, "periode-inscription": {"periode": {"fin": "20260312", "debut": "20250915"}}, "modalites-inscription": "Tests pratiques", "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": "CIR - BPI - BP", "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81042", "@ref": "V14", "@info": "code-public-vise"}, {"$": "CIR - BPI - BP", "@info": "info-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "Actions socio-linguistiques (ASL) complémentaires du CIR 77 - 2025-2026", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": "Tests pratiques", "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "4 Rue de l'Orme au Charron", "commune": "Pontault-Combault", "publics": ["personnes-exilees"], "courriel": "coordocsc@cscpontault.fr", "date_maj": "2026-03-19", "latitude": 48.79982, "longitude": 2.609985, "structure": {"id": "carif-oref--14_OF_0000014841", "nom": "Association animation centre social", "siret": "31170235100017", "source": "carif-oref", "adresse": "4 Rue de l'Orme au Charron", "commune": "Pontault-Combault", "courriel": "coordocsc@cscpontault.fr", "date_maj": "2026-03-19", "doublons": [{"id": "mediation-numerique--Coop-numérique_30203fcf-4093-4dbf-94c3-2639d16ab9a8", "source": "mediation-numerique"}], "latitude": 48.79982, "site_web": null, "longitude": 2.609985, "telephone": null, "code_insee": "77373", "code_postal": "77340", "description": null, "lien_source": "https://www.intercariforef.org/formations/association-animation-centre-social/organisme-14_OF_0000014841.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33160285101", "code_insee": "77373", "code_postal": "77340", "description": "### Objectif de la formation\n\nCe sont des formations de proximité qui visent à rendre autonomes les « apprenants » dans les différents espaces sociaux c'est-à-dire les différents lieux ou institutions de la vie courante (centres sociaux, médiathèque, CAF, CPAM, centre hospitalier, écoles, …).  \n L'apprentissage de la langue française est toujours contextualisé dans le respect des valeurs de la République. Les ASL concourent à cette démarche spécifique de développement de programmes destinés à favoriser l'intégration sociale, l'accès à l'emploi, l'accès aux droits, l'accès à la culture…  \n  \n1. Permettre l'autonomie linguistique des primo-arrivants par l'apprentissage du français jusqu'au niveau A2   \n2. Favoriser l'insertion professionnelle par l'acquisition de compétences linguistiques à visée professionnelle   \n3. Lutter contre l'isolement et favoriser la prise ou la reprise de confiance en soi   \n4. Développer l'accessibilité aux droits notamment par l'apprentissage du numérique   \n5. Impliquer les participants dans la vie du centre et dans la vie locale pour faciliter le développement d'une citoyenneté active  \n \n\n### Contenu de la formation\n\nNotre projet s'inscrit dans l'axe de l'apprentissage linguistique mais avec une dimension civique intégrée qui en fait sa spécificité.  \nNotre approche d'apprentissage :  \nChaque module de notre programme raconte une histoire : celle d'hommes et de femmes qui, partis de leur pays d'origine avec leurs rêves et leurs compétences, construisent pas à pas leur nouvelle vie en France. Le français devient alors non pas une matière scolaire, mais l'outil de leur émancipation, le moyen de faire entendre leur voix, de défendre leurs droits, d'accompagner leurs enfants dans leur scolarité… d'élaborer un avenir.  \nContenu plus étayé et plu personnalisé pour répondre aux nouvelles exigences du passage a terme du niveau A2 obligatoire et de l'examen civique.", "lien_source": "https://www.intercariforef.org/formations/actions-socio-linguistiques-complementaires-du-cir-asl-ateliers-sociolinguistiques-et-competences-pro/formation-14_AF_0000242984_SE_0001611012.html", "thematiques": ["preparer-sa-candidature--organiser-ses-demarches-de-recherche-demploi", "choisir-un-metier--confirmer-son-choix-de-metier", "lecture-ecriture-calcul--maitriser-le-francais", "trouver-un-emploi--suivre-ses-candidatures-et-relancer-les-employeurs"], "structure_id": "carif-oref--14_OF_0000014841", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Aucun", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["75", "77", "78", "91", "92", "93", "94", "95"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": "CIR - BPI - BP", "mobilisation_precisions": "Tests pratiques", "volume_horaire_hebdomadaire": 4}$seed$, NULL, NULL, $seed$c13a277e-58e7-4693-a529-c81bdc53e7cb$seed$, $seed$7f4dfad5-f8ef-4973-ac5a-750f0911b6b9$seed$, 2, $seed$DI$seed$, NULL) ON CONFLICT DO NOTHING;

ALTER TABLE ingestion_records ENABLE TRIGGER on_new_ingestion_record;
ALTER TABLE ingestion_records ENABLE TRIGGER tr_ingestion_records_version;
