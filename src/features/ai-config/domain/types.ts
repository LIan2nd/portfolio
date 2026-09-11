export type AiGateway = "nara" | "sumopod";

export interface AiModelConfig {
  activeProvider: AiGateway;
  naraModel: string;
  sumopodModel: string;
  updatedAt?: string;
}

export interface GatewayModelOption {
  id: string;
  name: string;
}
