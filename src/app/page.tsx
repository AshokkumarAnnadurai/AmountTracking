"use client";

import * as React from "react";
import type { Contributor, Expense, Program } from "@/lib/types";
import { mockContributors, mockExpenses, mockPrograms } from "@/lib/mock-data";

import { SummaryCards } from "@/components/dashboard/summary-cards";
import { ContributionsCard } from "@/components/dashboard/contributions-card";
import { ExpensesCard } from "@/components/dashboard/expenses-card";
import { ProgramsCard } from "@/components/dashboard/programs-card";
import { Sparkles } from "lucide-react";

export default function UtsavHisabDashboard() {
  const [contributors, setContributors] =
    React.useState<Contributor[]>(mockContributors);
  const [expenses, setExpenses] = React.useState<Expense[]>(mockExpenses);
  const [programs, setPrograms] = React.useState<Program[]>(mockPrograms);

  const totalCollection = React.useMemo(
    () => contributors.reduce((sum, c) => sum + c.amount, 0),
    [contributors]
  );
  const totalExpenses = React.useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );
  const remainingBalance = totalCollection - totalExpenses;

  const handleAddContributor = (newContributor: Omit<Contributor, "id">) => {
    setContributors((prev) => [
      { ...newContributor, id: crypto.randomUUID() },
      ...prev,
    ]);
  };

  const handleAddExpense = (newExpense: Omit<Expense, "id">) => {
    setExpenses((prev) => [
      { ...newExpense, id: crypto.randomUUID() },
      ...prev,
    ]);
  };

  const handleAddProgram = (newProgram: Omit<Program, "id">) => {
    setPrograms((prev) => [
      { ...newProgram, id: crypto.randomUUID() },
      ...prev,
    ]);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <Sparkles className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">Utsav Hisab</h1>
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
