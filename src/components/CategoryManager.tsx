"use client";

import { useState } from "react";
import { Category } from "@/types/expense";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings2, Check } from "lucide-react";

interface CategoryManagerProps {
  categories: Category[];
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
}

export function CategoryManager({
  categories,
  onUpdateCategory,
}: CategoryManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const handleSave = () => {
    if (editingId && editName.trim()) {
      onUpdateCategory(editingId, { name: editName.trim() });
      setEditingId(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground gap-1.5"
        >
          <Settings2 className="h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm mx-4 bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Categories</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50"
            >
              {editingId === category.id ? (
                <div className="flex gap-2 w-full">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    className="flex-1 h-9 bg-background"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSave} className="h-9 px-2">
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-foreground text-sm">
                    {category.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartEdit(category)}
                    className="text-muted-foreground text-xs"
                  >
                    Edit
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
