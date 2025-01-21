import { create } from "zustand";
import { MODEL } from "@/types";

interface ConfigState {
  direction: "vertical" | "horizontal";
  usedApi: MODEL;
  rate: number;
  difficulty: number;
  setDirection: (direction: "vertical" | "horizontal") => void;
  setUsedApi: (usedApi: MODEL) => void;
  setRate: (rate: number) => void;
  setDifficulty: (difficulty: number) => void;
}


export const useConfigStore = create<ConfigState>((set) => ({
  direction: "horizontal",
  usedApi: "chatgpt",
  rate: 1,
  difficulty: 5,
  setDirection: (direction) => set({ direction }),
  setUsedApi: (usedApi: MODEL) => set({ usedApi }),
  setRate: (rate) => set({ rate }),
  setDifficulty: (difficulty) => set({ difficulty }),
}));
