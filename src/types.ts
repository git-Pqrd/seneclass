export type MODEL = "canary" | "chatgpt" | "phi_35";
export type Role = "student" | "me";

export interface ModelInfo {
  modelName: string;
  longModelName: string;
  modelInstruction: string;
}

export interface Message {
  role: Role;
  content: string;
  additionalInfo?: string;
}

export interface DebugMessage {
  timestamp: string;
  message: string;
}

export const modelInfoMap: Record<MODEL, ModelInfo> = {
  chatgpt: {
    modelName: "chatgpt",
    longModelName: "ChatGPT",
    modelInstruction:
      "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
  },
  phi_35: {
    modelName: "phi_35",
    longModelName: "Phi-3",
    modelInstruction:
      "Phi-3-mini-4k-instruct, a 3.82 billion parameter LLM that is optimized for inference on the web.",
  },
  canary: {
    modelName: "canary",
    longModelName: "Chrome Canary",
    modelInstruction:
      "You might need to ",
  },
} as const;
