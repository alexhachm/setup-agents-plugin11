"use client";

interface PresenceUser {
  id: string;
  name: string;
  color: string;
  isAI?: boolean;
}

// Demo presence data
const DEMO_USERS: PresenceUser[] = [
  { id: "ai", name: "AI Engine", color: "#8B5CF6", isAI: true },
];

export function PresenceAvatars() {
  const users = DEMO_USERS;

  return (
    <div className="flex items-center -space-x-1.5">
      {users.map((user) => (
        <div
          key={user.id}
          className="relative h-6 w-6 rounded-full border-2 border-background text-center text-[10px] font-bold leading-[20px]"
          style={{ backgroundColor: user.color + "30", color: user.color }}
          title={user.name}
        >
          {user.isAI ? (
            <svg className="h-full w-full p-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 110 2h-1.07A7.003 7.003 0 0113 22h-2a7.003 7.003 0 01-6.93-6H3a1 1 0 110-2h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2zm-2 10a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
      ))}
      {users.length > 0 && (
        <span className="pl-2 text-xs text-muted-foreground">
          {users.length} online
        </span>
      )}
    </div>
  );
}
