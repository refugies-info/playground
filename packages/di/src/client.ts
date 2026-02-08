import type {
  Page,
  Service,
  ServiceDetail,
  ServiceFullSearchParams,
  ServiceResult,
  ServiceSearchParams,
  Source,
  Structure,
  StructureSearchParams,
  StructureSummary,
} from "./types";

export class DIClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: { baseUrl?: string; apiKey?: string } = {}) {
    this.baseUrl =
      config.baseUrl ||
      process.env.DI_BASE_URL ||
      "https://api.data.inclusion.beta.gouv.fr";
    this.apiKey = config.apiKey || process.env.DI_API_KEY || "";

    if (this.baseUrl.endsWith("/")) {
      this.baseUrl = this.baseUrl.slice(0, -1);
    }
  }

  private async fetch<T>(
    path: string,
    params?: Record<string, any>,
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
          for (const v of value) {
            url.searchParams.append(key, String(v));
          }
        } else {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `DI API Error ${response.status}: ${status} - ${errorBody}`,
      );
    }

    return response.json() as Promise<T>;
  }

  // --- Structures ---

  async getStructures(
    params?: StructureSearchParams,
  ): Promise<Page<StructureSummary>> {
    return this.fetch<Page<StructureSummary>>("/api/v1/structures", params);
  }

  async getStructure(id: string): Promise<Structure> {
    return this.fetch<Structure>(
      `/api/v1/structures/${encodeURIComponent(id)}`,
    );
  }

  // --- Services ---

  async getServices(params?: ServiceSearchParams): Promise<Page<Service>> {
    return this.fetch<Page<Service>>("/api/v1/services", params);
  }

  async getService(id: string): Promise<ServiceDetail> {
    return this.fetch<ServiceDetail>(
      `/api/v1/services/${encodeURIComponent(id)}`,
    );
  }

  async searchServices(
    params?: ServiceFullSearchParams,
  ): Promise<Page<ServiceResult>> {
    return this.fetch<Page<ServiceResult>>("/api/v1/search/services", params);
  }

  // --- Sources ---

  async getSources(): Promise<Source[]> {
    return this.fetch<Source[]>("/api/v1/sources");
  }
}

export const diClient = new DIClient();
