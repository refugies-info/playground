import "dotenv/config";
import { Letta } from "@letta-ai/letta-client";

export interface LettaConfig {
  baseUrl?: string;
  token?: string;
}

export class LettaService {
  private client: Letta;

  constructor(config: LettaConfig = {}) {
    this.client = new Letta({
      baseURL: config.baseUrl,
      apiKey: config.token || process.env.LETTA_API_KEY,
    });
  }

  getClient(): Letta {
    return this.client;
  }

  async listAgents() {
    return this.client.agents.list();
  }

  async getAgent(agentId: string) {
    return this.client.agents.retrieve(agentId);
  }
}
