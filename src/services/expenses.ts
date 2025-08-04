import { db } from '@/lib/firebase';
import type { Expense } from '@/lib/types';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Fetch all expenses for a given year
export const getExpenses = async (year: number): Promise<Expense[]> => {
  const q = query(
    collection(db, 'expenses'), 
    where('year', '==', year)
  );
  const querySnapshot = await getDocs(q);
  const expenses = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      reason: data.reason,
      amount: data.amount,
      date: data.date.toDate(),
      category: data.category,
      year: data.year
    } as Expense;
  });
  // Sort by date in descending order
  return expenses.sort((a, b) => (b.date as Date).getTime() - (a.date as Date).getTime());
};

// Add a new expense
export const addExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
  const docRef = await addDoc(collection(db, 'expenses'), {
    ...expense,
    // we use the date from the form, not the server timestamp
  });
  return { id: docRef.id, ...expense };
};
