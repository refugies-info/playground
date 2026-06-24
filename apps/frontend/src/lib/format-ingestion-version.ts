interface FormatIngestionVersionParams {
  activeVersion?: number | null;
  latestVersion?: number | null;
}

export function formatIngestionVersion({
  activeVersion,
  latestVersion,
}: FormatIngestionVersionParams): string {
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
