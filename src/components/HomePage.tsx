"use client";

import { useState, useRef, useCallback } from "react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { BottomNav, NavTab } from "@/components/BottomNav";
import { ExpenseEntry } from "@/components/ExpenseEntry";
import { OverviewLog } from "@/components/OverviewLog";
import { EditExpenseDialog } from "@/components/EditExpenseDialog";
import { useExpenses } from "@/hooks/useExpenses";
import { Expense } from "@/types/expense";

export function HomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>("add");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [canSave, setCanSave] = useState(false);
  const submitRef = useRef<(() => void) | null>(null);

  const {
    isSignedIn,
    expenses,
    categories,
    members,
    isLoaded,
    addExpense,
    updateExpense,
    deleteExpense,
    updateCategory,
    addMember,
    deleteMember,
    setBudget,
    getBudget,
    getSpentByCategory,
    getTotalSpent,
    exportToCSV,
  } = useExpenses();

  const handleSave = useCallback(() => {
    if (activeTab !== "add") {
      setActiveTab("add");
      return;
    }
    submitRef.current?.();
  }, [activeTab]);

  const handleCanSubmitChange = useCallback((val: boolean) => {
    setCanSave(val);
  }, []);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="text-4xl">💰</div>
          <h1 className="text-2xl font-bold">Expense Tracker</h1>
          <p className="text-muted-foreground">
            Sign in to track your expenses securely across devices.
          </p>
          <div className="flex gap-3 mt-2">
            <SignInButton>
              <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="px-4 py-2 rounded-md border border-border font-medium hover:bg-muted transition">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-lg mx-auto min-h-screen">
        {activeTab === "add" && (
          <ExpenseEntry
            categories={categories}
            members={members}
            onAddExpense={addExpense}
            onUpdateCategory={updateCategory}
            onAddMember={addMember}
            onDeleteMember={deleteMember}
            totalSpent={getTotalSpent()}
            onCanSubmitChange={handleCanSubmitChange}
            submitRef={submitRef}
          />
        )}

        {activeTab === "overview" && (
          <OverviewLog
            categories={categories}
            expenses={expenses}
            members={members}
            getSpentByCategory={getSpentByCategory}
            getTotalSpent={getTotalSpent}
            getBudget={getBudget}
            onSetBudget={setBudget}
            onEditExpense={setEditingExpense}
            onDeleteExpense={deleteExpense}
            onExport={exportToCSV}
          />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSave={handleSave}
        canSave={activeTab === "add" && canSave}
      />

      <EditExpenseDialog
        expense={editingExpense}
        categories={categories}
        members={members}
        onClose={() => setEditingExpense(null)}
        onSave={updateExpense}
        onAddMember={addMember}
        onDeleteMember={deleteMember}
      />
    </div>
  );
}
