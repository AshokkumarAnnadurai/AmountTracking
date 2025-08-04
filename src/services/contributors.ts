import { db } from '@/lib/firebase';
import type { Contributor } from '@/lib/types';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';

// Fetch all contributors
export const getContributors = async (): Promise<Contributor[]> => {
  const q = query(collection(db, 'contributors'), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      amount: data.amount,
      date: data.date.toDate(),
    } as Contributor
  });
};

// Add a new contributor
export const addContributor = async (contributor: Omit<Contributor, 'id' | 'date'>): Promise<Contributor> => {
  const docRef = await addDoc(collection(db, 'contributors'), {
    ...contributor,
    date: serverTimestamp(),
  });
  return { id: docRef.id, ...contributor, date: new Date() };
};
