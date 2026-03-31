// AUTO-GENERE — ne pas editer (sync-dsfr-icons.ts)
import type { ComponentType } from "react";

type DsfrIconProps = { color?: string; size?: number | string };

export const FrArrowRightSLastLine: ComponentType<DsfrIconProps> = ({
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
    <path d="m11.17 12.364-4.95 4.95 1.414 1.414 6.364-6.364L7.634 6 6.22 7.414l4.95 4.95ZM17.998 6h-2v12.73h2V6Z" />
  </svg>
);
