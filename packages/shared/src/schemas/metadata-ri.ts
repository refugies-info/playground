import { z } from "zod";

// =============================================================================
// Metadata RI Schemas for validation
// =============================================================================

/** Price schema */
export const PriceSchema = z.object({
  values: z.array(
    z.number({ message: "Les valeurs doivent être des nombres" }),
    {
      message: "La liste des prix est requise",
    },
  ),
  details: z
    .string({ message: "Le détail doit être une chaîne de caractères" })
    .min(1, { message: "Le détail ne peut pas être vide" })
    .optional(),
});

/** Age schema */
export const AgeSchema = z.object({
  type: z
    .enum(["lessThan", "moreThan", "between"], {
      message: "Le type d'âge doit être 'lessThan', 'moreThan' ou 'between'",
    })
    .optional(),
  ages: z
    .array(z.number({ message: "L'âge doit être un nombre" }), {
      message: "La liste des âges est invalide",
    })
    .optional(),
});

/** Commitment schema */
export const CommitmentSchema = z.object({
  amountDetails: z
    .enum(["minimum", "maximum", "approximately", "exactly", "between"], {
      message:
        "Le type d'engagement doit être 'minimum', 'maximum', 'approximately', 'exactly' ou 'between'",
    })
    .optional(),
  hours: z
    .array(z.number({ message: "Le nombre d'heures doit être un nombre" }), {
      message: "La liste des heures est invalide",
    })
    .optional(),
  timeUnit: z
    .string({ message: "L'unité de temps doit être une chaîne de caractères" })
    .optional(),
});

/** Frequency schema */
export const FrequencySchema = z.object({
  amountDetails: z
    .enum(["minimum", "maximum", "approximately", "exactly"], {
      message:
        "Le type de fréquence doit être 'minimum', 'maximum', 'approximately' ou 'exactly'",
    })
    .optional(),
  hours: z
    .number({ message: "Le nombre d'heures doit être un nombre" })
    .optional(),
  timeUnit: z
    .string({ message: "L'unité de temps doit être une chaîne de caractères" })
    .optional(),
  frequencyUnit: z
    .string({
      message: "L'unité de fréquence doit être une chaîne de caractères",
    })
    .optional(),
});

/** Session schema */
export const SessionSchema = z.object({
  startDate: z
    .string({ message: "La date de début doit être une chaîne de caractères" })
    .optional(),
  endDate: z
    .string({ message: "La date de fin doit être une chaîne de caractères" })
    .optional(),
});

/** Sessions field schema (v2 format with modalitesEntreesSorties) */
export const SessionsFieldSchema = z.object({
  modalitesEntreesSorties: z
    .union([z.literal(0), z.literal(1)], {
      message:
        "modalitesEntreesSorties doit être 0 (dates fixes), 1 (a tout moment), ou null",
    })
    .nullish(),
  items: z
    .array(SessionSchema, {
      message: "items doit être une liste de sessions",
    })
    .nullish(),
});

/** POI schema */
export const PoiSchema = z.object({
  title: z
    .string({ message: "Le titre doit être une chaîne de caractères" })
    .optional(),
  address: z
    .string({ message: "L'adresse doit être une chaîne de caractères" })
    .optional(),
  city: z
    .string({ message: "La ville doit être une chaîne de caractères" })
    .optional(),
  lat: z.number({ message: "La latitude doit être un nombre" }).optional(),
  lng: z.number({ message: "La longitude doit être un nombre" }).optional(),
  email: z
    .string({ message: "L'email doit être une chaîne de caractères" })
    .optional(),
  phone: z
    .string({ message: "Le téléphone doit être une chaîne de caractères" })
    .optional(),
  description: z
    .string({ message: "La description doit être une chaîne de caractères" })
    .optional(),
});

/** Full Metadata RI Schema */
export const MetadataRiSchema = z.object({
  // Identity
  titreMarque: z
    .string({ message: "Le titre marque doit être une chaîne de caractères" })
    .nullish(),
  mainSponsor: z
    .string({
      message: "Le sponsor principal doit être une chaîne de caractères",
    })
    .nullish(),
  logo: z
    .string({ message: "Le logo doit être une chaîne de caractères (URL)" })
    .nullish(),
  abstract: z
    .string({ message: "Le résumé doit être une chaîne de caractères" })
    .nullish(),

  // Themes & Needs
  theme: z
    .string({
      message: "Le thème doit être un identifiant (chaîne de caractères)",
    })
    .nullish(),
  secondaryThemes: z
    .array(
      z.string({ message: "Chaque thème secondaire doit être un identifiant" }),
      {
        message: "Les thèmes secondaires doivent être une liste d'identifiants",
      },
    )
    .nullish(),
  needs: z
    .array(z.string({ message: "Chaque besoin doit être un identifiant" }), {
      message: "Les besoins doivent être une liste d'identifiants",
    })
    .nullish(),

  // Public
  publicStatus: z
    .array(
      z.string({
        message: "Chaque statut public doit être une chaîne de caractères",
      }),
      {
        message: "Les statuts publics doivent être une liste",
      },
    )
    .nullish(),
  public: z
    .array(
      z.string({
        message: "Chaque type de public doit être une chaîne de caractères",
      }),
      {
        message: "Les types de public doivent être une liste",
      },
    )
    .nullish(),
  frenchLevel: z
    .array(
      z.string({
        message: "Chaque niveau de français doit être une chaîne de caractères",
      }),
      {
        message: "Les niveaux de français doivent être une liste",
      },
    )
    .nullish(),
  age: AgeSchema.nullish(),

  // Modalities
  price: PriceSchema.nullish(),
  commitment: CommitmentSchema.nullish(),
  frequency: FrequencySchema.nullish(),
  periode: SessionsFieldSchema.nullish(),
  timeSlots: z
    .array(
      z.string({
        message: "Chaque créneau horaire doit être une chaîne de caractères",
      }),
      {
        message: "Les créneaux horaires doivent être une liste",
      },
    )
    .nullish(),

  // Geography
  location: z
    .union(
      [
        z.literal("france"),
        z.literal("online"),
        z.array(
          z.string({
            message: "Chaque département doit être une chaîne de caractères",
          }),
          {
            message: "Les départements doivent être une liste",
          },
        ),
      ],
      {
        message:
          "La localisation doit être 'france', 'online' ou une liste de départements",
      },
    )
    .nullish(),
  conditions: z
    .array(
      z.string({
        message: "Chaque condition doit être une chaîne de caractères",
      }),
      {
        message: "Les conditions doivent être une liste",
      },
    )
    .nullish(),
  map: z
    .union([
      z.array(PoiSchema, {
        message: "Les points d'intérêt doivent être une liste",
      }),
      PoiSchema,
    ])
    .nullish(),
});

export type MetadataRi = z.infer<typeof MetadataRiSchema>;

// =============================================================================
// Field-by-field validation helper
// =============================================================================

/**
 * Validate a single field value against its schema.
 * Returns { success: true } or { success: false; error: string }
 */
export function validateField(
  key: string,
  value: unknown,
): { success: true } | { success: false; error: string } {
  // Get the field schema from the main schema
  const fieldSchema =
    MetadataRiSchema.shape[key as keyof typeof MetadataRiSchema.shape];

  // If no schema defined for this key, allow it (permissive for unknown fields)
  if (!fieldSchema) {
    return { success: true };
  }

  const result = fieldSchema.safeParse(value);

  if (result.success) {
    return { success: true };
  }

  // Format error message - use the first error with custom message
  const firstError = result.error.issues[0];
  if (!firstError) {
    return { success: false, error: "Erreur de validation inconnue" };
  }

  // Use the custom message from Zod, or fallback to a generic message
  const errorMessage =
    firstError.message || `Valeur invalide pour le champ '${key}'`;

  return { success: false, error: errorMessage };
}

/**
 * Validate all fields in a metadata object.
 * Returns a map of field keys to error messages.
 */
export function validateAllFields(
  metadata: Record<string, unknown>,
): Map<string, string> {
  const errors = new Map<string, string>();

  for (const [key, value] of Object.entries(metadata)) {
    const result = validateField(key, value);
    if (!result.success) {
      errors.set(key, result.error);
    }
  }

  return errors;
}
