"use client";

import { cn } from "@playground/ui";
import {
  RiArrowLeftDoubleLine,
  RiArrowRightDoubleLine,
  RiComputerLine,
  RiSmartphoneLine,
} from "@playground/ui/icons";
import { Button, SegmentedControl } from "@playground/ui/primitives";
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { PreviewDevice } from "@/lib/widget-preview";

const DEVICE_OPTIONS: ComponentProps<
  typeof SegmentedControl<PreviewDevice>
>["options"] = [
  { value: "mobile", icon: RiSmartphoneLine, label: "Vue mobile" },
  { value: "desktop", icon: RiComputerLine, label: "Vue desktop" },
];

const DEVICE_WIDTH_IN_PX: Record<PreviewDevice, number> = {
  desktop: 1024,
  mobile: 375,
};

interface WidgetPreviewPanelProps {
  src: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function WidgetPreviewPanel({
  src,
  isOpen,
  onOpenChange,
}: WidgetPreviewPanelProps) {
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const widgetOrigin = new URL(src).origin;
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== widgetOrigin) {
        return;
      }
      if (event.data?.type === "widget-fullscreen") {
        setIsFullscreen(event.data.active === true);
      } else if (typeof event.data?.height === "number") {
        setContentHeight(event.data.height);
      }
    };
    setIsFullscreen(false);
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [src]);

  const observeArea = useCallback((element: HTMLDivElement | null) => {
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setArea({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const frameWidth = DEVICE_WIDTH_IN_PX[device];
  const scale = Math.min(1, area.width / frameWidth);
  const frameHeight =
    isFullscreen || contentHeight === null
      ? area.height / scale
      : contentHeight;

  // Sized like the source panel of the document editor: a third of the page, or nothing
  return (
    <>
      <div
        inert={!isOpen}
        className={cn(
          "shrink-0 bg-(--background-contrast-info) transition-[width] duration-500 ease-expo-out",
          isOpen ? "w-1/3" : "w-0",
        )}
      >
        <aside
          className={cn(
            "sticky top-20 flex h-[calc(100vh-5rem)] w-full flex-col items-center gap-4 overflow-hidden rounded-tl-2xl border-(--border-default-grey) bg-(--background-alt-blue-france) transition-opacity duration-200",
            isOpen
              ? "border-l border-t opacity-100 shadow-[-1px_0_3px_var(--shadow-color)]"
              : "opacity-0",
          )}
        >
          <div className="relative flex h-[84px] w-full items-center justify-center p-2">
            <Button
              type="button"
              variant="quatrieme"
              className="absolute left-5 top-[18px] h-12 w-12 text-(--text-disabled-grey)"
              aria-label="Refermer l'aperçu"
              onClick={() => onOpenChange(false)}
            >
              <RiArrowRightDoubleLine className="size-6" aria-hidden="true" />
            </Button>
            <SegmentedControl
              options={DEVICE_OPTIONS}
              value={device}
              onChange={setDevice}
              aria-label="Appareil de l'aperçu"
            />
          </div>
          <div
            ref={observeArea}
            className="mx-9 mb-10 min-h-0 w-[calc(100%-72px)] flex-1 overflow-y-auto"
          >
            {area.width > 0 && (
              <div className="relative" style={{ height: frameHeight * scale }}>
                <iframe
                  ref={iframeRef}
                  title="Aperçu du widget"
                  src={src}
                  className="absolute top-0 bg-white shadow-[0_4px_12px_var(--shadow-color)]"
                  style={{
                    width: frameWidth,
                    height: frameHeight,
                    left: (area.width - frameWidth * scale) / 2,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                  }}
                />
              </div>
            )}
          </div>
        </aside>
      </div>
      {!isOpen && (
        <div className="fixed top-24 right-6">
          <Button
            type="button"
            variant="quatrieme"
            size="sm"
            className="bg-white"
            leftIcon={RiArrowLeftDoubleLine}
            onClick={() => onOpenChange(true)}
          >
            Aperçu
          </Button>
        </div>
      )}
    </>
  );
}
