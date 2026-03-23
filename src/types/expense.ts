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
  { id: "restaurants", name: "Restaurants" },
  { id: "transport", name: "Transport" },
  { id: "rent-bills", name: "Rent & Bills" },
  { id: "shopping", name: "Shopping" },
  { id: "health", name: "Health & Medical" },
  { id: "entertainment", name: "Entertainment" },
  { id: "personal-care", name: "Personal Care" },
  { id: "education", name: "Education" },
  { id: "subscriptions", name: "Subscriptions" },
  { id: "travel", name: "Travel" },
  { id: "misc", name: "Misc" },
];
