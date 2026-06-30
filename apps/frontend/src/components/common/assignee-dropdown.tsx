"use client";

import { TitledPopover } from "@playground/ui";
import { Avatar } from "@playground/ui/primitives";
import { RiCheckLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Profile } from "@/lib/profile-name";
import { updateAssigneeAction } from "@/services/assignee-actions";

interface AssigneeDropdownProps {
  workflowId?: string;
  currentEmail?: string;
  editors: Profile[];
  onOptimisticUpdate?: (email: string | null) => void;
}

export function AssigneeDropdown({
  workflowId,
  currentEmail,
  editors,
  onOptimisticUpdate,
}: AssigneeDropdownProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (!workflowId) {
    return currentEmail ? (
      <Avatar displayName={currentEmail} />
    ) : (
      <Avatar isAI={true} />
    );
  }

  const handleSelect = async (editor: Profile) => {
    if (editor.email === currentEmail || pending) return;
    setPending(true);
    onOptimisticUpdate?.(editor.email);

    const result = await updateAssigneeAction(workflowId, editor.id);
    setPending(false);

    if (result.success) {
      router.refresh();
    } else {
      onOptimisticUpdate?.(currentEmail ?? null);
    }
  };

  const trigger = (
    <button
      type="button"
      className="flex items-center gap-1 rounded p-0.5 hover:bg-gray-100 transition-colors disabled:opacity-50"
      disabled={pending}
      aria-label="Assigner à…"
    >
      {currentEmail ? (
        <Avatar displayName={currentEmail} />
      ) : (
        <Avatar isAI={true} />
      )}
    </button>
  );

  return (
    <div
      role="none"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <TitledPopover
        title="Assigner à…"
        trigger={trigger}
        contentClassName="w-[220px]"
        closeOnChildClick
      >
        <div className="flex flex-col gap-1 px-2">
          {editors.map((editor) => (
            <button
              type="button"
              key={editor.id}
              onClick={() => handleSelect(editor)}
              className="flex items-center gap-3 rounded px-2 py-1.5 hover:bg-(--background-action-low-blue-france,#E3E3FD) text-left text-sm w-full transition-colors"
            >
              <Avatar
                displayName={editor.displayName}
                className="size-6 shrink-0"
              />
              <span className="flex-1 truncate">{editor.displayName}</span>
              {editor.email === currentEmail && (
                <RiCheckLine className="w-4 h-4 text-(--text-title-blue-france,#000091) shrink-0" />
              )}
            </button>
          ))}
        </div>
      </TitledPopover>
    </div>
  );
}
