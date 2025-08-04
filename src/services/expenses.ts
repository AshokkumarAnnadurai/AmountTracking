import { db } from '@/lib/firebase';
import type { Expense } from '@/lib/types';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';

// Fetch all expenses
export const getExpenses = async (): Promise<Expense[]> => {
  const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      reason: data.reason,
      amount: data.amount,
      date: data.date.toDate(),
      category: data.category,
    } as Expense;
  });
};

// Add a new expense
export const addExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
  const docRef = await addDoc(collection(db, 'expenses'), {
    ...expense,
    // we use the date from the form, not the server timestamp
  });
  return { id: docRef.id, ...expense };
};
