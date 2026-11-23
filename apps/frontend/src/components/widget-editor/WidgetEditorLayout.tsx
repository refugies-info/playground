"use client";

import { SaveIndicator } from "@playground/ui";
import { HeaderFiche } from "@playground/ui/composites";
import { RiArrowLeftSLine } from "@playground/ui/icons";
import { Badge, Button } from "@playground/ui/primitives";
import Link from "next/link";
import type { ComponentProps } from "react";
import type { WidgetDisplayedStatus } from "@/lib/widget-list";
import { WidgetEditorNavigation } from "./WidgetEditorNavigation";
import { WidgetEmbedPopover } from "./WidgetEmbedPopover";
import { WidgetPreviewPanel } from "./WidgetPreviewPanel";

interface WidgetEditorLayoutProps {
  widgetId: string;
  displayedStatus: WidgetDisplayedStatus;
  title: string;
  typeLabel: string;
  widgetHref: string;
  saveStatus: ComponentProps<typeof SaveIndicator>["status"];
  onSave: () => void;
  previewSrc?: string;
  embedUrl?: string;
  children: React.ReactNode;
}

export function WidgetEditorLayout({
  widgetId,
  displayedStatus,
  title,
  typeLabel,
  widgetHref,
  saveStatus,
  onSave,
  previewSrc,
  embedUrl,
  children,
}: WidgetEditorLayoutProps) {
  return (
    <div className="flex flex-1 flex-col">
      <HeaderFiche
        left={
          <>
            <Link href="/widgets">
              <Button
                variant="quatrieme"
                size="sm"
                className="px-2"
                aria-label="Retour à la liste des widgets"
              >
                <RiArrowLeftSLine className="h-4 w-4" />
              </Button>
            </Link>
            <SaveIndicator status={saveStatus} onSave={onSave} />
          </>
        }
        right={embedUrl && <WidgetEmbedPopover embedUrl={embedUrl} />}
        center={
          <span className="inline-flex items-center gap-2">
            {title}
            <Badge variant="info" size="sm">
              {typeLabel}
            </Badge>
          </span>
        }
      />
      <div className="flex flex-1 flex-row">
        <WidgetEditorNavigation
          widgetId={widgetId}
          widgetHref={widgetHref}
          displayedStatus={displayedStatus}
        />
        <div className="flex min-w-0 flex-1 bg-(--background-contrast-info)">
          <div className="min-w-0 flex-1 py-10 pr-6 pl-10">
            <div className="flex max-w-[650px] flex-col gap-6">{children}</div>
          </div>
          {previewSrc && <WidgetPreviewPanel src={previewSrc} />}
        </div>
      </div>
    </div>
  );
}
