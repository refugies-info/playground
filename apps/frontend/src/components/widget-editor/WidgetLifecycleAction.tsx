"use client";

import type { WidgetConfigStatus } from "@playground/shared-types";
import { cn } from "@playground/ui";
import {
  RiCloseLine,
  RiGlobalLine,
  RiGlobalOffLine,
} from "@playground/ui/icons";
import {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
} from "@playground/ui/overlays";
import { BoutonMenu, Button } from "@playground/ui/primitives";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { WidgetDisplayedStatus } from "@/lib/widget-list";
import { updateWidgetConfigAction } from "@/services/widget-config-actions";

interface LifecycleAction {
  label: string;
  icon: typeof RiGlobalLine;
  isDestructive: boolean;
  newStatus: WidgetConfigStatus;
  confirmation: string[];
}

const DEACTIVATE: LifecycleAction = {
  label: "Désactiver",
  icon: RiGlobalOffLine,
  isDestructive: true,
  newStatus: "inactive",
  confirmation: [
    "Êtes-vous sûr de vouloir désactiver ce widget ?",
    "Pensez à prévenir votre partenaire, car il ne sera plus visible sur son site.",
  ],
};

const REACTIVATE: LifecycleAction = {
  label: "Réactiver",
  icon: RiGlobalLine,
  isDestructive: false,
  newStatus: "active",
  confirmation: [
    "Êtes-vous sûr de vouloir réactiver ce widget ?",
    "Si votre partenaire ne l’a pas supprimé de son site, il sera de nouveau visible par les usagers.",
  ],
};

const getLifecycleAction = (
  displayedStatus: WidgetDisplayedStatus,
): LifecycleAction | null => {
  if (displayedStatus === "disabled") return REACTIVATE;
  if (displayedStatus === "none") return null;
  return DEACTIVATE;
};

interface WidgetLifecycleActionProps {
  widgetId: string;
  displayedStatus: WidgetDisplayedStatus;
}

export function WidgetLifecycleAction({
  widgetId,
  displayedStatus,
}: WidgetLifecycleActionProps) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const action = getLifecycleAction(displayedStatus);
  if (!action) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    const result = await updateWidgetConfigAction(widgetId, {
      status: action.newStatus,
    });
    setIsLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setIsConfirmOpen(false);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-1">
      <Popover open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <PopoverAnchor asChild>
          <BoutonMenu
            icon={action.icon}
            label={action.label}
            variant={action.isDestructive ? "error" : "default"}
            className={cn(
              "w-full",
              !action.isDestructive &&
                "text-(--text-action-high-blue-france) hover:text-(--text-action-high-blue-france)",
            )}
            onClick={() => setIsConfirmOpen(true)}
          />
        </PopoverAnchor>
        <PopoverContent side="right" className="flex w-[388px] flex-col gap-7">
          <div className="flex flex-col gap-4 text-base leading-6 text-(--text-default-grey)">
            {action.confirmation.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {error && (
            <p role="alert" className="text-sm text-(--text-default-error)">
              {error}
            </p>
          )}
          <div className="flex items-center justify-end gap-4">
            <PopoverClose asChild>
              <Button
                variant="tertiaire"
                rightIcon={RiCloseLine}
                disabled={isLoading}
              >
                Annuler
              </Button>
            </PopoverClose>
            <Button
              variant="primaire"
              rightIcon={action.icon}
              isLoading={isLoading}
              onClick={handleConfirm}
            >
              {action.label}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
