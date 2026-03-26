"use client";

import { useState, useRef, useCallback } from "react";
import { SignInButton } from "@clerk/nextjs";
import { BottomNav, NavTab } from "@/components/BottomNav";
import { ExpenseEntry } from "@/components/ExpenseEntry";
import { OverviewLog } from "@/components/OverviewLog";
import { EditExpenseDialog } from "@/components/EditExpenseDialog";
import { useExpenses } from "@/hooks/useExpenses";
import { Expense } from "@/types/expense";
import { InstallPrompt } from "@/components/InstallPrompt";
import { NotificationPrompt } from "@/components/NotificationPrompt";

export function HomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>("add");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [canSave, setCanSave] = useState(false);
  const submitRef = useRef<(() => Promise<void>) | null>(null);

  const {
    isSignedIn,
    clerkLoaded,
    expenses,
    categories,
    members,
    isLoaded,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    updateCategory,
    deleteCategory,
    updateCategoryOrder,
    addMember,
    updateMember,
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

  if (!clerkLoaded) {
    return (
      <div className="min-h-screen bg-background" />
    );
  }

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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {!isLoaded && (
        <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-primary/20 overflow-hidden">
          <div className="h-full bg-primary animate-[shimmer_1.2s_ease-in-out_infinite] w-1/2" />
        </div>
      )}
      <main className="max-w-lg mx-auto flex flex-col pb-nav">
        {activeTab === "add" && (
          <ExpenseEntry
            categories={categories}
            members={members}
            onAddExpense={addExpense}
            onAddCategory={addCategory}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
            onReorderCategories={updateCategoryOrder}
            getBudget={getBudget}
            getSpentByCategory={getSpentByCategory}
            onSetBudget={setBudget}
            onAddMember={addMember}
            onUpdateMember={updateMember}
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

      <InstallPrompt />
      <NotificationPrompt />

      <EditExpenseDialog
        expense={editingExpense}
        categories={categories}
        members={members}
        onClose={() => setEditingExpense(null)}
        onSave={updateExpense}
        onAddMember={addMember}
        onUpdateMember={updateMember}
        onDeleteMember={deleteMember}
      />
    </div>
  );
}
