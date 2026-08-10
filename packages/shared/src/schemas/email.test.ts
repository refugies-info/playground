import { describe, expect, it } from "vitest";
import { EMAIL_ERROR_MESSAGE, EmailSchema, getEmailError } from "./email";

describe("getEmailError", () => {
  it("accepte une adresse valide", () => {
    expect(getEmailError("contact@structure.fr")).toBeUndefined();
    expect(
      getEmailError("Prenom.Nom+tag@sous.domaine.example"),
    ).toBeUndefined();
  });

  it("ne signale rien sur une valeur vide — le champ requis ou non se décide ailleurs", () => {
    expect(getEmailError("")).toBeUndefined();
    expect(getEmailError(undefined)).toBeUndefined();
    expect(getEmailError(null)).toBeUndefined();
  });

  it("signale une adresse mal formée", () => {
    expect(getEmailError("pas-un-email")).toBe(EMAIL_ERROR_MESSAGE);
    expect(getEmailError("a@")).toBe(EMAIL_ERROR_MESSAGE);
    expect(getEmailError("@structure.fr")).toBe(EMAIL_ERROR_MESSAGE);
  });

  it("tolère les espaces de bord — elles sont retirées, pas refusées", () => {
    // Le cas d'origine du ticket : une adresse copiée-collée avec une espace.
    expect(getEmailError(" contact@structure.fr")).toBeUndefined();
    expect(getEmailError("contact@structure.fr ")).toBeUndefined();
    expect(getEmailError("\tcontact@structure.fr\n")).toBeUndefined();
  });

  it("refuse une espace au milieu de l'adresse", () => {
    // `trim` ne touche que les bords : celle-ci reste une vraie erreur.
    expect(getEmailError("con tact@structure.fr")).toBe(EMAIL_ERROR_MESSAGE);
  });

  it('exige un TLD, contrairement à `<input type="email">`', () => {
    // Le navigateur accepterait ces deux valeurs ; nous non, volontairement.
    expect(getEmailError("a@b")).toBe(EMAIL_ERROR_MESSAGE);
    expect(getEmailError("contact@localhost")).toBe(EMAIL_ERROR_MESSAGE);
  });
});

describe("EmailSchema", () => {
  it("rejette une chaîne vide", () => {
    expect(EmailSchema.safeParse("").success).toBe(false);
  });

  it("renvoie l'adresse nettoyée dans `data`", () => {
    // C'est la seule façon de récupérer la valeur trimée : un appelant qui
    // réutilise son entrée au lieu de `result.data` perd la normalisation.
    const result = EmailSchema.safeParse("  contact@structure.fr  ");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("contact@structure.fr");
  });

  it("porte le message partagé", () => {
    const result = EmailSchema.safeParse("nope");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(EMAIL_ERROR_MESSAGE);
    }
  });
});
