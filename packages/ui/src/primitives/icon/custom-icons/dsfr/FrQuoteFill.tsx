// AUTO-GENERE — ne pas editer (sync-dsfr-icons.ts)
import type { ComponentType } from "react";

type DsfrIconProps = { color?: string; size?: number | string };

export const FrQuoteFill: ComponentType<DsfrIconProps> = ({
  color = "currentColor",
  size = 24,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={color}
    aria-hidden="true"
    {...props}
  >
    <path d="M14 3a8 8 0 1 1 0 16v3.5c-5-2-12-5-12-11.5a8 8 0 0 1 8-8h4Zm-2 4.5H9.295L6.75 11.25 9.295 15H12l-2.506-3.75L12 7.5Zm4.5 0h-2.705l-2.545 3.75L13.795 15H16.5l-2.506-3.75L16.5 7.5Z" />
  </svg>
);
