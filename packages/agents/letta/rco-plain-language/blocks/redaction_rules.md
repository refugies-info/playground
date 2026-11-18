# Règles de rédaction en langage clair

## Public
- Personnes allophones A1/A2 : comprennent peu le français, lisent difficilement.
- Stressées, peu de temps, situation précaire (logement, emploi, démarches, enfants).
- Lisent sur smartphone, avec une connexion limitée.

## Ton
- Neutre, bienveillant, rassurant, pratique. Vouvoiement.
- Forme active. Pas de futur à la 2e personne (« vous apprendrez » → « Apprendre »). Pas d'impératif (« Téléphonez » → « Appeler »).
- Phrases nominales privilégiées (« Mots pour commander au restaurant »).
- « son / sa / ses » → « votre », « un » ou « le » (« améliorer son français » → « améliorer votre français »).

## Phrases et vocabulaire
- 25 mots maximum par phrase. Une phrase = une idée. Paragraphes courts.
- Mots simples et courants. Pas de mot anglais (« créneaux », pas « slots »).
- Expliquer chaque sigle à sa première mention : « le français langue étrangère (FLE) ». Les sigles techniques vont aussi dans `lexicon`.
- QPV : ne jamais laisser tel quel. Écrire « quartier prioritaire » ou l'expliquer dans `lexicon`.
- Ne pas écrire « étranger » ou « d'origine étrangère » quand c'est évident.

## Termes interdits (sauf dans un nom de marque)
reconnaissance officielle, gestes concrets, multisectoriel, plan de travail, programme d'apprentissage linguistique, vers l'emploi, obtenir, acquérir, pré-requis, FLE (seul, sans explication), primo-arrivant, être d'origine étrangère, codes français, complètement, parler beaucoup le français, socio-professionnel, linguistique.

Dans `why`, interdits aussi : postuler.
Dans `how`, interdits aussi : « se rendre à l'inscription », « aller à l'adresse suivante », « à votre vie », « placé dans le bon groupe ».

## Reformulations
- « Obtenir une certification » → « Avoir une certification officielle du niveau de français »
- « Accéder à l'emploi ou à la formation » → « Trouver un travail ou une formation professionnelle »
- « Communiquer sans timidité » → « Communiquer plus facilement » ou « Mieux communiquer au quotidien »
- « Devenir indépendant dans vos études » → « Être autonome »
- « Poursuivre vos progrès » → « Continuer à progresser »
- « Gagner confiance avec la langue » → « Parler en confiance »
- « Apprentissage axé sur » → reformuler entièrement.

## Ce que la fiche ne dit jamais
- La gratuité ou le prix.
- Le nom de l'organisme, le nombre de places, le financeur (« financé par l'État », « BOP 104 »…).
- La zone géographique ou le département (« vérifier que vous habitez dans la bonne zone »).
- Les dates d'inscription et les dates de session : elles sont déjà affichées à côté de la fiche. Seule exception : le « Bon à savoir » peut donner le calendrier d'un programme qui a des dates fixes (voir les exemples).
- Une absence ou une condition négative (« pas de sélection », « sans test », « aucun niveau requis », « pas de prérequis ») : ce qui n'est pas demandé n'a pas besoin d'être dit.

## Contenu de chaque partie
- `title` : verbe à l'infinitif + action concrète, 70 caractères maximum. Ne jamais recopier l'intitulé de la source : pas de sigle (ASL, CIR, CECRL, FLE), pas de tiret. Un niveau ou un diplôme seulement s'il est le but (« Préparer l'examen du DELF A2 »). Titres publiés à imiter :
  - « Apprendre le français pour trouver un travail »
  - « Progresser en français et en numérique »
  - « Apprendre à parler, lire et écrire »
  - « Prendre des cours de français et comprendre vos droits »
  - « Apprendre le français pour travailler dans la propreté »
- `description` : quelques phrases courtes, **une phrase par idée** : la nature de l'action (cours, formation, atelier…), son objectif, ses caractéristiques principales. Mentionner la durée ici si la source la donne. Pas de puces. Exemple :
  « Une formation de 3 mois pour apprendre le français et trouver un travail. Il y a des cours de français et un accompagnement pour chercher un emploi ou une formation. La formation se termine par un stage en entreprise. »
- `goodToKnow` : **au plus 1 élément**, souvent vide (le code ajoute lui-même le bloc CIR). Une info utile pour agir que le reste de la fiche ne donne pas : les conditions précises pour s'inscrire, les jours et horaires des cours, ou l'explication d'un mot que la personne doit comprendre pour savoir si la formation est pour elle. Jamais une condition négative, jamais la durée (elle va dans `description`). Une liste commence par une phrase terminée par « : », puis une ligne par condition. Exemples validés par l'équipe éditoriale :
  - « La formation est ouverte aux personnes qui :\n- ont la protection internationale (statut de réfugié, bénéficiaire de la protection subsidiaire, apatride) ou une carte de séjour vie privée vie familiale, ou une carte de séjour salarié ou travailleur temporaire\n- sont en France depuis moins de 5 ans\n- sont accompagnées par France Travail (personnes qui cherchent un travail), ou CAP Emploi (personnes en situation de handicap), ou une Mission locale (jeunes de 16 à 25 ans), ou le programme AGIR (accompagnement global et individualisé des réfugiés). »
  - « Vous pouvez vous inscrire si vous avez :\n- la protection internationale (statut de réfugié, bénéficiaire de la protection subsidiaire, apatride) ou si vous êtes en France depuis moins de 5 ans\n- un ou plusieurs enfants inscrits à l'école. »
  - « Le secteur du bâtiment correspond aux chantiers de construction ou de rénovation. Par exemple : faire la maçonnerie ou l'électricité, poser du carrelage ou de la peinture. Cette formation est ouverte aux personnes qui sont en France depuis moins de 5 ans et qui cherchent un travail dans le secteur du BTP (bâtiment et travaux publics). »
  - « Les cours ont lieu le mardi de 14h à 16h pour les niveaux B1/B2/C1 et le vendredi de 11h à 13h pour les niveaux A1/A2/Alphabétisation. »
  - « Le programme est organisé du 16 novembre 2026 au 18 mars 2027.\nIl y a 21 heures de cours par semaine, le mardi, le mercredi et le jeudi. »
- `why` : **3 accordéons minimum, 4 maximum**, seulement ce que la source justifie (le code ne publie pas au-delà de 4). Titres courts, jamais « Étape » (« Progresser en français », « Faire les démarches plus facilement », « Comprendre la vie en France »). `text` = 1 ou 2 phrases courtes avec un exemple concret intégré au texte, **jamais de liste à puces**. Exemple :
  « Comprendre ce que disent les enseignants, par exemple pendant une réunion de parents. »
- `how` : 1 accordéon, 2 au maximum et rarement (le code ne publie pas au-delà de 2). Titre = action concrète et préalable (« Contacter l'organisme », « Préparer votre dossier »). Jamais « Suivre / Commencer / Démarrer la formation ». Infinitif, pas d'impératif.
- `otherInfo` : éléments courts : niveau de français requis, thématiques, conditions d'accès, public prioritaire.
- `lexicon` : termes administratifs ou techniques gardés dans le texte, expliqués en 1 ou 2 phrases.

## Fidélité
- Ne jamais extrapoler. Exemple interdit : la source dit « Niveau A2 attendu », écrire « un test vérifie votre niveau A2 » (le test n'existe pas dans la source).
- Vérifier chaque élément technique (examen TEF/DELF, dates, durée) : ne rien oublier.
- Durée : en mois plutôt qu'en semaines (« environ 3 mois »). Tout calcul (heures → mois) va dans `warnings` avec la formule utilisée.
- Une seule durée dans la fiche. Si `nombre_heures_total` et `duree_indicative` ne disent pas la même chose, garder `nombre_heures_total` et mettre l'écart dans `warnings` : ne jamais afficher deux chiffres.
- Utiliser seulement la fiche : une adresse ou des horaires absents vont dans `warnings`.
