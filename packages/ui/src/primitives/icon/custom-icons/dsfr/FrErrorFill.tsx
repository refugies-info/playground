// AUTO-GENERE — ne pas editer (sync-dsfr-icons.ts)
import type { ComponentType } from "react";

type DsfrIconProps = { color?: string; size?: number | string };

export const FrErrorFill: ComponentType<DsfrIconProps> = ({
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
    <path d="M17.5,2.5h-11L1,12l5.5,9.5h11L23,12L17.5,2.5z M16.2,14.8l-1.4,1.4L12,13.4l-2.8,2.8l-1.4-1.4l2.8-2.8L7.8,9.2l1.4-1.4l2.8,2.8l2.8-2.8l1.4,1.4L13.4,12L16.2,14.8z" />
  </svg>
);
