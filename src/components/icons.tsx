import { Utensils, Palette, Theater, Sprout, Car, MoreHorizontal, type LucideProps } from 'lucide-react';
import type { ExpenseCategory } from '@/lib/types';

export const CategoryIcon = ({ category, ...props }: { category: ExpenseCategory } & LucideProps) => {
  const iconMap: Record<ExpenseCategory, React.ElementType> = {
    'Food': Utensils,
    'Decoration': Palette,
    'Cultural Event': Theater,
    'Pooja': Sprout,
    'Travel': Car,
    'Miscellaneous': MoreHorizontal,
  };
  const Icon = iconMap[category] || MoreHorizontal;
  return <Icon {...props} />;
};
