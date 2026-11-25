import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser } from "@/lib/auth";
import type { Profile } from "@/lib/profile";
import { listRiWidgetConfigs } from "./ri/widget-configs";
import { listWidgetConfigsAction } from "./widget-config-actions";

vi.mock("@/lib/auth", () => ({ getCurrentUser: vi.fn() }));
vi.mock("./ri/widget-configs", () => ({ listRiWidgetConfigs: vi.fn() }));

const signInAs = (role: Profile["role"]) =>
  vi.mocked(getCurrentUser).mockResolvedValue({
    id: "user-id",
    email: "someone@refugies.info",
    role,
    createdAt: null,
  });

describe("widget config actions access", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(listRiWidgetConfigs).mockResolvedValue([]);
  });

  it.each(["admin", "business"] as const)(
    "lets the %s role in",
    async (role) => {
      signInAs(role);

      await expect(listWidgetConfigsAction()).resolves.toEqual({
        success: true,
        data: [],
      });
    },
  );

  it.each(["editor", "translator"] as const)(
    "refuses the %s role without calling Refugies.info",
    async (role) => {
      signInAs(role);

      await expect(listWidgetConfigsAction()).resolves.toEqual({
        success: false,
        error: "Accès refusé",
      });
      expect(listRiWidgetConfigs).not.toHaveBeenCalled();
    },
  );
});
