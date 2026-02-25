import { formatSourceValue, resolvePath } from "./shared/helpers";

interface SourceDisplayProps {
  source?: string[];
  diMetadata: Record<string, unknown>;
}

export function SourceDisplay({ source, diMetadata }: SourceDisplayProps) {
  if (!source?.length) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <div className="space-y-1 text-sm">
      {source.map((srcKey) => {
        const resolved = resolvePath(diMetadata, srcKey);
        const formattedValue = formatSourceValue(resolved);
        return (
          <div key={srcKey}>
            <span className="font-bold">{srcKey}</span>
            {formattedValue && (
              <>
                {" "}
                : <span>{formattedValue}</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
