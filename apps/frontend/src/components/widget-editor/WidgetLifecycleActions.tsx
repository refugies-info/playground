"use client";

import type { WidgetConfigStatus } from "@playground/shared-types";
import { cn } from "@playground/ui";
import {
  RiCloseLine,
  RiDeleteBinLine,
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
import {
  deleteWidgetConfigAction,
  updateWidgetConfigAction,
  type WidgetConfigActionResult,
} from "@/services/widget-config-actions";

interface LifecycleAction {
  label: string;
  icon: typeof RiGlobalLine;
  isDestructive: boolean;
  confirmation: string[];
  run: (widgetId: string) => Promise<WidgetConfigActionResult<unknown>>;
  redirectTo?: string;
}

const setStatus = (status: WidgetConfigStatus) => (widgetId: string) =>
  updateWidgetConfigAction(widgetId, { status });

const DEACTIVATE: LifecycleAction = {
  label: "Désactiver",
  icon: RiGlobalOffLine,
  isDestructive: true,
  confirmation: [
    "Êtes-vous sûr de vouloir désactiver ce widget ?",
    "Pensez à prévenir votre partenaire, car il ne sera plus visible sur son site.",
  ],
  run: setStatus("inactive"),
};

const REACTIVATE: LifecycleAction = {
  label: "Réactiver",
  icon: RiGlobalLine,
  isDestructive: false,
  confirmation: [
    "Êtes-vous sûr de vouloir réactiver ce widget ?",
    "Si votre partenaire ne l’a pas supprimé de son site, il sera de nouveau visible par les usagers.",
  ],
  run: setStatus("active"),
};

const DELETE: LifecycleAction = {
  label: "Supprimer",
  icon: RiDeleteBinLine,
  isDestructive: true,
  confirmation: [
    "Êtes-vous sûr de vouloir supprimer ce widget ? Cette action est irréversible.",
  ],
  run: deleteWidgetConfigAction,
  redirectTo: "/widgets",
};

const getStatusAction = (
  displayedStatus: WidgetDisplayedStatus,
): LifecycleAction | null => {
  if (displayedStatus === "disabled") return REACTIVATE;
  if (displayedStatus === "none") return null;
  return DEACTIVATE;
};

interface WidgetLifecycleActionsProps {
  widgetId: string;
  displayedStatus: WidgetDisplayedStatus;
  isDeletable: boolean;
}

export function WidgetLifecycleActions({
  widgetId,
  displayedStatus,
  isDeletable,
}: WidgetLifecycleActionsProps) {
  const actions = [
    getStatusAction(displayedStatus),
    isDeletable ? DELETE : null,
  ].filter((action) => action !== null);

  return (
    <div className="flex flex-col gap-2">
      {actions.map((action) => (
        <ConfirmedAction
          key={action.label}
          widgetId={widgetId}
          action={action}
        />
      ))}
    </div>
  );
}

function ConfirmedAction({
  widgetId,
  action,
}: {
  widgetId: string;
  action: LifecycleAction;
}) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    const result = await action.run(widgetId);
    if (!result.success) {
      setIsLoading(false);
      setError(result.error);
      return;
    }
    if (action.redirectTo) {
      router.replace(action.redirectTo);
      return;
    }
    setIsLoading(false);
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
