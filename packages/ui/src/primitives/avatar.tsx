import { cn } from "../utils/cn";

/**
 * Avatar — Composant utilisateur ou IA.
 *
 * @figma https://www.figma.com/design/mVdElBMCLe9RLRJF9ayP5Z/Wireframes_RCO?node-id=378-4313
 *
 * 2 variants :
 *
 *   user → bg action-low-blue-france (#E3E3FD), initiales title-blue-france (#000091)
 *   ia   → bg contrast-grey (#EEEEEE), icône RiRobotLine 16px blanc (#FFFFFF)
 *
 * Taille fixe : 32×32px, border-radius: 40px (plein cercle), border 0.5px #DDDDDD
 */

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Affichage forcé comme IA (si false/absent et email présent → user) */
  isAI?: boolean;
  displayName?: string;
  avatarUrl?: string;
}

export function Avatar({
  displayName,
  isAI,
  className,
  avatarUrl,
  ...props
}: AvatarProps) {
  const showAsAI = isAI || !displayName;

  // Initiales : 2 premiers caractères de l'email (avant l'@), en majuscules
  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : null;

  if (showAsAI) {
    return (
      <div
        className={cn(
          // Figma Property 1=IA : 32×32, bg contrast-grey, border-radius 40px, border 0.5px
          "flex items-center justify-center shrink-0",
          "size-8 rounded-full",
          "bg-[var(--background-contrast-grey,#EEEEEE)]",
          "border-[0.5px] border-[var(--border-default-grey,#DDDDDD)]",
          className,
        )}
        title="Intelligence Artificielle"
        {...props}
      >
        {/* Figma node 378:4312 — SVG custom 16×16 */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M9 1.33333C9 1.62949 8.87127 1.89559 8.66667 2.0787V3.33333H12C13.1046 3.33333 14 4.22876 14 5.33333V12C14 13.1046 13.1046 14 12 14H4C2.89543 14 2 13.1046 2 12V5.33333C2 4.22876 2.89543 3.33333 4 3.33333H7.33333V2.0787C7.12873 1.89559 7 1.62949 7 1.33333C7 0.781042 7.44773 0.333328 8 0.333328C8.55227 0.333328 9 0.781042 9 1.33333ZM4 4.66666C3.63181 4.66666 3.33333 4.96514 3.33333 5.33333V12C3.33333 12.3682 3.63181 12.6667 4 12.6667H12C12.3682 12.6667 12.6667 12.3682 12.6667 12V5.33333C12.6667 4.96514 12.3682 4.66666 12 4.66666H8.66667H7.33333H4ZM1.33333 6.66666H0V10.6667H1.33333V6.66666ZM14.6667 6.66666H16V10.6667H14.6667V6.66666ZM6 9.66666C6.55229 9.66666 7 9.21893 7 8.66666C7 8.1144 6.55229 7.66666 6 7.66666C5.44771 7.66666 5 8.1144 5 8.66666C5 9.21893 5.44771 9.66666 6 9.66666ZM10 9.66666C10.5523 9.66666 11 9.21893 11 8.66666C11 8.1144 10.5523 7.66666 10 7.66666C9.44773 7.66666 9 8.1144 9 8.66666C9 9.21893 9.44773 9.66666 10 9.66666Z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={cn(
        // Figma Property 1=alice/claudia/xavier : 32×32, bg action-low-blue-france, border-radius 40px
        "flex items-center justify-center shrink-0",
        "size-8 rounded-full",
        "bg-[var(--background-action-low-blue-france,#E3E3FD)]",
        "border-[0.5px] border-[var(--border-default-grey,#DDDDDD)]",
        className,
      )}
      title={displayName ?? undefined}
      {...props}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-full h-full rounded-full object-cover shadow-inner"
        />
      ) : (
        <span
          className="text-xs font-medium leading-none select-none"
          style={{ color: "var(--text-title-blue-france, #000091)" }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
