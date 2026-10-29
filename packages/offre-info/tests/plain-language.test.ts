import { describe, expect, it } from "vitest";
import { buildActionDocument } from "../src/document";
import { normalizeSession } from "../src/normalize";
import {
  type PlainLanguageFiche,
  renderPlainLanguageFiche,
  toPlainLanguageDocument,
} from "../src/plain-language/plain-language-rules";
import { rawSession } from "./fixtures";

const actionOf = (overrides: Record<string, unknown> = {}) =>
  buildActionDocument(
    [normalizeSession(rawSession(overrides))],
    "carif-oref--01_999",
  );

const fiche = (overrides: Partial<PlainLanguageFiche> = {}) => ({
  title: "Apprendre le français pour aider vos enfants",
  description: "Des cours de français à l'école de vos enfants.",
  goodToKnow: [],
  why: [
    { title: "Parler avec l'école", text: "Comprendre les enseignants." },
    { title: "Suivre les devoirs", text: "Aider vos enfants le soir." },
    { title: "Mieux communiquer", text: "Parler en confiance." },
  ],
  how: [{ title: "Contacter l'école", text: "Envoyer un mail à l'école." }],
  otherInfo: ["Niveau A1"],
  lexicon: [{ term: "Dispositif", definition: "Programme ou service." }],
  warnings: [],
  ...overrides,
});

describe("toPlainLanguageDocument", () => {
  it("keeps the useful texts as plain text and drops what the fiche must not mention", () => {
    const document = toPlainLanguageDocument(actionOf());
    expect(document).toMatchObject({
      nom: "Ouvrir l'école aux parents",
      objectif_formation: "Améliorer le français",
      contenu_formation: "Trois axes\nLangue",
    });
    expect(document).not.toHaveProperty("organisme_responsable");
    expect(document).not.toHaveProperty("sessions");
    expect(document).not.toHaveProperty("resultat_attendus");
    expect(JSON.stringify(document)).not.toContain("Ecole Test");
  });
});

describe("renderPlainLanguageFiche", () => {
  it("renders the RI structure around the agent texts", () => {
    const markdown = renderPlainLanguageFiche(
      fiche(),
      actionOf({ url_formation: "https://carif.example/f" }),
    );
    expect(
      markdown.startsWith(
        "---\n---\n\n# Apprendre le français pour aider vos enfants à Mulhouse\n",
      ),
    ).toBe(true);
    expect(markdown).toContain(
      "## Pourquoi c'est intéressant ?\n\n:::toggle{title=\"Parler avec l'école\"}\nComprendre les enseignants.\n:::",
    );
    expect(markdown).toContain("## Comment faire ?");
    expect(markdown).toContain("### Autres informations\n\nNiveau A1");
    expect(markdown).toContain(
      "- Source 1: Ouvrir l'école aux parents – Carif-Oref – https://carif.example/f",
    );
    expect(markdown).not.toContain("### Journal des Avertissements");
    expect(markdown).toContain("**Dispositif** : Programme ou service.");
  });

  it("fixes the typography the rules forbid", () => {
    const markdown = renderPlainLanguageFiche(
      fiche({
        description: "Écrire un courriel à France Travail — vite 🙂 --",
      }),
      actionOf(),
    );
    expect(markdown).toContain(
      "Écrire un mail à France Travail (anciennement Pôle emploi) – vite  -",
    );
  });

  it("adds the CIR good-to-know block when the source asks for it", () => {
    const markdown = renderPlainLanguageFiche(
      fiche(),
      actionOf({
        intitule_formation:
          "Actions socio-linguistiques complémentaires au CIR",
      }),
    );
    expect(markdown).toContain(":::good-to-know\nIl est possible de venir");
    expect(markdown.indexOf("good-to-know")).toBeLessThan(
      markdown.indexOf("## Pourquoi"),
    );
  });

  it("keeps one agent good-to-know, with the CIR one as a separate block", () => {
    const markdown = renderPlainLanguageFiche(
      fiche({ goodToKnow: ["Venir avec un stylo.", "Niveau d'entrée : B2"] }),
      actionOf({
        intitule_formation:
          "Actions socio-linguistiques complémentaires au CIR",
      }),
    );
    expect(markdown.match(/:::good-to-know/g)).toHaveLength(2);
    expect(markdown).toContain(
      ":::good-to-know\nVenir avec un stylo.\n:::\n\n:::good-to-know\nIl est possible de venir",
    );
    expect(markdown).toContain("Non publiés : Niveau d'entrée : B2");
  });

  it("logs forbidden terms, long sentences and missing content as warnings", () => {
    const markdown = renderPlainLanguageFiche(
      fiche({
        why: [{ title: "Obtenir un diplôme", text: "Postuler à un emploi." }],
        how: [],
        description: Array(30).fill("mot").join(" "),
        warnings: [
          {
            type: "Calcul",
            field: "Durée",
            level: "faible",
            detail: "120 h / 35 h ≈ 1 mois",
            suggestion: "Vérifier",
          },
        ],
      }),
      actionOf({ objectif_formation: null, contenu_formation: null }),
    );
    const journal = markdown.split("### Journal des Avertissements")[1] ?? "";
    expect(journal).toContain("| Calcul | Durée | faible |");
    expect(journal).toContain("« obtenir »");
    expect(journal).toContain("« postuler »");
    expect(journal).toContain("Phrase trop longue");
    expect(journal).toContain("1 accordéon(s) au lieu de 3 minimum.");
    expect(journal).toContain("Aucune démarche décrite.");
    expect(journal).toContain("Donnée manquante");
    expect(markdown).toContain(
      '## Comment faire ?\n\n:::toggle{title="Contacter Ecole Test"}\n- Adresse : Mulhouse\n:::',
    );
  });

  it("publishes a single how accordion and logs the others", () => {
    const markdown = renderPlainLanguageFiche(
      fiche({
        how: [
          { title: "Contacter l'école", text: "Envoyer un mail." },
          { title: "Préparer votre dossier", text: "Rassembler les papiers." },
        ],
      }),
      actionOf(),
    );
    const [fichePart, journal = ""] = markdown.split(
      "### Journal des Avertissements",
    );
    expect(fichePart).not.toContain("Préparer votre dossier");
    expect(journal).toContain("Non publiés : Préparer votre dossier");
  });

  it("keeps a step that is not a contact, and no city when there are several", () => {
    const markdown = renderPlainLanguageFiche(
      fiche({ how: [{ title: "Préparer votre CV", text: "Écrire le CV." }] }),
      actionOf({
        lieu_formation: [{ ville: "Mulhouse" }, { ville: "Colmar" }],
      }),
    );
    expect(markdown).toContain(
      "# Apprendre le français pour aider vos enfants\n",
    );
    expect(markdown).toContain('title="Préparer votre CV"');
  });

  it("ends the first step with the Lieux contact and rebuilds the source URL", () => {
    const markdown = renderPlainLanguageFiche(
      fiche(),
      actionOf({
        contact_formation: [
          { courriel: "jean_dupont@ecole.fr", telfixe: "0389000000" },
        ],
      }),
    );
    expect(markdown).toContain(
      "Envoyer un mail à l'école.\n\n- Téléphone : 0389000000\n- Mail : jean_dupont@ecole.fr\n- Adresse : Mulhouse\n:::",
    );
    expect(markdown).toContain(
      "https://www.intercariforef.org/offreinfo/01_AL27473/01_AL1954732/GE1954732/",
    );
  });
});
