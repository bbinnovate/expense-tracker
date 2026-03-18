"use client";

import { useState, useEffect } from "react";
import { Category } from "@/types/expense";
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
import { Settings2, Check, Plus, Edit2, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

const MAX_CATEGORIES = 20;

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (name: string) => Promise<Category>;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => Promise<void>;
  onReorderCategories: (ids: string[]) => Promise<void>;
  getBudget: (categoryId: string) => number;
  onSetBudget: (categoryId: string, amount: number) => Promise<void>;
}

interface SortableRowProps {
  category: Category;
  budget: number;
  editingId: string | null;
  editName: string;
  editBudget: string;
  onStartEdit: (c: Category) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  setEditName: (v: string) => void;
  setEditBudget: (v: string) => void;
}

function SortableRow({
  category,
  budget,
  editingId,
  editName,
  editBudget,
  onStartEdit,
  onSave,
  onDelete,
  setEditName,
  setEditBudget,
}: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
    disabled: editingId === category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("rounded-lg bg-secondary/50 overflow-hidden", isDragging && "opacity-50 ring-1 ring-primary")}
    >
      {editingId === category.id ? (
        <div className="p-2 space-y-2">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSave()}
            placeholder="Category name"
            className="h-8 bg-background text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
              <Input
                type="number"
                value={editBudget}
                onChange={(e) => setEditBudget(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSave()}
                placeholder="Monthly budget"
                className="h-8 pl-6 bg-background text-sm"
              />
            </div>
            <Button size="sm" onClick={onSave} className="h-8 px-3">
              <Check className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-2 py-2.5">
          <button
            className="touch-none cursor-grab active:cursor-grabbing p-1 text-muted-foreground/50 hover:text-muted-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-foreground">{category.name}</div>
            {budget > 0 && (
              <div className="text-xs text-muted-foreground">₹{budget.toLocaleString("en-IN")}/mo</div>
            )}
          </div>
          <button
            onClick={() => onStartEdit(category)}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </button>
        </div>
      )}
    </div>
  );
}

export function CategoryManager({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  getBudget,
  onSetBudget,
}: CategoryManagerProps) {
  const [items, setItems] = useState(categories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editBudget, setEditBudget] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => { setItems(categories); }, [categories]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((c) => c.id === active.id);
    const newIndex = items.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    void onReorderCategories(reordered.map((c) => c.id));
  };

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditBudget(getBudget(category.id) > 0 ? getBudget(category.id).toString() : "");
    setAdding(false);
  };

  const handleSave = async () => {
    if (!editingId) return;
    if (editName.trim()) onUpdateCategory(editingId, { name: editName.trim() });
    const budget = parseFloat(editBudget);
    await onSetBudget(editingId, isNaN(budget) ? 0 : budget);
    setEditingId(null);
  };

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name || categories.length >= MAX_CATEGORIES) return;
    await onAddCategory(name);
    setNewName("");
    setAdding(false);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await onDeleteCategory(deleteId);
      setDeleteId(null);
    }
  };

  const atLimit = categories.length >= MAX_CATEGORIES;
  const deleteTarget = categories.find((c) => c.id === deleteId);

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5">
            <Settings2 className="h-4 w-4" />
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <span>Categories</span>
              <span className="text-xs font-normal text-muted-foreground">{categories.length}/{MAX_CATEGORIES}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 max-h-[55vh] overflow-y-auto">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                {items.map((category) => (
                  <SortableRow
                    key={category.id}
                    category={category}
                    budget={getBudget(category.id)}
                    editingId={editingId}
                    editName={editName}
                    editBudget={editBudget}
                    onStartEdit={handleStartEdit}
                    onSave={handleSave}
                    onDelete={setDeleteId}
                    setEditName={setEditName}
                    setEditBudget={setEditBudget}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>

          {adding ? (
            <div className="flex gap-2 pt-1">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Category name"
                className="flex-1 h-9 bg-background"
                autoFocus
              />
              <Button size="sm" onClick={handleAdd} disabled={!newName.trim()} className="h-9 px-2">
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdding(true)}
              disabled={atLimit}
              className="w-full gap-1.5 border-dashed text-muted-foreground"
            >
              <Plus className="h-4 w-4" />
              {atLimit ? "Limit reached (20)" : "Add category"}
            </Button>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the category. Existing expenses with this category won't be deleted.
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
