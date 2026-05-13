-- Seed di_services — scénarios crafted à partir de données DI réelles (RI-1243)
--
-- Données source : export staging carif-oref (main branch)
-- UUIDs stables pour identifier facilement chaque entrée en dev :
--   aa000001-... carif-oref--01_GE2021586      v1  (svc-01-compliant)
--   aa000002-... carif-oref--01_GE2030516      v1  (svc-02-noncompliant)
--   aa000003-... carif-oref--07_763179S        v1  (svc-03-draft)
--   aa000004-... carif-oref--07_776575S        v1  (svc-04-published)
--   aa000005-... carif-oref--14_SE_0001116947  v1  (svc-05 ancienne version)
--   aa000006-... carif-oref--14_SE_0001116947  v2  (svc-05 MAJ DI — scénario clé RI-1243)
--   aa000007-... carif-oref--14_SE_0001597312  v1  (svc-06 ancienne version)
--   aa000008-... carif-oref--14_SE_0001597312  v2  (svc-06 MAJ DI avec editorial sur v1)

ALTER TABLE di_services DISABLE TRIGGER di_services_set_version;

-- Scénario 1 : carif-oref--01_GE2021586 — Ouvrir l'école aux parents (Petite-Rosselle)
INSERT INTO di_services ("id", "version", "raw_data", "data", "content_hash")
VALUES (
  'aa000001-0000-0000-0000-000000000000',
  1, '{}',
  $seed${"source": "carif-oref", "structure_id": "carif-oref--01_GE307361", "id": "carif-oref--01_GE2021586", "nom": "Ouvrir l'école aux parents pour la réussite des enfants", "description": "### Objectif de la formation\n\n- Les formations ont pour but de favoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.\n- Attestation de suivi.\n- Validation possible selon le cas (DELF, DCL).\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :\n- l'acquisition du français (comprendre, parler, lire et écrire) ;\n- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;\n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.\nCette formation est assurée par des enseignants en Français Langue Seconde, des enseignants des UPE2A, ou des membres d'associations diplômés en FLE-FLS.", "date_maj": "2026-01-14", "type": "formation", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "frais": null, "publics": ["personnes-exilees"], "conditions_acces": "Etre primo-arrivants, immigres ou etrangers hors Union europeenne.", "commune": "Petite-Rosselle", "code_postal": "57540", "code_insee": "57537", "adresse": "1 Place du Mineur", "longitude": 6.850071, "latitude": 49.209202, "telephone": "+33387509020", "courriel": "ce.0572493A@ac-nancy-metz.fr", "modes_accueil": ["en-presentiel"], "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "mobilisable_par": ["professionnels"], "score_qualite": 0.9}$seed$,
  '9f45d5ca28f58f35d0dab2b6c6a0ff300546f7d6'
) ON CONFLICT DO NOTHING;

-- Scénario 2 : carif-oref--01_GE2030516 — Atelier sociolinguistique ASL (Mulhouse)
INSERT INTO di_services ("id", "version", "raw_data", "data", "content_hash")
VALUES (
  'aa000002-0000-0000-0000-000000000000',
  1, '{}',
  $seed${"source": "carif-oref", "structure_id": "carif-oref--01_GE305449", "id": "carif-oref--01_GE2030516", "nom": "Atelier sociolinguistique - Formation en français - Alphabétisation niveau A1.1 - Groupe 2 (ASL)", "description": "### Objectif de la formation\n\n- Se présenter et présenter sa famille.- Ecrire son nom et son prénom.- Discriminer les sons des voyelles et des consonnes.- Remplir un formulaire simple avec leurs éléments d'identité de base.\n\n### Contenu de la formation\n\n- Acquisition de la lecture- Production orale, activités d'expression- Production écrite- Réception écrite", "date_maj": "2026-01-20", "type": "formation", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "frais": null, "publics": ["personnes-exilees"], "conditions_acces": "Pas de prerequis", "commune": "Mulhouse", "code_postal": "68200", "code_insee": "68224", "adresse": "100 Avenue de Colmar", "longitude": 7.336421, "latitude": 47.756287, "telephone": "+33787069017", "courriel": "cdafal68.asl@hotmail.fr", "modes_accueil": ["en-presentiel"], "zone_eligibilite": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"], "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "mobilisable_par": ["professionnels"], "mobilisation_precisions": "- Test de positionnement de départ\n- Évaluation préalable", "score_qualite": 0.9}$seed$,
  'a2c8e1f3b7d94e5210c6f8a3b5d7e9f1c3a5b7d9'
) ON CONFLICT DO NOTHING;

-- Scénario 3 : carif-oref--07_763179S — Du FLE à l'emploi (Bourges)
INSERT INTO di_services ("id", "version", "raw_data", "data", "content_hash")
VALUES (
  'aa000003-0000-0000-0000-000000000000',
  1, '{}',
  $seed${"source": "carif-oref", "structure_id": "carif-oref--07_00297P", "id": "carif-oref--07_763179S", "nom": "Du FLE (Français langue étrangère) à l'emploi", "description": "### Objectif de la formation\n\nLa formation FLE a pour objectifs de permettre aux stagiaires : - De comprendre et s'exprimer oralement dans des situations diverses de la vie courante et dans un contexte professionnel - D'acquérir des bases linguistiques pour faciliter le passage à l'écrit - D'acquérir ou renforcer des compétences linguistiques attendues en entreprise pour réussir son projet professionnel par l'accès à l'emploi et/ou à la qualification - De découvrir un environnement professionnel et comprendre les codes de l'entreprise.\n\n### Contenu de la formation\n\nNon renseigné", "date_maj": "2026-01-20", "type": "formation", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "frais": null, "publics": ["personnes-exilees"], "conditions_acces": "Un entretien de positionnement a l arrivee. Orientation en fonction du niveau (debutants, intermediaires ou avances)", "commune": "Bourges", "code_postal": "18000", "code_insee": "18033", "adresse": "1 Allée Napoléon III", "longitude": 2.419547, "latitude": 47.074363, "telephone": "+33248656703", "courriel": "contact@lerelais18.fr", "modes_accueil": ["en-presentiel"], "zone_eligibilite": ["18", "28", "36", "37", "41", "45"], "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "mobilisable_par": ["professionnels"], "score_qualite": 0.9}$seed$,
  'b3d9f2a1c5e7f8d4a6b2c8e4f0d6a2b8c4e0f6d2'
) ON CONFLICT DO NOTHING;

-- Scénario 4 : carif-oref--07_776575S — FLE : Progresser en français (Blois)
INSERT INTO di_services ("id", "version", "raw_data", "data", "content_hash")
VALUES (
  'aa000004-0000-0000-0000-000000000000',
  1, '{}',
  $seed${"source": "carif-oref", "structure_id": "carif-oref--07_14262", "id": "carif-oref--07_776575S", "nom": "FLE : Progresser en français", "description": "### Objectif de la formation\n\nLa formation « FRANÇAIS LANGUE ÉTRANGÈRE » vise l'acquisition des bases linguistiques des bénéficiaires pour faciliter le passage à l'écrit dans des situations diverses. Les personnes sauront comprendre et s'exprimer oralement dans un contexte professionnel.\n\n### Contenu de la formation\n\nModules : accueil et intégration, positionnement, techniques de recherche d'emploi, projet collectif et soft skills.", "date_maj": "2026-01-28", "type": "formation", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "frais": null, "publics": ["demandeurs-emploi"], "conditions_acces": "Le dispositif s adresse a toutes les personnes dont l appropriation de la langue francaise est insuffisante pour s inserer dans l emploi.", "commune": "Blois", "code_postal": "41000", "code_insee": "41018", "adresse": "13 Rue Robert Nau", "longitude": 1.332562, "latitude": 47.612388, "telephone": "+33243756585", "courriel": "via.info@viaformation.fr", "modes_accueil": ["en-presentiel"], "zone_eligibilite": ["18", "28", "36", "37", "41", "45"], "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "mobilisable_par": ["professionnels"], "score_qualite": 0.85}$seed$,
  'c4e0a2b6d8f2a4c6e8b0d2f4a6c8e0b2d4f6a8c0'
) ON CONFLICT DO NOTHING;

-- Scénario 5 v1 : carif-oref--14_SE_0001116947 — OEPRE Les Mureaux (version initiale)
INSERT INTO di_services ("id", "version", "raw_data", "data", "content_hash")
VALUES (
  'aa000005-0000-0000-0000-000000000000',
  1, '{}',
  $seed${"source": "carif-oref", "structure_id": "carif-oref--14_OF_0000016454", "id": "carif-oref--14_SE_0001116947", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "description": "### Objectif de la formation\n\nFavoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage : - l'acquisition du français (comprendre, parler, lire et écrire) ; - la connaissance des valeurs de la République et leur mise en oeuvre dans la société française ; - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.", "date_maj": "2025-03-21", "type": "formation", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "frais": null, "publics": ["personnes-exilees"], "conditions_acces": "Aucun", "commune": "Les Mureaux", "code_postal": "78130", "code_insee": "78440", "adresse": "Rue Albert Thomas", "longitude": 1.922887, "latitude": 48.982753, "telephone": "+33134741945", "courriel": "ce.0780180x@ac-versailles.fr", "modes_accueil": ["en-presentiel"], "zone_eligibilite": ["75", "77", "78", "91", "92", "93", "94", "95"], "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "mobilisable_par": ["professionnels"], "volume_horaire_hebdomadaire": 3, "score_qualite": 0.87}$seed$,
  'd5f1b3c7e9a3b5d7f9c1e3a5b7d9f1c3e5a7b9d1'
) ON CONFLICT DO NOTHING;

-- Scénario 5 v2 : carif-oref--14_SE_0001116947 — OEPRE Les Mureaux (MAJ DI — scénario clé RI-1243)
-- Simulation d'une MAJ DI : date_maj mise à jour, volume horaire modifié, nouveau courriel
-- → jamais édité → l'éditeur doit voir cette v2 dans le BOMO
INSERT INTO di_services ("id", "version", "raw_data", "data", "content_hash")
VALUES (
  'aa000006-0000-0000-0000-000000000000',
  2, '{}',
  $seed${"source": "carif-oref", "structure_id": "carif-oref--14_OF_0000016454", "id": "carif-oref--14_SE_0001116947", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "description": "### Objectif de la formation\n\nFavoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage : - l'acquisition du français (comprendre, parler, lire et écrire) ; - la connaissance des valeurs de la République et leur mise en oeuvre dans la société française ; - la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.", "date_maj": "2026-04-15", "type": "formation", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "frais": null, "publics": ["personnes-exilees"], "conditions_acces": "Aucun", "commune": "Les Mureaux", "code_postal": "78130", "code_insee": "78440", "adresse": "Rue Albert Thomas", "longitude": 1.922887, "latitude": 48.982753, "telephone": "+33134741946", "courriel": "direction.mureaux@ac-versailles.fr", "modes_accueil": ["en-presentiel", "a-distance"], "zone_eligibilite": ["75", "77", "78", "91", "92", "93", "94", "95"], "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "mobilisable_par": ["professionnels"], "volume_horaire_hebdomadaire": 4, "score_qualite": 0.9}$seed$,
  'e6a2c4d8f0b2d4e6a8c0b2d4f6a8c0e2b4d6f8a2'
) ON CONFLICT DO NOTHING;

-- Scénario 6 v1 : carif-oref--14_SE_0001597312 — ASL ateliers du soir (Mantes-la-Jolie)
INSERT INTO di_services ("id", "version", "raw_data", "data", "content_hash")
VALUES (
  'aa000007-0000-0000-0000-000000000000',
  1, '{}',
  $seed${"source": "carif-oref", "structure_id": "carif-oref--14_OF_0000012792", "id": "carif-oref--14_SE_0001597312", "nom": "Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers linguistiques du soir", "description": "### Objectif de la formation\n\nAccéder à l'emploi ou préparer une réorientation professionnelle\nUtiliser l'informatique\nPréparer un diplôme ou une certification de langue française [DILF, DELF A1, DELF A2 ou DELF B1 selon le niveau du bénéficiaire]\nDevenir autonome au quotidien\nSe former aux questions civiques et de citoyenneté\n\n### Contenu de la formation\n\nCette action vise l'accompagnement dans l'apprentissage de la langue des salariés et des mères de famille non disponibles en journée. Elle permet à chaque demandeur de réaliser un parcours cohérent tenant compte du rythme, de l'individualisation, de son profil et de son projet professionnel.", "date_maj": "2026-01-22", "type": "formation", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "frais": null, "publics": ["personnes-exilees"], "publics_precisions": "Salaries primo arrivants avec contrat de travail. Femmes primo arrivantes ayant des problemes de garde d enfant.", "conditions_acces": "CECRL Oral : A1.1, A1 — Ecrit : A1.1, A1", "commune": "Mantes-la-Jolie", "code_postal": "78200", "code_insee": "78361", "adresse": "44 Boulevard Georges Clémenceau", "longitude": 1.687963, "latitude": 48.99789, "telephone": "+33130946383", "courriel": "a.atigui@ifdev.org", "modes_accueil": ["en-presentiel"], "zone_eligibilite": ["75", "77", "78", "91", "92", "93", "94", "95"], "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "mobilisable_par": ["professionnels"], "volume_horaire_hebdomadaire": 4, "score_qualite": 0.9}$seed$,
  'f7b3d5e9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1'
) ON CONFLICT DO NOTHING;

-- Scénario 6 v2 : carif-oref--14_SE_0001597312 — ASL du soir (MAJ DI)
-- Simulation d'une MAJ DI : nouvelles sessions, date_maj mise à jour
-- → editorial_record pointe encore sur v1 = obsolescence
INSERT INTO di_services ("id", "version", "raw_data", "data", "content_hash")
VALUES (
  'aa000008-0000-0000-0000-000000000000',
  2, '{}',
  $seed${"source": "carif-oref", "structure_id": "carif-oref--14_OF_0000012792", "id": "carif-oref--14_SE_0001597312", "nom": "Actions socio-linguistiques complémentaires du CIR (ASL) - Ateliers linguistiques du soir", "description": "### Objectif de la formation\n\nAccéder à l'emploi ou préparer une réorientation professionnelle\nUtiliser l'informatique\nPréparer un diplôme ou une certification de langue française [DILF, DELF A1, DELF A2 ou DELF B1 selon le niveau du bénéficiaire]\nDevenir autonome au quotidien\nSe former aux questions civiques et de citoyenneté\n\n### Contenu de la formation\n\nCette action vise l'accompagnement dans l'apprentissage de la langue des salariés et des mères de famille non disponibles en journée. Elle permet à chaque demandeur de réaliser un parcours cohérent tenant compte du rythme, de l'individualisation, de son profil et de son projet professionnel.", "date_maj": "2026-05-05", "type": "formation", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "frais": null, "publics": ["personnes-exilees"], "publics_precisions": "Salaries primo arrivants avec contrat de travail. Femmes primo arrivantes ayant des problemes de garde d enfant.", "conditions_acces": "CECRL Oral : A1.1, A1 — Ecrit : A1.1, A1", "commune": "Mantes-la-Jolie", "code_postal": "78200", "code_insee": "78361", "adresse": "44 Boulevard Georges Clémenceau", "longitude": 1.687963, "latitude": 48.99789, "telephone": "+33130946384", "courriel": "contact@ifdev.org", "modes_accueil": ["en-presentiel"], "zone_eligibilite": ["75", "77", "78", "91", "92", "93", "94", "95"], "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "mobilisable_par": ["professionnels"], "volume_horaire_hebdomadaire": 5, "score_qualite": 0.92}$seed$,
  'a8c4e6f0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2'
) ON CONFLICT DO NOTHING;

-- Scénario 7 v1 : carif-oref--10_377967S — OEPRE Nevers (version initiale)
INSERT INTO di_services ("id", "version", "raw_data", "data", "content_hash")
VALUES (
  'aa000009-0000-0000-0000-000000000000',
  1, '{}',
  $seed${"source": "carif-oref", "structure_id": "carif-oref--10_4417", "id": "carif-oref--10_377967S", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "description": "### Objectif de la formation\n\nFavoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :\n- l'acquisition du français (comprendre, parler, lire et écrire) ;\n- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;\n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.", "date_maj": "2025-09-01", "type": "formation", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "frais": null, "publics": ["personnes-exilees"], "conditions_acces": "Aucun", "commune": "Nevers", "code_postal": "58000", "adresse": "12 Rue Saint-Genest", "longitude": 3.159749, "latitude": 46.989501, "telephone": "+33386571200", "courriel": "ce.0580048B@ac-dijon.fr", "modes_accueil": ["en-presentiel"], "zone_eligibilite": ["03", "21", "58", "71", "89"], "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "mobilisable_par": ["professionnels"], "score_qualite": 0.88}$seed$,
  'b9d1e3f5a7c9e1f3b5d7f9a1c3e5b7d9f1a3c5e7'
) ON CONFLICT DO NOTHING;

-- Scénario 7 v2 : carif-oref--10_377967S — OEPRE Nevers (MAJ DI + audit Letta déjà effectué)
-- compliance_status = 'compliant' sur la v2 → Letta a réévalué, fiche visible normalement
INSERT INTO di_services ("id", "version", "raw_data", "data", "content_hash")
VALUES (
  'aa000010-0000-0000-0000-000000000000',
  2, '{}',
  $seed${"source": "carif-oref", "structure_id": "carif-oref--10_4417", "id": "carif-oref--10_377967S", "nom": "Ouvrir l'école aux parents pour la réussite des enfants - OEPRE", "description": "### Objectif de la formation\n\nFavoriser l'intégration des parents d'élèves, primo-arrivants, immigrés ou étrangers hors Union européenne, volontaires, en les impliquant notamment dans la scolarité de leur enfant.\n\n### Contenu de la formation\n\nLes formations portent sur trois axes d'apprentissage :\n- l'acquisition du français (comprendre, parler, lire et écrire) ;\n- la connaissance des valeurs de la République et leur mise en œuvre dans la société française ;\n- la connaissance du fonctionnement et des attentes de l'école vis-à-vis des élèves et des parents.", "date_maj": "2026-03-10", "type": "formation", "thematiques": ["lecture-ecriture-calcul--maitriser-le-francais"], "frais": null, "publics": ["personnes-exilees"], "conditions_acces": "Aucun", "commune": "Nevers", "code_postal": "58000", "adresse": "12 Rue Saint-Genest", "longitude": 3.159749, "latitude": 46.989501, "telephone": "+33386571201", "courriel": "direction.nevers@ac-dijon.fr", "modes_accueil": ["en-presentiel", "a-distance"], "zone_eligibilite": ["03", "21", "58", "71", "89"], "modes_mobilisation": ["envoyer-un-courriel", "telephoner"], "mobilisable_par": ["professionnels"], "score_qualite": 0.91}$seed$,
  'c0e2f4a6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6a8'
) ON CONFLICT DO NOTHING;

ALTER TABLE di_services ENABLE TRIGGER di_services_set_version;
