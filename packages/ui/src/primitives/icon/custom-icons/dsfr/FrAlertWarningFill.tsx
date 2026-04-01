// AUTO-GENERE — ne pas editer (sync-dsfr-icons.ts)
import type { ComponentType } from "react";

type DsfrIconProps = { color?: string; size?: number | string };

export const FrAlertWarningFill: ComponentType<DsfrIconProps> = ({
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
    <path d="M15.5 2.5h6a1 1 0 0 1 1 1v12l-7-13ZM12.867 3l9.526 16.5a1 1 0 0 1-.866 1.5H2.475a1 1 0 0 1-.866-1.5L11.135 3a1 1 0 0 1 1.732 0ZM11 16v2h2v-2h-2Zm0-7v5h2V9h-2Z" />
  </svg>
);
