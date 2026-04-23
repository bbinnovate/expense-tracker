"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Bell, Lock, Send, CheckCircle2, XCircle } from "lucide-react";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

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
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, hsl(45 95% 55% / 0.05) 0%, transparent 65%), hsl(var(--background))",
        }}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative w-full max-w-xs flex flex-col items-center gap-7">
          {/* Lock badge */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "hsl(45 95% 55% / 0.08)",
              border: "1px solid hsl(45 95% 55% / 0.2)",
              boxShadow: "0 0 40px hsl(45 95% 55% / 0.08)",
            }}
          >
            <Lock className="w-6 h-6 text-primary" />
          </div>

          <div className="text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">
              Admin Console
            </p>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">
              Restricted Access
            </h1>
          </div>

          <div className="w-full flex flex-col gap-2.5">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && password === PAGE_PASSWORD && setUnlocked(true)
              }
              placeholder="Enter password"
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/30 transition-all"
            />
            <button
              onClick={() => password === PAGE_PASSWORD && setUnlocked(true)}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Unlock
            </button>
          </div>

          {password && password !== PAGE_PASSWORD && (
            <p className="text-[11px] text-destructive/80">Incorrect password</p>
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
    <div className="min-h-screen bg-background">
      {/* Top accent line */}
      <div
        className="h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(45 95% 55% / 0.5) 30%, hsl(45 95% 55% / 0.5) 70%, transparent 100%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-8 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-success" style={{ boxShadow: "0 0 6px hsl(150 50% 40%)" }} />
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
                Admin Console
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Overview</h1>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">
            internal · v1
          </span>
        </div>

        <Tabs defaultValue="dashboard">
          {/* Custom pill tabs */}
          <TabsList className="h-auto bg-transparent border-0 p-0 gap-1 mb-8">
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground
                data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-border
                hover:text-foreground/80 transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="notify"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground
                data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-border
                hover:text-foreground/80 transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              Broadcast
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            <AdminDashboard password={PAGE_PASSWORD} />
          </TabsContent>

          <TabsContent value="notify" className="mt-0">
            <div className="w-full max-w-md">
              <div className="rounded-2xl bg-card border border-border p-6 flex flex-col gap-5">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-1">
                    Push Notification
                  </p>
                  <h2 className="text-sm font-semibold text-foreground">Broadcast to All Users</h2>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    Sends to all registered push devices
                  </p>
                </div>

                <div className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70">
                      Title
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. New feature available!"
                      className="bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70">
                      Message
                    </label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="e.g. Check out the new budget overview!"
                      rows={3}
                      className="bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSend}
                  disabled={sending || !title.trim() || !body.trim()}
                  className="flex items-center justify-center gap-2 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors"
                >
                  {sending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send to All Users
                    </>
                  )}
                </button>

                {result && (
                  <div
                    className={`rounded-xl p-4 text-xs ${
                      result.error
                        ? "bg-destructive/8 border border-destructive/15"
                        : "bg-success/8 border border-success/15"
                    }`}
                  >
                    {result.error ? (
                      <div className="flex items-start gap-2">
                        <XCircle className="w-3.5 h-3.5 text-destructive mt-0.5 flex-shrink-0" />
                        <p className="text-destructive/90">{String(result.error)}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0" />
                          <p className="text-success font-medium">
                            Delivered to {String(result.sent)} / {String(result.total)} devices
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 pl-5 mt-1">
                          {(result.delivered as Array<{ userId?: string }>)?.map((d, i) => (
                            <p key={i} className="font-mono text-muted-foreground/60">
                              ✓ {d.userId}
                            </p>
                          ))}
                          {(result.errors as Array<{ userId?: string; error?: string }>)?.map(
                            (e, i) => (
                              <p key={i} className="font-mono text-destructive/70">
                                ✗ {e.userId} — {e.error}
                              </p>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
