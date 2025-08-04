import { db } from '@/lib/firebase';
import type { Program } from '@/lib/types';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

// Fetch all programs
export const getPrograms = async (): Promise<Program[]> => {
  const q = query(collection(db, 'programs'), orderBy('name'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program));
};

// Add a new program
export const addProgram = async (program: Omit<Program, 'id'>): Promise<Program> => {
  const docRef = await addDoc(collection(db, 'programs'), program);
  return { id: docRef.id, ...program };
};
