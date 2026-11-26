"use client";

import type { WidgetConfigType } from "@playground/shared-types";
import { SelectInput, TextInput } from "@playground/ui/forms";
import {
  RiAddCircleLine,
  RiCheckLine,
  RiCloseLine,
} from "@playground/ui/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@playground/ui/overlays";
import { Button } from "@playground/ui/primitives";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildWidgetDraft, MAX_WIDGET_FIELD_LENGTH } from "@/lib/widget-form";
import { WIDGET_TYPE_OPTIONS } from "@/lib/widget-list";
import { createWidgetConfigAction } from "@/services/widget-config-actions";

export function CreateWidgetPopover() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [structureName, setStructureName] = useState("");
  const [type, setType] = useState<WidgetConfigType | "">("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canConfirm =
    title.trim() !== "" && structureName.trim() !== "" && type !== "";

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setTitle("");
      setStructureName("");
      setType("");
      setError(null);
    }
    setOpen(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canConfirm || isCreating) return;
    setIsCreating(true);
    setError(null);
    const result = await createWidgetConfigAction(
      buildWidgetDraft(type, { title, structureName }),
    );
    if (!result.success) {
      setIsCreating(false);
      setError(result.error);
      return;
    }
    router.push(`/widgets/${result.data.id}`);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button leftIcon={RiAddCircleLine}>Créer un widget</Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[300px]">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <TextInput
              label="Titre"
              variant="dsfr"
              value={title}
              onChange={setTitle}
              maxLength={MAX_WIDGET_FIELD_LENGTH}
              required
            />
            <TextInput
              label="Partenaire"
              variant="dsfr"
              value={structureName}
              onChange={setStructureName}
              maxLength={MAX_WIDGET_FIELD_LENGTH}
              required
            />
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="widget-type">
                Type de widget
              </label>
              <SelectInput
                id="widget-type"
                required
                options={WIDGET_TYPE_OPTIONS}
                value={type}
                placeholder="Sélectionner une option"
                onChange={(value) => setType(value as WidgetConfigType)}
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-(--text-default-error)">
              {error}
            </p>
          )}
          <div className="flex w-full justify-end gap-[10px]">
            <Button
              type="button"
              variant="tertiaire"
              size="sm"
              className="text-[var(--text-action-high-blue-france)]"
              rightIcon={RiCloseLine}
              onClick={() => handleOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primaire"
              size="sm"
              rightIcon={RiCheckLine}
              disabled={!canConfirm}
              isLoading={isCreating}
            >
              Confirmer
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
