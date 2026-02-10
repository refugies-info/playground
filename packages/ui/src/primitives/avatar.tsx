import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

export const avatarVariants = cva(
  "rounded-full flex items-center justify-center font-bold text-white shadow-inner bg-linear-to-br shrink-0",
  {
    variants: {
      roleVariant: {
        admin: "from-pink-500 to-rose-600",
        translator: "from-orange-400 to-amber-500",
        editor: "from-indigo-500 to-blue-600",
        ai: "from-purple-500 to-violet-600",
        default: "from-gray-400 to-gray-500",
      },
      size: {
        sm: "w-6 h-6 text-xs",
        md: "w-8 h-8 text-sm",
        lg: "w-10 h-10 text-base",
        xl: "w-16 h-16 text-xl",
      },
    },
    defaultVariants: {
      roleVariant: "default",
      size: "md",
    },
  },
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  email?: string | null;
  userRole?: string | null;
  fallback?: string;
}

export function Avatar({
  email,
  userRole,
  size,
  className,
  fallback = "IA",
  roleVariant, // Extract it so we can decide whether to use it or computed
  ...props
}: AvatarProps) {
  // Determine variant based on userRole or fallback
  let computedRole: VariantProps<typeof avatarVariants>["roleVariant"] =
    "default";

  if (userRole === "admin") computedRole = "admin";
  else if (userRole === "translator") computedRole = "translator";
  else if (userRole === "editor") computedRole = "editor";
  else if (!email) computedRole = "ai"; // Fallback role for AI/System

  // Allow manual override via roleVariant prop if provided
  const finalRoleVariant = roleVariant || computedRole;

  // Initials
  const initials = email ? email.slice(0, 2).toUpperCase() : fallback;

  return (
    <div
      className={cn(
        avatarVariants({ roleVariant: finalRoleVariant, size }),
        className,
      )}
      title={email || "Intelligence Artificielle"}
      {...props}
    >
      {initials}
    </div>
  );
}
