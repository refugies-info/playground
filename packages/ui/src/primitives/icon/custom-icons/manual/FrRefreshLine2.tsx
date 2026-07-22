// Icône custom maintenue à la main — absente de @gouvfr/dsfr ET @remixicon/react.
// NE PAS placer dans custom-icons/dsfr/ : sync-dsfr-icons.ts y fait un rmSync
// et régénère depuis la source DSFR, ce qui supprimerait cette icône.
// API alignée sur les icônes DSFR générées (color / size) pour les slots
// leftIcon/rightIcon des boutons.
import type { ComponentType } from "react";

type DsfrIconProps = { color?: string; size?: number | string };

export const FrRefreshLine2: ComponentType<DsfrIconProps> = ({
  color = "currentColor",
  size = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 20 20"
    width={size}
    height={size}
    fill={color}
    aria-hidden="true"
    {...props}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16.5374 17.5674C14.7844 19.0831 12.4993 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 12.1361 19.3302 14.1158 18.1892 15.7406L15 10H18C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C12.1502 18 14.1022 17.1517 15.5398 15.7716L16.5374 17.5674Z" />
  </svg>
);
