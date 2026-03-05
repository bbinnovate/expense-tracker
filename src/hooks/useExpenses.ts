import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Category,
  Expense,
  HouseholdMember,
  MonthlyBudget,
  DEFAULT_CATEGORIES,
  DEFAULT_MEMBERS,
  FIXED_MEMBER_IDS,
} from "@/types/expense";

export function useExpenses() {
  const { user, isLoaded: clerkLoaded } = useUser();
  // Clerk userId is used directly as the Firestore document key (users/{userId}/...)
  const userId = user?.id ?? null;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [members, setMembers] = useState<HouseholdMember[]>(DEFAULT_MEMBERS);
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync Clerk user profile → Firestore users/{userId}
  useEffect(() => {
    if (!userId || !user) return;
    setDoc(
      doc(db, "users", userId),
      {
        clerkId: userId,
        email: user.primaryEmailAddress?.emailAddress ?? "",
        name: user.fullName ?? "",
        imageUrl: user.imageUrl ?? "",
        lastSeen: serverTimestamp(),
      },
      { merge: true },
    );
  }, [userId, user]);

  // Real-time listener for expenses (user-scoped)
  useEffect(() => {
    if (!userId) {
      setExpenses([]);
      return;
    }
    const q = query(
      collection(db, "users", userId, "expenses"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Expense));
    });
    return unsub;
  }, [userId]);

  // Real-time listener for members; seed defaults on first sign-in
  useEffect(() => {
    if (!userId) {
      setMembers(DEFAULT_MEMBERS);
      return;
    }
    const unsub = onSnapshot(
      collection(db, "users", userId, "members"),
      async (snap) => {
        try {
          // Skip local-cache snapshots for seeding to avoid false empty state
          if (snap.empty && !snap.metadata.fromCache) {
            await Promise.all(
              DEFAULT_MEMBERS.map((m) =>
                setDoc(doc(db, "users", userId, "members", m.id), m),
              ),
            );
            return;
          }
          if (snap.empty) return;
          // Always keep fixed members first, then custom members alphabetically
          const all = snap.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as HouseholdMember,
          );
          const fixed = FIXED_MEMBER_IDS.map((fid) =>
            all.find((m) => m.id === fid),
          ).filter(Boolean) as HouseholdMember[];
          const custom = all.filter(
            (m) =>
              !FIXED_MEMBER_IDS.includes(
                m.id as (typeof FIXED_MEMBER_IDS)[number],
              ),
          );
          setMembers([...fixed, ...custom]);
        } catch (err) {
          console.error("[members] snapshot handler error:", err);
        }
      },
      (err) => {
        console.error("[members] onSnapshot permission/network error:", err);
      },
    );
    return unsub;
  }, [userId]);

  // Real-time listener for categories; seed defaults on first sign-in
  useEffect(() => {
    if (!userId) {
      setCategories(DEFAULT_CATEGORIES);
      return;
    }
    const unsub = onSnapshot(
      collection(db, "users", userId, "categories"),
      async (snap) => {
        if (snap.empty) {
          // First time this user signs in — seed their private categories
          await Promise.all(
            DEFAULT_CATEGORIES.map((cat) =>
              setDoc(doc(db, "users", userId, "categories", cat.id), cat),
            ),
          );
          return;
        }
        setCategories(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category),
        );
      },
    );
    return unsub;
  }, [userId]);

  // Real-time listener for budgets (user-scoped)
  useEffect(() => {
    if (!userId) {
      setBudgets([]);
      setIsLoaded(clerkLoaded);
      return;
    }
    const unsub = onSnapshot(
      collection(db, "users", userId, "budgets"),
      (snap) => {
        setBudgets(
          snap.docs.map((d) => ({ month: d.id, ...d.data() }) as MonthlyBudget),
        );
        setIsLoaded(true);
      },
    );
    return unsub;
  }, [userId, clerkLoaded]);

  const addMember = useCallback(
    async (name: string) => {
      if (!userId) throw new Error("Not signed in");
      const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
      const member: HouseholdMember = { id, name };
      try {
        await setDoc(doc(db, "users", userId, "members", id), member);
      } catch (err) {
        console.error("[addMember] Firestore write FAILED:", err);
        throw err; // re-throw so WhoSelector can show the toast
      }
      return member;
    },
    [userId],
  );

  const deleteMember = useCallback(
    async (id: string) => {
      if (!userId) throw new Error("Not signed in");
      if (FIXED_MEMBER_IDS.includes(id as (typeof FIXED_MEMBER_IDS)[number]))
        return; // can't delete fixed
      await deleteDoc(doc(db, "users", userId, "members", id));
    },
    [userId],
  );

  const addExpense = useCallback(
    async (expense: Omit<Expense, "id" | "createdAt">) => {
      if (!userId) throw new Error("Not signed in");
      const newExpense: Expense = {
        ...expense,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      await setDoc(
        doc(db, "users", userId, "expenses", newExpense.id),
        newExpense,
      );
      return newExpense;
    },
    [userId],
  );

  const updateExpense = useCallback(
    async (id: string, updates: Partial<Omit<Expense, "id" | "createdAt">>) => {
      if (!userId) throw new Error("Not signed in");
      await updateDoc(
        doc(db, "users", userId, "expenses", id),
        updates as Record<string, unknown>,
      );
    },
    [userId],
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      if (!userId) throw new Error("Not signed in");
      await deleteDoc(doc(db, "users", userId, "expenses", id));
    },
    [userId],
  );

  const updateCategory = useCallback(
    async (id: string, updates: Partial<Category>) => {
      if (!userId) throw new Error("Not signed in");
      await updateDoc(
        doc(db, "users", userId, "categories", id),
        updates as Record<string, unknown>,
      );
    },
    [userId],
  );

  const getCurrentMonthKey = useCallback(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const setBudget = useCallback(
    async (categoryId: string, amount: number) => {
      if (!userId) throw new Error("Not signed in");
      const monthKey = getCurrentMonthKey();
      const budgetRef = doc(db, "users", userId, "budgets", monthKey);
      const snap = await getDoc(budgetRef);
      if (snap.exists()) {
        await updateDoc(budgetRef, { [`budgets.${categoryId}`]: amount });
      } else {
        await setDoc(budgetRef, {
          month: monthKey,
          budgets: { [categoryId]: amount },
        });
      }
    },
    [userId, getCurrentMonthKey],
  );

  const getBudget = useCallback(
    (categoryId: string, month?: string) => {
      const monthKey = month || getCurrentMonthKey();
      const monthBudget = budgets.find((b) => b.month === monthKey);
      return monthBudget?.budgets[categoryId] || 0;
    },
    [budgets, getCurrentMonthKey],
  );

  const getExpensesByMonth = useCallback(
    (month?: string) => {
      const monthKey = month || getCurrentMonthKey();
      return expenses.filter((exp) => exp.date.startsWith(monthKey));
    },
    [expenses, getCurrentMonthKey],
  );

  const getSpentByCategory = useCallback(
    (categoryId: string, month?: string) => {
      const monthExpenses = getExpensesByMonth(month);
      return monthExpenses
        .filter((exp) => exp.categoryId === categoryId)
        .reduce((sum, exp) => sum + exp.amount, 0);
    },
    [getExpensesByMonth],
  );

  const getTotalSpent = useCallback(
    (month?: string) => {
      const monthExpenses = getExpensesByMonth(month);
      return monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    },
    [getExpensesByMonth],
  );

  const exportToCSV = useCallback(() => {
    const headers = ["Date", "Amount", "Category", "Who Spent", "Description"];
    const rows = expenses.map((exp) => {
      const category = categories.find((c) => c.id === exp.categoryId);
      const member = members.find((m) => m.id === exp.whoSpent);
      return [
        exp.date,
        exp.amount.toString(),
        category?.name || exp.categoryId,
        member?.name || exp.whoSpent,
        exp.description,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `expenses-${getCurrentMonthKey()}.csv`;
    link.click();
  }, [expenses, categories, members, getCurrentMonthKey]);

  return {
    userId,
    isSignedIn: !!userId,
    expenses,
    categories,
    members,
    budgets,
    isLoaded,
    addExpense,
    updateExpense,
    deleteExpense,
    updateCategory,
    addMember,
    deleteMember,
    setBudget,
    getBudget,
    getExpensesByMonth,
    getSpentByCategory,
    getTotalSpent,
    getCurrentMonthKey,
    exportToCSV,
  };
}
