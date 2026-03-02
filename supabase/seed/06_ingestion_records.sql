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
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$025a23c3-ec34-4f5c-98c8-48ab5e9b79a0$seed$, $seed$2026-02-16 11:10:28.409546+00$seed$, $seed$2026-02-16 11:10:28.409546+00$seed$, $seed$---
id: carif-oref--03_2552706S
nom: Ouvrir l'école aux parents pour la réussite des enfants - OEPRE
type: formation
extra:
  action:
    session:
      - "@ref": "131290"
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
  - personnes-exilees
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

  - l'acquisition du français (comprendre, parler, lire et écrire) ;

  - la connaissance des valeurs de la République et leur mise en œuvre dans la
  société française ;

  - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des
  élèves et des parents.

  Cette formation est assurée par des enseignants en Français Langue Seconde,
  des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS
lien_source: https://www.intercariforef.org/formations/formations-intitule-formation/formation-03_1900311F_2552706S.html
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
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
lien_mobilisation: null
complement_adresse: null
contact_nom_prenom: null
modes_mobilisation:
  - telephoner
  - envoyer-un-courriel
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
  lien_source: https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-03_6665.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
  accessibilite_lieu: null
  complement_adresse: null
---

# Ouvrir l'école aux parents pour la réussite des enfants - OEPRE

### Objectif de la formation

Les formations ont pour but de favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.

### Contenu de la formation

Les formations portent sur trois axes d'apprentissage :
- l'acquisition du français (comprendre, parler, lire et écrire) ;
- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;
- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.
Cette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS

## Conditions d'accès

-$seed$, $seed${"id": "carif-oref--03_2552706S", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "type": "formation", "extra": {"action": {"session": [{"@ref": "131290", "@numero": "2552706S", "periode": {"fin": "20270131", "debut": "20250901"}, "contact-session": [{"@tag": "principal", "coordonnees": {"nom": "Secretariat", "adresse": {"pays": "FR", "ligne": ["34 Rue Jean Jaures"], "ville": "Bron", "region": "03", "codepostal": "69500", "departement": "69", "denomination": "Collège Théodore Monod", "geolocalisation": {"latitude": "45.730538", "longitude": "4.903545"}, "code-INSEE-commune": "69029"}, "telfixe": {"numtel": ["0478268076"]}, "courriel": "ce.0693834T@ac-lyon.fr"}, "type-contact": "0"}], "etat-recrutement": "1", "adresse-inscription": {"adresse": {"pays": "FR", "ligne": ["34 Rue Jean Jaures"], "ville": "Bron", "codepostal": "69500", "departement": "69", "denomination": "Collège Théodore Monod", "geolocalisation": {"latitude": "45.730538", "longitude": "4.903545"}, "code-INSEE-commune": "69029"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": "Primo-arrivants, refugies sans niveau specifique", "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "80001", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81022", "@ref": "V14", "@info": "code-public-vise"}, {"$": "Primo-arrivants, réfugiés sans niveau spécifique", "@info": "info-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "Ouvrir l'Ecole aux parents pour la réussite des enfants (OEPRE)", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "34 Rue Jean Jaurès", "commune": "Bron", "publics": ["personnes-exilees", "demandeurs-emploi"], "courriel": "ce.0693834T@ac-lyon.fr", "date_maj": "2026-01-06", "latitude": 45.730538, "longitude": 4.903545, "structure": {"id": "carif-oref--03_6665", "nom": "Collège Théodore Monod", "siret": "19693843500027", "source": "carif-oref", "adresse": "34 Rue Jean Jaurès", "commune": "Bron", "courriel": "ce.0693834T@ac-lyon.fr", "date_maj": "2026-01-06", "doublons": [], "latitude": 45.730538, "site_web": null, "longitude": 4.903545, "telephone": "+33478268076", "code_insee": "69029", "code_postal": "69500", "description": null, "lien_source": "https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-03_6665.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33478268076", "code_insee": "69029", "code_postal": "69500", "description": "### Objectif de la formation\n\nLes formations ont pour but de favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :\n- l'acquisition du français (comprendre, parler, lire et écrire) ;\n- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;\n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.\nCette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS", "lien_source": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-03_1900311F_2552706S.html", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--03_6665", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "-", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["01", "03", "07", "15", "26", "38", "42", "43", "63", "69", "73", "74"], "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["telephoner", "envoyer-un-courriel"], "publics_precisions": "Primo-arrivants, refugies sans niveau specifique", "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$c265e9c3-e528-4e5a-a96f-7ede598441f3$seed$, $seed$3556151c-7b9a-46e7-b6b0-73d1f7174870$seed$, 1, $seed$DI$seed$, NULL) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$7549bd3e-aff2-453e-8105-d79639a98b4a$seed$, $seed$2026-02-16 09:55:49.692879+00$seed$, $seed$2026-02-16 09:55:49.692879+00$seed$, $seed$---
id: carif-oref--10_377967S
nom: Ouvrir l'école aux parents pour la réussite des enfants - OEPRE
type: formation
extra:
  action:
    session:
      - "@ref": "197917"
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
lien_source: https://www.intercariforef.org/formations/formations-intitule-formation/formation-10_2590061F_377967S.html
thematiques:
  - lecture-ecriture-calcul--maitriser-le-francais
structure_id: carif-oref--10_4417
modes_accueil:
  - en-presentiel
score_qualite: 0.9000000000000001
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
  lien_source: https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-10_4417.html
  score_qualite: 0.9
  horaires_accueil: null
  reseaux_porteurs: null
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
Jours et horaires des ateliers : lundi et vendredi 8h45 10h45$seed$, $seed${"id": "carif-oref--10_377967S", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "type": "formation", "extra": {"action": {"session": [{"@ref": "197917", "@numero": "377967S", "periode": {"fin": "20270131", "debut": "20250901"}, "etat-recrutement": "1", "adresse-inscription": {"adresse": {"pays": "FR", "ligne": ["Rue Bernard Palissy"], "ville": "Nevers", "codepostal": "58000", "departement": "58", "denomination": "Ecole Elémentaire Pierre Brossolette", "geolocalisation": {"latitude": "46.986289", "longitude": "3.172369"}, "code-INSEE-commune": "58194"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 80, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "81042", "@ref": "V14", "@info": "code-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "L'école des parents (Oepre)", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "Rue Bernard Palissy", "commune": "Nevers", "publics": ["personnes-exilees"], "courriel": "ce.0580606u@ac-dijon.fr", "date_maj": "2025-09-04", "latitude": 46.986289, "longitude": 3.172369, "structure": {"id": "carif-oref--10_4417", "nom": "ECOLE ELEMENTAIRE PIERRE BROSSOLETTE", "siret": "21580194500282", "source": "carif-oref", "adresse": "Rue Bernard Palissy", "commune": "Nevers", "courriel": null, "date_maj": "2025-09-04", "doublons": [], "latitude": 46.986289, "site_web": null, "longitude": 3.172369, "telephone": "+33386684384", "code_insee": "58194", "code_postal": "58000", "description": null, "lien_source": "https://www.intercariforef.org/formations/organismes-formateurs-raison-sociale-formateur/organisme-10_4417.html", "score_qualite": 0.9, "horaires_accueil": null, "reseaux_porteurs": null, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33386684384", "code_insee": "58194", "code_postal": "58000", "description": "### Objectif de la formation\n\nFavoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :\n- l'acquisition du français (comprendre, parler, lire et écrire),\n- la connaissance des valeurs de la République et leur mise en oeuvre dans la société française,\n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.", "lien_source": "https://www.intercariforef.org/formations/formations-intitule-formation/formation-10_2590061F_377967S.html", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--10_4417", "modes_accueil": ["en-presentiel"], "score_qualite": 0.9000000000000001, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Avoir un enfant scolarise dans l etablissement ou se deroule le dispositif ou dans un etablissement proche.\nJours et horaires des ateliers : lundi et vendredi 8h45 10h45", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["21", "25", "39", "58", "70", "71", "89", "90"], "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": null}$seed$, NULL, NULL, $seed$5953f5d6-78e6-4183-9f01-ae4903431c13$seed$, $seed$b73f7be6-5183-4a9d-baa8-68b1647ed746$seed$, 1, $seed$DI$seed$, $seed$non_compliant$seed$) ON CONFLICT DO NOTHING;
INSERT INTO ingestion_records ("id", "created_at", "updated_at", "markdown", "metadata", "rco_record_id", "ingestion_report_id", "di_service_id", "di_structure_id", "version", "origin", "compliance_status") VALUES ($seed$3ecab6bf-c363-41d2-b4f7-e4f387e5f420$seed$, $seed$2026-02-25 02:01:10.428947+00$seed$, $seed$2026-02-25 02:01:10.428947+00$seed$, $seed$---
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

Aucun$seed$, $seed${"id": "carif-oref--14_SE_0001116783", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "type": "formation", "extra": {"action": {"session": [{"@ref": "240395", "@numero": "SE_0001116783", "periode": {"fin": "20260131", "debut": "20240901"}, "etat-recrutement": "1", "adresse-inscription": {"adresse": {"pays": "FR", "ligne": ["Ecole elementaire Joliot-Curie A", "23 Rue Saint-Just"], "ville": "Ivry-sur-Seine", "codepostal": "94200", "departement": "94", "denomination": "Ecole élémentaire Joliot-Curie A", "geolocalisation": {"latitude": "48.811023", "longitude": "2.389238"}, "code-INSEE-commune": "94041"}}, "reference-certification": [null]}], "frais-restants": null, "conventionnement": "1", "duree-indicative": null, "info-public-vise": null, "nombre-heures-total": 120, "organisme-financeur": [{"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "Ouvrir l'école aux parents pour la réussite des enfants (OEPRE) 2024-2025", "@info": "programme-financeur"}]}], "code-financeur": "12"}, {"extras": [{"@info": "specificites", "extra": [{"$": "81023", "@ref": "V14", "@info": "code-public-vise"}, {"$": "3", "@info": "code-perimetre-recrutement"}, {"$": "Ouvrir l'école aux parents pour la réussite des enfants (OEPRE) 2024-2025", "@info": "programme-financeur"}]}], "code-financeur": "19"}], "modalites-recrutement": null, "modalites-enseignement": "0", "modalites-entrees-sorties": "1"}, "formation": {"code-niveau-entree": "1", "code-niveau-sortie": "1"}}, "frais": null, "source": "carif-oref", "adresse": "Rue Saint-Just", "commune": "Ivry-sur-Seine", "publics": ["personnes-exilees"], "courriel": "ce.0940249k@ac-creteil.fr", "date_maj": "2025-03-21", "latitude": 48.810817, "longitude": 2.389171, "structure": {"id": "carif-oref--14_OF_0000014533", "nom": "Commune d'Ivry-sur-Seine", "siret": "21940041300171", "source": "carif-oref", "adresse": "Rue Saint-Just", "commune": "Ivry-sur-Seine", "courriel": null, "date_maj": "2025-03-21", "doublons": [], "latitude": 48.810817, "site_web": null, "longitude": 2.389171, "telephone": "+33172046679", "code_insee": "94041", "code_postal": "94200", "description": null, "lien_source": "https://www.intercariforef.org/formations/commune-d-ivry-sur-seine/organisme-14_OF_0000014533.html", "score_qualite": 0.88, "horaires_accueil": null, "reseaux_porteurs": null, "adresse_certifiee": true, "accessibilite_lieu": null, "complement_adresse": null}, "telephone": "+33172046679", "code_insee": "94041", "code_postal": "94200", "description": "### Objectif de la formation\n\nFavoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :\n- l'acquisition du français (comprendre, parler, lire et écrire) ;\n- la connaissance des valeurs de la République et leur mise en oeuvre dans la société française ;\n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.\nCette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS.", "lien_source": "https://www.intercariforef.org/formations/ouvrir-l-ecole-aux-parents-pour-la-reussite-des-enfants-oepre/formation-14_AF_0000178821_SE_0001116783.html", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "structure_id": "carif-oref--14_OF_0000014533", "modes_accueil": ["en-presentiel"], "score_qualite": 0.8699999999999999, "mobilisable_par": ["professionnels"], "nombre_semaines": null, "conditions_acces": "Aucun", "frais_precisions": null, "horaires_accueil": null, "zone_eligibilite": ["75", "77", "78", "91", "92", "93", "94", "95"], "adresse_certifiee": true, "lien_mobilisation": null, "complement_adresse": null, "contact_nom_prenom": null, "modes_mobilisation": ["telephoner", "envoyer-un-courriel"], "publics_precisions": null, "mobilisation_precisions": null, "volume_horaire_hebdomadaire": 3}$seed$, NULL, NULL, $seed$6c6f7070-50ff-4d73-a257-9191c7630819$seed$, $seed$7b111ba0-9cf8-43f2-a946-b515448e6d89$seed$, 1, $seed$DI$seed$, NULL) ON CONFLICT DO NOTHING;

ALTER TABLE ingestion_records ENABLE TRIGGER on_new_ingestion_record;
ALTER TABLE ingestion_records ENABLE TRIGGER tr_ingestion_records_version;
