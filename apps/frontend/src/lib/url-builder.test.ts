import { describe, expect, it } from "vitest";
import { buildRcoSourceUrl } from "./url-builder";

const NEW_BASE =
  "https://www.intercariforef.org/outils/recherche-offreinfo/formations/sessions";

describe("buildRcoSourceUrl", () => {
  it("rewrites legacy intercariforef links to the new search URL", () => {
    expect(
      buildRcoSourceUrl(
        "https://www.intercariforef.org/formations/asl/formation-02_202410265937_00511985.html",
        "carif-oref--02_00511985",
      ),
    ).toBe(`${NEW_BASE}/02_202410265937/02_00511985`);
    expect(
      buildRcoSourceUrl(
        "https://www.intercariforef.org/formations/acc/formation-14_AF_0000242733_SE_0001609082.html",
        "carif-oref--14_SE_0001609082",
      ),
    ).toBe(`${NEW_BASE}/14_AF_0000242733/14_SE_0001609082`);
  });

  it("keeps other links unchanged", () => {
    const grandEst = "https://formation.grandest.fr/accueil/formations/107509";
    const certification =
      "http://www.intercariforef.org/formations/certification-109875.html";
    expect(buildRcoSourceUrl(grandEst, "carif-oref--01_GE1946723")).toBe(
      grandEst,
    );
    expect(buildRcoSourceUrl(certification, "carif-oref--06_2036489S")).toBe(
      certification,
    );
    expect(buildRcoSourceUrl(undefined, "carif-oref--02_00511985")).toBe(
      undefined,
    );
  });
});
