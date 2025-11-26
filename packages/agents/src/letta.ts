import "dotenv/config";
import { Letta } from "@letta-ai/letta-client";

export interface LettaConfig {
  baseUrl?: string;
  token?: string;
}

export const createLettaClient = (config: LettaConfig = {}): Letta => {
  return new Letta({
    baseURL: config.baseUrl,
    apiKey: config.token || process.env.LETTA_API_KEY,
  });
};

export const listAgents = async (client: Letta) => {
  return client.agents.list();
};

export const getAgent = async (client: Letta, agentId: string) => {
  return client.agents.retrieve(agentId);
};
