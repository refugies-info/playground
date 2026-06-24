interface FormatIngestionVersionParams {
  activeVersion?: number | null;
  latestVersion?: number | null;
}

export function formatIngestionVersion({
  activeVersion,
  latestVersion,
}: FormatIngestionVersionParams): string {
  if (activeVersion == null) {
    return latestVersion == null ? "—" : `—/${latestVersion}`;
  }

  return `${activeVersion}/${latestVersion ?? activeVersion}`;
}
