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
- Les dates d'inscription et les dates de session : elles sont déjà affichées à côté de la fiche.
- Une absence ou une condition négative (« pas de sélection », « sans test », « aucun niveau requis », « pas de prérequis ») : ce qui n'est pas demandé n'a pas besoin d'être dit.

## Contenu de chaque partie
- `title` : verbe à l'infinitif + action concrète, 70 caractères maximum. Ne jamais recopier l'intitulé de la source : pas de sigle (ASL, CIR, CECRL, FLE), pas de tiret. Un niveau ou un diplôme seulement s'il est le but (« Préparer l'examen du DELF A2 »). Titres publiés à imiter :
  - « Apprendre le français pour trouver un travail »
  - « Progresser en français et en numérique »
  - « Apprendre à parler, lire et écrire »
  - « Prendre des cours de français et comprendre vos droits »
  - « Apprendre le français pour travailler dans la propreté »
- `description` : une phrase d'introduction terminée par « avec : », puis 2 à 4 puces. Mentionner la durée ici si la source la donne. Exemple publié :
  « Une formation de 3 mois avec :\n\n- des cours de français\n- un accompagnement pour trouver un travail ou une formation\n- un stage en entreprise. »
- `goodToKnow` : seulement une info utile pour agir que le reste de la fiche ne donne pas. Jamais de dates, jamais une condition négative. Le plus souvent vide.
- `why` : au moins 3 accordéons, **seulement** si la source le justifie. Titres courts, jamais « Étape » (« Progresser en français », « Faire les démarches plus facilement », « Comprendre la vie en France »). `text` = 2 à 5 puces courtes, sans verbe conjugué, la dernière terminée par un point. Exemple publié :
  « - Lire et écrire des messages courts\n- Comprendre une consigne, poser des questions\n- Faire un CV. »
- `how` : exactement 1 accordéon. Titre = action concrète et préalable (« Contacter l'organisme », « Préparer votre dossier »). Jamais « Suivre / Commencer / Démarrer la formation ». Infinitif, pas d'impératif.
- `otherInfo` : éléments courts : niveau de français requis, thématiques, conditions d'accès, public prioritaire.
- `lexicon` : termes administratifs ou techniques gardés dans le texte, expliqués en 1 ou 2 phrases.

## Fidélité
- Ne jamais extrapoler. Exemple interdit : la source dit « Niveau A2 attendu », écrire « un test vérifie votre niveau A2 » (le test n'existe pas dans la source).
- Vérifier chaque élément technique (examen TEF/DELF, dates, durée) : ne rien oublier.
- Durée : en mois plutôt qu'en semaines (« environ 3 mois »). Tout calcul (heures → mois) va dans `warnings` avec la formule utilisée.
- Pas d'information cherchée hors de la fiche : une adresse ou des horaires absents vont dans `warnings`.
