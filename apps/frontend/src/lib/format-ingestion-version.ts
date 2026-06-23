interface FormatIngestionVersionParams {
  activeVersion?: number | null;
  latestVersion?: number | null;
}

export function formatIngestionVersion({
  activeVersion,
  latestVersion,
}: FormatIngestionVersionParams): string {
  if (activeVersion != null && latestVersion != null) {
    if (activeVersion === latestVersion) {
      return `${activeVersion}`;
    }

    return `${activeVersion}/${latestVersion}`;
  }

  if (activeVersion != null) {
    return `${activeVersion}`;
  }

  if (latestVersion != null) {
    return `—/${latestVersion}`;
  }

  return "—";
}
