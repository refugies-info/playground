// AUTO-GENERE — ne pas editer (sync-dsfr-icons.ts)
import type { ComponentType } from "react";

type DsfrIconProps = { color?: string; size?: number | string };

export const FrInfoFill: ComponentType<DsfrIconProps> = ({
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
    <path d="M19.5,2.5h-15c-1.1,0-2,0.9-2,2v15c0,1.1,0.9,2,2,2h15c1.1,0,2-0.9,2-2v-15C21.5,3.4,20.6,2.5,19.5,2.5z M13,17h-2v-6h2V17z M13,9h-2V7h2V9z" />
  </svg>
);
