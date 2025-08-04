
"use client";

import * as React from "react";
import type { Contributor, Expense, Program } from "@/lib/types";
import { getContributors, addContributor } from "@/services/contributors";
import { getExpenses, addExpense } from "@/services/expenses";
import { getPrograms, addProgram } from "@/services/programs";

import { SummaryCards } from "@/components/dashboard/summary-cards";
import { ContributionsCard } from "@/components/dashboard/contributions-card";
import { ExpensesCard } from "@/components/dashboard/expenses-card";
import { ProgramsCard } from "@/components/dashboard/programs-card";
import { Sparkles, Loader2, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";


const getYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 10; i--) {
    years.push(i);
  }
  return years;
};

export default function UtsavHisabDashboard() {
  const [contributors, setContributors] = React.useState<Contributor[]>([]);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const availableYears = getYears();

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [contributorsData, expensesData, programsData] = await Promise.all([
          getContributors(selectedYear),
          getExpenses(selectedYear),
          getPrograms(selectedYear),
        ]);
        setContributors(contributorsData);
        setExpenses(expensesData);
        setPrograms(programsData);
      } catch (error) {
        console.error("Error loading data from Firestore:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedYear]);

  const totalCollection = React.useMemo(
    () => contributors.reduce((sum, c) => sum + c.amount, 0),
    [contributors]
  );
  const totalExpenses = React.useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );
  const remainingBalance = totalCollection - totalExpenses;

  const handleAddContributor = async (newContributor: Omit<Contributor, "id" | "date" | "year">) => {
    const contributorWithYear = { ...newContributor, year: selectedYear };
    const added = await addContributor(contributorWithYear);
    setContributors((prev) => [added, ...prev]);
  };

  const handleAddExpense = async (newExpense: Omit<Expense, "id" | "year">) => {
    const expenseWithYear = { ...newExpense, year: selectedYear };
    const added = await addExpense(expenseWithYear);
    setExpenses((prev) => [
       {...added, date: newExpense.date},
      ...prev,
    ]);
  };

  const handleAddProgram = async (newProgram: Omit<Program, "id" | "year">) => {
    const programWithYear = { ...newProgram, year: selectedYear };
    const added = await addProgram(programWithYear);
    setPrograms((prev) => [added, ...prev]);
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Festival Data for {selectedYear}...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <Sparkles className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">Utsav Hisab</h1>
        <div className="ml-auto flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{selectedYear}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {availableYears.map(year => (
                <DropdownMenuItem key={year} onSelect={() => setSelectedYear(year)}>
                  {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <SummaryCards
          totalCollection={totalCollection}
          totalExpenses={totalExpenses}
          remainingBalance={remainingBalance}
          programs={programs}
        />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <div className="xl:col-span-1">
            <ContributionsCard
              contributors={contributors}
              onAddContributor={handleAddContributor}
            />
          </div>
          <div className="xl:col-span-1">
            <ExpensesCard expenses={expenses} onAddExpense={handleAddExpense} />
          </div>
          <div className="xl:col-span-1">
            <ProgramsCard programs={programs} onAddProgram={handleAddProgram} />
          </div>
        </div>
      </main>
    </div>
  );
}
