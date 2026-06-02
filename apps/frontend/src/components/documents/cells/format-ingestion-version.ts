interface FormatIngestionVersionParams {
  label?: string | null;
  activeVersion?: number | null;
  latestVersion?: number | null;
}

export function formatIngestionVersion({
  label,
  activeVersion,
  latestVersion,
}: FormatIngestionVersionParams): string {
  if (label) return label;

  if (activeVersion != null && latestVersion != null) {
    return `${activeVersion}/${latestVersion}`;
  }

  if (activeVersion != null) {
    return `${activeVersion}/${activeVersion}`;
  }

  if (latestVersion != null) {
    return `—/${latestVersion}`;
  }

  return "—";
}
