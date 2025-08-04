import { db } from '@/lib/firebase';
import type { Program } from '@/lib/types';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Fetch all programs for a given year
export const getPrograms = async (year: number): Promise<Program[]> => {
  const q = query(
    collection(db, 'programs'), 
    where('year', '==', year)
  );
  const querySnapshot = await getDocs(q);
  const programs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program));
  // Sort by name
  return programs.sort((a, b) => a.name.localeCompare(b.name));
};

// Add a new program
export const addProgram = async (program: Omit<Program, 'id'>): Promise<Program> => {
  const docRef = await addDoc(collection(db, 'programs'), program);
  return { id: docRef.id, ...program };
};
