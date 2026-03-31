/**
 * Toutes les icônes du design system en un seul barrel.
 *
 * - Remix Icons (~2800) : préfixe Ri — `RiArrowRightLine`
 * - DSFR custom (~45)   : préfixe Fr — `FrErrorFill`, `FrInfoLine`
 *
 * Usage :
 *   import { RiArrowRightLine, FrInfoLine } from "@playground/ui/icons"
 *   <Button leftIcon={RiArrowRightLine}>Continuer</Button>
 */
export * from "@remixicon/react";
export * from "./primitives/icon/custom-icons/dsfr";
