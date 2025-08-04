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


const programSchema = z.object({
  name: z.string().min(3, { message: "Program name must be at least 3 characters." }),
  organizer: z.string().min(2, { message: "Organizer name must be at least 2 characters." }),
  notes: z.string().optional(),
});

interface ProgramsCardProps {
  programs: Program[];
  onAddProgram: (program: Omit<Program, "id" | "year">) => Promise<void>;
}

export function ProgramsCard({ programs, onAddProgram }: ProgramsCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof programSchema>>({
    resolver: zodResolver(programSchema),
    defaultValues: { name: "", organizer: "", notes: "" },
  });

  async function onSubmit(values: z.infer<typeof programSchema>) {
    await onAddProgram(values);
    toast({
      title: "Success!",
      description: `Program "${values.name}" has been added.`,
    });
    form.reset();
    setIsOpen(false);
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Cultural Programs</CardTitle>
          <CardDescription>
            List of events planned for the festival.
          </CardDescription>
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
                  <DialogTitle>Add New Program</DialogTitle>
                  <DialogDescription>
                    Enter the details of the cultural program.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <FormField name="name" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program Name</FormLabel>
                      <FormControl><Input placeholder="e.g. Kerala Sendai Melam" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="organizer" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organizer / Team</FormLabel>
                      <FormControl><Input placeholder="e.g. Team A" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="notes" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl><Textarea placeholder="Any special instructions or contacts..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <DialogFooter>
                  <Button type="submit">Add Program</Button>
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
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-sm text-muted-foreground">Organizer: {p.organizer}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap">{p.notes || "No notes provided."}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="flex items-center justify-center h-24 text-center text-muted-foreground">
              No programs added yet. Add one to get started.
          </div>
        )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
