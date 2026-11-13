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
import { WIDGET_TYPE_OPTIONS } from "@/lib/widget-list";

const MAX_FIELD_LENGTH = 50;

export function CreateWidgetPopover() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [structureName, setStructureName] = useState("");
  const [type, setType] = useState<WidgetConfigType | "">("");

  const canConfirm =
    title.trim() !== "" && structureName.trim() !== "" && type !== "";

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setTitle("");
      setStructureName("");
      setType("");
    }
    setOpen(nextOpen);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canConfirm) return;
    const params = new URLSearchParams({
      title: title.trim(),
      structureName: structureName.trim(),
    });
    router.push(`/widgets/new/${type}?${params}`);
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
              maxLength={MAX_FIELD_LENGTH}
              required
            />
            <TextInput
              label="Partenaire"
              variant="dsfr"
              value={structureName}
              onChange={setStructureName}
              maxLength={MAX_FIELD_LENGTH}
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
            >
              Confirmer
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
