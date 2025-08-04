
"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Users, Download } from "lucide-react";
import { format } from "date-fns";
import type { Timestamp } from "firebase/firestore";

import type { Contributor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/hooks/use-language";

const contributionSchema = (t: Function) => z.object({
  name: z.string().min(2, { message: t('validation.name.min') }),
  amount: z.coerce.number().positive({ message: t('validation.amount.positive') }),
});


interface ContributionsCardProps {
  contributors: Contributor[];
  onAddContributor: (contributor: Omit<Contributor, "id" | "date" | "year">) => Promise<void>;
}

export function ContributionsCard({ contributors, onAddContributor }: ContributionsCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const form = useForm<z.infer<ReturnType<typeof contributionSchema>>>({
    resolver: zodResolver(contributionSchema(t)),
    defaultValues: { name: "", amount: 0 },
  });

  async function onSubmit(values: z.infer<ReturnType<typeof contributionSchema>>) {
    await onAddContributor(values);
    toast({
      title: t('toast.success'),
      description: t('toast.contributorAdded', { name: values.name }),
    });
    form.reset();
    setIsOpen(false);
  }
  
  const formatCurrency = (amount: number) => `${t('currencySymbol')} ${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 0 }).format(amount)}`;
  const formatDate = (date: Date | Timestamp) => {
    return format(date instanceof Date ? date : date.toDate(), "PPP");
  }

  const handleDownload = () => {
    const headers = ["Contributor", "Amount", "Date"];
    const csvContent = [
      headers.join(","),
      ...contributors.map(c => [c.name, c.amount, formatDate(c.date)].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "contributions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>{t('contributions.title')}</CardTitle>
          <CardDescription>
            {t('contributions.description')}
          </CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="ml-auto gap-1 bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {t('addNew')}
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>{t('contributions.form.title')}</DialogTitle>
                  <DialogDescription>
                    {t('contributions.form.description')}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contributions.form.nameLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('contributions.form.namePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contributions.form.amountLabel', { currency: t('currencySymbol') })}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder={t('contributions.form.amountPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">{t('contributions.form.submit')}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-[350px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('contributions.table.contributor')}</TableHead>
                <TableHead className="text-right">{t('contributions.table.amount')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributors.length > 0 ? (
                contributors.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(c.date)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(c.amount)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    {t('contributions.table.noContributions')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
      <CardFooter className="justify-end border-t pt-4">
        <Button variant="outline" size="sm" onClick={handleDownload} disabled={contributors.length === 0}>
          <Download className="h-3.5 w-3.5 mr-2" />
          {t('download')}
        </Button>
      </CardFooter>
    </Card>
  );
}
