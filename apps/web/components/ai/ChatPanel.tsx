"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage, type ChatMessageData } from "./ChatMessage";
import { ChatInput, type ChatMode } from "./ChatInput";
import { ActivityLog, type ActivityEntry } from "./ActivityLog";
import { OpenQuestionTag } from "./OpenQuestionTag";
import { FlagTag, type FlagType } from "./FlagTag";
import { TaskList } from "./TaskList";
import { cn } from "@/lib/utils";

type AIStatus = "idle" | "ideating..." | "implementing..." | "testing..." | "done";

interface OpenQuestion {
  id: string;
  question: string;
  resolved: boolean;
  noteId?: string;
  noteTitle?: string;
}

interface Flag {
  id: string;
  type: FlagType;
  text: string;
  noteId?: string;
  noteTitle?: string;
}

interface ChatPanelProps {
  chatSharing?: boolean;
  onToggleChatSharing?: () => void;
  onNoteNavigate?: (noteId: string) => void;
}

const DEMO_ACTIVITY: ActivityEntry[] = [
  { id: "a1", timestamp: new Date(Date.now() - 120000), status: "done", description: "Reading your payment notes..." },
  { id: "a2", timestamp: new Date(Date.now() - 90000), status: "done", description: "Generating migration..." },
  { id: "a3", timestamp: new Date(Date.now() - 60000), status: "done", description: "Running tests..." },
  { id: "a4", timestamp: new Date(), status: "running", description: "Updating Auth/Session note..." },
];

const DEMO_QUESTIONS: OpenQuestion[] = [
  { id: "q1", question: "How should session expiry work?", resolved: false, noteId: "n1", noteTitle: "Session" },
  { id: "q2", question: "Should 2FA be required for all roles?", resolved: false, noteId: "n2", noteTitle: "Auth Roles" },
];

const DEMO_FLAGS: Flag[] = [
  { id: "f1", type: "warning", text: "Payment note missing error handling", noteId: "n3", noteTitle: "Stripe Integration" },
  { id: "f2", type: "drift", text: "LoginForm code diverged from note spec", noteId: "n4", noteTitle: "Login" },
];

const DEMO_NOTE_REFS = [
  { id: "n1", title: "Session" },
  { id: "n2", title: "Auth Roles" },
  { id: "n3", title: "Stripe Integration" },
  { id: "n4", title: "Login" },
  { id: "n5", title: "User Table" },
];

export function ChatPanel({
  chatSharing = false,
  onToggleChatSharing,
  onNoteNavigate,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([
    {
      id: "1",
      role: "system",
      content: "AI Engine connected. Write in your notes -- I'll think along with you.",
      timestamp: new Date(),
    },
  ]);
  const [mode, setMode] = useState<ChatMode>("build");
  const [aiStatus, setAIStatus] = useState<AIStatus>("idle");
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>(DEMO_ACTIVITY);
  const [openQuestions, setOpenQuestions] = useState<OpenQuestion[]>(DEMO_QUESTIONS);
  const [flags, setFlags] = useState<Flag[]>(DEMO_FLAGS);
  const [expandedSection, setExpandedSection] = useState<string | null>("activity");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = (message: string) => {
    const userMsg: ChatMessageData = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Simulate AI thinking
    setAIStatus("ideating...");

    // Simulate activity log entry
    const newEntry: ActivityEntry = {
      id: `a-${Date.now()}`,
      timestamp: new Date(),
      status: "running",
      description: `Processing: "${message.slice(0, 40)}${message.length > 40 ? "..." : ""}"`,
    };
    setActivityEntries((prev) => [...prev, newEntry]);

    setTimeout(() => {
      setAIStatus("implementing...");

      setTimeout(() => {
        const aiMsg: ChatMessageData = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: `I'll look into that. Let me check the relevant notes and codebase...`,
          timestamp: new Date(),
          noteRefs: [{ id: "n1", title: "Session" }],
        };
        setMessages((prev) => [...prev, aiMsg]);
        setAIStatus("idle");

        // Mark activity as done
        setActivityEntries((prev) =>
          prev.map((e) =>
            e.id === newEntry.id ? { ...e, status: "done" as const } : e
          )
        );
      }, 1500);
    }, 500);
  };

  const handleResolveQuestion = (id: string) => {
    setOpenQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, resolved: true } : q))
    );
  };

  const handleDismissFlag = (id: string) => {
    setFlags((prev) => prev.filter((f) => f.id !== id));
  };

  const handleTogglePlan = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.plan
          ? { ...m, plan: { ...m.plan, expanded: !m.plan.expanded } }
          : m
      )
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const unresolvedQuestions = openQuestions.filter((q) => !q.resolved);

  return (
    <div className="flex h-full flex-col">
      {/* Header with sharing toggle and status */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          {aiStatus !== "idle" && (
            <span className="flex items-center gap-1.5 text-xs">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <span className="text-primary">{aiStatus}</span>
            </span>
          )}
          {aiStatus === "idle" && (
            <span className="text-xs text-muted-foreground">Ready</span>
          )}
        </div>
        <button
          onClick={onToggleChatSharing}
          className={cn(
            "rounded px-2 py-0.5 text-[10px] transition-colors",
            chatSharing
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-accent"
          )}
          title={chatSharing ? "Chat visible to collaborators" : "Chat is private"}
        >
          {chatSharing ? "Shared" : "Private"}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-1 py-2">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onNoteRefClick={onNoteNavigate}
              onTogglePlan={handleTogglePlan}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Collapsible sections */}
      <div className="shrink-0 border-t border-border">
        {/* Activity Log */}
        <ActivityLog entries={activityEntries} defaultCollapsed={false} />

        {/* Task List */}
        <TaskList />

        {/* Open Questions */}
        {unresolvedQuestions.length > 0 && (
          <div className="border-t border-border">
            <button
              onClick={() => toggleSection("questions")}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <svg
                className={cn(
                  "h-3 w-3 transition-transform",
                  expandedSection === "questions" && "rotate-90"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Open Questions
              <span className="ml-auto rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                {unresolvedQuestions.length}
              </span>
            </button>
            {expandedSection === "questions" && (
              <div className="space-y-1 px-3 pb-2">
                {openQuestions.map((q) => (
                  <OpenQuestionTag
                    key={q.id}
                    {...q}
                    onResolve={handleResolveQuestion}
                    onNavigate={onNoteNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Flags */}
        {flags.length > 0 && (
          <div className="border-t border-border">
            <button
              onClick={() => toggleSection("flags")}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <svg
                className={cn(
                  "h-3 w-3 transition-transform",
                  expandedSection === "flags" && "rotate-90"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Flags
              <span className="ml-auto rounded-full bg-destructive/15 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                {flags.length}
              </span>
            </button>
            {expandedSection === "flags" && (
              <div className="space-y-1 px-3 pb-2">
                {flags.map((f) => (
                  <FlagTag
                    key={f.id}
                    {...f}
                    onNavigate={onNoteNavigate}
                    onDismiss={handleDismissFlag}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat input */}
      <ChatInput
        onSend={handleSend}
        onModeChange={setMode}
        mode={mode}
        disabled={aiStatus !== "idle"}
        noteRefs={DEMO_NOTE_REFS}
      />
    </div>
  );
}
