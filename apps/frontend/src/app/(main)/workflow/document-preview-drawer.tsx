"use client";

import type { Document } from "@playground/shared-types";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@playground/ui/overlays";
import { Database, FileText } from "lucide-react";

interface DocumentPreviewDrawerProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentPreviewDrawer({
  document,
  open,
  onOpenChange,
}: DocumentPreviewDrawerProps) {
  if (!document) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[96vh]">
        <DrawerHeader className="border-b px-6 py-3">
          <DrawerTitle className="flex items-center gap-2">
            <span className="font-bold">{document.title || "Untitled"}</span>
            <span className="text-gray-400 font-normal text-sm">
              {document.id}
            </span>
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 flex overflow-hidden font-mono text-sm h-full">
          {/* Left Column: Markdown Content */}
          <div className="flex-1 flex flex-col border-r relative group">
            <div className="px-4 py-2 bg-gray-100 border-b font-semibold text-xs uppercase tracking-wider text-gray-500 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Markdown Content</span>
              </div>
              <span className="bg-gray-200 px-2 py-0.5 rounded text-[10px] text-gray-600">
                {document.content?.length || 0} chars
              </span>
            </div>
            <div className="flex-1 relative bg-gray-50/50 overflow-auto">
              <textarea
                className="w-full h-full p-4 resize-none focus:outline-none bg-transparent"
                value={document.content || ""}
                readOnly
              />
            </div>
          </div>

          {/* Right Column: Metadata */}
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-2 bg-blue-50/50 border-b font-semibold text-xs uppercase tracking-wider text-blue-600 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>Metadata</span>
              </div>
            </div>
            <div className="flex-1 relative bg-blue-50/10 overflow-auto">
              <textarea
                className="w-full h-full p-4 resize-none focus:outline-none bg-transparent text-blue-900"
                value={JSON.stringify(document.metadata || {}, null, 2)}
                readOnly
              />
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
