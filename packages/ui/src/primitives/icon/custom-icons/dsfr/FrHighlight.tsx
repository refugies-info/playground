// AUTO-GENERE — ne pas editer (sync-dsfr-icons.ts)
import type { ComponentType } from "react";

type DsfrIconProps = { color?: string; size?: number | string };

export const FrHighlight: ComponentType<DsfrIconProps> = ({
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
    <path d="M5 3v18H3V3h2Zm10 13v2H7v-2h8Zm6-5v2H7v-2h14Zm0-5v2H7V6h14Z" />
  </svg>
);
