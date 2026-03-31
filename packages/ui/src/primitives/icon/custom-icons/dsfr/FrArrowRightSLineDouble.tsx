// AUTO-GENERE — ne pas editer (sync-dsfr-icons.ts)
import type { ComponentType } from "react";

type DsfrIconProps = { color?: string; size?: number | string };

export const FrArrowRightSLineDouble: ComponentType<DsfrIconProps> = ({
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
    <path d="M10.1 12l-5-4.9 1.4-1.4 6.4 6.4-6.4 6.4L5.1 17l5-5zm6 0l-5-4.9 1.4-1.4 6.4 6.4-6.4 6.4-1.4-1.5 5-5z" />
  </svg>
);
