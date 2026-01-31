import { models, type ModelProps } from "@/ai/models.ts";
import { useSyncExternalStore } from 'react';

export interface ChatState {
  webSearch: boolean;
  academicSearch: boolean;
  model: ModelProps;
  provider: string;
}

const initialState: ChatState = {
  webSearch: false,
  academicSearch: false,
  model: models[0],
  provider: models[0].providers[0],
};

class Store<T> {
  private state: T;
  private listeners: Set<() => void>;

  constructor(initialState: T) {
    this.state = initialState;
    this.listeners = new Set();
  }

  // Get current state
  getState = () => {
    return this.state;
  };

  // Set new state with functional update support
  setState = (fn: (state: T) => Partial<T>) => {
    const changes = fn(this.state);
    this.state = { ...this.state, ...changes };
    this.emitChange();
  };

  // Subscribe to changes
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private emitChange() {
    this.listeners.forEach((listener) => listener());
  }
}

export const chatStore = new Store<ChatState>(initialState);

export function useChatStore<S>(selector: (state: ChatState) => S): S {
  return useSyncExternalStore(
    chatStore.subscribe,
    () => selector(chatStore.getState())
  );
}
