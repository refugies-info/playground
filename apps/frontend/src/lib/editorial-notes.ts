const EDITORIAL_NOTE_HEADINGS = [
  "autres informations",
  "pour aller plus loin",
  "journal des avertissements",
];

const splitByHeading = (markdown: string) => markdown.split(/^(?=#{1,3} )/m);

const isEditorialNote = (section: string) =>
  EDITORIAL_NOTE_HEADINGS.includes(
    section
      .match(/^#{1,3} (.+)/)?.[1]
      .trim()
      .toLowerCase() ?? "",
  );

/** Keeps the clear language sections that inform editors rather than readers. */
export const extractEditorialNotes = (markdown: string): string =>
  splitByHeading(markdown)
    .filter(isEditorialNote)
    .map((section) => section.trim())
    .join("\n\n");

/** The fiche without those sections: they live in the source panel. */
export const removeEditorialNotes = (markdown: string): string =>
  splitByHeading(markdown)
    .filter((section) => !isEditorialNote(section))
    .join("");
