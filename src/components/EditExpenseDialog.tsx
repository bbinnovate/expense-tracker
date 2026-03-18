"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Expense, Category, WhoSpent, HouseholdMember } from "@/types/expense";
import { CategorySelector } from "./CategorySelector";
import { WhoSelector } from "./WhoSelector";
import { DescriptionInput } from "./DescriptionInput";
import { DateSelector } from "./DateSelector";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditExpenseDialogProps {
  expense: Expense | null;
  categories: Category[];
  members: HouseholdMember[];
  onClose: () => void;
  onSave: (
    id: string,
    updates: Partial<Omit<Expense, "id" | "createdAt">>,
  ) => void;
  onAddMember: (name: string) => Promise<HouseholdMember | void>;
  onUpdateMember: (id: string, name: string) => Promise<void>;
  onDeleteMember: (id: string) => void;
}

export function EditExpenseDialog({
  expense,
  categories,
  members,
  onClose,
  onSave,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
}: EditExpenseDialogProps) {
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [whoSpent, setWhoSpent] = useState<WhoSpent>("me");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setCategoryId(expense.categoryId);
      setWhoSpent(expense.whoSpent);
      setDescription(expense.description);
      setDate(parseISO(expense.date));
    }
  }, [expense]);

  const handleSave = () => {
    if (!expense || !categoryId) return;

    onSave(expense.id, {
      amount: parseFloat(amount) || expense.amount,
      categoryId,
      whoSpent,
      description: description.trim(),
      date: format(date, "yyyy-MM-dd"),
    });
    onClose();
  };

  return (
    <Dialog open={!!expense} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground px-1">Amount</div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 h-12 bg-secondary border-0 text-lg font-mono"
              />
            </div>
          </div>

          <CategorySelector
            categories={categories}
            selected={categoryId}
            onSelect={setCategoryId}
          />

          <WhoSelector
            selected={whoSpent}
            members={members}
            onSelect={setWhoSpent}
            onAddMember={onAddMember}
            onUpdateMember={onUpdateMember}
            onDeleteMember={onDeleteMember}
          />

          <DescriptionInput value={description} onChange={setDescription} />

          <DateSelector date={date} onDateChange={setDate} />

          <Button
            onClick={handleSave}
            className="w-full h-12"
            disabled={!categoryId || !amount}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
