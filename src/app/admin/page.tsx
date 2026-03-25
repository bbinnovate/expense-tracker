"use client";

import { useState } from "react";

const PAGE_PASSWORD = "growbig8080";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [sending, setSending] = useState(false);

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-xs flex flex-col gap-4">
          <h1 className="text-lg font-semibold text-foreground text-center">Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && password === PAGE_PASSWORD && setUnlocked(true)}
            placeholder="Password"
            className="bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={() => password === PAGE_PASSWORD && setUnlocked(true)}
            className="h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
          >
            Unlock
          </button>
          {password && password !== PAGE_PASSWORD && (
            <p className="text-destructive text-xs text-center">Wrong password</p>
          )}
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: PAGE_PASSWORD, title, body }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-foreground mb-6">Send Notification to All Users</h1>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-muted-foreground">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New feature available!"
            className="bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-muted-foreground">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="e.g. Check out the new budget overview!"
            rows={3}
            className="bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={sending || !title.trim() || !body.trim()}
          className="h-12 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send to All Users"}
        </button>

        {result && (
          <div className="bg-card border border-border rounded-xl p-4 text-sm">
            {result.error ? (
              <p className="text-destructive">{String(result.error)}</p>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-foreground font-medium">
                  Sent to {String(result.sent)} / {String(result.total)} devices
                </p>
                {(result.delivered as Array<{ userId?: string; userAgent?: string }>)?.map((d, i) => (
                  <p key={i} className="text-muted-foreground text-xs">
                    ✓ {d.userId} — {d.userAgent?.slice(0, 60)}...
                  </p>
                ))}
                {(result.errors as Array<{ userId?: string; error?: string }>)?.map((e, i) => (
                  <p key={i} className="text-destructive text-xs">
                    ✗ {e.userId} — {e.error}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
