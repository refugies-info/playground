"use client";

import { SaveIndicator } from "@playground/ui";
import { HeaderFiche } from "@playground/ui/composites";
import { RiArrowLeftSLine } from "@playground/ui/icons";
import { Badge, Button } from "@playground/ui/primitives";
import Link from "next/link";
import type { ComponentProps } from "react";
import { WidgetEditorNavigation } from "./WidgetEditorNavigation";

interface WidgetEditorLayoutProps {
  title: string;
  typeLabel: string;
  widgetHref: string;
  saveStatus: ComponentProps<typeof SaveIndicator>["status"];
  onSave: () => void;
  children: React.ReactNode;
}

/** Header, menu and content frame shared by every widget type. */
export function WidgetEditorLayout({
  title,
  typeLabel,
  widgetHref,
  saveStatus,
  onSave,
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
        <WidgetEditorNavigation widgetHref={widgetHref} />
        <div className="min-w-0 flex-1 bg-(--background-alt-blue-france) p-10">
          <div className="flex max-w-[650px] flex-col gap-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
