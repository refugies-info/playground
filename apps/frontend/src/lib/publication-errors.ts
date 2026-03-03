const errorMappings = [
  {
    keys: ["fetch failed", "network"],
    message:
      "Le serveur de publication est injoignable. Vérifiez votre connexion ou réessayez dans quelques instants.",
  },
  {
    keys: ["webhook secret", "missing webhook"],
    message:
      "La configuration du serveur est incomplète. Contactez l'équipe technique.",
  },
  {
    keys: ["timeout", "timed out"],
    message:
      "Le serveur a mis trop de temps à répondre. Réessayez dans quelques instants.",
  },
  {
    keys: ["401", "unauthorized"],
    message:
      "Authentification refusée par le serveur distant. Contactez l'équipe technique.",
  },
  {
    keys: ["403", "forbidden"],
    message:
      "Accès refusé par le serveur de publication. Contactez l'équipe technique.",
  },
  {
    keys: ["404", "not found"],
    message:
      "Le point d'accès de publication est introuvable. Contactez l'équipe technique.",
  },
  {
    keys: ["invalid payload"],
    message:
      "Les données envoyées au serveur sont invalides. Vérifiez les métadonnées du contenu.",
  },
  {
    keys: ["500", "internal server"],
    message:
      "Erreur interne du serveur de publication. Réessayez ou contactez l'équipe technique.",
  },
  {
    keys: ["workflow not found"],
    message: "Le contenu n'a pas été trouvé. Rechargez la page et réessayez.",
  },
  {
    keys: ["publication id not received"],
    message:
      "La publication a été envoyée mais aucun identifiant n'a été retourné. Contactez l'équipe technique.",
  },
];

export function getUserFriendlyPublicationError(error: string): string {
  const lower = error.toLowerCase();
  const mapping = errorMappings.find((entry) =>
    entry.keys.some((key) => lower.includes(key)),
  );

  return (
    mapping?.message ||
    "Une erreur inattendue est survenue. Réessayez ou contactez l'équipe technique."
  );
}
