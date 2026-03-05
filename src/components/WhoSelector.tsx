"use client";

import { useState, useRef, useEffect } from "react";
import { HouseholdMember, FIXED_MEMBER_IDS } from "@/types/expense";
import { cn } from "@/lib/utils";
import { User, Home, Users, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface WhoSelectorProps {
  selected: string;
  members: HouseholdMember[];
  onSelect: (who: string) => void;
  onAddMember: (name: string) => Promise<HouseholdMember | void>;
  onDeleteMember: (id: string) => void;
}

function memberIcon(id: string) {
  if (id === "me") return <User className="w-3.5 h-3.5" />;
  if (id === "household") return <Home className="w-3.5 h-3.5" />;
  return <Users className="w-3.5 h-3.5" />;
}

export function WhoSelector({
  selected,
  members,
  onSelect,
  onAddMember,
  onDeleteMember,
}: WhoSelectorProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setAdding(false);
      return;
    }
    setSaving(true);
    try {
      await onAddMember(trimmed);
      setNewName("");
      setAdding(false);
    } catch (err) {
      console.error("[WhoSelector] addMember failed:", err);
      toast.error("Could not add member. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isFixed = (id: string) =>
    FIXED_MEMBER_IDS.includes(id as (typeof FIXED_MEMBER_IDS)[number]);

  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground px-1">Who spent</div>
      <div className="flex flex-wrap gap-1.5 items-center">
        {members.map((m) => (
          <div key={m.id} className="relative group">
            <button
              onClick={() => onSelect(m.id)}
              className={cn(
                "who-chip flex items-center gap-1.5 text-xs py-2 px-3",
                selected === m.id && "who-chip-selected",
                !isFixed(m.id) && "pr-6",
              )}
            >
              {memberIcon(m.id)}
              {m.name}
            </button>
            {!isFixed(m.id) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteMember(m.id);
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}

        {adding ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleAdd();
                }
                if (e.key === "Escape") {
                  setAdding(false);
                  setNewName("");
                }
              }}
              onBlur={() => {
                void handleAdd();
              }}
              placeholder="Name…"
              maxLength={20}
              disabled={saving}
              className="h-8 w-24 rounded-full bg-secondary border border-border px-3 text-xs outline-none focus:border-primary disabled:opacity-50"
            />
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="who-chip flex items-center gap-1 text-xs py-2 px-3 text-muted-foreground"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
