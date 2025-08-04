
"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, ListMusic } from "lucide-react";

import type { Program } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "../ui/scroll-area";
import { useLanguage } from "@/hooks/use-language";


const programSchema = (t: Function) => z.object({
  name: z.string().min(3, { message: t('validation.programName.min') }),
  organizer: z.string().min(2, { message: t('validation.organizer.min') }),
  budgetedAmount: z.coerce.number().positive({ message: t('validation.budget.positive') }),
  notes: z.string().optional(),
});

interface ProgramsCardProps {
  programs: Program[];
  onAddProgram: (program: Omit<Program, "id" | "year">) => Promise<void>;
}

export function ProgramsCard({ programs, onAddProgram }: ProgramsCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const form = useForm<z.infer<ReturnType<typeof programSchema>>>({
    resolver: zodResolver(programSchema(t)),
    defaultValues: { name: "", organizer: "", budgetedAmount: 0, notes: "" },
  });

  async function onSubmit(values: z.infer<ReturnType<typeof programSchema>>) {
    await onAddProgram(values);
    toast({
      title: t('toast.success'),
      description: t('toast.programAdded', { name: values.name }),
    });
    form.reset();
    setIsOpen(false);
  }

  const formatCurrency = (amount: number) => `${t('currencySymbol')} ${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 0 }).format(amount)}`;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>{t('programs.title')}</CardTitle>
          <CardDescription>
            {t('programs.description')}
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
                  <DialogTitle>{t('programs.form.title')}</DialogTitle>
                  <DialogDescription>
                    {t('programs.form.description')}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <FormField name="name" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('programs.form.nameLabel')}</FormLabel>
                      <FormControl><Input placeholder={t('programs.form.namePlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="organizer" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('programs.form.organizerLabel')}</FormLabel>
                      <FormControl><Input placeholder={t('programs.form.organizerPlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField
                    control={form.control}
                    name="budgetedAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('programs.form.budgetLabel', { currency: t('currencySymbol') })}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder={t('programs.form.budgetPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField name="notes" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('programs.form.notesLabel')}</FormLabel>
                      <FormControl><Textarea placeholder={t('programs.form.notesPlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <DialogFooter>
                  <Button type="submit">{t('programs.form.submit')}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-[400px]">
        {programs.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {programs.map((p) => (
              <AccordionItem value={p.id} key={p.id}>
                <AccordionTrigger>
                  <div className="flex flex-col items-start text-left w-full">
                    <div className="flex justify-between w-full">
                      <span className="font-medium">{p.name}</span>
                      <span className="font-semibold pr-2">{formatCurrency(p.budgetedAmount)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{t('programs.organizer')}: {p.organizer}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap">{p.notes || t('programs.noNotes')}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="flex items-center justify-center h-24 text-center text-muted-foreground">
              {t('programs.noPrograms')}
          </div>
        )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
