import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Send, ArrowLeft, Mic, Square } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/components/budget-advisor/MessageBubble";
import { TypingIndicator } from "@/components/budget-advisor/TypingIndicator";
import { sendAdvisorMessage, transcribeAudio } from "@/api/advisor";
import type { AdvisorResponse } from "@/api/advisor";
import type { ChatMessage } from "@/components/budget-advisor/types";

// ---------------------------------------------------------------------------
// Prompt groups
// ---------------------------------------------------------------------------

const PROMPT_GROUPS = [
  {
    label: "Receipts",
    prompts: [
      "Show me my last receipt",
      "What did I buy today?",
      "Show me yesterday's receipts",
    ],
  },
  {
    label: "Spending",
    prompts: [
      "How much did I spend this month?",
      "Spending last 30 days",
      "What's my cost per person?",
    ],
  },
  {
    label: "Budget & Forecast",
    prompts: [
      "Am I on track with my budget?",
      "Will I go over budget?",
      "How much budget left?",
    ],
  },
  {
    label: "Insights",
    prompts: [
      "Top spending categories",
      "Where do I shop the most?",
      "How much did I save?",
    ],
  },
];

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ---------------------------------------------------------------------------
// Voice input hook
// ---------------------------------------------------------------------------

const SILENCE_THRESHOLD = 12;   // RMS below this = silence
const SILENCE_DURATION_MS = 1500; // pause this long → auto-stop

function useVoiceInput(onTranscription: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [waveLevels, setWaveLevels] = useState<number[]>(Array(7).fill(0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
    setWaveLevels(Array(7).fill(0));
  }, []);

  const stopAndTranscribe = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    setIsRecording(false);

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });

    cleanup();

    const chunks = chunksRef.current;
    chunksRef.current = [];
    if (chunks.length === 0) return;

    const blob = new Blob(chunks, { type: "audio/webm" });
    setIsTranscribing(true);
    try {
      const text = await transcribeAudio(blob);
      if (text?.trim()) onTranscription(text.trim());
    } catch {
      // transcription failed silently — user can still type
    } finally {
      setIsTranscribing(false);
    }
  }, [cleanup, onTranscription]);

  // Animate wave bars and detect silence using AnalyserNode
  const startAnalyser = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const buf = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteTimeDomainData(buf);

      // Compute RMS
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length) * 255;

      // Drive 7 wave bars using different frequency slices
      const step = Math.floor(buf.length / 7);
      setWaveLevels(
        Array.from({ length: 7 }, (_, i) => {
          const slice = buf.slice(i * step, (i + 1) * step);
          const avg = slice.reduce((a, b) => a + Math.abs(b - 128), 0) / slice.length;
          return Math.min(avg / 40, 1); // normalise 0–1
        }),
      );

      // Silence detection
      if (rms < SILENCE_THRESHOLD) {
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            stopAndTranscribe();
          }, SILENCE_DURATION_MS);
        }
      } else {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [stopAndTranscribe]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start(100); // collect chunks every 100ms

      setIsRecording(true);
      startAnalyser();
    } catch {
      // User denied mic or no mic available
    }
  }, [startAnalyser]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopAndTranscribe();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopAndTranscribe]);

  // Cleanup on unmount
  useEffect(() => () => cleanup(), [cleanup]);

  return { isRecording, isTranscribing, waveLevels, toggleRecording };
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AdvisorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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

  const appendToInput = useCallback((text: string) => {
    setInputValue((prev) => (prev ? `${prev} ${text}` : text));
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const { isRecording, isTranscribing, waveLevels, toggleRecording } =
    useVoiceInput(appendToInput);

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
        const res: AdvisorResponse = await sendAdvisorMessage(text.trim());
        const aiMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          text: res.text,
          chart: res.chart,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
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
          <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold select-none">
            F
          </div>
          <span className="text-sm font-semibold">Budget Advisor</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
            online
          </span>
        </div>
      </div>

      {/* Content */}
      {!hasMessages ? (
        <WelcomeScreen
          inputRef={inputRef}
          inputValue={inputValue}
          isTyping={isTyping}
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          waveLevels={waveLevels}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onSend={() => sendMessage(inputValue)}
          onSelect={sendMessage}
          onToggleRecording={toggleRecording}
        />
      ) : (
        <>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto"
            role="log"
            aria-live="polite"
          >
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="shrink-0 size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold select-none">
                    F
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
              <InputBar
                inputRef={inputRef}
                value={inputValue}
                isTyping={isTyping}
                isRecording={isRecording}
                isTranscribing={isTranscribing}
                waveLevels={waveLevels}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onSend={() => sendMessage(inputValue)}
                onToggleRecording={toggleRecording}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Welcome screen
// ---------------------------------------------------------------------------

interface WelcomeScreenProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  inputValue: string;
  isTyping: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  waveLevels: number[];
  onInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onSelect: (p: string) => void;
  onToggleRecording: () => void;
}

function WelcomeScreen({
  inputRef,
  inputValue,
  isTyping,
  isRecording,
  isTranscribing,
  waveLevels,
  onInput,
  onKeyDown,
  onSend,
  onSelect,
  onToggleRecording,
}: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4 overflow-y-auto hero-gradient">
      {/* Animated avatar */}
      <div className="advisor-anim-1 relative flex items-center justify-center mb-6">
        <span className="advisor-ring-pulse-1 absolute size-16 rounded-full bg-accent/15" />
        <span className="advisor-ring-pulse-2 absolute size-16 rounded-full bg-accent/10" />
        <div className="relative size-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
          <span className="text-xl font-bold text-primary-foreground select-none">F</span>
        </div>
      </div>

      <h2 className="advisor-anim-2 text-2xl font-semibold mb-2 text-center">
        {getTimeGreeting()}
      </h2>
      <p className="advisor-anim-3 text-sm text-muted-foreground mb-8 text-center max-w-xs leading-relaxed">
        Ask me anything about your spending,
        <br />receipts, or budget.
      </p>

      <div className="advisor-anim-4 w-full max-w-2xl">
        <InputBar
          inputRef={inputRef}
          value={inputValue}
          isTyping={isTyping}
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          waveLevels={waveLevels}
          onInput={onInput}
          onKeyDown={onKeyDown}
          onSend={onSend}
          onToggleRecording={onToggleRecording}
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
                  onClick={() => onSelect(prompt)}
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
  );
}

// ---------------------------------------------------------------------------
// Input bar
// ---------------------------------------------------------------------------

interface InputBarProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  isTyping: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  waveLevels: number[];
  onInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onToggleRecording: () => void;
}


function InputBar({
  inputRef,
  value,
  isTyping,
  isRecording,
  isTranscribing,
  waveLevels,
  onInput,
  onKeyDown,
  onSend,
  onToggleRecording,
}: InputBarProps) {
  const inputBusy = isTyping || isTranscribing;

  return (
    <div
      className={[
        "rounded-2xl border bg-card shadow-sm overflow-hidden transition-all duration-300",
        isTyping ? "advisor-input-glow" : "border-border",
      ].join(" ")}
    >
      {/* Recording wave overlay */}
      {isRecording && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
          <span className="size-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          <div className="flex items-end gap-[3px] h-6">
            {waveLevels.map((level, i) => (
              <div
                key={i}
                className={`advisor-wave-bar advisor-wave-delay-${i} w-[3px] rounded-full bg-accent`}
                style={{ "--bar-h": `${Math.max(12, level * 24)}px` } as React.CSSProperties}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-1">Listening…</span>
        </div>
      )}

      {isTranscribing && !isRecording && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border/40">
          <span className="text-xs text-muted-foreground animate-pulse">Transcribing…</span>
        </div>
      )}

      <textarea
        ref={inputRef}
        value={value}
        onChange={onInput}
        onKeyDown={onKeyDown}
        placeholder={isRecording ? "Listening…" : "Ask about your spending…"}
        rows={1}
        disabled={inputBusy}
        className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 min-h-[52px] max-h-[160px]"
      />

      <div className="flex items-center justify-end gap-2 px-3 pb-2.5">
        {/* Mic button */}
        <Button
          size="icon"
          type="button"
          onClick={onToggleRecording}
          disabled={inputBusy}
          aria-label={isRecording ? "Stop recording" : "Start voice input"}
          className={[
            "size-8 rounded-xl transition-all",
            isRecording
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-secondary text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
          ].join(" ")}
        >
          {isRecording ? <Square className="size-3.5 fill-current" /> : <Mic className="size-4" />}
        </Button>

        {/* Send button */}
        <Button
          size="icon"
          onClick={onSend}
          disabled={!value.trim() || inputBusy}
          aria-label="Send message"
          className="size-8 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-30 transition-opacity"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
