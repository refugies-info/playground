import { RiCloseCircleFill } from "@remixicon/react";
import { FrInfoFill } from "../primitives/icon/custom-icons/dsfr";
import { cn } from "../utils";

export interface FieldMessageProps {
  variant: "info" | "error";
  children: React.ReactNode;
  id?: string;
  className?: string;
}

const VARIANTS = {
  info: { icon: FrInfoFill, className: "text-(--text-default-info)" },
  error: { icon: RiCloseCircleFill, className: "text-(--text-default-error)" },
};

/**
 * FieldMessage — DSFR "Message de formulaire": an icon and a short text under a field.
 *
 * @example
 * ```tsx
 * <FieldMessage variant="info">100 caractères max</FieldMessage>
 * <FieldMessage variant="error">Le domaine doit être une URL.</FieldMessage>
 * ```
 */
export function FieldMessage({
  variant,
  children,
  id,
  className,
}: FieldMessageProps) {
  const { icon: Icon, className: variantClassName } = VARIANTS[variant];
  return (
    <p
      id={id}
      className={cn(
        "flex items-start gap-1 text-xs leading-5",
        variantClassName,
        className,
      )}
    >
      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
        <Icon size={16} aria-hidden="true" />
      </span>
      <span>{children}</span>
    </p>
  );
}
FieldMessage.displayName = "FieldMessage";
