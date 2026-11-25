import { RiHammerLine } from "@playground/ui/icons";
import { BoutonMenu } from "@playground/ui/primitives";
import Link from "next/link";
import type { WidgetDisplayedStatus } from "@/lib/widget-list";
import { WidgetLifecycleActions } from "./WidgetLifecycleActions";

interface WidgetEditorNavigationProps {
  widgetId: string;
  widgetHref: string;
  displayedStatus: WidgetDisplayedStatus;
  isDeletable: boolean;
}

export function WidgetEditorNavigation({
  widgetId,
  widgetHref,
  displayedStatus,
  isDeletable,
}: WidgetEditorNavigationProps) {
  return (
    <div className="sticky top-20 flex h-[calc(100vh-5rem)] w-65 flex-shrink-0 flex-col self-start px-10 py-12">
      <nav className="flex flex-col gap-2" aria-label="Navigation du widget">
        <Link href={widgetHref} className="w-full">
          <BoutonMenu
            icon={RiHammerLine}
            label="Widget"
            active
            className="w-full"
          />
        </Link>
      </nav>
      <div className="mt-2">
        <WidgetLifecycleActions
          widgetId={widgetId}
          displayedStatus={displayedStatus}
          isDeletable={isDeletable}
        />
      </div>
    </div>
  );
}
