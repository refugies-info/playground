"use client";

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
}

export function WidgetPreviewPanel({ src }: WidgetPreviewPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const widgetOrigin = new URL(src).origin;
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== widgetOrigin) {
        return;
      }
      setContentHeight(event.data.height);
    };
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

  if (!isOpen) {
    return (
      <aside className="flex w-[396px] shrink-0 justify-end pr-10 pt-10">
        <Button
          type="button"
          variant="quatrieme"
          size="sm"
          className="bg-white"
          leftIcon={RiArrowLeftDoubleLine}
          onClick={() => setIsOpen(true)}
        >
          Aperçu
        </Button>
      </aside>
    );
  }

  return (
    <aside className="sticky top-20 flex h-[calc(100vh-5rem)] w-[clamp(596px,40vw,1118px)] shrink-0 flex-col items-center gap-4 self-start rounded-tl-2xl border-l border-t border-(--border-default-grey) bg-(--background-alt-blue-france) shadow-[-1px_0_3px_rgba(0,0,18,0.06)]">
      <div className="relative flex h-[84px] w-full items-center justify-center p-2">
        <Button
          type="button"
          variant="quatrieme"
          className="absolute left-5 top-[18px] h-12 w-12 text-(--text-disabled-grey)"
          aria-label="Refermer l'aperçu"
          onClick={() => setIsOpen(false)}
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
          <div
            className="relative"
            style={{ height: (contentHeight ?? area.height / scale) * scale }}
          >
            <iframe
              ref={iframeRef}
              title="Aperçu du widget"
              src={src}
              className="absolute top-0 bg-white shadow-[0_4px_12px_rgba(0,0,18,0.16)]"
              style={{
                width: frameWidth,
                height: contentHeight ?? area.height / scale,
                left: (area.width - frameWidth * scale) / 2,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
