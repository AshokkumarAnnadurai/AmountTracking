
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
import { Sparkles, Loader2, Calendar, Languages, LogIn, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageProvider, useLanguage } from "@/hooks/use-language";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const getYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 10; i--) {
    years.push(i);
  }
  return years;
};

function AdminLoginDialog({ onLogin }: { onLogin: (email: string, pass: string) => Promise<void> }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(email, password);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LogIn className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-2">Admin Login</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
            <DialogDescription>
              Please enter your admin credentials to login.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Login</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


function UtsavHisabDashboardContent() {
  const [contributors, setContributors] = React.useState<Contributor[]>([]);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const availableYears = getYears();
  const { t, setLanguage, language } = useLanguage();
  const { user, isAdmin, loading: authLoading, signInWithEmail, signOut } = useAuth();
  const { toast } = useToast();

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
    const totalBudget = React.useMemo(
    () => programs.reduce((sum, p) => sum + p.budgetedAmount, 0),
    [programs]
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

  const handleLogin = async (email: string, pass: string) => {
    try {
      await signInWithEmail(email, pass);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      })
    }
  }
  
  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">{t('loading', { year: selectedYear })}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <Sparkles className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">{t('appTitle')}</h1>
        <div className="ml-auto flex items-center gap-4">
           {user ? (
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-2">Logout</span>
            </Button>
          ) : (
            <AdminLoginDialog onLogin={handleLogin} />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Languages className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:ml-2">{language === 'en' ? 'English' : 'தமிழ்'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setLanguage('en')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLanguage('ta')}>
                தமிழ்
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          totalBudget={totalBudget}
          programs={programs}
        />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <div className="xl:col-span-1">
            <ContributionsCard
              contributors={contributors}
              onAddContributor={handleAddContributor}
              isAdmin={isAdmin}
            />
          </div>
          <div className="xl:col-span-1">
            <ExpensesCard expenses={expenses} onAddExpense={handleAddExpense} isAdmin={isAdmin} />
          </div>
          <div className="xl:col-span-1">
            <ProgramsCard programs={programs} onAddProgram={handleAddProgram} isAdmin={isAdmin} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function UtsavHisabDashboard() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <UtsavHisabDashboardContent />
      </LanguageProvider>
    </AuthProvider>
  )
}
