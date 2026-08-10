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

  it("refuse les espaces, y compris en bord d'adresse", () => {
    // Le cas d'origine du ticket : une adresse copiée-collée avec une espace.
    expect(getEmailError(" contact@structure.fr")).toBe(EMAIL_ERROR_MESSAGE);
    expect(getEmailError("contact@structure.fr ")).toBe(EMAIL_ERROR_MESSAGE);
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

  it("porte le message partagé", () => {
    const result = EmailSchema.safeParse("nope");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(EMAIL_ERROR_MESSAGE);
    }
  });
});
