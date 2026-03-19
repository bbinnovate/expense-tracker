"use client";

import { useState, useRef, useEffect } from "react";
import { HouseholdMember, FIXED_MEMBER_IDS } from "@/types/expense";
import { cn } from "@/lib/utils";
import { User, Home, Users, Settings2, Plus, Check, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WhoSelectorProps {
  selected: string;
  members: HouseholdMember[];
  onSelect: (who: string) => void;
  onAddMember: (name: string) => Promise<HouseholdMember | void>;
  onUpdateMember: (id: string, name: string) => Promise<void>;
  onDeleteMember: (id: string) => void;
}

function memberIcon(id: string) {
  if (id === "me") return <User className="w-3.5 h-3.5" />;
  if (id === "household") return <Home className="w-3.5 h-3.5" />;
  return <Users className="w-3.5 h-3.5" />;
}

const isFixed = (id: string) =>
  FIXED_MEMBER_IDS.includes(id as (typeof FIXED_MEMBER_IDS)[number]);

export function WhoSelector({
  selected,
  members,
  onSelect,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
}: WhoSelectorProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) { setAdding(false); return; }
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

  const handleSaveEdit = async () => {
    if (editingId && editName.trim()) {
      await onUpdateMember(editingId, editName.trim());
      setEditingId(null);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      onDeleteMember(deleteId);
      setDeleteId(null);
    }
  };

  const deleteTarget = members.find((m) => m.id === deleteId);

  return (
    <>
      <div className="space-y-1">
        <div className="flex items-center justify-between px-1">
          <div className="text-sm text-muted-foreground">Who spent</div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5">
                <Settings2 className="h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] max-w-sm bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Members</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m.id} className="rounded-lg bg-secondary/50 overflow-hidden">
                    {editingId === m.id ? (
                      <div className="flex gap-2 p-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                          className="flex-1 h-10 bg-background text-sm"
                          autoFocus
                        />
                        <Button size="sm" onClick={handleSaveEdit} className="h-10 px-3">
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2.5">
                        <div className="flex items-center gap-2 flex-1 text-sm text-foreground">
                          {memberIcon(m.id)}
                          {m.name}
                        </div>
                        {!isFixed(m.id) && (
                          <>
                            <button
                              onClick={() => { setEditingId(m.id); setEditName(m.name); setAdding(false); }}
                              className="p-2.5 rounded-md hover:bg-secondary transition-colors"
                            >
                              <Edit2 className="w-5 h-5 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => setDeleteId(m.id)}
                              className="p-2.5 rounded-md hover:bg-secondary transition-colors"
                            >
                              <Trash2 className="w-5 h-5 text-destructive" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {adding ? (
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void handleAdd()}
                    placeholder="Member name"
                    maxLength={20}
                    disabled={saving}
                    className="flex-1 h-10 bg-background"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleAdd} disabled={!newName.trim() || saving} className="h-10 px-3">
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setAdding(true); setEditingId(null); }}
                  className="w-full gap-1.5 border-dashed text-muted-foreground"
                >
                  <Plus className="h-4 w-4" />
                  Add member
                </Button>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={cn(
                "who-chip flex items-center gap-1.5 text-sm h-10 px-3",
                selected === m.id && "who-chip-selected",
              )}
            >
              {memberIcon(m.id)}
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteTarget?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the member from your household.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary border-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
