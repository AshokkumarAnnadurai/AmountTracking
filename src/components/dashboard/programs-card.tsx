
"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, ListMusic, Download, Pencil } from "lucide-react";

import type { Program } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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

type ProgramFormData = z.infer<ReturnType<typeof programSchema>>;

function ProgramForm({
  onSubmit,
  initialValues,
  isEdit = false,
}: {
  onSubmit: (values: ProgramFormData) => Promise<void>;
  initialValues: ProgramFormData;
  isEdit?: boolean;
}) {
  const { t } = useLanguage();
  const form = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema(t)),
    defaultValues: initialValues,
  });

  React.useEffect(() => {
    form.reset(initialValues);
  }, [initialValues, form]);

  const handleSubmit = async (values: ProgramFormData) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <DialogHeader>
          <DialogTitle>{isEdit ? t('programs.form.editTitle') : t('programs.form.title')}</DialogTitle>
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
          <Button type="submit">{isEdit ? t('programs.form.update') : t('programs.form.submit')}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}


interface ProgramsCardProps {
  programs: Program[];
  onAddProgram: (program: Omit<Program, "id" | "year">) => Promise<void>;
  onUpdateProgram: (programId: string, program: Omit<Program, "id" | "year">) => Promise<void>;
  isAdmin: boolean;
}

export function ProgramsCard({ programs, onAddProgram, onUpdateProgram, isAdmin }: ProgramsCardProps) {
  const [isAddOpen, setAddOpen] = React.useState(false);
  const [editProgram, setEditProgram] = React.useState<Program | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const handleAddSubmit = async (values: ProgramFormData) => {
    await onAddProgram(values);
    toast({
      title: t('toast.success'),
      description: t('toast.programAdded', { name: values.name }),
    });
    setAddOpen(false);
  };
  
  const handleEditSubmit = async (values: ProgramFormData) => {
    if (!editProgram) return;
    await onUpdateProgram(editProgram.id, values);
    toast({
      title: t('toast.success'),
      description: t('toast.programUpdated', { name: values.name }),
    });
    setEditProgram(null);
  };

  const formatCurrency = (amount: number) => `${t('currencySymbol')} ${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 0 }).format(amount)}`;
  
  const handleDownload = () => {
    const headers = ["Name", "Organizer", "Budgeted Amount", "Notes"];
    const csvContent = [
      headers.join(","),
      ...programs.map(p => [p.name, p.organizer, p.budgetedAmount, `"${p.notes || ''}"`].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "programs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>{t('programs.title')}</CardTitle>
          <CardDescription>
            {t('programs.description')}
          </CardDescription>
        </div>
        {isAdmin && (
          <Dialog open={isAddOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="ml-auto gap-1 bg-accent text-accent-foreground hover:bg-accent/90">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  {t('addNew')}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <ProgramForm
                onSubmit={handleAddSubmit}
                initialValues={{ name: "", organizer: "", budgetedAmount: 0, notes: "" }}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-[350px]">
        {programs.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {programs.map((p) => (
              <AccordionItem value={p.id} key={p.id}>
                <div className="flex items-center justify-between w-full">
                  <AccordionTrigger className="flex-grow">
                    <div className="flex flex-col items-start text-left w-full">
                      <div className="flex justify-between w-full">
                        <span className="font-medium">{p.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{t('programs.organizer')}: {p.organizer}</span>
                    </div>
                  </AccordionTrigger>
                   <div className="flex items-center pr-4">
                      <span className="font-semibold text-right w-24">{formatCurrency(p.budgetedAmount)}</span>
                      {isAdmin && (
                        <Button variant="ghost" size="icon" className="ml-2" onClick={() => setEditProgram(p)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit Program</span>
                        </Button>
                      )}
                    </div>
                </div>
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
       <CardFooter className="justify-end border-t pt-4">
        <Button variant="outline" size="sm" onClick={handleDownload} disabled={programs.length === 0}>
          <Download className="h-3.5 w-3.5 mr-2" />
          {t('download')}
        </Button>
      </CardFooter>
      <Dialog open={!!editProgram} onOpenChange={(isOpen) => !isOpen && setEditProgram(null)}>
        <DialogContent>
          {editProgram && (
            <ProgramForm
              onSubmit={handleEditSubmit}
              initialValues={{
                name: editProgram.name,
                organizer: editProgram.organizer,
                budgetedAmount: editProgram.budgetedAmount,
                notes: editProgram.notes || "",
              }}
              isEdit={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
