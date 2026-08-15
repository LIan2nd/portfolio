"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquareCode, ChevronUp, Send, Trash2, ShieldCheck } from "lucide-react";
import { PrivacyPolicyModal } from "./PrivacyPolicyModal";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

const INITIAL_SUGGESTIONS = [
  "Tell me about the ESAO research project 🤖",
  "What are Alfian's main tech stack & skills? 💻",
  "Tell me about Alfian's journal publication 📄",
  "How can I contact or hire Alfian? 📫",
];

// Helper to format basic Markdown (bold, lists, and links)
function formatMarkdown(text: string) {
  const parts = text.split("\n");
  return parts.map((line, lineIndex) => {
    const boldFormatted = line.split(/(\*\*.*?\*\*)/g).map((chunk, i) => {
      if (chunk.startsWith("**") && chunk.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-[var(--color-text-primary)]">
            {chunk.slice(2, -2)}
          </strong>
        );
      }

      const linkMatch = chunk.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        const [full, label, url] = linkMatch;
        const [before, after] = chunk.split(full);
        return (
          <span key={i}>
            {before}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline font-medium hover:opacity-80 transition-opacity inline-flex items-center gap-0.5"
            >
              {label} ↗
            </a>
            {after}
          </span>
        );
      }

      return chunk;
    });

    if (line.startsWith("• ") || line.startsWith("- ")) {
      return (
        <li key={lineIndex} className="ml-4 list-disc text-inherit my-0.5">
          {boldFormatted}
        </li>
      );
    }

    if (line.trim() === "") {
      return <div key={lineIndex} className="h-1.5" />;
    }

    return (
      <p key={lineIndex} className="my-1 leading-relaxed">
        {boldFormatted}
      </p>
    );
  });
}

import { LOADING_PHRASES, getRandomLoadingIndex } from "@/lib/loadingPhrases";

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const [aiStatus, setAiStatus] = useState<"active" | "error" | "offline">("active");
  const [providerMode, setProviderMode] = useState<"live" | "simulated">(
    "simulated"
  );
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  // Cycle playful loading phrases comfortably (every 5.8s)
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingPhraseIndex(getRandomLoadingIndex());
    }, 4800);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Health probe on mount
  useEffect(() => {
    fetch("/api/chat")
      .then((res) => {
        if (!res.ok) setAiStatus("error");
        else setAiStatus("active");
      })
      .catch(() => setAiStatus("offline"));
  }, []);

  // Ref to always have the latest showPrivacyModal value (avoids stale closures)
  const showPrivacyModalRef = useRef(showPrivacyModal);
  useEffect(() => {
    showPrivacyModalRef.current = showPrivacyModal;
  }, [showPrivacyModal]);

  // Close on Escape key and Click Outside with modal hierarchy
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (showPrivacyModalRef.current) return;
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (showPrivacyModalRef.current) return;
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Mobile & browser back button handler for chat widget (popstate)
  useEffect(() => {
    if (!isOpen) return;

    // Push history state to capture mobile back button
    window.history.pushState({ aiChat: true }, "");

    const handlePopState = () => {
      // If privacy modal is open, let the modal's own handler deal with it
      if (showPrivacyModalRef.current) return;
      setIsOpen(false);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen]); // Only depend on isOpen — NOT showPrivacyModal

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue.trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setLoadingPhraseIndex(getRandomLoadingIndex());
    setIsLoading(true);

    const aiMessageId = `ai-${Date.now()}`;
    const initialAiMessage: Message = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, initialAiMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const modeHeader = response.headers.get("X-AI-Mode");
      if (modeHeader === "live" || modeHeader === "simulated") {
        setProviderMode(modeHeader);
      }

      if (!response.ok || !response.body) {
        if (response.status === 429) {
          throw new Error("⚠️ Terlalu banyak pesan. Silakan tunggu 1 menit sebelum mengirim lagi ya.");
        }
        throw new Error("⚠️ Maaf, terjadi kendala saat menghubungkan ke AI. Silakan coba kembali sesaat lagi.");
      }

      // Mark status as healthy
      setAiStatus("active");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: accumulatedContent, isStreaming: true }
              : msg
          )
        );
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: accumulatedContent, isStreaming: false }
            : msg
        )
      );
    } catch (error) {
      setAiStatus("error");
      const errorText =
        error instanceof Error
          ? error.message
          : "⚠️ Maaf, koneksi ke server AI terputus. Silakan coba kembali sesaat lagi.";

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
              ...msg,
              content: errorText,
              isStreaming: false,
            }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <aside
      ref={containerRef}
      aria-label="AI Assistant"
      className={`fixed z-40 bg-[var(--color-bg-primary)]/95 backdrop-blur-2xl border border-[var(--color-bg-tertiary)]/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isOpen
        ? "bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:bottom-5 sm:w-[360px] h-[520px] max-h-[85vh]"
        : "bottom-4 right-4 sm:right-5 sm:bottom-5 w-[210px] sm:w-[220px] h-[56px]"
        }`}
    >
      {/* Header Bar (Always visible & Clickable to toggle) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2 flex items-center justify-between bg-[var(--color-bg-secondary)]/50 hover:bg-[var(--color-bg-secondary)]/80 transition-colors cursor-pointer text-left focus:outline-none ${isOpen ? "border-b border-[var(--color-bg-tertiary)]/70" : "border-none"
          }`}
        aria-label={isOpen ? "Close AI Clone" : "Open AI Clone"}
      >
        <div className="flex flex-col">
          <span className="text-[10px] text-[var(--color-text-secondary)] leading-tight">
            Portfolio Assistant
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {/* Dynamic Pulse Heartbeat / Offline Dot Indicator */}
            <span className="relative flex h-2 w-2 shrink-0">
              {aiStatus === "active" ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-xs" title="Online" />
                </>
              ) : (
                <span
                  className="relative inline-flex rounded-full h-2 w-2 bg-zinc-400 dark:bg-zinc-500/80 shadow-xs transition-colors"
                  title={aiStatus === "offline" ? "AI Offline" : "Connection Issue"}
                />
              )}
            </span>
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              LIand's Clone
            </span>
          </div>
        </div>

        <div className="p-0.5 text-[var(--color-text-secondary)]">
          <ChevronUp
            className={`w-3.5 h-3.5 transition-transform duration-300 ease-in-out ${isOpen ? "rotate-0" : "rotate-180"
              }`}
          />
        </div>
      </button>

      {/* Main Chat Body (Only rendered when expanded) */}
      {isOpen && (
        <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
          {/* Messages Feed or Initial Welcome View */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 text-xs sm:text-sm custom-scrollbar">
            {messages.length === 0 ? (
              /* Custom Initial Screen */
              <div className="h-full flex flex-col items-center justify-center text-center py-2 px-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mb-2 shadow-xs">
                  <MessageSquareCode className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] mb-1">
                  Ask Anything About Alfian
                </h4>
                <p className="text-[10px] sm:text-[11px] text-[var(--color-text-secondary)] max-w-[260px] mb-3 leading-relaxed">
                  This AI Twin is ready to answer questions about the <strong>ESAO</strong> research, Web3 <strong>DigiArc</strong>, thesis, and my tech stack!
                </p>

                <span className="text-[9px] sm:text-[10px] text-[var(--color-text-secondary)] mb-1.5 font-medium tracking-wide uppercase">
                  Popular Topics:
                </span>

                <div className="w-full flex flex-col gap-1.5 mb-2.5">
                  {INITIAL_SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSendMessage(q)}
                      className="w-full text-[10px] sm:text-[11px] px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:border-accent hover:text-accent hover:bg-accent/5 transition-all cursor-pointer text-left shadow-xs break-words"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <span className="text-[9px] sm:text-[10px] text-[var(--color-text-secondary)]/60">
                  Powered by{" "}
                  <span className="text-accent font-medium">
                    {providerMode === "live" ? "SumoPod & RAG AI" : "LLM & RAG Engine"}
                  </span>
                </span>
              </div>
            ) : (
              /* Active Message List */
              <>
                {messages.map((msg) => {
                  if (msg.role === "assistant" && !msg.content && msg.isStreaming) {
                    return (
                      <div key={msg.id} className="flex flex-col items-start animate-in fade-in duration-200">
                        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl rounded-tl-xs bg-[var(--color-bg-secondary)] border border-[var(--color-bg-tertiary)]/70 text-[var(--color-text-secondary)] shadow-xs">
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" />
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.4s]" />
                          </div>
                          <span
                            key={loadingPhraseIndex}
                            className="text-[11px] sm:text-xs font-medium italic text-[var(--color-text-secondary)] animate-in fade-in duration-500"
                          >
                            {LOADING_PHRASES[loadingPhraseIndex]}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"
                        }`}
                    >
                      <div
                        className={`max-w-[88%] sm:max-w-[85%] px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl shadow-xs ${msg.role === "user"
                          ? "bg-accent text-white rounded-tr-xs"
                          : "bg-[var(--color-bg-secondary)] border border-[var(--color-bg-tertiary)]/70 text-[var(--color-text-primary)] rounded-tl-xs"
                          }`}
                      >
                        <div className="break-words">
                          {formatMarkdown(msg.content)}
                          {msg.isStreaming && (
                            <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-accent animate-pulse align-middle" />
                          )}
                        </div>
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-[var(--color-text-secondary)]/60 px-1 mt-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2 sm:p-3 border-t border-[var(--color-bg-tertiary)]/70 bg-[var(--color-bg-secondary)]/30 flex items-center gap-1.5 sm:gap-2 shrink-0"
          >
            {/* Reset Button */}
            <button
              type="button"
              onClick={handleClearChat}
              disabled={messages.length === 0}
              title="Reset chat"
              className="p-2 sm:p-2.5 rounded-xl border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] hover:text-red-400 hover:border-red-400/40 disabled:opacity-30 disabled:hover:text-[var(--color-text-secondary)] disabled:hover:border-[var(--color-bg-tertiary)] transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-xs"
              aria-label="Reset conversation"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about ESAO, Alfian's skills..."
              disabled={isLoading}
              maxLength={280}
              className="min-w-0 flex-1 bg-[var(--color-bg-primary)] border border-[var(--color-bg-tertiary)]/80 focus:border-accent focus:ring-1 focus:ring-accent/40 rounded-xl px-2.5 py-2 sm:px-3.5 sm:py-2.5 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/60 outline-none transition-all"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2 sm:p-2.5 rounded-xl bg-accent text-white flex items-center justify-center hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer shadow-xs"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </form>

          {/* Privacy Note Footer */}
          <div className="px-3 py-1.5 border-t border-[var(--color-bg-tertiary)]/40 bg-[var(--color-bg-secondary)]/60 flex items-center justify-between text-[10px] text-[var(--color-text-secondary)]/70 select-none">
            <span className="flex items-center gap-1 truncate">
              <span className="text-[11px]">🔒</span>
              <span className="truncate">Questions saved anonymously</span>
            </span>
            <button
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="text-accent hover:underline bg-transparent border-none p-0 cursor-pointer text-[10px] font-medium shrink-0 ml-1.5"
            >
              Privacy?
            </button>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </aside>
  );
}
