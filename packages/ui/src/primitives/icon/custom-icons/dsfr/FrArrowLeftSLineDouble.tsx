// AUTO-GENERE — ne pas editer (sync-dsfr-icons.ts)
import type { ComponentType } from "react";

type DsfrIconProps = { color?: string; size?: number | string };

export const FrArrowLeftSLineDouble: ComponentType<DsfrIconProps> = ({
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
    <path d="M13.9 12l5 5-1.4 1.4-6.4-6.4 6.4-6.4L18.9 7l-5 5zm-1-5l-1.4-1.4L5.1 12l6.4 6.4 1.4-1.4-5-5 5-5z" />
  </svg>
);
