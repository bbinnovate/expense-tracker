export interface Category {
  id: string;
  name: string;
}

// 'me' and 'household' are fixed; any other string is a custom member id
export type WhoSpent = string;

export interface HouseholdMember {
  id: string; // stable id (slugified name or uuid)
  name: string; // display label
}

export const DEFAULT_MEMBERS: HouseholdMember[] = [
  { id: "me", name: "Me" },
  { id: "household", name: "Household" },
];

export const FIXED_MEMBER_IDS = ["me", "household"] as const;

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  whoSpent: WhoSpent;
  description: string;
  date: string; // ISO date string
  createdAt: string;
}

export interface MonthlyBudget {
  month: string; // YYYY-MM format
  budgets: Record<string, number>; // categoryId -> budget
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "groceries", name: "Groceries" },
  { id: "milk", name: "Milk & Daily" },
  { id: "baby", name: "Baby" },
  { id: "utilities", name: "Utilities" },
  { id: "transport", name: "Transport" },
  { id: "eating-out", name: "Eating Out" },
  { id: "salaries", name: "Salaries" },
  { id: "home-decor", name: "Home Decor" },
  { id: "guests", name: "Guests" },
  { id: "misc", name: "Misc" },
];
