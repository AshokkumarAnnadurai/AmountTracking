import { Timestamp } from "firebase/firestore";

export type Contributor = {
  id: string;
  name: string;
  amount: number;
  date: Date | Timestamp;
  year: number;
};

export const expenseCategories = ['Food', 'Decoration', 'Cultural Event', 'Pooja', 'Travel', 'Miscellaneous'] as const;

export type ExpenseCategory = typeof expenseCategories[number];

export type Expense = {
  id: string;
  reason: string;
  amount: number;
  date: Date | Timestamp;
  category: ExpenseCategory;
  year: number;
};

export type Program = {
  id: string;
  name: string;
  organizer: string;
  notes: string;
  year: number;
};
