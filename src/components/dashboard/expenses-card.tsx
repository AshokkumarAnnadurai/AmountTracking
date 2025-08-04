"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, PlusCircle, ReceiptText } from "lucide-react";
import { format } from "date-fns";
import type { Timestamp } from "firebase/firestore";

import type { Expense } from "@/lib/types";
import { expenseCategories } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const expenseSchema = z.object({
  reason: z.string().min(3, { message: "Reason must be at least 3 characters." }),
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  date: z.date(),
  category: z.enum(expenseCategories),
});

interface ExpensesCardProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, "id" | "year">) => Promise<void>;
}

export function ExpensesCard({ expenses, onAddExpense }: ExpensesCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { reason: "", amount: 0, date: new Date(), category: 'Miscellaneous' },
  });

  async function onSubmit(values: z.infer<typeof expenseSchema>) {
    await onAddExpense(values);
    toast({
      title: "Success!",
      description: `Expense for ${values.reason} has been added.`,
    });
    form.reset();
    setIsOpen(false);
  }
  
  const formatCurrency = (amount: number) => `Rs ${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 0 }).format(amount)}`;
  const formatDate = (date: Date | Timestamp) => {
    return format(date instanceof Date ? date : date.toDate(), "PPP");
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Expenses</CardTitle>
          <CardDescription>All recorded festival expenses.</CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="ml-auto gap-1 bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add New
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                  <DialogDescription>
                    Enter the details of the expense.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <FormField name="reason" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Stage Decoration" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="amount" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (Rs)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 5000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField name="category" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="date" control={form.control} render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Expense</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <DialogFooter>
                  <Button type="submit">Add Expense</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length > 0 ? (
              expenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div className="font-medium flex items-center gap-2">
                       <CategoryIcon category={e.category} className="h-4 w-4 text-muted-foreground"/>
                       {e.reason}
                    </div>
                    <div className="text-sm text-muted-foreground ml-6">
                      {formatDate(e.date)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(e.amount)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  No expenses yet. Add one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
