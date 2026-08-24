import type { ComponentType } from "react";

type DsfrIconProps = { color?: string; size?: number | string };

export const FrMarkAsReadLine: ComponentType<DsfrIconProps> = ({
  color = "currentColor",
  size = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 14 12"
    width={size}
    height={size}
    fill={color}
    aria-hidden="true"
    {...props}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.50139 0C6.83473 0.666667 6.83598 0.666667 6.16931 1.33333H1.33333V10.6667H10.6667V6C11.3333 5.33333 11.3333 5.33333 12 4.66667V11.3333C12 11.7015 11.7015 12 11.3333 12H0.666667C0.298477 12 0 11.7015 0 11.3333V0.666667C0 0.298477 0.298477 0 0.666667 0H7.50139Z"
    />
    <path d="M13.698 0.942667L12.7553 0L9.92667 2.828L8.27667 1.178L7.33333 2.12067L9.92667 4.714L13.698 0.942667Z" />
  </svg>
);
