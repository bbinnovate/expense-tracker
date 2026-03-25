import { useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Category,
  Expense,
  HouseholdMember,

  DEFAULT_CATEGORIES,
  DEFAULT_MEMBERS,
  FIXED_MEMBER_IDS,
} from "@/types/expense";

export function useExpenses() {
  const { user, isLoaded: clerkLoaded } = useUser();
  // Clerk userId is used directly as the Firestore document key (users/{userId}/...)
  const userId = user?.id ?? null;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [rawCategories, setRawCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>(DEFAULT_MEMBERS);
  // Flat budget targets: categoryId -> monthly amount (applies to every month)
  const [budgetTargets, setBudgetTargets] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState({ count: 0, lastDate: "" });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  // Sync Clerk user profile → Firestore users/{userId}, then trigger migration if needed
  useEffect(() => {
    if (!userId || !user) return;
    const email = user.primaryEmailAddress?.emailAddress ?? "";
    setDoc(
      doc(db, "users", userId),
      { clerkId: userId, email, name: user.fullName ?? "", imageUrl: user.imageUrl ?? "", lastSeen: serverTimestamp() },
      { merge: true },
    ).then(() => {
      // Run migration once per user (API checks migratedAt flag)
      setIsMigrating(true);
      fetch("/api/migrate", { method: "POST" })
        .then((r) => r.json())
        .catch(() => {})
        .finally(() => setIsMigrating(false));
    });
  }, [userId, user]);

  // Load streak data once on sign-in
  useEffect(() => {
    if (!userId) return;
    getDoc(doc(db, "users", userId)).then((snap) => {
      const data = snap.data();
      if (data?.streakCount && data?.streakLastDate) {
        setStreak({ count: data.streakCount, lastDate: data.streakLastDate });
      }
    }).catch(() => {});
  }, [userId]);

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
      setRawCategories(DEFAULT_CATEGORIES);
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
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);
        const defaultIds = DEFAULT_CATEGORIES.map((c) => c.id);
        const defaults = defaultIds.map((id) => all.find((c) => c.id === id)).filter(Boolean) as Category[];
        const custom = all.filter((c) => !defaultIds.includes(c.id)).sort((a, b) => a.id.localeCompare(b.id));
        setRawCategories([...defaults, ...custom]);
      },
    );
    return unsub;
  }, [userId]);

  // Real-time listener for category order
  useEffect(() => {
    if (!userId) { setCategoryOrder([]); return; }
    const unsub = onSnapshot(
      doc(db, "users", userId, "settings", "categoryOrder"),
      (snap) => {
        setCategoryOrder(snap.exists() ? (snap.data().order as string[]) : []);
      },
    );
    return unsub;
  }, [userId]);

  // Real-time listener for budget targets (flat per-category, applies to all months)
  useEffect(() => {
    if (!userId) {
      setBudgetTargets({});
      setIsLoaded(clerkLoaded);
      return;
    }
    const unsub = onSnapshot(
      doc(db, "users", userId, "budgets", "targets"),
      (snap) => {
        setBudgetTargets(snap.exists() ? (snap.data() as Record<string, number>) : {});
        setIsLoaded(true);
      },
    );
    return unsub;
  }, [userId, clerkLoaded]);

  const categories = useMemo(() => {
    if (categoryOrder.length === 0) return rawCategories;
    const orderMap = new Map(categoryOrder.map((id, i) => [id, i]));
    return [...rawCategories].sort((a, b) => {
      const ai = orderMap.has(a.id) ? orderMap.get(a.id)! : Infinity;
      const bi = orderMap.has(b.id) ? orderMap.get(b.id)! : Infinity;
      return ai - bi;
    });
  }, [rawCategories, categoryOrder]);

  const updateCategoryOrder = useCallback(
    async (ids: string[]) => {
      if (!userId) return;
      await setDoc(
        doc(db, "users", userId, "settings", "categoryOrder"),
        { order: ids },
      );
    },
    [userId],
  );

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

  const updateMember = useCallback(
    async (id: string, name: string) => {
      if (!userId) throw new Error("Not signed in");
      if (FIXED_MEMBER_IDS.includes(id as (typeof FIXED_MEMBER_IDS)[number])) return;
      await updateDoc(doc(db, "users", userId, "members", id), { name });
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
        id: (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)),
        createdAt: new Date().toISOString(),
      };
      await setDoc(
        doc(db, "users", userId, "expenses", newExpense.id),
        newExpense,
      );
      // Track last entry time + streak
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      let newCount = 1;
      if (streak.lastDate === today) {
        newCount = streak.count; // same day, no change
      } else if (streak.lastDate === yesterday) {
        newCount = streak.count + 1; // consecutive day
      }
      const newStreak = { count: newCount, lastDate: today };
      setStreak(newStreak);
      await setDoc(doc(db, "users", userId), {
        lastEntryAt: new Date().toISOString(),
        streakCount: newCount,
        streakLastDate: today,
      }, { merge: true });

      const MILESTONES = [3, 7, 14, 30];
      const streakMilestone = streak.lastDate !== today && MILESTONES.includes(newCount) ? newCount : null;
      return { expense: newExpense, streakMilestone };
    },
    [userId, streak],
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

  const addCategory = useCallback(
    async (name: string) => {
      if (!userId) throw new Error("Not signed in");
      const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString(36);
      const category: Category = { id, name };
      await setDoc(doc(db, "users", userId, "categories", id), category);
      return category;
    },
    [userId],
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      if (!userId) throw new Error("Not signed in");
      await deleteDoc(doc(db, "users", userId, "categories", id));
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
      await setDoc(
        doc(db, "users", userId, "budgets", "targets"),
        { [categoryId]: amount },
        { merge: true },
      );
    },
    [userId],
  );

  // Budget targets are month-agnostic: same target applies every month
  // Spending is computed per-month from expenses, so it naturally resets each month
  const getBudget = useCallback(
    (categoryId: string) => {
      return budgetTargets[categoryId] ?? 0;
    },
    [budgetTargets],
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

  const exportToCSV = useCallback((month?: string) => {
    const exportExpenses = month ? expenses.filter((e) => e.date.startsWith(month)) : expenses;
    const headers = ["Date", "Amount", "Category", "Who Spent", "Description"];
    const rows = exportExpenses.map((exp) => {
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
    link.download = `expenses-${month ?? getCurrentMonthKey()}.csv`;
    link.click();
  }, [expenses, categories, members, getCurrentMonthKey]);

  return {
    userId,
    isSignedIn: !!userId,
    clerkLoaded,
    expenses,
    categories,
    members,
    isLoaded,
    isMigrating,
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
    getExpensesByMonth,
    getSpentByCategory,
    getTotalSpent,
    getCurrentMonthKey,
    exportToCSV,
  };
}
