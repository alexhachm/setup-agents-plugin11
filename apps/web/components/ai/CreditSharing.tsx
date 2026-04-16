"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface WorkspaceMemberCredit {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  creditLimit: number;
  creditsUsed: number;
  sharingEnabled: boolean;
}

interface CreditSharingProps {
  currentBalance: number;
  members: WorkspaceMemberCredit[];
  onUpdateLimit: (userId: string, limit: number) => void;
  onToggleSharing: (userId: string, enabled: boolean) => void;
  onClose: () => void;
}

export function CreditSharing({
  currentBalance,
  members: initialMembers,
  onUpdateLimit,
  onToggleSharing,
  onClose,
}: CreditSharingProps) {
  const [members, setMembers] = useState(initialMembers);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const totalShared = members
    .filter((m) => m.sharingEnabled)
    .reduce((sum, m) => sum + m.creditLimit, 0);

  const handleToggle = (userId: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.userId === userId ? { ...m, sharingEnabled: !m.sharingEnabled } : m
      )
    );
    const member = members.find((m) => m.userId === userId);
    if (member) onToggleSharing(userId, !member.sharingEnabled);
  };

  const handleStartEdit = (member: WorkspaceMemberCredit) => {
    setEditingMember(member.userId);
    setEditValue(member.creditLimit.toString());
  };

  const handleSaveEdit = (userId: string) => {
    const limit = parseInt(editValue, 10);
    if (isNaN(limit) || limit < 0) return;

    setMembers((prev) =>
      prev.map((m) =>
        m.userId === userId ? { ...m, creditLimit: limit } : m
      )
    );
    onUpdateLimit(userId, limit);
    setEditingMember(null);
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-bold">Credit Sharing</h3>
        <button
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Balance overview */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Current Balance</span>
          <span className="text-sm font-bold text-foreground">{currentBalance.toLocaleString()} credits</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Total Shared</span>
          <span className="text-xs text-warning">{totalShared.toLocaleString()} credits allocated</span>
        </div>
        {/* Balance bar */}
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min((totalShared / currentBalance) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Member list */}
      <div className="max-h-64 overflow-auto">
        {members.map((member) => (
          <div
            key={member.userId}
            className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0"
          >
            {/* Avatar */}
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary"
            >
              {member.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="text-xs font-medium">{member.name}</div>
              <div className="text-[10px] text-muted-foreground">{member.email}</div>
              {member.sharingEnabled && (
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  {member.creditsUsed} / {member.creditLimit} credits used
                </div>
              )}
            </div>

            {/* Credit limit edit */}
            {member.sharingEnabled && (
              <div className="shrink-0">
                {editingMember === member.userId ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-16 rounded border border-input bg-background px-1.5 py-0.5 text-xs"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(member.userId);
                        if (e.key === "Escape") setEditingMember(null);
                      }}
                    />
                    <button
                      onClick={() => handleSaveEdit(member.userId)}
                      className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] text-primary"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEdit(member)}
                    className="rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-accent"
                  >
                    {member.creditLimit} credits
                  </button>
                )}
              </div>
            )}

            {/* Toggle */}
            <button
              onClick={() => handleToggle(member.userId)}
              className={cn(
                "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                member.sharingEnabled ? "bg-primary" : "bg-secondary"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                  member.sharingEnabled ? "left-[18px]" : "left-0.5"
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
