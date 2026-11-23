"use client";

import { CopyField } from "@playground/ui/forms";
import { RiCodeSSlashLine } from "@playground/ui/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@playground/ui/overlays";
import { Button } from "@playground/ui/primitives";
import { buildEmbedCode } from "@/lib/widget-embed";

interface WidgetEmbedPopoverProps {
  embedUrl: string;
}

export function WidgetEmbedPopover({ embedUrl }: WidgetEmbedPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondaire" size="sm" leftIcon={RiCodeSSlashLine}>
          Copier le code d’intégration
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-[483px] flex-col gap-6">
        <CopyField
          label="Lien url de l’iframe"
          value={embedUrl}
          copyLabel="Copier le lien"
        />
        <CopyField
          label="Code de l’iframe"
          value={buildEmbedCode(embedUrl)}
          copyLabel="Copier le code"
        />
      </PopoverContent>
    </Popover>
  );
}
