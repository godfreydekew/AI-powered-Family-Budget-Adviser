import { useState, useRef, useEffect, useCallback } from "react";
import { Send, ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/components/budget-advisor/MessageBubble";
import { TypingIndicator } from "@/components/budget-advisor/TypingIndicator";
import { askBenefitsQuestion } from "@/api/benefits";
import type { SourceRef } from "@/api/benefits";
import type { ChatMessage } from "@/components/budget-advisor/types";

// ---------------------------------------------------------------------------
// Suggested prompts
// ---------------------------------------------------------------------------

const PROMPT_GROUPS = [
  {
    label: "Eligibility",
    prompts: [
      "Who is eligible for Universal Credit?",
      "Can I claim if I'm self-employed?",
      "What is the savings limit for Universal Credit?",
    ],
  },
  {
    label: "Rates & Amounts",
    prompts: [
      "How much is Universal Credit for a single person?",
      "What is the carer element on Universal Credit?",
      "How do savings affect my payments?",
    ],
  },
  {
    label: "How It Works",
    prompts: [
      "How long does the first payment take?",
      "What legacy benefits does Universal Credit replace?",
      "How much of my earnings are deducted?",
    ],
  },
  {
    label: "Changes & Appeals",
    prompts: [
      "How do I report a change of circumstances?",
      "How do I appeal a Universal Credit decision?",
      "What is a mandatory reconsideration?",
    ],
  },
];

// ---------------------------------------------------------------------------
// Source pills shown below an assistant answer
// ---------------------------------------------------------------------------

function SourcePills({ sources }: { sources: SourceRef[] }) {
  if (sources.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {sources.map((s, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground border border-border/50"
        >
          <ShieldCheck className="size-2.5 text-accent shrink-0" />
          {s.benefit_name ? `${s.benefit_name} · ` : ""}
          {s.title}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function BenefitsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sources, setSources] = useState<Record<string, SourceRef[]>>({});
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;
      setError(null);

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        text: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setIsTyping(true);
      scrollToBottom();

      if (inputRef.current) inputRef.current.style.height = "auto";

      try {
        const res = await askBenefitsQuestion(text.trim());
        const aiId = crypto.randomUUID();
        const aiMsg: ChatMessage = {
          id: aiId,
          role: "assistant",
          text: res.answer,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        if (res.sources.length > 0) {
          setSources((prev) => ({ ...prev, [aiId]: res.sources }));
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setIsTyping(false);
        scrollToBottom();
      }
    },
    [isTyping, scrollToBottom],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hasMessages = messages.length > 0 || isTyping;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-border">
        <Link
          to="/dashboard"
          className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-accent flex items-center justify-center">
            <ShieldCheck className="size-3.5 text-accent-foreground" />
          </div>
          <span className="text-sm font-semibold">Benefits Advisor</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
            online
          </span>
        </div>
      </div>

      {/* Content */}
      {!hasMessages ? (
        // Welcome screen
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4 overflow-y-auto hero-gradient">
          <div className="advisor-anim-1 relative flex items-center justify-center mb-6">
            <span className="advisor-ring-pulse-1 absolute size-16 rounded-full bg-accent/15" />
            <span className="advisor-ring-pulse-2 absolute size-16 rounded-full bg-accent/10" />
            <div className="relative size-14 rounded-full bg-accent flex items-center justify-center shadow-lg">
              <ShieldCheck className="size-7 text-accent-foreground" />
            </div>
          </div>

          <h2 className="advisor-anim-2 text-2xl font-semibold mb-2 text-center">
            Benefits Advisor
          </h2>
          <p className="advisor-anim-3 text-sm text-muted-foreground mb-8 text-center max-w-xs leading-relaxed">
            Ask anything about UK benefits — eligibility, rates,
            <br />how to apply, and what you're entitled to.
          </p>

          <div className="advisor-anim-4 w-full max-w-2xl">
            <BenefitsInputBar
              inputRef={inputRef}
              value={inputValue}
              isTyping={isTyping}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onSend={() => sendMessage(inputValue)}
            />
          </div>

          <div className="advisor-anim-5 w-full max-w-2xl mt-8 space-y-4">
            {PROMPT_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-2">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.prompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/70 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto"
            role="log"
            aria-live="polite"
          >
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
              {messages.map((msg) => (
                <div key={msg.id}>
                  <MessageBubble message={msg} />
                  {msg.role === "assistant" && sources[msg.id] && (
                    <div className="ml-10 mt-1">
                      <SourcePills sources={sources[msg.id]} />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="shrink-0 size-7 rounded-full bg-accent flex items-center justify-center mt-0.5">
                    <ShieldCheck className="size-3.5 text-accent-foreground" />
                  </div>
                  <div className="flex items-center">
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="shrink-0 px-4 pb-2 max-w-2xl mx-auto w-full">
              <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {error}
              </p>
            </div>
          )}

          <div className="shrink-0 border-t border-border px-4 py-3">
            <div className="max-w-2xl mx-auto">
              <BenefitsInputBar
                inputRef={inputRef}
                value={inputValue}
                isTyping={isTyping}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onSend={() => sendMessage(inputValue)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Input bar
// ---------------------------------------------------------------------------

interface BenefitsInputBarProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  isTyping: boolean;
  onInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
}

function BenefitsInputBar({
  inputRef,
  value,
  isTyping,
  onInput,
  onKeyDown,
  onSend,
}: BenefitsInputBarProps) {
  return (
    <div
      className={[
        "rounded-2xl border bg-card shadow-sm overflow-hidden transition-all duration-300",
        isTyping ? "advisor-input-glow" : "border-border",
      ].join(" ")}
    >
      <textarea
        ref={inputRef}
        value={value}
        onChange={onInput}
        onKeyDown={onKeyDown}
        placeholder="Ask about benefits, eligibility, or how to apply…"
        rows={1}
        disabled={isTyping}
        className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 min-h-[52px] max-h-[160px]"
      />
      <div className="flex items-center justify-end px-3 pb-2.5">
        <Button
          size="icon"
          onClick={onSend}
          disabled={!value.trim() || isTyping}
          aria-label="Send message"
          className="size-8 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-30 transition-opacity"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
