import { z } from "zod";

/**
 * Zod schemas for Data Inclusion API
 * Generated from OpenAPI spec at https://api.data.inclusion.gouv.fr/api/openapi.json
 */

// Enums
export const FraisSchema = z.enum(["gratuit", "payant"]);

export const TypeServiceSchema = z.enum([
  "accompagnement",
  "aide-financiere",
  "aide-materielle",
  "atelier",
  "formation",
  "information",
]);

export const ModeAccueilSchema = z.enum(["a-distance", "en-presentiel"]);

export const ModeMobilisationSchema = z.enum([
  "envoyer-un-courriel",
  "se-presenter",
  "telephoner",
  "utiliser-lien-mobilisation",
]);

export const PersonneMobilisatriceSchema = z.enum([
  "usagers",
  "professionnels",
]);

export const PublicSchema = z.enum([
  "tous-publics",
  "actifs",
  "beneficiaires-des-minimas-sociaux",
  "demandeurs-emploi",
  "etudiants",
  "familles",
  "femmes",
  "jeunes",
  "personnes-en-situation-de-handicap",
  "personnes-en-situation-durgence",
  "personnes-en-situation-juridique-specifique",
  "personnes-exilees",
  "residents-qpv-frr",
  "seniors",
]);

// Base schemas
export const BaseStructureSchema = z.object({
  source: z.string(),
  id: z.string(),
  nom: z.string().min(3).max(150),
  date_maj: z.string(), // ISO date format
  description: z.string().min(5).max(10000).nullable(),
  lien_source: z.string().url().min(1).max(2083).nullable(),
  siret: z
    .string()
    .length(14)
    .regex(/^\d{14}$/)
    .nullable(),
  commune: z.string().nullable(),
  code_postal: z
    .string()
    .length(5)
    .regex(/^\d{5}$/)
    .nullable(),
  code_insee: z
    .string()
    .length(5)
    .regex(/^\w{5}$/)
    .nullable(),
  adresse: z.string().nullable(),
  complement_adresse: z.string().nullable(),
  longitude: z.number().nullable(),
  latitude: z.number().nullable(),
  telephone: z.string().nullable(),
  courriel: z.string().email().nullable(),
  site_web: z.string().url().min(1).max(2083).nullable(),
  horaires_accueil: z.string().nullable(),
  accessibilite_lieu: z.string().url().min(1).max(2083).nullable(),
  reseaux_porteurs: z.array(z.string()).nullable(),
});

export const ServiceSchema = z.object({
  source: z.string(),
  structure_id: z.string(),
  id: z.string(),
  nom: z.string().min(3).max(150),
  description: z.string().min(5).max(10000),
  lien_source: z.string().url().min(1).max(2083).nullable(),
  date_maj: z.string(), // ISO date format
  type: TypeServiceSchema.nullable(),
  thematiques: z.array(z.string()).nullable(),
  frais: FraisSchema.nullable(),
  frais_precisions: z.string().nullable(),
  publics: z.array(PublicSchema).min(1).nullable(),
  publics_precisions: z.string().nullable(),
  conditions_acces: z.string().nullable(),
  commune: z.string().nullable(),
  code_postal: z
    .string()
    .length(5)
    .regex(/^\d{5}$/)
    .nullable(),
  code_insee: z
    .string()
    .length(5)
    .regex(/^\w{5}$/)
    .nullable(),
  adresse: z.string().nullable(),
  complement_adresse: z.string().nullable(),
  longitude: z.number().nullable(),
  latitude: z.number().nullable(),
  telephone: z.string().nullable(),
  courriel: z.string().email().nullable(),
  modes_accueil: z.array(ModeAccueilSchema).nullable(),
  zone_eligibilite: z.array(z.string()).min(1).nullable(),
  contact_nom_prenom: z.string().nullable(),
  lien_mobilisation: z.string().url().min(1).max(2083).nullable(),
  modes_mobilisation: z.array(ModeMobilisationSchema).min(1).nullable(),
  mobilisable_par: z.array(PersonneMobilisatriceSchema).min(1).nullable(),
  mobilisation_precisions: z.string().nullable(),
  volume_horaire_hebdomadaire: z.number().min(0).nullable(),
  nombre_semaines: z.number().int().min(1).nullable(),
  horaires_accueil: z.string().nullable(),
  score_qualite: z.number().min(0).max(1),
});

export const StructureSchema = z.object({
  source: z.string(),
  id: z.string(),
  nom: z.string().min(3).max(150),
  date_maj: z.string(), // ISO date format
  description: z.string().min(5).max(10000).nullable(),
  lien_source: z.string().url().min(1).max(2083).nullable(),
  siret: z
    .string()
    .length(14)
    .regex(/^\d{14}$/)
    .nullable(),
  commune: z.string().nullable(),
  code_postal: z
    .string()
    .length(5)
    .regex(/^\d{5}$/)
    .nullable(),
  code_insee: z
    .string()
    .length(5)
    .regex(/^\w{5}$/)
    .nullable(),
  adresse: z.string().nullable(),
  complement_adresse: z.string().nullable(),
  longitude: z.number().nullable(),
  latitude: z.number().nullable(),
  telephone: z.string().nullable(),
  courriel: z.string().email().nullable(),
  site_web: z.string().url().min(1).max(2083).nullable(),
  horaires_accueil: z.string().nullable(),
  accessibilite_lieu: z.string().url().min(1).max(2083).nullable(),
  reseaux_porteurs: z.array(z.string()).nullable(),
});

// Detailed versions (with nested structure/services)
export const DetailedServiceSchema = ServiceSchema.extend({
  structure: BaseStructureSchema,
});

export const DetailedStructureSchema = StructureSchema.extend({
  score_qualite: z.number().min(0).max(1),
  doublons: z.array(StructureSchema),
  services: z.array(ServiceSchema),
});

// Generic Page schema
export const PageSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int(),
    page: z.number().int(),
    size: z.number().int(),
    pages: z.number().int(),
  });

// Specific page schemas for common endpoints
export const PageServiceSchema = PageSchema(ServiceSchema);
export const PageStructureSchema = PageSchema(StructureSchema);

// Type exports for convenience
export type Service = z.infer<typeof ServiceSchema>;
export type Structure = z.infer<typeof StructureSchema>;
export type DetailedService = z.infer<typeof DetailedServiceSchema>;
export type DetailedStructure = z.infer<typeof DetailedStructureSchema>;
