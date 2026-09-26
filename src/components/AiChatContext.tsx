"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

interface AiChatContextValue {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  clearMessages: () => void;
}

const AiChatContext = createContext<AiChatContextValue | null>(null);

export function AiChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <AiChatContext.Provider
      value={{
        messages,
        setMessages,
        isOpen,
        setIsOpen,
        inputValue,
        setInputValue,
        clearMessages,
      }}
    >
      {children}
    </AiChatContext.Provider>
  );
}

const fallbackContextValue: AiChatContextValue = {
  messages: [],
  setMessages: () => {},
  isOpen: false,
  setIsOpen: () => {},
  inputValue: "",
  setInputValue: () => {},
  clearMessages: () => {},
};

export function useAiChat(): AiChatContextValue {
  const ctx = useContext(AiChatContext);
  return ctx || fallbackContextValue;
}
