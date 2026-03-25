import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, MessageCircle, Minus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { getDummyResponse } from "./dummy-responses";
import type { ChatMessage } from "./types";

const SUGGESTED_PROMPTS = [
  "How much did I spend this month?",
  "Compare this month to last",
  "What are my top categories?",
  "Any unusual spending?",
  "Why are groceries higher?",
];

interface BudgetAdvisorPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BudgetAdvisorPanel({ isOpen, onClose }: BudgetAdvisorPanelProps) {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [dragY, setDragY] = useState(0);
  const dragStart = useRef<number | null>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const userMsg: ChatMessage = {
        id: Math.random().toString(36).slice(2),
        role: "user",
        text: text.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setIsTyping(true);
      scrollToBottom();

      const delay = 1200 + Math.random() * 800;
      setTimeout(() => {
        const response = getDummyResponse(text);
        const aiMsg: ChatMessage = {
          id: Math.random().toString(36).slice(2),
          ...response,
          timestamp: new Date(),
        };
        setIsTyping(false);
        setMessages((prev) => [...prev, aiMsg]);
        scrollToBottom();
      }, delay);
    },
    [scrollToBottom],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Mobile drag-to-close
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStart.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStart.current == null) return;
    const delta = e.touches[0].clientY - dragStart.current;
    if (delta > 0) setDragY(delta);
  };
  const handleTouchEnd = () => {
    if (dragY > 120) onClose();
    setDragY(0);
    dragStart.current = null;
  };

  if (!isOpen) return null;

  // --- Mobile: bottom sheet ---
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
        <div
          className="absolute inset-x-0 bottom-0 bg-card border-t border-border rounded-t-2xl flex flex-col"
          style={{
            height: "85vh",
            transform: `translateY(${dragY}px)`,
            transition: dragY === 0 ? "transform 280ms ease-out" : "none",
            animation: dragY === 0 ? "advisor-slide-up 280ms ease-out" : "none",
          }}
        >
          {/* Drag handle */}
          <div
            className="flex justify-center pt-3 pb-2 cursor-grab"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
          <PanelContent
            messages={messages}
            inputValue={inputValue}
            isTyping={isTyping}
            scrollRef={scrollRef}
            inputRef={inputRef}
            onInput={setInputValue}
            onSend={sendMessage}
            onKeyDown={handleKeyDown}
            onClose={onClose}
          />
        </div>
      </div>
    );
  }

  // --- Desktop / Tablet: side panel ---
  const isTablet = typeof window !== "undefined" && window.innerWidth < 1024;
  const panelWidth = isTablet ? 360 : 420;

  return (
    <div
      className="fixed top-0 right-0 bottom-0 z-40 bg-card border-l border-border flex flex-col"
      style={{
        width: panelWidth,
        animation: "advisor-slide-in 280ms ease-out",
      }}
    >
      <PanelContent
        messages={messages}
        inputValue={inputValue}
        isTyping={isTyping}
        scrollRef={scrollRef}
        inputRef={inputRef}
        onInput={setInputValue}
        onSend={sendMessage}
        onKeyDown={handleKeyDown}
        onClose={onClose}
      />
    </div>
  );
}

// --- Shared inner content ---
function PanelContent({
  messages,
  inputValue,
  isTyping,
  scrollRef,
  inputRef,
  onInput,
  onSend,
  onKeyDown,
  onClose,
}: {
  messages: ChatMessage[];
  inputValue: string;
  isTyping: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  onInput: (v: string) => void;
  onSend: (t: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold">Budget Advisor</h2>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-success animate-pulse" />
            AI
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-secondary transition-colors"
            aria-label="Close Budget Advisor"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="shrink-0 overflow-hidden">
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => onSend(prompt)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-150 hover:scale-[1.03]"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageCircle className="size-10 mb-3 opacity-30" />
            <p className="text-sm">Ask me about your spending</p>
            <p className="text-xs mt-1">Tap a suggestion above to get started</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => onInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about your spending…"
            rows={1}
            className="flex-1 resize-none bg-secondary/50 rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring max-h-[6rem] overflow-y-auto"
            style={{ minHeight: 40 }}
          />
          <Button
            size="icon"
            onClick={() => onSend(inputValue)}
            disabled={!inputValue.trim()}
            aria-label="Send message"
            className="shrink-0"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

// --- Floating trigger ---
export function BudgetAdvisorTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 size-14 rounded-full bg-accent text-accent-foreground shadow-finio-md flex items-center justify-center hover:scale-105 transition-transform duration-150 lg:hidden"
      aria-label="Open Budget Advisor"
    >
      <MessageCircle className="size-6" />
    </button>
  );
}
