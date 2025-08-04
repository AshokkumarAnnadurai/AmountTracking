import type { Contributor, Expense, Program } from './types';

export const mockContributors: Contributor[] = [
  { id: '1', name: 'Arun Kumar', amount: 1000, date: new Date('2024-07-15') },
  { id: '2', name: 'Binu Raj', amount: 750, date: new Date('2024-07-16') },
  { id: '3', name: 'Charles Xavier', amount: 1000, date: new Date('2024-07-17') },
  { id: '4', name: 'David George', amount: 500, date: new Date('2024-07-18') },
];

export const mockExpenses: Expense[] = [
  { id: '1', reason: 'Stage Decoration Items', amount: 2500, date: new Date('2024-07-20'), category: 'Decoration' },
  { id: '2', reason: 'Welcome Dinner (Day 1)', amount: 4000, date: new Date('2024-07-21'), category: 'Food' },
  { id: '3', reason: 'Sendai Melam Advance', amount: 5000, date: new Date('2024-07-22'), category: 'Cultural Event' },
];

export const mockPrograms: Program[] = [
    { id: '1', name: 'Kerala Sendai Melam', organizer: 'Team A', notes: 'Final payment due on event day. Contact person: Ramesh.' },
    { id: '2', name: 'Ganamela (Musical Night)', organizer: 'Team B', notes: 'Sound system check at 5 PM. Need 4 microphones.' },
    { id: '3', name: 'Closing Ceremony Fireworks', organizer: 'Team C', notes: 'Get police permission a week in advance. Safety first.' },
];
